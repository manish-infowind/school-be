import { Router } from 'express';
import { login, logout, forgotPassword } from '../controllers/adminAuthController';
import { getProfile, updateProfile, changePassword, uploadAvatar } from '../controllers/adminProfileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Authentication
router.post('/login', login);
router.post('/auth/logout', authenticate, logout);

// Password Management
router.post('/forgot-password', forgotPassword);
router.post('/change-password', authenticate, changePassword);

// Profile Module
router.get('/admin-profile', authenticate, getProfile);
router.put('/admin-profile', authenticate, updateProfile);
router.post('/admin-profile/avatar', authenticate, uploadAvatar);

export default router;
