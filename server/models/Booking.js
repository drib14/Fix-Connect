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
    required: true
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
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentUrl: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
  paymentMethod: {
    type: String,
    enum: ['PayMongo', 'GCash', 'Maya', 'Cash'],
    required: true,
    default: 'PayMongo'
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
