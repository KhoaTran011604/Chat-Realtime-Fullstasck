import { Response } from 'express';
import Chat from '../models/Chat';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Access or create 1-on-1 chat
// @route   POST /api/chats
// @access  Private
export const accessChat = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ message: 'UserId param not sent with request' });
            return;
        }

        // Check if chat already exists
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user?._id } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate('users', '-password')
            .populate('latestMessage');

        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name avatar email',
        });

        if (isChat.length > 0) {
            res.json(isChat[0]);
        } else {
            // Create new chat
            const chatData = {
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user?._id, userId],
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');

            res.status(200).json(fullChat);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Fetch all chats for a user
// @route   GET /api/chats
// @access  Private
export const fetchChats = async (req: AuthRequest, res: Response) => {
    try {
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } })
            .populate('users', '-password')
            .populate('groupAdmin', '-password')
            .populate('latestMessage')
            .sort({ updatedAt: -1 });

        const results = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: 'name avatar email',
        });

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create group chat
// @route   POST /api/chats/group
// @access  Private
export const createGroupChat = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.body.users || !req.body.name) {
            res.status(400).json({ message: 'Please fill all the fields' });
            return;
        }

        const users = JSON.parse(req.body.users);

        if (users.length < 2) {
            res.status(400).json({ message: 'More than 2 users are required to form a group chat' });
            return;
        }

        users.push(req.user);

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        res.status(200).json(fullGroupChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Rename group
// @route   PUT /api/chats/group/rename
// @access  Private
export const renameGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new: true }
        )
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!updatedChat) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }

        res.json(updatedChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add user to group
// @route   PUT /api/chats/group/add
// @access  Private
export const addToGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, userId } = req.body;

        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!added) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }

        res.json(added);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove user from group
// @route   PUT /api/chats/group/remove
// @access  Private
export const removeFromGroup = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, userId } = req.body;

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
            .populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!removed) {
            res.status(404).json({ message: 'Chat not found' });
            return;
        }

        res.json(removed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
