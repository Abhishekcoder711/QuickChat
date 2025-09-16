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

👉 Create a .env file in the root folder and add your MongoDB details and session secret like this:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quickchat?retryWrites=true&w=majority   
```
👉 Make sure to replace the placeholders with your actual MongoDB Atlas connection string and a strong session secret.

### 4. Start the Server

```bash
node server.js
```

Then visit:  
👉 local server of your system or browser

---

## 🧪 Tech Stack

- Frontend: HTML, CSS, EJS templating, JavaScript
- Backend: Node.js, Express
- Real-time Communication: Socket.io WebSockets
- Database: MongoDB (Atlas or local)
- Authentication: Session-based with express-session and secure .env config

---

## 📦 Useful Scripts

```bash
npm start       # Run app
npm install     # Install dependencies
```


## 🙌 Contributing

I welcome pull requests and feedback! Feel free to fork the repo, make improvements, and send a PR back.

---

## 🌐 Live Demo on Render

🚧 You can check out the live version of QuickChat here: 
--https://quickchat-t1wq.onrender.com

---

## 👤 Author

- **Abhishek Kumar Mishra**
- GitHub: [@Abhishekcoder711](https://github.com/Abhishekcoder711)
