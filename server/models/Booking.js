const mongoose = require('mongoose');

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
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending',
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
  notes: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
