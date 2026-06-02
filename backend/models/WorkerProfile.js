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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: [800, 'Bio too long'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    completedJobs: {
      type: Number,
      default: 0,
    },
    responseTimeMinutes: {
      type: Number,
      default: 30, // average response time in minutes
    },
    isAvailable: {
      type: Boolean,
      default: true,
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
    // Enhanced profile fields
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    certifications: {
      type: [
        {
          name: String,
          issuedBy: String,
          year: Number,
        },
      ],
      default: [],
    },
    portfolio: {
      type: [
        {
          imageUrl: String,
          caption: String,
          addedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    // Verification status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: {
      type: [String],
      select: false,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.verificationDocuments;
        return ret;
      },
    },
  }
);

export const WorkerProfile = mongoose.model('WorkerProfile', WorkerProfileSchema);
export default WorkerProfile;
