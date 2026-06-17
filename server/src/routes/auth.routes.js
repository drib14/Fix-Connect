const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/user/register', authController.registerUser);
router.post('/user/login', authController.loginUser);
router.post('/worker/register', authController.registerWorker);
router.post('/worker/login', authController.loginWorker);
router.post('/admin/login', authController.loginAdmin);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
