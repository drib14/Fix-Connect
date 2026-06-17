const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig = mongoose.model('SystemConfig', configSchema);

module.exports = SystemConfig;
