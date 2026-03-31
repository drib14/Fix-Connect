const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150',
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  jobsOffered: [{
    type: String
  }],
  baseFee: {
    type: Number,
    required: true,
    default: 1000
  },
  rateType: {
    type: String,
    enum: ['Daily', 'Monthly', 'One-time'],
    default: 'One-time'
  }
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
