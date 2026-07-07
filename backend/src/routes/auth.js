const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  refresh,
  getMe,
  updateProfile,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.post('/logout', auth, logout);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
