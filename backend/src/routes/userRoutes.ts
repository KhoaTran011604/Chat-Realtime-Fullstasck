import express from 'express';
import { searchUsers, getUserProfile } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/profile', protect, getUserProfile);

export default router;
