import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import UserSearch from './UserSearch';
import ChatList from './ChatList';
import CreateGroupModal from './CreateGroupModal';
import EditProfileModal from './EditProfileModal';
import { Search, UserPlus, LogOut, Bell, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { notifications } = useChat();
    const [showSearch, setShowSearch] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    return (
        <div className="w-full md:w-96 glass-dark border-r border-slate-700/30 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <img
                                src={user?.avatar || 'https://ui-avatars.com/api/?background=random&name=User'}
                                alt={user?.name}
                                className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-lg shadow-blue-500/30"
                            />
                            {/* Settings button on avatar */}
                            <button
                                onClick={() => setShowEditProfile(true)}
                                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full transition-colors shadow-lg"
                                title="Edit Profile"
                            >
                                <Settings size={12} />
                            </button>
                        </div>
                        <div>
                            <h3 className="font-semibold">{user?.name}</h3>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                    </div>

                    {/* Notification Badge */}
                    <div className="relative">
                        <Bell size={20} className="text-slate-400" />
                        {notifications.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
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
                <div className="border-b border-slate-700/30">
                    <UserSearch onClose={() => setShowSearch(false)} />
                </div>
            )}

            {/* Chat List */}
            <ChatList />

            {/* Create Group Modal */}
            {showGroupModal && (
                <CreateGroupModal onClose={() => setShowGroupModal(false)} />
            )}

            {/* Edit Profile Modal */}
            {showEditProfile && (
                <EditProfileModal onClose={() => setShowEditProfile(false)} />
            )}
        </div>
    );
};

export default Sidebar;
