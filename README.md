# QuickChat 
Let's Try--> https://quickchat-t1wq.onrender.com

QuickChat is a real-time chat application built with Node.js, Express, and Socket.io. It allows users to create an account, log in, and chat live in a modern web interface. The app features a clean UI, service worker support, and session-based login system.

---

## 🚀 Features

- Create Account / Login System
- Also showing online users
- Real-Time Chat using WebSockets (Socket.io)
- Background Images & Styling
- EJS & HTML based templating
- Node.js + Express backend
- Organized folder structure
- Service worker & manifest for PWA support
- Clean code & scalable architecture

---

## 📁 Folder Structure

```
CHAT-APP/
├── .github/            # GitHub workflows and configs
├── models/             # Data models
│   ├── Message.js      # Message schema
│   └── User.js         # User schema
├── node_modules/       # Installed npm packages
├── public/             # Static files
│   ├── images/         # Images used in the app
│   ├── client.js       # Handles chat on client side
│   ├── create.js       # Client logic for creating chats/users
│   ├── manifest.json   # PWA settings
│   ├── style.css       # Styling for the app
│   └── terms.html      # Terms and conditions page
├── views/              # Server templates
│   ├── create.html     # Page for creating new chat/user
│   └── index.ejs       # Main chat interface
├── .env                # Environment variables
├── .gitignore          # Files ignored by Git
├── package-lock.json   # Dependency lock file
├── package.json        # Project metadata and dependencies
├── README.md           # Project overview
├── render.yaml         # Deployment config
└── server.js           # Main backend server
```

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Abhishekcoder711/QuickChat.git
cd QuickChat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root and add:

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=you_db_name
SESSION_SECRET=your_secret_key
```

### 4. Start the Server

```bash
node server.js
```

Then visit:  
👉 local server of your system or browser

---

## 🧪 Tech Stack

- **Frontend**: HTML, CSS, EJS, JavaScript
- **Backend**: Node.js, Express
- **WebSockets**: Socket.io
- **Database**: MySQL 
- **Auth**: Sessions & `.env` secrets

---

## 📦 Scripts

```bash
npm start       # Run app
npm install     # Install dependencies
```


## 🙌 Contributing

Pull requests and feedback are welcome!  
If you'd like to improve QuickChat, fork it and send a PR.

---

## 🌐 Live Demo on Render

🚧 You can check out the live version of QuickChat here: 
--https://quickchat-t1wq.onrender.com

---

## 👤 Author

- **Abhishek Kumar Mishra**
- GitHub: [@Abhishekcoder711](https://github.com/Abhishekcoder711)
