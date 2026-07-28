const express = require("express");
const router = express.Router();
const {
  createBooking,
  acceptBooking,
  updateBookingStatus,
  getBookings,
  getBookingById,
} = require("../controllers/bookingController");
const { protect, authorizeRoles, validateObjectId } = require("../middleware/authMiddleware");
const { dispatchLimiter } = require("../middleware/securityMiddleware");
const { validateBooking, validateStatusUpdate } = require("../middleware/validatorMiddleware");

router.post("/", protect, dispatchLimiter, validateBooking, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, validateObjectId("id"), getBookingById);
router.put("/:id/accept", protect, validateObjectId("id"), authorizeRoles("provider"), acceptBooking);
router.put("/:id/status", protect, validateObjectId("id"), validateStatusUpdate, updateBookingStatus);

module.exports = router;
