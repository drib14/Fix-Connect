const mongoose = require('mongoose');

const servicePostSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Booking', 'Hire'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  rateType: {
    type: String,
    enum: ['Daily', 'Monthly', 'One-time', 'Per Job'],
    required: true
  },
  imageUrl: {
    type: String
  },
  recommendations: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ServicePost', servicePostSchema);
