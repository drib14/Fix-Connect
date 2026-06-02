import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { AppError } from './errorMiddleware.js';
import { logger } from '../utils/logger.js';

const userRepository = new UserRepository();

export const protect = async (req, _res, next) => {
  try {
    let accessToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
      return next(new AppError('You are not logged in! Please login to gain access.', 401));
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'superultramegasecret';
    
    let decodedPayload;
    try {
      decodedPayload = jwt.verify(accessToken, accessTokenSecret);
    } catch (err) {
      logger.warn('Access token verification failed', { err });
      return next(new AppError('Invalid or expired access token. Please rotate session.', 401));
    }

    const user = await userRepository.findById(decodedPayload.id);
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (!user.isVerified) {
      return next(new AppError('Your email address is not verified.', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('User profile not resolved in context.', 500));
    }

    if (!roles.includes(req.user.role)) {
      logger.security(`Forbidden action bypass attempt by ${req.user.email} (Role: ${req.user.role}) trying to hit routes restricted to [${roles.join(', ')}]`);
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};
