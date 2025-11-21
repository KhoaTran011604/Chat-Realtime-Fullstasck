import express from 'express';
import { searchUsers, getUserProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

export default router;
