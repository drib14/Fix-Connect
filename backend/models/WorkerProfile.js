import mongoose from 'mongoose';

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
      trim: true,
    },
    // REPLACED specialty and hourlyRate with transportType, identityVerified, baseRate
    transportType: {
      type: String,
      enum: ['motorcycle', 'car', 'van', 'truck', 'walking'],
      default: 'motorcycle',
    },
    identityVerified: {
      type: Boolean,
      default: false,
    },
    baseRate: {
      type: Number,
      required: [true, 'Base rate is required'],
      min: [0, 'Base rate cannot be negative'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio must not exceed 1000 characters'],
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must not exceed 5'],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    serviceRadius: {
      type: Number, // In Kilometers
      default: 15,
      min: [1, 'Radius must be at least 1 km'],
    },
    availability: {
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      startTime: {
        type: String,
        default: '08:00',
      },
      endTime: {
        type: String,
        default: '17:00',
      },
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

export const WorkerProfile = mongoose.model('WorkerProfile', WorkerProfileSchema);
export default WorkerProfile;
