import { AppError } from './errorMiddleware.js';

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateBody = (requiredFields) => {
  return (req, _res, next) => {
    const missing = [];
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
    }
    next();
  };
};

export const validateRegistrationInputs = (req, _res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new AppError('Name must be at least 2 characters long.', 400));
  }

  if (!email || !validateEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long.', 400));
  }

  if (!role || !['customer', 'provider', 'admin'].includes(role)) {
    return next(new AppError('Role must be one of: customer, provider, admin.', 400));
  }

  next();
};

export const validateLoginInputs = (req, _res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  if (!password) {
    return next(new AppError('Password is required.', 400));
  }

  next();
};
