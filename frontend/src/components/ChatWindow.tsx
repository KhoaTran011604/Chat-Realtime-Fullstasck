import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';
import MessageBubble from './MessageBubble';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Image as ImageIcon, X } from 'lucide-react';

const ChatWindow: React.FC = () => {
    const { user } = useAuth();
    const { selectedChat, setSelectedChat, messages, setMessages, notifications, setNotifications } = useChat();
    const { socket, typing } = useSocket();
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            setSelectedImage(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if ((!newMessage.trim() && !selectedImage) || !selectedChat || !socket) return;

        const messageContent = newMessage;
        const imageFile = selectedImage;

        setNewMessage('');
        clearImage();
        setSending(true);

        try {
            const { data } = await messageAPI.sendMessage(
                messageContent,
                selectedChat._id,
                imageFile || undefined
            );

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
            setNewMessage(messageContent);
            if (imageFile) {
                setSelectedImage(imageFile);
            }
        } finally {
            setSending(false);
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
            {/* Chat Header */}
            <div className="glass-dark border-b border-white/10 p-4 shadow-lg">
                <div className="flex items-center justify-center md:justify-start relative">
                    {/* Back button for mobile */}
                    <button
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden absolute left-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
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
                            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
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

            {/* Image Preview */}
            {imagePreview && (
                <div className="glass-dark border-t border-white/10 p-3">
                    <div className="relative inline-block">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-lg"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="glass-dark border-t border-white/10 p-3 md:p-4 shadow-2xl">
                <form onSubmit={sendMessage} className="flex items-center space-x-2 md:space-x-3">
                    {/* Image Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 md:p-2.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-primary-400"
                        title="Upload image"
                    >
                        <ImageIcon size={20} />
                    </button>

                    {/* Text Input */}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="input-primary flex-1 text-sm md:text-base"
                        disabled={sending}
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedImage) || sending}
                        className="btn-primary px-4 md:px-6 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                    >
                        {sending ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span className="hidden md:inline">Sending...</span>
                            </>
                        ) : (
                            <>
                                <span className="hidden md:inline">Send</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
