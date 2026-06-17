const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Service = require('../models/service.model');
const { sendBookingCreatedEmail, sendBookingStatusEmail } = require('../utils/email');

/**
 * Creates a new booking and triggers emails
 */
const createBooking = async (userId, bookingData) => {
  const { workerId, serviceId, bookingDate, bookingTime, description, address, longitude, latitude, amount } = bookingData;

  // Verify worker exists
  const workerUser = await User.findById(workerId);
  if (!workerUser || workerUser.role !== 'WORKER') {
    throw new Error('Selected worker not found or invalid');
  }

  // Verify client exists
  const clientUser = await User.findById(userId);
  if (!clientUser) {
    throw new Error('Client not found');
  }

  // Verify service exists if specified
  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error('Selected service not found');
    }
  }

  const booking = await Booking.create({
    userId,
    workerId,
    serviceId: serviceId || null,
    bookingDate: new Date(bookingDate),
    bookingTime,
    description,
    address,
    coordinates: {
      type: 'Point',
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    },
    amount: parseFloat(amount),
    status: 'PENDING',
    paymentStatus: 'UNPAID',
  });

  // Send email alerts asynchronously
  sendBookingCreatedEmail(clientUser, workerUser, booking).catch((err) =>
    console.error('Failed to send booking created emails:', err.message)
  );

  return booking;
};

/**
 * Fetches bookings related to a user based on their role
 */
const getMyBookings = async (userId, role) => {
  let query = {};
  if (role === 'WORKER') {
    query = { workerId: userId };
  } else {
    query = { userId };
  }

  return await Booking.find(query)
    .populate('userId', 'fullName email phoneNumber')
    .populate('workerId', 'fullName email phoneNumber')
    .populate('serviceId')
    .sort({ bookingDate: -1, bookingTime: -1 });
};

/**
 * Updates booking status (with role authorization checks)
 */
const updateBookingStatus = async (bookingId, userId, role, newStatus) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  const isWorker = booking.workerId.toString() === userId.toString();
  const isCustomer = booking.userId.toString() === userId.toString();

  if (!isWorker && !isCustomer) {
    throw new Error('Unauthorized to modify this booking');
  }

  // State Machine Guard
  const validTransitions = {
    PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['COMPLETED', 'CANCELLED'],
    REJECTED: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  const allowedNext = validTransitions[booking.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${booking.status} to ${newStatus}`);
  }

  // Role Guard
  if ((newStatus === 'ACCEPTED' || newStatus === 'REJECTED' || newStatus === 'COMPLETED') && !isWorker) {
    throw new Error('Only workers can Accept, Decline, or Complete a job');
  }

  booking.status = newStatus;
  await booking.save();

  // Load customer and worker details for email alerts
  const customer = await User.findById(booking.userId);
  const worker = await User.findById(booking.workerId);

  if (customer && worker) {
    sendBookingStatusEmail(customer, worker, booking).catch((err) =>
      console.error('Failed to send booking status email:', err.message)
    );
  }

  return booking;
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
