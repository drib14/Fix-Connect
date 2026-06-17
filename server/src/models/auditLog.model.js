const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionType: {
      type: String,
      required: true, // e.g. BLOCK_USER, VERIFY_WORKER, UPDATE_LEGAL, CREATE_BLOG, DELETE_REVIEW, CRUD_CATEGORY
    },
    targetEntity: {
      type: String,
      required: true, // e.g. Email address or ID of target user/booking/category
    },
    details: {
      type: String,
      required: true, // description text of action
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
