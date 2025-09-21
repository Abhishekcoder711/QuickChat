const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const userBox = document.getElementById("online-users");
const profileBox = document.getElementById("profile-box");
const chatHeader = document.getElementById("chat-header");

let currentChatUserId = null;
let myUserId = document.getElementById("myUserId").value.trim(); // ✅ keep as string
let myUsername = document.getElementById("myUsername").value;

let selectedUserId = null;

const defaultProfileHTML = profileBox.innerHTML;
const defaultHeaderHTML = chatHeader.innerHTML;

// ✅ Register current user with server
socket.emit("register-user", { userId: myUserId, username: myUsername });

// ✅ Fetch and render user list
fetch("/users")
  .then(res => res.json())
  .then(users => {
    userBox.innerHTML = "";
    users.forEach(user => {
      if (user._id === myUserId) return;

      const userDiv = document.createElement("div");
      userDiv.classList.add("user");
      userDiv.dataset.userid = user._id;

      const statusClass = user.is_online ? "online" : "offline";
      userDiv.innerHTML = `
        ${user.username}
        <br>
        <span class="status ${statusClass}">${user.is_online ? "Online" : "Offline"}</span>
      `;

      userDiv.addEventListener("click", () => {
        if (currentChatUserId === user._id) return;

        selectedUserId = user._id;
        currentChatUserId = user._id;
        
        // Hide welcome screen, show chat
        document.getElementById("chat-welcome").style.display = "none";
        document.querySelector(".chat-active").classList.add("show");
        
        // ✅ Load chat history
        fetch(`/messages/${selectedUserId}`)
          .then(res => {
            if (!res.ok) {
              console.error("❌ Failed to load history:", res.status);
              return [];
            }
            return res.json();
          })
          .then(history => {
            messages.innerHTML = "";

            history.forEach(data => {
              const msg = document.createElement("div");
              msg.classList.add("msg");

              // ✅ Robust comparison: handles populated sender_id object or raw ID
              const senderId = data.sender_id._id ? String(data.sender_id._id) : String(data.sender_id);
              msg.classList.add(senderId === myUserId ? "mine" : "theirs");

              const seenBadge = data.is_read ? `<span class="seen-badge">✔ Seen</span>` : "";

              msg.innerHTML = `
                <div class="msg-content">
                  <div class="msg-text">${data.message_content}</div>
                  <div class="msg-time">${new Date(data.timestamp).toLocaleTimeString()} ${seenBadge}</div>
                </div>
              `;

              messages.appendChild(msg);
            });

            messages.scrollTop = messages.scrollHeight;
          });

        // ✅ Update UI
        chatHeader.innerHTML = `<h2>${user.username}</h2>`;
        document.getElementById("chat-welcome").style.display = "none";
        form.style.display = "flex";

        profileBox.innerHTML = `
          <h3>Chatting with</h3>
          <p><strong>${user.username}</strong></p>
          <p>Status: ${user.is_online ? "Online" : "Offline"}</p>
          <button id="back-to-profile">← Back to My Profile</button>
        `;

        document.getElementById("back-to-profile").addEventListener("click", () => {
          // Show welcome screen, hide chat
          document.getElementById("chat-welcome").style.display = "block";
          document.querySelector(".chat-active").classList.remove("show");
          
          profileBox.innerHTML = defaultProfileHTML;
          document.getElementById("chat-welcome").style.display = "block";
          chatHeader.innerHTML = defaultHeaderHTML;
          form.style.display = "none";
          selectedUserId = null;
          currentChatUserId = null;
          messages.innerHTML = "";
        });
      });

      userBox.appendChild(userDiv);
    });
  });

// ✅ Search Bar Filtering
const searchInput = document.querySelector(".user-list input");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const userDivs = userBox.querySelectorAll(".user");

  userDivs.forEach(div => {
    const name = div.textContent.toLowerCase();
    div.style.display = name.includes(query) ? "block" : "none";
  });
});

// ✅ Handle incoming private messages
socket.on("private-message", (data) => {
  if (selectedUserId !== data.from && data.from !== myUserId) {
    return;
  }

  const msg = document.createElement("div");
  msg.classList.add("msg");
  msg.classList.add(data.from === myUserId ? "mine" : "theirs");

  const seenBadge = data.is_read ? `<span class="seen-badge">✔ Seen</span>` : "";

  msg.innerHTML = `
    <div class="msg-content">
      <div class="msg-text">${data.message}</div>
      <div class="msg-time">${data.time} ${seenBadge}</div>
    </div>
  `;

  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
});

// ✅ Send private message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() !== "" && selectedUserId) {
    const message = input.value;
    socket.emit("private-message", {
      toUserId: selectedUserId,
      fromUserId: myUserId,
      message: message
    });
    input.value = "";
  }
});

// ✅ Listen for real-time status updates
socket.on("user-status-change", ({ userId, is_online }) => {
  const userDiv = document.querySelector(`.user[data-userid="${userId}"]`);
  if (userDiv) {
    const statusSpan = userDiv.querySelector(".status");
    statusSpan.textContent = is_online ? "Online" : "Offline";
    statusSpan.className = `status ${is_online ? "online" : "offline"}`;
  }
});

function toggleUserList() {
  const userList = document.querySelector('.user-list');
  userList.classList.toggle('show');
}

function toggleProfile() {
  const profileBox = document.querySelector('.profile-section');
  profileBox.classList.toggle('show');
}
