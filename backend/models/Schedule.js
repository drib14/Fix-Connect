const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlots: {
      type: [String], // e.g., ["09:00", "10:00", "14:00"]
      default: [],
    },
    isDayOff: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);
