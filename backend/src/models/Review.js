const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
    maxlength: 500,
  },
  tags: [{
    type: String,
    enum: ['punctual', 'professional', 'skilled', 'friendly', 'clean', 'affordable', 'would_recommend'],
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

reviewSchema.index({ provider_id: 1 });
reviewSchema.index({ user_id: 1 });

module.exports = mongoose.model('Review', reviewSchema);
