const Booking = require("../models/Booking");
const User = require("../models/User");
const ServiceCategory = require("../models/ServiceCategory");
const crypto = require("crypto");
const { getIO } = require("../services/socketService");

// Generate cryptographically strong booking code
const generateBookingCode = () => {
  const randomBytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `FIX-${randomBytes}`;
};

// Allowed state transitions (prevents arbitrary status jumps)
const VALID_TRANSITIONS = {
  SEARCHING: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

// @desc Create instant booking request (SEARCHING state)
// @route POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      serviceName,
      category,
      address,
      coordinates,
      notes,
      paymentMethod,
    } = req.body;

    // Only customers can create bookings
    if (
      req.user.activeRole !== "customer" &&
      req.user.role !== "customer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only customers can create service bookings",
      });
    }

    // Check if customer already has an active pending booking
    const activeBooking = await Booking.findOne({
      customer: req.user.id,
      status: {
        $in: ["SEARCHING", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"],
      },
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: "You already have an active service booking in progress",
      });
    }

    // Lookup service category pricing — only accept active known categories
    const serviceCat = await ServiceCategory.findOne({
      $or: [{ name: serviceName }, { slug: category.toLowerCase() }],
      isActive: true,
    });

    if (!serviceCat) {
      return res.status(400).json({
        success: false,
        message: "Selected service category is not available",
      });
    }

    const basePrice = serviceCat.basePrice;
    const estimatedDistanceKm = 3.5;
    const totalAmount =
      basePrice +
      Math.round(estimatedDistanceKm * serviceCat.pricePerKm);

    const booking = await Booking.create({
      bookingCode: generateBookingCode(),
      customer: req.user.id,
      serviceName: serviceCat.name, // Use canonical name, not user input
      category: serviceCat.slug,
      status: "SEARCHING",
      location: {
        address: address.slice(0, 500),
        coordinates,
      },
      notes: notes ? notes.slice(0, 500) : "",
      basePrice,
      estimatedDistanceKm,
      totalAmount,
      paymentMethod: paymentMethod || "CASH",
    });

    // Populate customer details for socket broadcast
    const populatedBooking = await Booking.findById(booking._id).populate(
      "customer",
      "name phone rating"
    );

    // Notify only providers in matching category room (never broadcast globally)
    try {
      const io = getIO();
      if (io) {
        io.to(`category_${serviceCat.slug}`).emit("new_job_dispatch", {
          booking: populatedBooking,
        });
      }
    } catch (err) {
      console.warn("[Socket Dispatch Warning]:", err.message);
    }

    res.status(201).json({
      success: true,
      message: "Searching for nearby service providers...",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("[Create Booking Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating instant service request",
    });
  }
};

// @desc Provider accepts an incoming instant booking request
// @route PUT /api/bookings/:id/accept
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "SEARCHING") {
      return res.status(400).json({
        success: false,
        message:
          "This booking request has already been accepted or cancelled",
      });
    }

    // Prevent provider from accepting their own booking
    if (booking.customer.toString() === req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot accept your own service request",
      });
    }

    booking.provider = req.user.id;
    booking.status = "ACCEPTED";
    booking.timeline.acceptedAt = new Date();

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name phone rating location")
      .populate(
        "provider",
        "name phone rating location serviceCategories"
      );

    // Socket.IO event to update customer room
    try {
      const io = getIO();
      if (io) {
        io.to(`booking_${booking._id}`).emit("booking_accepted", {
          booking: updatedBooking,
        });
        io.to(`user_${booking.customer._id}`).emit(
          "booking_status_updated",
          { booking: updatedBooking }
        );
      }
    } catch (err) {
      console.warn("[Socket Accept Warning]:", err.message);
    }

    res.status(200).json({
      success: true,
      message: "Job accepted successfully!",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("[Accept Booking Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Error accepting booking",
    });
  }
};

// @desc Update booking state with strict transition enforcement & ownership check
// @route PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Ownership check: only the assigned provider or the customer can update
    const isCustomer =
      booking.customer.toString() === req.user.id.toString();
    const isProvider =
      booking.provider &&
      booking.provider.toString() === req.user.id.toString();

    if (!isCustomer && !isProvider) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden. You are not authorized to update this booking.",
      });
    }

    // Customers can only cancel
    if (isCustomer && status !== "CANCELLED") {
      return res.status(403).json({
        success: false,
        message: "Customers may only cancel a booking",
      });
    }

    // Enforce state machine transitions
    const allowedNext = VALID_TRANSITIONS[booking.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;

    if (status === "EN_ROUTE") booking.timeline.enRouteAt = new Date();
    if (status === "ARRIVED") booking.timeline.arrivedAt = new Date();
    if (status === "IN_PROGRESS") booking.timeline.startedAt = new Date();
    if (status === "COMPLETED") {
      booking.timeline.completedAt = new Date();
      booking.paymentStatus = "PAID";
    }
    if (status === "CANCELLED") booking.timeline.cancelledAt = new Date();

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name phone location")
      .populate("provider", "name phone location rating");

    // Real-time Socket sync
    try {
      const io = getIO();
      if (io) {
        io.to(`booking_${booking._id}`).emit("booking_status_updated", {
          booking: updatedBooking,
        });
      }
    } catch (err) {
      console.warn("[Socket Update Status Warning]:", err.message);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("[Update Status Error]:", error.message);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
    });
  }
};

// @desc Get customer or provider booking history (only own records)
// @route GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const isProvider =
      req.user.role === "provider" ||
      req.user.activeRole === "provider";
    const filter = isProvider
      ? { provider: req.user.id }
      : { customer: req.user.id };

    // Paginate to prevent excessive data loading
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(filter)
      .populate("customer", "name phone rating")
      .populate("provider", "name phone rating serviceCategories")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
    });
  }
};

// @desc Get single booking details (ownership-verified)
// @route GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name phone rating location")
      .populate(
        "provider",
        "name phone rating location serviceCategories"
      );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // IDOR protection: only the customer or assigned provider can view
    const isCustomer =
      booking.customer._id.toString() === req.user.id.toString();
    const isProvider =
      booking.provider &&
      booking.provider._id.toString() === req.user.id.toString();

    if (!isCustomer && !isProvider) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this booking",
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking details",
    });
  }
};
