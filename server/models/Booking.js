const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for testing/mock since frontend might not pass a token cleanly right away if not logged in
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: false
  },
  serviceCategory: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Searching', 'Accepted', 'EnRoute', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Searching'
  },
  // Real-time location tracking for worker heading to user
  workerLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  // Request coordinates (where the user needs the worker)
  jobLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
