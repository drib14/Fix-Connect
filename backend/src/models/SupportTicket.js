const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['General', 'Booking', 'Payment', 'Technical'],
    default: 'General',
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
