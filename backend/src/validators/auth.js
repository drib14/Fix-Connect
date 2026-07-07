const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  phone: z.string().min(7, 'Phone number is required.'),
  country: z.string().optional(),
  currency: z.string().optional(),
  currency_symbol: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits.'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  otp: z.string().length(6, 'Verification code must be exactly 6 digits.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  avatar_url: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
