import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { Chat } from '../types';

const ChatList: React.FC = () => {
    const { user } = useAuth();
    const { chats, selectedChat, setSelectedChat, clearUnreadCount } = useChat();
    const { onlineUsers } = useSocket();

    const getSender = (chat: Chat) => {
        if (chat.isGroupChat) {
            return chat.chatName;
        }
        return chat.users.find((u) => u._id !== user?._id)?.name || 'Unknown';
    };

    const getSenderAvatar = (chat: Chat) => {
        if (chat.isGroupChat) {
            return '👥';
        }
        const otherUser = chat.users.find((u) => u._id !== user?._id);
        return otherUser?.avatar || 'https://ui-avatars.com/api/?background=random&name=User';
    };

    const isUserOnline = (chat: Chat) => {
        if (chat.isGroupChat) return false;
        const otherUser = chat.users.find((u) => u._id !== user?._id);
        return otherUser ? onlineUsers.has(otherUser._id) : false;
    };

    const getUnreadCount = (chat: Chat) => {
        return chat.unreadCount || 0;
    };

    const formatTime = (date: string) => {
        const messageDate = new Date(date);
        const now = new Date();
        const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const handleChatClick = (chat: Chat) => {
        setSelectedChat(chat);
        // Clear unread count when opening chat
        if (chat.unreadCount && chat.unreadCount > 0) {
            clearUnreadCount(chat._id);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {chats.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                    <p>No chats yet</p>
                    <p className="text-sm mt-2">Search for users to start chatting</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-700/30">
                    {chats.map((chat) => {
                        const unreadCount = getUnreadCount(chat);
                        const isOnline = isUserOnline(chat);
                        const isSelected = selectedChat?._id === chat._id;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => handleChatClick(chat)}
                                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/5 ${isSelected ? 'bg-white/10 border-l-4 border-blue-500' : ''
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        {chat.isGroupChat ? (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                                                {getSenderAvatar(chat)}
                                            </div>
                                        ) : (
                                            <img
                                                src={getSenderAvatar(chat)}
                                                alt={getSender(chat)}
                                                className="w-12 h-12 rounded-full border-2 border-slate-700/50"
                                            />
                                        )}
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 online-dot"></div>
                                        )}
                                    </div>

                                    {/* Chat Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold truncate">{getSender(chat)}</h4>
                                            {chat.latestMessage && (
                                                <span className="text-xs text-slate-400">
                                                    {formatTime(chat.latestMessage.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        {chat.latestMessage && (
                                            <p className="text-sm text-slate-400 truncate">
                                                {chat.latestMessage.sender._id === user?._id && 'You: '}
                                                {chat.latestMessage.imageUrl ? '📷 Photo' : chat.latestMessage.content}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unread Badge */}
                                    {unreadCount > 0 && (
                                        <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatList;
