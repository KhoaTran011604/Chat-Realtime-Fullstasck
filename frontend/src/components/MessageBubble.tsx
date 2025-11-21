import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const { user } = useAuth();
    const isSender = message.sender._id === user?._id;

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4 fade-in`}>
            <div className={`flex items-end space-x-2 max-w-[75%] ${isSender ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar - only show for received messages */}
                {!isSender && (
                    <img
                        src={message.sender.avatar || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(message.sender.name)}`}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                )}

                {/* Message Content */}
                <div className="flex flex-col">
                    {/* Sender name for received messages */}
                    {!isSender && (
                        <p className="text-xs text-gray-400 mb-1 px-2">{message.sender.name}</p>
                    )}

                    {/* Message bubble */}
                    <div className={`
            px-4 py-3 rounded-2xl shadow-lg
            ${isSender
                            ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-br-sm'
                            : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-bl-sm'
                        }
          `}>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {message.content}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <p className={`text-xs mt-1 px-2 ${isSender ? 'text-right text-gray-400' : 'text-left text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
