const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    default: null,
  },
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SEARCHING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
    default: 'DRAFT',
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  formatted_address: {
    type: String,
    required: true,
  },
  problem_description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  attachment_urls: [{
    type: String,
  }],
  // Fare calculation
  base_fare: {
    type: Number,
    default: 0,
  },
  platform_fee: {
    type: Number,
    default: 0,
  },
  distance_fee: {
    type: Number,
    default: 0,
  },
  total_amount: {
    type: Number,
    default: 0,
  },
  // Verification code (like ride-hailing PIN)
  otp_code: {
    type: String,
    default: null,
  },
  // Scheduling
  scheduled_at: {
    type: Date,
    default: null,
  },
  is_scheduled: {
    type: Boolean,
    default: false,
  },
  // Time tracking
  accepted_at: {
    type: Date,
    default: null,
  },
  arrived_at: {
    type: Date,
    default: null,
  },
  started_at: {
    type: Date,
    default: null,
  },
  completed_at: {
    type: Date,
    default: null,
  },
  cancelled_at: {
    type: Date,
    default: null,
  },
  cancel_reason: {
    type: String,
    default: null,
  },
  cancelled_by: {
    type: String,
    enum: ['user', 'provider', 'system', null],
    default: null,
  },
  // Search tracking
  search_started_at: {
    type: Date,
    default: null,
  },
  search_radius_km: {
    type: Number,
    default: 5,
  },
  providers_notified: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

bookingSchema.index({ location: '2dsphere' });
bookingSchema.index({ user_id: 1, status: 1 });
bookingSchema.index({ provider_id: 1, status: 1 });
bookingSchema.index({ status: 1, search_started_at: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
