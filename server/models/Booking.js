const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const BookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false // Optional for instant booking
  },
  status: {
    type: String,
    enum: ['finding_provider', 'pending', 'accepted', 'declined', 'arrived', 'in_progress', 'completed', 'cancelled'],
    default: 'finding_provider',
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  time: {
    type: String, // HH:MM
    required: true
  },
  pickupAddress: {
    type: String,
    default: ''
  },
  customerCoords: {
    type: [Number], // [longitude, latitude]
    default: [120.9842, 14.5995]
  },
  workerCoords: {
    type: [Number], // [longitude, latitude]
    default: [120.9842, 14.5995]
  },
  notes: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  chat: [MessageSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
