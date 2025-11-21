import { Response } from 'express';
import Message from '../models/Message';
import Chat from '../models/Chat';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { content, chatId } = req.body;

        if (!content || !chatId) {
            res.status(400).json({ message: 'Invalid data passed into request' });
            return;
        }

        const newMessage = {
            sender: req.user?._id,
            content: content,
            chat: chatId,
        };

        let message = await Message.create(newMessage);

        message = await message.populate('sender', 'name avatar');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name avatar email',
        });

        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name avatar email')
            .populate('chat');

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
