import mongoose from 'mongoose';

const WorkerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    specialty: {
      type: String,
      trim: true,
      default: '',
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    serviceRadius: {
      type: Number,
      default: 15, // in kilometers
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
