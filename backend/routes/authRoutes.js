const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  switchRole,
  toggleOnline,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  onboardCustomer,
  onboardProvider,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/securityMiddleware");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateToggleOnline,
} = require("../middleware/validatorMiddleware");

router.post("/register", authLimiter, validateRegister, register);
router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/logout", protect, logout);
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password", authLimiter, validateResetPassword, resetPassword);
router.post("/onboard/customer", protect, onboardCustomer);
router.post("/onboard/provider", protect, onboardProvider);
router.get("/me", protect, getMe);
router.put("/switch-role", protect, switchRole);
router.put("/toggle-online", protect, validateToggleOnline, toggleOnline);

module.exports = router;
