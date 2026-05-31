const mongoose = require('mongoose');

const CurrencySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide the currency code (e.g., USD, PHP)'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide the currency name'],
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, 'Please provide the currency symbol'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Currency', CurrencySchema);
