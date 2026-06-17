const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['USER', 'WORKER', 'ADMIN'],
      default: 'USER',
    },
    avatar: {
      type: String,
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    // Worker specific onboarding details
    specialty: {
      type: String,
      default: null, // e.g., 'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Repair'
    },
    hourlyRate: {
      type: Number,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    experienceYears: {
      type: Number,
      default: null,
    },
    governmentId: {
      type: String,
      default: null, // URL or base64 data
    },
    certificate: {
      type: String,
      default: null, // URL or base64 data
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'BLOCKED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'],
      default: 'ACTIVE',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    // User specific onboarding details
    address: {
      type: String,
      default: null,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
