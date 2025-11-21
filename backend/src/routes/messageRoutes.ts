import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('image'), sendMessage);
router.get('/:chatId', protect, getMessages);

export default router;
