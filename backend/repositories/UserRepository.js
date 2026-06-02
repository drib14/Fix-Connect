import { User } from '../models/User.js';

export class UserRepository {
  async findByEmail(email, selectPassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (selectPassword) {
      query.select('+passwordHash');
    }
    return await query.exec();
  }

  async findById(id, selectFields) {
    const query = User.findById(id);
    if (selectFields) {
      query.select(selectFields);
    }
    return await query.exec();
  }

  async create(userData) {
    const newUser = new User(userData);
    return await newUser.save();
  }

  async update(id, updateData, selectFields) {
    const query = User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (selectFields) {
      query.select(selectFields);
    }
    return await query.exec();
  }

  async delete(id) {
    const result = await User.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findByVerificationToken(token) {
    return await User.findOne({
      verificationToken: token,
      verificationTokenExpiresAt: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiresAt').exec();
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiresAt').exec();
  }
}
