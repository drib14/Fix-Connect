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
    enum: ['Searching', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Searching'
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
  paymentType: {
    type: String,
    enum: ['one-time', 'monthly'],
    default: 'one-time'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
