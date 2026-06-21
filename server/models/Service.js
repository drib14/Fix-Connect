const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: String,
    default: '1 hour'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);
