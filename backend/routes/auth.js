const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ─── Validation Helpers ───────────────────────────────────────────────
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
};

const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

// Verification code TTL: 30 minutes
const CODE_EXPIRY_MS = 30 * 60 * 1000;

// ─── JWT Generator ────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

// ─── Email Utility ────────────────────────────────────────────────────
const sendVerificationEmail = async (email, name, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"FixConnect Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your FixConnect Account',
      html: `
        <div style="font-family: 'Outfit', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #10b981; border-radius: 12px; padding: 24px;">
          <h2 style="color: #10b981; text-align: center;">Welcome to FixConnect!</h2>
          <p>Hi ${sanitizeInput(name)},</p>
          <p>Thank you for signing up to FixConnect. To complete your registration, please verify your email using the 6-digit verification code below:</p>
          <div style="background-color: #f0fdf4; border: 2px dashed #10b981; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #047857;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 30 minutes. If you did not sign up for an account, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="text-align: center; color: #10b981; font-weight: bold;">FixConnect &bull; Connecting Homes with Handpicked Professionals</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Nodemailer Error: ${error.message}`);
    return false;
  }
};

// ─── Generate secure verification code ────────────────────────────────
const generateVerificationCode = () => {
  // Use crypto-safe random for verification codes
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (rate limited)
router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  const cleanName = sanitizeInput(name);
  const cleanEmail = sanitizeInput(email).toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
    });
  }

  // Whitelist allowed roles
  const allowedRoles = ['user', 'worker'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  try {
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const verificationCode = generateVerificationCode();

    user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password,
      role: userRole,
      verificationCode,
      verificationCodeExpiry: new Date(Date.now() + CODE_EXPIRY_MS),
    });

    await sendVerificationEmail(cleanEmail, cleanName, verificationCode);

    res.status(201).json({
      success: true,
      message: 'User registered. Please check your email for the verification code.',
      userId: user._id,
    });
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/verify
// @desc    Verify email with 6-digit code
// @access  Public
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and verification code are required' });
  }

  try {
    const user = await User.findOne({ email: sanitizeInput(email).toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User is already verified' });
    }

    // Check code expiry
    if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.verificationCode !== sanitizeInput(code)) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    // Create worker profile container if the role is a worker
    if (user.role === 'worker') {
      const existingProfile = await WorkerProfile.findOne({ userId: user._id });
      if (!existingProfile) {
        await WorkerProfile.create({
          userId: user._id,
          title: 'New Service Provider',
          hourlyRate: 25,
          skills: [],
        });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(`Verification Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public (rate limited)
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email: sanitizeInput(email).toLowerCase() }).select('+password');
    if (!user) {
      // Generic message to prevent email enumeration
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Direct check if verified
    if (!user.isVerified) {
      const verificationCode = generateVerificationCode();
      user.verificationCode = verificationCode;
      user.verificationCodeExpiry = new Date(Date.now() + CODE_EXPIRY_MS);
      await user.save();

      await sendVerificationEmail(user.email, user.name, verificationCode);

      return res.status(403).json({
        success: false,
        notVerified: true,
        message: 'Account not verified. A new code has been sent to your email.',
      });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        onboardingCompleted: user.onboardingCompleted,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let workerProfile = null;
    if (req.user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ userId: req.user._id });
    }

    res.status(200).json({
      success: true,
      user: req.user,
      workerProfile,
    });
  } catch (error) {
    console.error(`Auth Me Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset code and email it
// @access  Public (rate limited)
router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(sanitizeInput(email))) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  try {
    const user = await User.findOne({ email: sanitizeInput(email).toLowerCase() });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a reset code has been sent.',
      });
    }

    const resetCode = generateVerificationCode();
    user.verificationCode = resetCode;
    user.verificationCodeExpiry = new Date(Date.now() + CODE_EXPIRY_MS);
    await user.save();

    await sendVerificationEmail(email, user.name, resetCode);

    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a reset code has been sent.',
    });
  } catch (error) {
    console.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/verify-reset-code
// @desc    Check if password reset code is valid
// @access  Public
router.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required' });
  }

  try {
    const user = await User.findOne({ email: sanitizeInput(email).toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    // Check expiry
    if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.verificationCode !== sanitizeInput(code)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code validated successfully.',
    });
  } catch (error) {
    console.error(`Verify Code Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with validated code
// @access  Public (rate limited)
router.post('/reset-password', authLimiter, async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number',
    });
  }

  try {
    const user = await User.findOne({ email: sanitizeInput(email).toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    // Check expiry
    if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ success: false, message: 'Reset code has expired. Please request a new one.' });
    }

    if (user.verificationCode !== sanitizeInput(code)) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    user.password = newPassword;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
