const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const room = "global"; // default room

// ✅ Join room (only once)
socket.emit("join-room", { username, room });
console.log("📤 [EMIT] join-room");

// ✅ Clean previous listener before setting a new one
socket.off("chat message");
socket.on("chat message", (data) => {
    console.log("📥 [RECEIVED] chat message:", data);

    const msg = document.createElement("div");
    msg.classList.add("msg");
    msg.classList.add(data.user === username ? "mine" : "theirs");

    msg.innerHTML = `
        <div class="msg-content">
            <span class="msg-user">${data.user}</span>
            <div class="msg-text">${data.message}</div>
            <div class="msg-time">${data.time}</div>
        </div>
    `;

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
});

// ✅ Send message
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim() !== "") {
        const time = new Date().toLocaleTimeString();
        socket.emit("chat message", {
            user: username,
            message: input.value,
            time: time,
            room: room
        });
        input.value = "";
    }
});

// ✅ Update Online Users List
socket.off("update-users");
socket.on("update-users", (userList) => {
    const userBox = document.getElementById("online-users");
    if (!userBox) return; // if element not on page, skip

    userBox.innerHTML = ""; // Clear previous
    userList.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.className = "user";
        userDiv.textContent = user === username ? `${user} (You)` : user;
        userBox.appendChild(userDiv);
    });
});
