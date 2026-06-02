import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
      index: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Provider is required'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    address: {
      formatted: { type: String, default: '' },
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    estimatedDuration: {
      type: Number, // in hours
      default: 1,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'declined', 'in-progress', 'completed', 'cancelled'],
        message: 'Invalid booking status',
      },
      default: 'pending',
      index: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    // Provider response
    providerNotes: {
      type: String,
      default: '',
    },
    // Tracking
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
    // Reference
    referenceNumber: {
      type: String,
      unique: true,
    },
    // Review
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-generate reference number before save
BookingSchema.pre('save', function (next) {
  if (!this.referenceNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referenceNumber = `FC-${ts}-${rand}`;
  }
  next();
});

BookingSchema.index({ customer: 1, status: 1 });
BookingSchema.index({ provider: 1, status: 1 });
BookingSchema.index({ scheduledAt: 1 });

export const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
