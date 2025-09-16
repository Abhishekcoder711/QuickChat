const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Message = require("./models/Message");

// ✅ Safe ObjectId helper
const toObjectId = (id) => {
  const strId = String(id);
  if (!mongoose.Types.ObjectId.isValid(strId)) {
    console.warn("⚠️ Invalid ObjectId:", strId);
    return null;
  }
  return new mongoose.Types.ObjectId(strId);
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

const onlineUsers = new Map();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "quickchat_secret",
  resave: false,
  saveUninitialized: true
}));

app.get("/", (req, res) => {
  res.redirect("/create");
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "create.html"));
});

app.post("/create", async (req, res) => {
  const { username, email, password, terms } = req.body;
  if (!username || !email || !password || !terms) {
    return res.redirect("/create?error=empty");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.redirect("/create?error=invalid-email");
  }

  if (password.length < 6) {
    return res.redirect("/create?error=short-password");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.redirect("/create?error=exists");

  const hash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, email, password: hash, is_online: true });

  req.session.userId = newUser._id;
  req.session.username = username;

  res.redirect("/chat");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.redirect("/create?error=empty&page=login");
  }

  const user = await User.findOne({ email });
  if (!user) return res.redirect("/create?error=notfound&page=login");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.redirect("/create?error=notfound&page=login");

  user.is_online = true;
  await user.save();

  req.session.userId = user._id;
  req.session.username = user.username;

  res.redirect("/chat");
});

app.get("/chat", (req, res) => {
  if (!req.session.userId || !req.session.username) {
    return res.redirect("/create?page=login");
  }

  res.render("index", {
    userId: req.session.userId,
    username: req.session.username
  });
});

app.get("/logout", async (req, res) => {
  const userObjectId = toObjectId(req.session.userId);
  if (!userObjectId) return res.redirect("/create?page=login");

  await User.findByIdAndUpdate(userObjectId, { is_online: false });
  req.session.destroy(() => {
    res.redirect("/create?page=login");
  });
});

app.get("/users", async (req, res) => {
  const myId = req.session.userId;
  if (!myId) return res.status(401).json({ error: "Unauthorized" });

  const users = await User.find({ _id: { $ne: myId } }, "username is_online");
  res.json(users);
});

app.get("/messages/:otherUserId", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const myId = toObjectId(req.session.userId);
  const otherId = toObjectId(req.params.otherUserId);
  if (!myId || !otherId) return res.status(400).json({ error: "Invalid user ID" });

  const messages = await Message.find({
    $or: [
      { sender_id: myId, receiver_id: otherId },
      { sender_id: otherId, receiver_id: myId }
    ]
  }).sort({ timestamp: 1 }).populate("sender_id", "username");

  await Message.updateMany({
    receiver_id: myId,
    sender_id: otherId,
    is_read: false
  }, { $set: { is_read: true } });

  res.json(messages.map(msg => ({
    ...msg.toObject(),
    sender_name: msg.sender_id.username
  })));
});

io.on("connection", (socket) => {
  socket.on("register-user", async ({ userId, username }) => {
    socket.userId = userId;
    socket.username = username;
    onlineUsers.set(userId, socket.id);

    socket.broadcast.emit("user-status-change", { userId, is_online: true });

    const receiverId = toObjectId(userId);
    if (!receiverId) return;

    const unreadMessages = await Message.find({
      receiver_id: receiverId,
      is_read: false
    }).populate("sender_id", "username");

    unreadMessages.forEach(msg => {
      socket.emit("private-message", {
        from: msg.sender_id._id,
        fromName: msg.sender_id.username,
        message: msg.message_content,
        time: msg.timestamp,
        is_read: false
      });
    });
  });

  socket.on("private-message", async ({ toUserId, fromUserId, message }) => {
    if (!fromUserId || !toUserId || !message || message.trim() === "") {
      console.error("❌ Invalid message payload:", { fromUserId, toUserId, message });
      return;
    }

    const senderId = toObjectId(fromUserId);
    const receiverId = toObjectId(toUserId);
    if (!senderId || !receiverId) return;

    const time = new Date().toLocaleTimeString();

    const newMsg = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      message_content: message,
      is_read: true
    });

    io.to(socket.id).emit("private-message", {
      from: fromUserId,
      fromName: socket.username,
      message,
      time,
      is_read: true
    });

    const receiverSocketId = onlineUsers.get(toUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("private-message", {
        from: fromUserId,
        fromName: socket.username,
        message,
        time,
        is_read: true
      });

      await Message.findByIdAndUpdate(newMsg._id, { is_read: true });
    }
  });

  socket.on("disconnect", async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit("user-status-change", { userId: socket.userId, is_online: false });

      const userObjectId = toObjectId(socket.userId);
      if (!userObjectId) return;

      await User.findByIdAndUpdate(userObjectId, { is_online: false });
    }
  });
});

http.listen(process.env.SERVER_PORT || 3000, () => {
  console.log("✅ Server running at http://localhost:" + (process.env.SERVER_PORT || 3000));
});