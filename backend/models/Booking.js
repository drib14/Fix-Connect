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
    checklist: {
      type: [
        {
          task: { type: String, required: true },
          completed: { type: Boolean, default: false },
        }
      ],
      default: [
        { task: 'Arrive at client location', completed: false },
        { task: 'Perform initial diagnostics', completed: false },
        { task: 'Discuss options with client', completed: false },
        { task: 'Perform repair or maintenance task', completed: false },
        { task: 'Test and verify resolution', completed: false },
        { task: 'Clean up workspace', completed: false },
      ],
    },
    completionReport: {
      notes: { type: String, default: '' },
      proofPhoto: { type: String, default: '' },
      completedAt: { type: Date, default: null },
    },
    dispute: {
      isDisputed: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
      refundRequested: { type: Boolean, default: false },
    },
    couponCode: {
      type: String,
      default: '',
    },
    discountAmount: {
      type: Number,
      default: 0,
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
