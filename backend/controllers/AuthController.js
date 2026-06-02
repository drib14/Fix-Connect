import { AuthService } from '../services/AuthService.js';
import { logger } from '../utils/logger.js';

const authService = new AuthService();

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
  });
};

export class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      logger.info(`Processing registration request for: ${email}`);

      const user = await authService.register({ name, email, passwordHash: password, role });

      res.status(201).json({
        status: 'success',
        message: 'Registration successful! A verification email has been sent to your email address.',
        data: {
          user,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const token = req.query.token || req.body.token;
      
      await authService.verifyEmail(token);

      res.status(200).json({
        status: 'success',
        message: 'Your email address has been successfully verified! You can now log in.',
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      logger.info(`Processing login request for: ${email}`);

      const { user, accessToken, refreshToken } = await authService.login(email, password);

      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully.',
        data: {
          user,
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
      logger.info('Processing refresh token rotation request.');

      const { accessToken, refreshToken } = await authService.refreshToken(oldRefreshToken);

      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      logger.info('Processing user logout.');

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      logger.info(`Processing forgot password request for: ${email}`);

      await authService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: 'If the email is associated with an active account, password reset instructions have been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const token = req.params.token || req.body.token;
      const { password } = req.body;
      logger.info('Processing password reset verification.');

      await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: 'Password has been successfully updated! You can now log in with your new credentials.',
      });
    } catch (err) {
      next(err);
    }
  }
}
export default AuthController;
