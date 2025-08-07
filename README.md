QuickChat

QuickChat is a real-time chat application built with Node.js, Express, and Socket.io. It allows users to create an account, log in, and chat live in a modern web interface. The app features a clean UI, service worker support, and session-based login system.

---

## 🚀 Features

- 🔐 Create Account / Login System
- 💬 Real-Time Chat using WebSockets (Socket.io)
- 🖼️ Background Images & Styling
- 📝 EJS & HTML based templating
- 📦 Node.js + Express backend
- 📂 Organized folder structure
- 🌐 Service worker & manifest for PWA support
- 🧠 Clean code & scalable architecture

---

## 📁 Folder Structure

```
chat-app/
├── node_modules/            # Dependencies
├── public/                  # Static files
│   ├── images/              # Backgrounds, logos
│   ├── client.js            # Frontend socket logic
│   ├── style.css            # App styling
│   ├── manifest.json        # PWA manifest
│   └── service-worker.js    # Service worker for caching
├── views/                   # HTML / EJS Templates
│   ├── index.ejs
│   ├── login.html
│   └── create.html
├── .env                     # Environment variables (not uploaded)
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
├── database.js              # MongoDB or database logic
├── server.js                # Main server file
├── package.json             # Project metadata & scripts
└── package-lock.json        # Dependency versions lock
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
PORT=3000
MONGODB_URI=mongodb://localhost:27017/quickchat
SESSION_SECRET=your_secret_key
```

### 4. Start the Server

```bash
node server.js
```

Then visit:  
👉 http://localhost:3000

---

## 🧪 Tech Stack

- **Frontend**: HTML, CSS, EJS, JavaScript
- **Backend**: Node.js, Express
- **WebSockets**: Socket.io
- **Database**: MongoDB (or your setup in `database.js`)
- **Auth**: Sessions & `.env` secrets

---

## 📦 Scripts

```bash
npm start       # Run app
npm install     # Install dependencies
```

---

## 📄 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and share responsibly.

---

## 🙌 Contributing

Pull requests and feedback are welcome!  
If you'd like to improve QuickChat, fork it and send a PR.

---

## 🌐 Live Demo

🚧 Coming soon: Will be deployed on [Render](https://render.com)

---

## 👤 Author

- **Abhishek Mishra**
- GitHub: [@Abhishekcoder711](https://github.com/Abhishekcoder711)
