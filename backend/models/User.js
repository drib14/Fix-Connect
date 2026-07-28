const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: 100,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+[1-9]\d{7,14}$/, "Please provide a valid E.164 phone number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Never included in query results by default
    },
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED"],
      default: "NOT_SUBMITTED",
    },
    yearsExperience: {
      type: Number,
      default: 0,
      min: 0,
      max: 60,
    },
    bio: {
      type: String,
      default: "",
      maxLength: 1000,
    },
    documents: [
      {
        docType: {
          type: String,
          enum: [
            "GOVERNMENT_ID",
            "DEGREE_CERTIFICATE",
            "TESDA_NC2_CERTIFICATE",
            "VOCATIONAL_CERTIFICATE",
            "WORK_LICENSE",
            "OTHER",
          ],
          required: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED"],
          default: "PENDING",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    serviceCategories: {
      type: [String],
      validate: [
        (arr) => arr.length <= 10,
        "Cannot register more than 10 service categories",
      ],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [120.9842, 14.5995],
        validate: {
          validator: function (coords) {
            if (!coords || coords.length !== 2) return false;
            const [lng, lat] = coords;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: "Coordinates must be valid [longitude, latitude] values",
        },
      },
      address: {
        type: String,
        default: "",
        maxLength: 500,
      },
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    // Account lockout fields
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Strip internal fields from every JSON response globally
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 2DSphere index for geospatial query matching
userSchema.index({ location: "2dsphere" });

// Virtual: is account currently locked?
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare input password with stored hash (constant-time via bcrypt)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Increment failed login attempts with progressive lockout
userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

  // Reset if a previous lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
    return this.save();
  }

  this.loginAttempts += 1;

  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }

  return this.save();
};

// Reset login attempts on successful authentication
userSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
