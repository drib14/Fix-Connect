const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Get bookings history list based on role
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
      .populate('worker', 'name email avatar phone workerDetails location')
      .populate('service', 'name category description price duration')
      .sort({ createdAt: -1 })
      .exec();

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Retrieve currently active booking for customer or worker
router.get('/active', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    let query = {
      status: { $in: ['finding_provider', 'pending', 'accepted', 'arrived', 'in_progress'] }
    };
    if (user.role === 'customer') {
      query.customer = user._id;
    } else {
      query.worker = user._id;
    }

    const activeBooking = await Booking.findOne(query)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails location')
      .populate('service', 'name category description price duration')
      .populate('chat.sender', 'name avatar')
      .exec();

    res.json(activeBooking); // returns null if no active booking
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create instant booking dispatch (Customer only)
router.post('/instant', requireAuth, async (req, res) => {
  try {
    const { category, latitude, longitude, notes, address } = req.body;

    const customerUser = await User.findOne({ clerkId: req.auth.userId });
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }

    // Proximity search: find closest online worker in this category within 10km
    const nearbyWorkers = await User.find({
      role: 'worker',
      status: 'online',
      'workerDetails.category': category,
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
          },
          $maxDistance: 10000 // 10 km in meters
        }
      }
    });

    if (!nearbyWorkers || nearbyWorkers.length === 0) {
      return res.status(404).json({ message: 'No active service providers nearby. Please try again later.' });
    }

    const selectedWorker = nearbyWorkers[0];

    // Standard service base pricing
    const basePrices = {
      'Plumbing': 50,
      'Electrical': 60,
      'Cleaning': 40,
      'AC Repair': 55,
      'Carpentry': 45,
      'Painting': 50
    };
    const price = basePrices[category] || 50;

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    const booking = new Booking({
      customer: customerUser._id,
      worker: selectedWorker._id,
      category,
      status: 'finding_provider',
      date: dateStr,
      time: timeStr,
      pickupAddress: address || 'Current Location',
      customerCoords: [parseFloat(longitude), parseFloat(latitude)],
      workerCoords: selectedWorker.location.coordinates,
      notes: notes || '',
      price
    });

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails location');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error during dispatch', error: error.message });
  }
});

// Create a booking (Scheduled / Traditional route)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { serviceId, date, time, notes } = req.body;

    const customerUser = await User.findOne({ clerkId: req.auth.userId });
    if (!customerUser || customerUser.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can book services' });
    }

    const service = await Service.findById(serviceId).populate('worker');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const booking = new Booking({
      customer: customerUser._id,
      worker: service.worker._id,
      service: serviceId,
      category: service.category,
      status: 'pending',
      date,
      time,
      pickupAddress: 'Scheduled Service Address',
      customerCoords: customerUser.location?.coordinates || [120.9842, 14.5995],
      workerCoords: service.worker?.location?.coordinates || [120.9842, 14.5995],
      notes: notes || '',
      price: service.price
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status (with auto-assign matching logic on worker decline)
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['accepted', 'declined', 'arrived', 'in_progress', 'completed', 'cancelled'];
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

    // Security check
    if (user.role === 'customer') {
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Customers can only cancel bookings' });
      }
      if (booking.customer.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
    } else if (user.role === 'worker') {
      if (booking.worker.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized action' });
      }
    }

    if (status === 'declined' && user.role === 'worker') {
      // Find the next closest online worker in this category who is not the current one
      const nearbyWorkers = await User.find({
        _id: { $ne: booking.worker },
        role: 'worker',
        status: 'online',
        'workerDetails.category': booking.category,
        location: {
          $nearSphere: {
            $geometry: {
              type: 'Point',
              coordinates: booking.customerCoords
            },
            $maxDistance: 10000
          }
        }
      });

      if (nearbyWorkers && nearbyWorkers.length > 0) {
        const nextWorker = nearbyWorkers[0];
        booking.worker = nextWorker._id;
        booking.workerCoords = nextWorker.location.coordinates;
        booking.status = 'finding_provider'; // re-enter find loop
        await booking.save();
      } else {
        booking.status = 'cancelled'; // cancel since no other providers are online
        await booking.save();
      }
    } else {
      booking.status = status;
      await booking.save();
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails location')
      .populate('service', 'name category description price duration');

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Append chat message to booking conversation (Customer & Worker only)
router.post('/:id/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;

    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Security check: must be customer or worker for this booking
    if (booking.customer.toString() !== user._id.toString() && booking.worker.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    booking.chat.push({
      sender: user._id,
      message
    });

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails location')
      .populate('chat.sender', 'name avatar');

    res.status(201).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get individual booking details by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email avatar phone')
      .populate('worker', 'name email avatar phone workerDetails location')
      .populate('chat.sender', 'name avatar')
      .populate('service', 'name category description price duration');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
