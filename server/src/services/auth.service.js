const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateResetToken, verifyResetToken } = require('../utils/jwt');
const { sendResetPasswordEmail } = require('../utils/email');

const register = async (data) => {
  const { fullName, email, phoneNumber, password, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    passwordHash: hashedPassword,
    role: role || 'USER',
  });

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const refreshToken = async (token) => {
  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // We don't throw an error to prevent email enumeration attacks
    return;
  }

  const resetToken = generateResetToken(user._id);
  const expiresAt = new Date(Date.now() + 3600000); // 1 hour

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = expiresAt;
  await user.save();

  await sendResetPasswordEmail(user.email, resetToken);
};

const resetPassword = async (token, newPassword) => {
  try {
    const payload = verifyResetToken(token);
    const user = await User.findById(payload.id);

    if (!user || user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    user.passwordHash = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isValidPassword = await comparePassword(oldPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Incorrect old password');
  }

  const hashedPassword = await hashPassword(newPassword);

  user.passwordHash = hashedPassword;
  await user.save();
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
