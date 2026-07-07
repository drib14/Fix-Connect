const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require('../validators/auth');
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

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', auth, getMe);
router.put('/profile', auth, validate(updateProfileSchema), updateProfile);
router.post('/logout', auth, logout);

router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;
