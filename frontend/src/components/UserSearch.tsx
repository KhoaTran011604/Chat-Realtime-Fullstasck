import React, { useState } from 'react';
import { userAPI, chatAPI } from '../services/api';
import { useChat } from '../context/ChatContext';
import { User } from '../types';
import toast from 'react-hot-toast';

interface UserSearchProps {
    onClose: () => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onClose }) => {
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const { setChats, setSelectedChat } = useChat();

    const handleSearch = async (query: string) => {
        setSearch(query);

        if (!query) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const { data } = await userAPI.searchUsers(query);
            setSearchResults(data);
        } catch (error) {
            toast.error('Failed to search users');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId: string) => {
        try {
            const { data } = await chatAPI.accessChat(userId);

            // Update chats list
            setChats((prevChats) => {
                const exists = prevChats.find((c) => c._id === data._id);
                if (exists) {
                    return prevChats;
                }
                return [data, ...prevChats];
            });

            setSelectedChat(data);
            onClose();
            toast.success('Chat opened');
        } catch (error) {
            toast.error('Failed to access chat');
            console.error(error);
        }
    };

    return (
        <div className="p-4">
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="input-primary"
                    autoFocus
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-primary-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {searchResults.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => accessChat(user._id)}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all"
                        >
                            <img
                                src={user.avatar || 'https://ui-avatars.com/api/?background=random&name=' + user.name}
                                alt={user.name}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {search && !loading && searchResults.length === 0 && (
                <p className="text-center text-gray-400 mt-4">No users found</p>
            )}
        </div>
    );
};

export default UserSearch;
