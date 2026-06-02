import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from './errorMiddleware.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, _res, next) => {
  try {
    let accessToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    
    // Ensure that JWT secrets are NEVER exposed or hardcoded fallback
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenSecret) {
      return next(new AppError('Server authentication configuration is missing.', 500));
    }

    let decodedPayload;
    try {
      decodedPayload = jwt.verify(accessToken, accessTokenSecret);
    } catch (err) {
      logger.warn('Access token verification failed', { err });
      return next(new AppError('Invalid or expired access token. Please rotate session.', 401));
    }

    const user = await User.findById(decodedPayload.id).select('+role +isOnboarded');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
