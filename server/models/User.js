const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['customer', 'worker'],
    default: 'customer'
  },
  // Worker-specific status
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  // Geolocation for proximity booking
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [120.9842, 14.5995] // Default to Manila coordinates
    }
  },
  // Worker-specific attributes
  workerDetails: {
    bio: {
      type: String,
      default: ''
    },
    skills: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 5.0
    },
    ratingsCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create geospatial index for proximity searches
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
