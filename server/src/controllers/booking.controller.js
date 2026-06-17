const bookingService = require('../services/booking.service');

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const booking = await bookingService.createBooking(userId, req.body);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const bookings = await bookingService.getMyBookings(userId, role);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await bookingService.updateBookingStatus(id, userId, role, status);
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
};
