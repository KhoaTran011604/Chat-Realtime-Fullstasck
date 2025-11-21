import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface UserSocket extends Socket {
    userId?: string;
}

export const initializeSocket = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
        },
    });

    // Store online users
    const onlineUsers = new Map<string, string>();

    io.on('connection', (socket: UserSocket) => {
        console.log('🔌 New client connected:', socket.id);

        // Setup user connection
        socket.on('setup', (userData) => {
            socket.userId = userData._id;
            socket.join(userData._id);
            onlineUsers.set(userData._id, socket.id);
            socket.emit('connected');

            // Broadcast online status to all users
            io.emit('user-online', userData._id);
            console.log(`✅ User ${userData.name} is online`);
        });

        // Join chat room
        socket.on('join-chat', (room) => {
            socket.join(room);
            console.log(`👥 User joined chat room: ${room}`);
        });

        // Leave chat room
        socket.on('leave-chat', (room) => {
            socket.leave(room);
            console.log(`👋 User left chat room: ${room}`);
        });

        // Typing indicator
        socket.on('typing', (room) => {
            socket.to(room).emit('typing', room);
        });

        socket.on('stop-typing', (room) => {
            socket.to(room).emit('stop-typing', room);
        });

        // New message - FIXED for group chat
        socket.on('new-message', (newMessageReceived) => {
            console.log('📬 New message event received:', newMessageReceived.content);
            const chat = newMessageReceived.chat;

            if (!chat.users) {
                return console.log('❌ chat.users not defined');
            }

            console.log(`📤 Broadcasting message to chat room: ${chat._id}`);

            // Emit to the chat room (all users in the chat will receive it)
            // This ensures group messages appear in the group chat
            socket.to(chat._id).emit('message-received', newMessageReceived);

            // Also send individual notifications to users who are not currently viewing this chat
            chat.users.forEach((user: any) => {
                // Don't send notification to the sender
                if (user._id === newMessageReceived.sender._id) {
                    console.log(`⏭️  Skipping notification for sender: ${user._id}`);
                    return;
                }

                console.log(`🔔 Sending notification to user: ${user._id}`);

                // Send notification to user's personal room
                socket.to(user._id).emit('notification', {
                    message: newMessageReceived,
                    chat: chat,
                });
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);

            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                // Broadcast offline status
                io.emit('user-offline', socket.userId);
                console.log(`⚫ User ${socket.userId} is offline`);
            }
        });
    });

    return io;
};
