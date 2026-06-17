const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: ['Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Handyman', 'Painting', 'Gardening', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      default: '',
    },
    hourlyRate: {
      type: Number,
      required: true,
      default: 0,
    },
    locationName: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    avatar: {
      type: String,
      default: '',
    },
    portfolio: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enable 2dsphere index for location-based distance queries
workerSchema.index({ coordinates: '2dsphere' });

const Worker = mongoose.model('Worker', workerSchema);

module.exports = Worker;
