const mongoose = require('mongoose');

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a professional title'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Please provide an hourly rate'],
      default: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    certifications: {
      type: [String], // Array of Cloudinary URLs
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    workingHours: {
      start: {
        type: String,
        default: '08:00',
      },
      end: {
        type: String,
        default: '17:00',
      },
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkerProfile', WorkerProfileSchema);
