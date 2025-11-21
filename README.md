# 💬 Realtime Chat Application

A modern, full-stack realtime chat application built with React, TypeScript, Node.js, Express, Socket.io, and MongoDB.

## ✨ Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💬 **1-on-1 Chat** - Private messaging between users
- 👥 **Group Chat** - Create and manage group conversations
- ⚡ **Real-time Messaging** - Instant message delivery with Socket.io
- 🔔 **Live Notifications** - Get notified of new messages
- ⌨️ **Typing Indicators** - See when someone is typing
- 🟢 **Online Status** - Know who's online
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🎨 **Modern UI** - Glass morphism effects and smooth animations
- 🔍 **User Search** - Find and start conversations with other users

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Socket.io Client** - Real-time client
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd TestAI
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Update .env with your MongoDB URI and JWT secret
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/chat-app
# JWT_SECRET=your_super_secret_jwt_key
# NODE_ENV=development

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🚀 Usage

1. **Register a new account**
   - Navigate to `http://localhost:5173/register`
   - Fill in your name, email, and password
   - Click "Sign Up"

2. **Login**
   - Navigate to `http://localhost:5173/login`
   - Enter your email and password
   - Click "Login"

3. **Start Chatting**
   - Click "🔍 Search Users" to find other users
   - Click on a user to start a 1-on-1 chat
   - Or click "➕ New Group" to create a group chat

4. **Send Messages**
   - Type your message in the input field
   - Press Enter or click "Send 📤"
   - Messages are delivered in real-time!

## 📁 Project Structure

```
TestAI/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.io handlers
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Context providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Socket services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/search?search=query` - Search users (Protected)
- `GET /api/users/profile` - Get user profile (Protected)

### Chats
- `POST /api/chats` - Access or create 1-on-1 chat (Protected)
- `GET /api/chats` - Fetch all chats (Protected)
- `POST /api/chats/group` - Create group chat (Protected)
- `PUT /api/chats/group/rename` - Rename group (Protected)
- `PUT /api/chats/group/add` - Add user to group (Protected)
- `PUT /api/chats/group/remove` - Remove user from group (Protected)

### Messages
- `POST /api/messages` - Send message (Protected)
- `GET /api/messages/:chatId` - Get messages for chat (Protected)

## 🔄 Socket.io Events

### Client → Server
- `setup` - Initialize user connection
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `new-message` - Send new message

### Server → Client
- `connected` - Connection established
- `user-online` - User came online
- `user-offline` - User went offline
- `message-received` - New message received
- `notification` - New notification
- `typing` - Someone is typing
- `stop-typing` - Someone stopped typing

## 🎨 UI Features

- **Glass Morphism** - Modern frosted glass effect
- **Gradient Backgrounds** - Beautiful purple/blue gradients
- **Smooth Animations** - Fade-in, slide-up effects
- **Custom Scrollbars** - Styled scrollbars
- **Typing Indicators** - Animated dots
- **Online Status** - Green/gray dots
- **Unread Badges** - Red notification badges
- **Responsive Design** - Mobile-friendly layout

## 🧪 Testing

To test the real-time features:

1. Open the app in two different browsers or incognito windows
2. Register/login as different users
3. Start a chat and send messages
4. Observe real-time message delivery, typing indicators, and online status

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected API routes
- CORS enabled
- Input validation

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### Frontend (optional .env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Socket.io for real-time communication
- TailwindCSS for beautiful styling
- MongoDB for flexible data storage
- React team for the amazing library

---

**Made with ❤️ using React, TypeScript, Node.js, and Socket.io**
