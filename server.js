const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client("215720195583-mdhlhcp1nlskktf6i564mim7neleg2u1.apps.googleusercontent.com");
require("dotenv").config();


// Multer for file uploads 
const multer = require("multer");

// Media storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });


const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "profile-" + Date.now() + "-" + file.originalname);
  }
});

const uploadProfile = multer({ storage: storage2 });

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
app.use(express.json());
app.use(express.static("public"));

app.use("/uploads", express.static("uploads"));


app.use(session({
  secret: process.env.SESSION_SECRET || "quickchat_secret",
  resave: false,
  saveUninitialized: true
}));

app.post("/delete-profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await User.findByIdAndUpdate(req.session.userId, {
      bio: "",
      profile_image: "/images/default.png"
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PASTE HERE
app.post("/update-profile", uploadProfile.single("profile"), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updateData = {
      bio: req.body.bio
    };

    if (req.file) {
      updateData.profile_image = "/uploads/" + req.file.filename;
    }

    await User.findByIdAndUpdate(req.session.userId, updateData);

    res.json({ success: true });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "home.html"));
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "create.html"));
});

app.post("/create", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
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
  const newUser = await User.create({ username, email, password: hash, is_online: true, profile_image: "/images/default.png", bio: "" });

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

// GOOGLE LOGIN

app.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "215720195583-mdhlhcp1nlskktf6i564mim7neleg2u1.apps.googleusercontent.com"
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                username: name,
                email,
                password: "google_auth",
                is_online: true,
                profile_image: "/images/default.png",
                bio: ""
            });
        } else {
            user.is_online = true;
            await user.save();
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});

// FACEBOOK LOGIN
app.post("/auth/facebook", async (req, res) => {
  const { email, name } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name,
        email: email,
        password: "facebook_auth",
        is_online: true,
        profile_image: "/images/default.png",
        bio: ""
      });
    } else {
      user.is_online = true;
      await user.save();
    }

    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  const data = `
-------------------
Name: ${name}
Email: ${email}
Message: ${message}
Time: ${new Date().toLocaleString()}
-------------------
`;

  const filePath = path.join(__dirname, "contact_messages.txt");

  fs.appendFile(filePath, data, (err) => {
    if (err) {
      return res.send("❌ Error saving message");
    }

    res.send("✅ Message saved successfully");
  });
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

  const users = await User.find({ _id: { $ne: myId } }, "username is_online profile_image bio email");
  res.json(users);
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("username is_online profile_image bio email");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
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
  })
  .sort({ timestamp: 1 })
  .populate("sender_id", "username");

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

app.get("/summarize-chat/:userId", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const myId = toObjectId(req.session.userId);
    const otherId = toObjectId(req.params.userId);

    const messages = await Message.find({
      $or: [
        { sender_id: myId, receiver_id: otherId },
        { sender_id: otherId, receiver_id: myId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate("sender_id", "username");

    let texts = messages
      .map(m => {
        if (!m.message_content) return null;

        // ignore media
        if (m.message_content.includes("/uploads/")) return null;

        const name = m.sender_id?.username || "User";
        return name + ": " + m.message_content;
      })
      .filter(Boolean)
      .filter(msg => {
        if (!msg) return false;

        // remove media
        if (msg.includes("/uploads/")) return false;

        // remove small msgs
        if (msg.length < 8) return false;

        // remove emoji
        if (/[\p{Emoji}]/u.test(msg)) return false;

        // remove common words
        const low = msg.toLowerCase();
        if (["hi","hii","hello","ok","hlo"].includes(low)) return false;

        return true;
      });

    let summary = texts.slice(-5);

    res.json({ summary });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Media upload route
app.post("/upload", upload.single("media"), async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({
    filePath: "/uploads/" + req.file.filename
  });
});
// yaha takk delete karna hai

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