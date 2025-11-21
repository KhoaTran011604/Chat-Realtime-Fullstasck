import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { Message, Notification } from '../types';
import toast from 'react-hot-toast';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: Set<string>;
    typingChatId: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingChatId, setTypingChatId] = useState<string | null>(null);
    const { user } = useAuth();
    const { addNotification, updateChatLatestMessage, incrementUnreadCount, selectedChat } = useChat();

    useEffect(() => {
        if (user) {
            console.log('🔌 Initializing socket for user:', user.name);
            const newSocket = initSocket(user._id);
            setSocket(newSocket);

            // Listen for online users
            newSocket.on('online-users', (users: string[]) => {
                console.log('👥 Online users:', users);
                setOnlineUsers(new Set(users));
            });

            // Listen for user online/offline
            newSocket.on('user-online', (userId: string) => {
                console.log('✅ User came online:', userId);
                setOnlineUsers((prev) => new Set([...prev, userId]));
            });

            newSocket.on('user-offline', (userId: string) => {
                console.log('❌ User went offline:', userId);
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            newSocket.on('message-received', (newMessage: Message) => {
                console.log('📨 Message received:', newMessage);
                // Update latest message in chat list for realtime preview
                updateChatLatestMessage(newMessage.chat._id, newMessage);

                // Increment unread count if chat is not currently selected
                if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
                    incrementUnreadCount(newMessage.chat._id);
                }
            });

            // Handle notifications
            newSocket.on('notification', (notification: Notification) => {
                console.log('🔔 Notification received:', notification);
                addNotification(notification);
                toast.success(`New message from ${notification.message.sender.name}`);
            });

            // Handle typing - now with chatId
            newSocket.on('typing', (chatId: string) => {
                console.log('⌨️ Someone is typing in chat:', chatId);
                setTypingChatId(chatId);
            });

            newSocket.on('stop-typing', (chatId: string) => {
                console.log('⌨️ Stopped typing in chat:', chatId);
                setTypingChatId(null);
            });

            return () => {
                console.log('🔌 Disconnecting socket...');
                disconnectSocket();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); // Only depend on user - setMessages and addNotification are stable

    useEffect(() => {
        if (socket) {
            socket.emit('join-chat', 'general');
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, typingChatId }}>
            {children}
        </SocketContext.Provider>
    );
};
