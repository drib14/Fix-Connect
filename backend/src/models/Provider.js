const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    default: '',
  },
  specialty_services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },
  average_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  total_reviews: {
    type: Number,
    default: 0,
  },
  total_completed: {
    type: Number,
    default: 0,
  },
  active_status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline',
  },
  current_location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  documents: [{
    type: { type: String },
    url: String,
    verified: { type: Boolean, default: false },
  }],
  last_active: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

providerSchema.index({ current_location: '2dsphere' });
providerSchema.index({ active_status: 1, specialty_services: 1 });

module.exports = mongoose.model('Provider', providerSchema);
