const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discount_amount: {
    type: Number,
    required: true,
    min: 0,
  },
  discount_type: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed',
  },
  expires_at: {
    type: Date,
    required: true,
  },
  max_uses: {
    type: Number,
    default: 100,
  },
  used_count: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Promo', promoSchema);
