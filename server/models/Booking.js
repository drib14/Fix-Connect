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
  address: {
    type: String,
    required: true,
  },
  priceAtBooking: {
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
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  paymentUrl: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['PayMongo', 'GCash', 'Maya', 'Cash', 'Credit / Debit'],
    required: true,
    default: 'PayMongo'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  // Real-time location tracking for worker heading to user
  workerLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  // Request coordinates (where the user needs the worker)
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  expiresAt: { type: Date },
  proofImageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
