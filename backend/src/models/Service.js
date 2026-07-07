const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['cleaning', 'plumbing', 'electrical', 'appliance_repair', 'carpentry', 'painting', 'pest_control', 'beauty', 'general_handyman'],
  },
  icon_name: {
    type: String,
    default: 'construct',
  },
  base_rate: {
    type: Number,
    required: true,
    min: 0,
  },
  rate_type: {
    type: String,
    enum: ['hourly', 'fixed', 'per_visit'],
    default: 'fixed',
  },
  estimated_duration: {
    type: Number,
    default: 60,
    min: 15,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  tags: [String],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Service', serviceSchema);
