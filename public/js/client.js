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

              // msg.innerHTML = `
              //   <div class="msg-content">
              //     <div class="msg-text">${data.message_content}</div>
              //     <div class="msg-time">${new Date(data.timestamp).toLocaleTimeString()} ${seenBadge}</div>
              //   </div>
              // `;

// yaha se delete karna hai and upper wala code uncomment karna hai

              let content = data.message_content;

              if (content.startsWith("/uploads/")) {

                if (content.match(/\.(jpg|jpeg|png|gif)$/i)) {
                  content = `<img src="${content}" style="max-width:200px;">`;
                }

                else if (content.match(/\.(mp4|webm|ogg)$/i)) {
                  content = `<video controls style="max-width:200px;">
                              <source src="${content}">
                            </video>`;
                }

                else if (content.match(/\.(mp3|wav)$/i)) {
                  content = `<audio controls>
                              <source src="${content}">
                            </audio>`;
                }

                else {
                  content = `<a href="${content}" target="_blank">Download File</a>`;
                }

              }

              msg.innerHTML = `
                <div class="msg-content">
                  <div class="msg-text">${content}</div>
                  <div class="msg-time">${new Date(data.timestamp).toLocaleTimeString()} ${seenBadge}</div>
                </div>
              `;
// yaha takk delete karna hai

              messages.appendChild(msg);
            });

            messages.scrollTop = messages.scrollHeight;
          });

          fetch(`/user/${selectedUserId}`)
            .then(res => res.json())
            .then(userData => {

              document.getElementById("profile-img").src = (userData.profile_image || "/images/default.png") + "?t=" + new Date().getTime();

              document.getElementById("profile-name").textContent = userData.username;

              document.getElementById("profile-status").textContent =
                "Status: " + (userData.is_online ? "Online" : "Offline");

              document.getElementById("profile-email").textContent =
                "Email: " + (userData.email || "Not available");

              document.getElementById("profile-bio").textContent =
                "Bio: " + (userData.bio || "No bio");

              // remove old button if exists
              const oldBtn = document.getElementById("back-to-profile");
              if (oldBtn) oldBtn.remove();
 
              // ✅ Show back button only for other users
              if (selectedUserId !== myUserId) {
                document.getElementById("profile-bio").insertAdjacentHTML(
                  "afterend",
                  `<button id="back-to-profile">← Back to My Profile</button>`
                );
              }
              // ✅ Show/hide edit option
              if (selectedUserId === myUserId) {
                document.getElementById("edit-profile-btn").style.display = "inline-block";
              } else {
                document.getElementById("edit-profile-btn").style.display = "none";
                document.getElementById("edit-box").style.display = "none";
              }  
            });

          // ✅ Update UI
          chatHeader.innerHTML = `<h2>${user.username}</h2>`;
          form.style.display = "flex";
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

  // msg.innerHTML = `
  //   <div class="msg-content">
  //     <div class="msg-text">${data.message}</div>
  //     <div class="msg-time">${data.time} ${seenBadge}</div>
  //   </div>
  // `;

// yaha se delete karna hai and upper wala code uncomment karna hai

  let content = data.message;

  if (content.startsWith("/uploads/")) {

    if (content.match(/\.(jpg|jpeg|png|gif)$/i)) {
      content = `<img src="${content}" style="max-width:200px;">`;
    }

    else if (content.match(/\.(mp4|webm|ogg)$/i)) {
      content = `<video controls style="max-width:200px;">
                  <source src="${content}">
                </video>`;
    }

    else if (content.match(/\.(mp3|wav)$/i)) {
      content = `<audio controls>
                  <source src="${content}">
                </audio>`;
    }

    else {
      content = `<a href="${content}" target="_blank">Download File</a>`;
    }

  }


  msg.innerHTML = `
    <div class="msg-content">
      <div class="msg-text">${content}</div>
      <div class="msg-time">${data.time} ${seenBadge}</div>
    </div>
  `;
// yaha takk delete karna hai


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

// Edit button click
document.addEventListener("click", (e) => {

  if (e.target.id === "edit-profile-btn") {
    document.getElementById("edit-box").style.display = "block";
  }

  if (e.target.id === "delete-profile") {

    if (!confirm("Are you sure?")) return;

    fetch("/delete-profile", {
      method: "POST"
    })
    .then(res => res.json())
    .then(data => {
      alert("Profile Reset");

      // reset UI
      document.getElementById("profile-img").src = "/images/default.png";
      document.getElementById("profile-bio").textContent = "Bio: No bio";

      document.getElementById("edit-box").style.display = "none";
    });

  }

  if (e.target.id === "save-profile") {
    console.log("Save clicked");

    const bio = document.getElementById("edit-bio").value;
    const imageFile = document.getElementById("edit-image").files[0];

    const formData = new FormData();
    formData.append("bio", bio);
    if (imageFile) formData.append("profile", imageFile);

    fetch("/update-profile", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      alert("Profile Updated");
      // 🔥 Fetch updated profile (NO reload)
      fetch(`/user/${myUserId}`)
        .then(res => res.json())
        .then(userData => {

          document.getElementById("profile-img").src =
            userData.profile_image + "?t=" + new Date().getTime();

          document.getElementById("profile-bio").textContent =
            "Bio: " + (userData.bio || "No bio");
 
          // hide edit box
          document.getElementById("edit-box").style.display = "none";
        });
    })
    .catch(err => console.error(err));
  }

});

// ✅ Back button click (GLOBAL - only once)
document.addEventListener("click", (e) => {
  if (e.target.id === "back-to-profile") {

    document.getElementById("chat-welcome").style.display = "block";
    document.querySelector(".chat-active").classList.remove("show");

    profileBox.innerHTML = defaultProfileHTML;

    // 🔥 reload my profile data
    fetch(`/user/${myUserId}`)
      .then(res => res.json())
      .then(userData => {

        document.getElementById("profile-img").src =
          (userData.profile_image || "/images/default.png") + "?t=" + new Date().getTime();

        document.getElementById("profile-name").textContent =
          userData.username;

        document.getElementById("profile-status").textContent =
          "Status: " + (userData.is_online ? "Online" : "Offline");

        document.getElementById("profile-email").textContent =
          "Email: " + (userData.email || "Not available");

        document.getElementById("profile-bio").textContent =
          "Bio: " + (userData.bio || "No bio");

        document.getElementById("edit-profile-btn").style.display = "inline-block";
      });
    chatHeader.innerHTML = defaultHeaderHTML;
    form.style.display = "none";

    selectedUserId = null;
    currentChatUserId = null;
    messages.innerHTML = "";
  }
});

// 🔥 Load my profile on page load
window.addEventListener("load", () => {

  fetch(`/user/${myUserId}`)
    .then(res => res.json())
    .then(userData => {

      document.getElementById("profile-img").src =
        userData.profile_image + "?t=" + new Date().getTime();

      document.getElementById("profile-name").textContent =
        userData.username;

      document.getElementById("profile-status").textContent =
        "Status: " + (userData.is_online ? "Online" : "Offline");

      document.getElementById("profile-email").textContent =
        "Email: " + (userData.email || "Not available");

      document.getElementById("profile-bio").textContent =
        "Bio: " + (userData.bio || "No bio");

      // ✅ 🔥 ADD THIS HERE
      document.getElementById("edit-profile-btn").style.display = "inline-block";  
    });

});

// 🤖 Toggle chatbot
document.addEventListener("DOMContentLoaded", () => {

  // 🤖 Summarize Chat
  document.getElementById("summarize-btn").addEventListener("click", () => {

    if (!selectedUserId) {
      document.getElementById("chatbot-output").innerText =
        "⚠️ Open a chat first";
      return;
    }

    fetch(`/summarize-chat/${selectedUserId}`)
      .then(res => res.json())
      .then(data => {

        let summary = data.summary;

        document.getElementById("chatbot-output").innerText =
          "📌 Summary:\n- " + summary.join("\n- ");
      });
  });
  const chatbotBtn = document.getElementById("chatbot-btn");
  const chatbotBox = document.getElementById("chatbot-box");

  chatbotBtn.addEventListener("click", () => {
    if (chatbotBox.style.display === "block") {
      chatbotBox.style.display = "none";
    } else {
      chatbotBox.style.display = "block";
    }
  });
});

// ================= GOOGLE LOGIN =================

function loginWithGoogle() {

    google.accounts.id.initialize({
        client_id: "215720195583-mdhlhcp1nlskktf6i564mim7neleg2u1.apps.googleusercontent.com",
        callback: handleCredentialResponse,
        auto_select: false
    });

    // ✅ ONLY button click pe popup aayega
    google.accounts.id.prompt();
}

function handleCredentialResponse(response) {
    const id_token = response.credential;

    fetch("/google-login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: id_token })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = "/chat";
        } else {
            alert("Google login failed");
        }
    })
    .catch(err => {
        console.log(err);
        alert("Error in Google login");
    });
}