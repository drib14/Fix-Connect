import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorMiddleware.js';
import { UserSessionManager } from '../models/User.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';

export class AuthService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  generateTokens(user) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new AppError('Server authentication configuration is missing.', 500);
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, isOnboarded: user.isOnboarded },
      accessTokenSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      refreshTokenSecret,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async registerUser(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userRepository.create({
      ...userData,
      verificationToken,
      verificationTokenExpiresAt,
      refreshTokens: [],
    });

    try {
      await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (err) {
      logger.error('Failed to send verification email:', err);
    }

    return user;
  }

  async verifyEmail(token) {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token.', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    const { accessToken, refreshToken } = this.generateTokens(user);
    await UserSessionManager.appendSession(user, refreshToken);

    await user.save({ validateBeforeSave: false });
    return { user, accessToken, refreshToken };
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email, '+passwordHash +refreshTokens');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email address to log in.', 403);
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    await UserSessionManager.appendSession(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new AppError('Refresh token is required.', 400);
    }

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
      throw new AppError('Server authentication configuration is missing.', 500);
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(oldRefreshToken, refreshTokenSecret);
    } catch (err) {
      logger.warn('Refresh token JWT verification failed.', { err });
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const user = await this.userRepository.findById(decodedPayload.id, '+refreshTokens');
    if (!user) {
      throw new AppError('User not found.', 401);
    }

    if (!user.refreshTokens.includes(oldRefreshToken)) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      logger.security(`Session compromise warning: Refresh token reuse detected for user ${user.email}. All sessions cleared!`);
      throw new AppError('Security violation detected. Please log in again.', 401);
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token !== oldRefreshToken);

    const { accessToken, refreshToken } = this.generateTokens(user);
    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;

    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshTokenSecret) {
        return; // Don't crash on logout, just ignore
    }

    try {
      const decodedPayload = jwt.verify(refreshToken, refreshTokenSecret);
      const user = await this.userRepository.findById(decodedPayload.id, '+refreshTokens');

      if (user && user.refreshTokens) {
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        await user.save({ validateBeforeSave: false });
      }
    } catch (err) {
      logger.warn('Logout token parsing failed, proceeding to clear client side session.');
    }
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save({ validateBeforeSave: false });

    try {
      await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('There was an error sending the password reset email. Try again later.', 500);
    }

    return true;
  }

  async resetPassword(token, passwordHash) {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Token is invalid or has expired', 400);
    }

    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    // Clear sessions
    user.refreshTokens = [];

    await user.save();
    return true;
  }

  static async appendSession(user, refreshToken) {
    const dbUser = await mongoose.model('User').findById(user.id).select('+refreshTokens');
    if (dbUser) {
      if (!dbUser.refreshTokens) {
        dbUser.refreshTokens = [];
      }
      dbUser.refreshTokens.push(refreshToken);
      // Keep max 5 sessions
      if (dbUser.refreshTokens.length > 5) {
        dbUser.refreshTokens.shift();
      }
      await dbUser.save({ validateBeforeSave: false });
    }
  }
}
