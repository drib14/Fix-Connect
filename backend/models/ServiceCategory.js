const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "Wrench",
    },
    basePrice: {
      type: Number,
      required: true,
      default: 250,
    },
    pricePerKm: {
      type: Number,
      default: 20,
    },
    estimatedDuration: {
      type: String,
      default: "30-60 mins",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServiceCategory", serviceCategorySchema);
