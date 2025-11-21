import React, { createContext, useContext, useState } from 'react';
import { Chat, Message, Notification } from '../types';

interface ChatContextType {
    selectedChat: Chat | null;
    setSelectedChat: (chat: Chat | null) => void;
    chats: Chat[];
    setChats: (chats: Chat[]) => void;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    notifications: Notification[];
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    removeNotification: (notification: Notification) => void;
    updateChatLatestMessage: (chatId: string, message: Message) => void;
    incrementUnreadCount: (chatId: string) => void;
    clearUnreadCount: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Notification) => {
        // Don't add notification if chat is currently selected
        if (selectedChat && selectedChat._id === notification.chat._id) {
            return;
        }

        // Don't add duplicate notifications
        const exists = notifications.some(
            (n) => n.message._id === notification.message._id
        );

        if (!exists) {
            setNotifications([notification, ...notifications]);
        }
    };

    const removeNotification = (notification: Notification) => {
        setNotifications(
            notifications.filter((n) => n.message._id !== notification.message._id)
        );
    };

    const updateChatLatestMessage = (chatId: string, message: Message) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat._id === chatId
                    ? { ...chat, latestMessage: message }
                    : chat
            )
        );
    };

    const incrementUnreadCount = (chatId: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat._id === chatId
                    ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
                    : chat
            )
        );
    };

    const clearUnreadCount = (chatId: string) => {
        setChats((prevChats) =>
            prevChats.map((chat) =>
                chat._id === chatId
                    ? { ...chat, unreadCount: 0 }
                    : chat
            )
        );
    };

    return (
        <ChatContext.Provider
            value={{
                selectedChat,
                setSelectedChat,
                chats,
                setChats,
                messages,
                setMessages,
                notifications,
                setNotifications,
                addNotification,
                removeNotification,
                updateChatLatestMessage,
                incrementUnreadCount,
                clearUnreadCount,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
