const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['GCash', 'Maya', 'Bank Transfer'],
    },
    accountDetails: {
      type: String,
      required: true, // Account Name / Account Number / Info
    },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    referenceId: {
      type: String,
      default: null, // Bank Transaction ID or Reference ID
    },
    adminNotes: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PayoutRequest = mongoose.model('PayoutRequest', payoutRequestSchema);

module.exports = PayoutRequest;
