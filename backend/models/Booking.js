const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify the category of service'],
    },
    bookingDate: {
      type: Date,
      required: [true, 'Please select a date for the service'],
    },
    bookingTime: {
      type: String,
      required: [true, 'Please select a time for the service'],
    },
    description: {
      type: String,
      required: [true, 'Please describe the problem or service requirements'],
    },
    images: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    reviewText: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Please specify the service address'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

BookingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Booking', BookingSchema);
