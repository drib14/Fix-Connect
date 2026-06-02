import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateRegistrationInputs, validateLoginInputs } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();
const authController = new AuthController();

// Registration
router.post('/register', validateRegistrationInputs, authController.register);

// Account Email Verification
router.post('/verify-email', authController.verifyEmail);

// User Authentication Login
router.post('/login', validateLoginInputs, authController.login);

// Token Rotation Session Refresh
router.post('/refresh', authController.refreshToken);

// Session Termination Logout
router.post('/logout', authController.logout);

// Password Recovery Requests
router.post('/forgot-password', authController.forgotPassword);

// Password Reset Action
router.post('/reset-password/:token', authController.resetPassword);

// Protected Identity Handshake (Me Route)
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});

export default router;
