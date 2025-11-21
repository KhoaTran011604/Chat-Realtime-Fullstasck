import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { chatAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import toast from 'react-hot-toast';

const Chat: React.FC = () => {
    const { setChats, selectedChat } = useChat();
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        fetchChats();
    }, []);

    const fetchChats = async () => {
        try {
            const { data } = await chatAPI.fetchChats();
            setChats(data);
        } catch (error: any) {
            toast.error('Failed to load chats');
            console.error(error);
        }
    };

    // Auto-hide sidebar on mobile when chat is selected
    useEffect(() => {
        if (selectedChat && window.innerWidth < 768) {
            setShowSidebar(false);
        }
    }, [selectedChat]);

    return (
        <div className="h-screen flex overflow-hidden relative">
            {/* Chat Window - Now on the left */}
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <ChatWindow />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-6xl mb-4 animate-bounce-subtle">💬</div>
                            <h2 className="text-2xl font-bold gradient-text mb-2">
                                Welcome to ChatApp
                            </h2>
                            <p className="text-gray-400">
                                Select a chat to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile menu button - Now on the right */}
            <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-primary-500 text-white shadow-lg"
            >
                {showSidebar ? '✕' : '☰'}
            </button>

            {/* Sidebar - Now slides from right */}
            <div className={`
        ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0
        fixed md:relative
        right-0
        z-40 md:z-0
        w-full md:w-96
        h-full
        transition-transform duration-300 ease-in-out
      `}>
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {showSidebar && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setShowSidebar(false)}
                />
            )}
        </div>
    );
};

export default Chat;
