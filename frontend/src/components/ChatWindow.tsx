import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';
import MessageBubble from './MessageBubble';
import toast from 'react-hot-toast';

const ChatWindow: React.FC = () => {
    const { user } = useAuth();
    const { selectedChat, setSelectedChat, messages, setMessages, notifications, setNotifications } = useChat();
    const { socket, typing } = useSocket();
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages();

            // Join the chat room
            if (socket) {
                socket.emit('join-chat', selectedChat._id);
            }

            // Clear notifications for this chat
            setNotifications(notifications.filter((n) => n.chat._id !== selectedChat._id));
        }
    }, [selectedChat, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;

        setLoading(true);
        try {
            const { data } = await messageAPI.getMessages(selectedChat._id);
            setMessages(data);
        } catch (error) {
            toast.error('Failed to load messages');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedChat || !socket) return;

        const messageContent = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            const { data } = await messageAPI.sendMessage(messageContent, selectedChat._id);

            console.log('📤 Sending message:', data);

            // Add to local messages immediately
            setMessages((prev) => [...prev, data]);

            // Emit to socket for real-time delivery to others
            socket.emit('new-message', data);
            socket.emit('stop-typing', selectedChat._id);
            setIsTyping(false);
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
            setNewMessage(messageContent); // Restore message on error
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!socket || !selectedChat) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', selectedChat._id);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', selectedChat._id);
            setIsTyping(false);
        }, 3000);
    };

    const getSender = () => {
        if (!selectedChat) return '';
        if (selectedChat.isGroupChat) {
            return selectedChat.chatName;
        }
        return selectedChat.users.find((u) => u._id !== user?._id)?.name || 'Unknown';
    };

    if (!selectedChat) return null;

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Chat Header - Centered on mobile, left on desktop */}
            <div className="glass-dark border-b border-white/10 p-4 shadow-lg">
                <div className="flex items-center justify-center md:justify-start relative">
                    {/* Back button for mobile - absolute left */}
                    <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden absolute left-0 p-2 hover:bg-white/10 rounded-lg transition-colors text-xl"
                    >
                        ←
                    </button>

                    {/* Avatar and Name */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                            {selectedChat.isGroupChat ? '👥' : getSender().charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="font-bold text-lg">{getSender()}</h3>
                            {selectedChat.isGroupChat && (
                                <p className="text-xs text-gray-400">
                                    {selectedChat.users.length} members
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-gradient-to-b from-slate-900/30 to-slate-900/60">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-gray-400 text-sm">Loading messages...</p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl md:text-7xl mb-4 animate-bounce-subtle">💬</div>
                            <p className="text-lg md:text-xl font-semibold text-gray-300 mb-2">No messages yet</p>
                            <p className="text-sm text-gray-500">Start the conversation!</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {messages.map((message) => (
                            <MessageBubble key={message._id} message={message} />
                        ))}
                        {typing && (
                            <div className="flex items-center space-x-3 text-gray-400 ml-12 mb-4 animate-fade-in">
                                <div className="flex space-x-1">
                                    <div className="w-2.5 h-2.5 bg-primary-400 rounded-full typing-dot"></div>
                                    <div className="w-2.5 h-2.5 bg-primary-400 rounded-full typing-dot"></div>
                                    <div className="w-2.5 h-2.5 bg-primary-400 rounded-full typing-dot"></div>
                                </div>
                                <span className="text-sm italic">typing...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="glass-dark border-t border-white/10 p-3 md:p-4 shadow-2xl">
                <form onSubmit={sendMessage} className="flex items-center space-x-2 md:space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="input-primary flex-1 text-sm md:text-base"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="btn-primary px-4 md:px-8 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <span className="hidden md:flex items-center space-x-2">
                            <span>Send</span>
                            <span>📤</span>
                        </span>
                        <span className="md:hidden">📤</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
