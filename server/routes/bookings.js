const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Get bookings based on role
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    let query = {};
    if (user.role === 'customer') {
      query.customer = user._id;
    } else {
      query.worker = user._id;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails')
      .populate('service', 'name category description price duration')
      .sort({ createdAt: -1 })
      .exec();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a booking (Customer only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;

    const customerUser = await User.findOne({ clerkId: req.auth.userId });
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = new Booking({
      customer: customerUser._id,
      worker: service.worker,
      service: serviceId,
      date,
      time,
      notes: notes || '',
      price: service.price // snapshot the service price at booking time
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['accepted', 'declined', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization checks
    if (user.role === 'customer') {
      // Customers can only cancel booking
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Customers can only cancel bookings' });
      }
      if (booking.customer.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
    } else if (user.role === 'worker') {
      // Workers can accept, decline, or complete bookings
      if (['cancelled'].includes(status)) {
        return res.status(403).json({ message: 'Workers cannot cancel bookings in this manner' });
      }
      if (booking.worker.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
    }

    booking.status = status;
    await booking.save();

    // Re-populate and return updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails')
      .populate('service', 'name category description price duration');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
