const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const session = require("express-session");
const db = require("./database");
const path = require("path");
require("dotenv").config();

// ✅ Track online users
const onlineUsers = new Map();

// 🦠 Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET || "quickchat_secret",
    resave: false,
    saveUninitialized: true
}));

// 🧠 View Engine
app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// ✅ Routes
app.get("/", (req, res) => {
    if (!req.session.username) return res.redirect("/create");
    res.render("index.ejs", { username: req.session.username });
});

app.get("/create", (req, res) => {
    res.render("create.html");
});

app.get("/login", (req, res) => {
    res.render("create.html");
});

// ✅ Create Account
app.post("/create", (req, res) => {
    const { username, mobile } = req.body;
    if (!username || !mobile) return res.redirect("/create?error=empty");

    db.query("SELECT * FROM users WHERE mobile = ?", [mobile], (err, result) => {
    if (err) {
      console.error("DB error on SELECT in /create:", err);
      return res.status(500).send("DB Error: " + err.message);
    }

        if (result.length > 0) {
            return res.redirect("/create?error=exists");
        }

        db.query("INSERT INTO users (username, mobile) VALUES (?, ?)", [username, mobile], (err2) => {
      if (err2) {
        console.error("DB error on INSERT in /create:", err2);
        return res.status(500).send("DB Error: " + err2.message);
      }
            req.session.username = username;
            res.redirect("/");
        });
    });
});

// ✅ Login
app.post("/login", (req, res) => {
    const { username, mobile } = req.body;
    if (!username || !mobile) return res.redirect("/create?error=empty");

    db.query("SELECT * FROM users WHERE username = ? AND mobile = ?", [username, mobile], (err, result) => {
    if (err) {
      console.error("DB error on SELECT in /create:", err);
      return res.status(500).send("DB Error: " + err.message);
    }
        if (result.length === 0) return res.redirect("/create?error=notfound");

        req.session.username = username;
        res.redirect("/");
    });
});

// ✅ Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/create");
    });
});

// ✅ SOCKET.IO CHAT - SINGLE BLOCK ONLY
io.on("connection", (socket) => {
    socket.on("join-room", ({ username, room }) => {
        socket.username = username;
        socket.room = room;
        socket.join(room);

        // Add to online list
        onlineUsers.set(socket.id, username);

        // Broadcast updated user list
        io.emit("update-users", Array.from(onlineUsers.values()));

        // Notify others
        socket.to(room).emit("chat message", {
            user: "System",
            message: `${username} joined the room`,
            time: new Date().toLocaleTimeString()
        });
    });

    // // ✅ FIXED: Only emit once
    // socket.on("chat message", (data) => {
    //     console.log(`[CHAT] ${data.user}: ${data.message}`);
    //     socket.to(data.room).emit("chat message", data);  // others
    //     socket.emit("chat message", data);                // sender
    // });

    // ✅ Handle disconnect
    socket.on("disconnect", () => {
        onlineUsers.delete(socket.id);

        if (socket.username && socket.room) {
            io.to(socket.room).emit("chat message", {
                user: "System",
                message: `${socket.username} left the room`,
                time: new Date().toLocaleTimeString()
            });
        }

        io.emit("update-users", Array.from(onlineUsers.values()));
    });
});

// ✅ Start Server
http.listen(43959, () => {
    console.log("✅ Server running at http://localhost:43959");
});
