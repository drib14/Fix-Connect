import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { UserRepository } from '../repositories/UserRepository.js';
import { EmailService } from './EmailService.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { logger } from '../utils/logger.js';

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.emailService = new EmailService();
  }

  generateTokens(user) {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'superultramegasecret';
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'mandatorysuperultramegasecret';

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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

  async register(userData) {
    const { name, email, passwordHash, role } = userData;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already in use by another account.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userRepository.create({
      name,
      email,
      passwordHash: hashedPassword,
      role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
      refreshTokens: [],
    });

    try {
      await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (err) {
      logger.error(`Register succeeded but verification email failed to send to ${email}:`, err);
    }

    return user;
  }

  async verifyEmail(token) {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new AppError('Verification link is invalid or has already expired.', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    logger.info(`User ${user.email} verified email successfully.`);
  }

  async login(email, passwordHash) {
    const user = await this.userRepository.findByEmail(email, true);
    if (!user) {
      throw new AppError('Invalid email or password. Please try again.', 401);
    }

    const isMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password. Please try again.', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Your email address is not verified. Please verify your email first!', 403);
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    await UserSessionManager.appendSession(user, refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'mandatorysuperultramegasecret';

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(oldRefreshToken, refreshTokenSecret);
    } catch (err) {
      logger.warn('Refresh token JWT verification failed.', { err });
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const user = await this.userRepository.findById(decodedPayload.id, '+refreshTokens');
    if (!user) {
      throw new AppError('User session not found.', 401);
    }

    if (!user.refreshTokens.includes(oldRefreshToken)) {
      user.refreshTokens = [];
      await user.save();
      logger.security(`Session compromise warning: Refresh token reuse detected for user ${user.email}. All sessions cleared!`);
      throw new AppError('Session hijacked or reused. For security reasons, all sessions are terminated. Please login again.', 403);
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token !== oldRefreshToken);

    const { accessToken, refreshToken } = this.generateTokens(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
  }

  async logout(refreshToken) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'mandatorysuperultramegasecret';

    try {
      const decodedPayload = jwt.verify(refreshToken, refreshTokenSecret);
      const user = await this.userRepository.findById(decodedPayload.id, '+refreshTokens');
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        await user.save();
        logger.info(`User ${user.email} logged out successfully.`);
      }
    } catch (err) {
      logger.warn('Logout token parsing failed, proceeding to clear client side session.');
    }
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.info(`Forgot password requested for non-existing email: ${email}`);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
  }

  async resetPassword(token, passwordHash) {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new AppError('Password reset link is invalid or has expired.', 400);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(passwordHash, salt);

    user.passwordHash = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.refreshTokens = [];

    await user.save();
    logger.info(`User ${user.email} successfully reset their password.`);
  }
}

class UserSessionManager {
  static async appendSession(user, refreshToken) {
    const dbUser = await mongoose.model('User').findById(user.id).select('+refreshTokens');
    if (dbUser) {
      if (!dbUser.refreshTokens) {
        dbUser.refreshTokens = [];
      }
      dbUser.refreshTokens.push(refreshToken);
      if (dbUser.refreshTokens.length > 5) {
        dbUser.refreshTokens.shift();
      }
      await dbUser.save();
    }
  }
}
