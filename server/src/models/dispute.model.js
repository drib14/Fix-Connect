const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    raisedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'RESOLVED', 'CLOSED'],
      default: 'OPEN',
    },
    resolution: {
      type: String,
      default: null, // e.g. "REFUNDED", "DISMISSED", "SETTLED_WORKER"
    },
    adminNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Dispute = mongoose.model('Dispute', disputeSchema);

module.exports = Dispute;
