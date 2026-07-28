const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    serviceName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "SEARCHING",
        "ACCEPTED",
        "EN_ROUTE",
        "ARRIVED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "SEARCHING",
      index: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    notes: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true,
    },
    estimatedDistanceKm: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: ["CASH", "GCASH", "PAYMONGO"],
      default: "CASH",
    },
    timeline: {
      requestedAt: { type: Date, default: Date.now },
      acceptedAt: { type: Date },
      enRouteAt: { type: Date },
      arrivedAt: { type: Date },
      startedAt: { type: Date },
      completedAt: { type: Date },
      cancelledAt: { type: Date },
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
