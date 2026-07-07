const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  booking_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
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
  payment_method: {
    type: String,
    enum: ['gcash', 'grab_pay', 'maya', 'card', 'cash'],
    required: true,
  },
  paymongo_payment_intent_id: {
    type: String,
    default: null,
  },
  paymongo_source_id: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paid_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

transactionSchema.index({ booking_id: 1 });
transactionSchema.index({ user_id: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
