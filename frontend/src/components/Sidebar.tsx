import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import UserSearch from './UserSearch';
import ChatList from './ChatList';
import CreateGroupModal from './CreateGroupModal';
import { Search, UserPlus, LogOut, Bell } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { notifications } = useChat();
    const [showSearch, setShowSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    return (
        <div className="w-full md:w-96 glass-dark border-r border-white/10 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <img
                            src={user?.avatar || 'https://ui-avatars.com/api/?background=random&name=User'}
                            alt={user?.name}
                            className="w-12 h-12 rounded-full border-2 border-primary-500"
                        />
                        <div>
                            <h3 className="font-semibold">{user?.name}</h3>
                            <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>
                    </div>

                    {/* Notification Badge */}
                    <div className="relative">
                        <Bell size={20} className="text-gray-400" />
                        {notifications.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {notifications.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                    >
                        <Search size={16} />
                        <span className="hidden sm:inline">Search</span>
                    </button>
                    <button
                        onClick={() => setShowGroupModal(true)}
                        className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center space-x-2"
                    >
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">New Group</span>
                    </button>
                    <button
                        onClick={logout}
                        className="btn-secondary text-sm py-2 px-3 flex items-center justify-center"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Search Component */}
            {showSearch && (
                <div className="border-b border-white/10">
                    <UserSearch onClose={() => setShowSearch(false)} />
                </div>
            )}

            {/* Chat List */}
            <ChatList />

            {/* Create Group Modal */}
            {showGroupModal && (
                <CreateGroupModal onClose={() => setShowGroupModal(false)} />
            )}
        </div>
    );
};

export default Sidebar;
