const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generate6DigitOTP } = require('../utils/otpGenerator');
const { sendOtpEmail } = require('../utils/mailer');

/**
 * Generate JWT access & refresh token pair.
 */
function generateTokens(user) {
  const payload = { id: user._id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
}

/**
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, country, currency, currency_symbol } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      country: country || 'Philippines',
      currency: currency || 'PHP',
      currency_symbol: currency_symbol || '₱',
    });

    const tokens = generateTokens(user);
    user.refresh_token = tokens.refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        country: user.country,
        currency: user.currency,
        currency_symbol: user.currency_symbol,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const tokens = generateTokens(user);
    user.refresh_token = tokens.refreshToken;
    await user.save();

    res.json({
      message: 'Login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        country: user.country,
        currency: user.currency,
        currency_symbol: user.currency_symbol,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

/**
 * POST /api/auth/refresh
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(user);
    user.refresh_token = tokens.refreshToken;
    await user.save();

    res.json(tokens);
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

/**
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refresh_token');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar_url) updates.avatar_url = avatar_url;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-password -refresh_token');

    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { refresh_token: null });
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

/**
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account with this email was found.' });
    }

    const otp = generate6DigitOTP();
    user.reset_otp = otp;
    user.reset_otp_expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await sendOtpEmail(user.email, otp, user.name);

    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('ForgotPassword error:', error);
    res.status(500).json({ message: 'Server error while sending password reset email.' });
  }
};

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account with this email was found.' });
    }

    if (!user.reset_otp || user.reset_otp !== otp || user.reset_otp_expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    res.json({ message: 'Verification successful.' });
  } catch (error) {
    console.error('VerifyOtp error:', error);
    res.status(500).json({ message: 'Server error during code verification.' });
  }
};

/**
 * POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account with this email was found.' });
    }

    if (!user.reset_otp || user.reset_otp !== otp || user.reset_otp_expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.reset_otp = null;
    user.reset_otp_expires = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('ResetPassword error:', error);
    res.status(500).json({ message: 'Server error while resetting password.' });
  }
};
