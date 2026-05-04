import { Router } from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadPhoto } from '../controllers/userProfileController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, me);
router.post('/profile-photo', authMiddleware, upload.single('photo'), uploadPhoto);

export default router;
