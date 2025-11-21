import React, { useState } from 'react';
import { userAPI, chatAPI } from '../services/api';
import { useChat } from '../context/ChatContext';
import { User } from '../types';
import toast from 'react-hot-toast';

interface CreateGroupModalProps {
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const { setChats, setSelectedChat } = useChat();

    const handleSearch = async (query: string) => {
        setSearch(query);

        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            const { data } = await userAPI.searchUsers(query);
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectUser = (user: User) => {
        if (selectedUsers.find((u) => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        if (selectedUsers.length < 2) {
            toast.error('Please select at least 2 users');
            return;
        }

        setLoading(true);
        try {
            const userIds = selectedUsers.map((u) => u._id);
            const { data } = await chatAPI.createGroupChat(groupName, userIds);

            setChats((prevChats) => [data, ...prevChats]);
            setSelectedChat(data);
            toast.success('Group created successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to create group');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Create Group Chat</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Group Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                        Group Name
                    </label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                        className="input-primary"
                    />
                </div>

                {/* Search Users */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-gray-300">
                        Add Users
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search users..."
                        className="input-primary"
                    />
                </div>

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <div
                                key={user._id}
                                className="flex items-center space-x-2 bg-primary-500/20 px-3 py-1 rounded-full"
                            >
                                <span className="text-sm">{user.name}</span>
                                <button
                                    onClick={() => handleSelectUser(user)}
                                    className="text-white hover:text-red-400"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                    {searchResults.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.map((user) => {
                                const isSelected = selectedUsers.find((u) => u._id === user._id);
                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-primary-500/20' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <img
                                            src={user.avatar || 'https://ui-avatars.com/api/?background=random&name=' + user.name}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-gray-400">{user.email}</p>
                                        </div>
                                        {isSelected && <span className="text-primary-400">✓</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ) : search ? (
                        <p className="text-center text-gray-400">No users found</p>
                    ) : (
                        <p className="text-center text-gray-400">Search for users to add</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={onClose}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        disabled={loading || !groupName.trim() || selectedUsers.length < 2}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
