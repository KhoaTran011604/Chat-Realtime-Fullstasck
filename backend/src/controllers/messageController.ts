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
        const file = req.file;

        // Must have either content or image
        if ((!content && !file) || !chatId) {
            res.status(400).json({ message: 'Invalid data passed into request' });
            return;
        }

        const newMessage: any = {
            sender: req.user?._id,
            chat: chatId,
        };

        // Add content if provided
        if (content) {
            newMessage.content = content;
        }

        // Add image if uploaded
        if (file) {
            newMessage.imageUrl = (file as any).path; // Cloudinary URL
            newMessage.imagePublicId = (file as any).filename; // Cloudinary public ID
        }

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
