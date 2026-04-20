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
  dailyRate: {
    type: Number,
    default: null
  },
  monthlyRate: {
    type: Number,
    default: null
  },
  oneTimeRate: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Rejected'],
    default: 'Active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // For now, allow mock workers without userIds
  },
  documentUrl: {
    type: String
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isBot: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
