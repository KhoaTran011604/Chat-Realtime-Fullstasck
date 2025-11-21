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
    const { addNotification } = useChat();

    useEffect(() => {
        if (user) {
            const newSocket = initSocket();
            setSocket(newSocket);

            // Setup connection
            newSocket.emit('setup', user);

            newSocket.on('connected', () => {
                console.log('✅ Connected to socket');
            });

            // Handle user online status
            newSocket.on('user-online', (userId: string) => {
                console.log('🟢 User online:', userId);
                setOnlineUsers((prev) => new Set(prev).add(userId));
            });

            newSocket.on('user-offline', (userId: string) => {
                console.log('⚫ User offline:', userId);
                setOnlineUsers((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(userId);
                    return newSet;
                });
            });

            // Handle incoming messages
            newSocket.on('message-received', (newMessage: Message) => {
                console.log('📨 Message received:', newMessage);
                // Don't auto-add to messages here - let ChatWindow handle it
                // This prevents messages from showing in wrong chats
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
