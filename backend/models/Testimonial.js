const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: [true, 'Please provide the author name'],
    },
    role: {
      type: String, // e.g., "Customer", "Professional Plumber"
      default: 'Customer',
    },
    content: {
      type: String,
      required: [true, 'Please provide the testimonial content'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);
