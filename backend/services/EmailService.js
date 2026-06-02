import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import { AppError } from '../middleware/errorMiddleware.js';

export class EmailService {
  constructor() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  async sendEmail(to, subject, html) {
    const from = `"FixConnect" <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email successfully dispatched to ${to} with subject: "${subject}"`);
    } catch (err) {
      logger.error(`Nodemailer failed to dispatch email to ${to}:`, err);
      throw new AppError('Email delivery failed. Please check your credentials or try again later.', 500);
    }
  }

  async sendVerificationEmail(to, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4CAF50; margin: 0;">Welcome to FixConnect!</h2>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering on FixConnect. We connect customers with top-tier local service providers seamlessly.</p>
        <p>To finalize your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 13px;">If the button above does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: #0066cc;"><a href="${verifyUrl}">${verifyUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This verification link will expire in 24 hours. If you did not sign up for a FixConnect account, please ignore this email.</p>
      </div>
    `;

    await this.sendEmail(to, 'Verify Your FixConnect Account', htmlContent);
  }

  async sendPasswordResetEmail(to, name, token) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #FF5722; margin: 0;">Password Reset Request</h2>
        </div>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset the password associated with your FixConnect account.</p>
        <p>To set a new password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #FF5722; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 13px;">If the button above does not work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: #0066cc;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 1 hour. If you did not request a password reset, please ignore this message and ensure your account credentials are secure.</p>
      </div>
    `;

    await this.sendEmail(to, 'Reset Your FixConnect Password', htmlContent);
  }
}
