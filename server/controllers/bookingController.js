const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const socket = require('../socket');
const axios = require('axios');

// Helper to standard responses
const createResponse = (success, message, data = null) => {
  return { success, message, data };
};

// Create a notification and emit it
const createAndEmitNotification = async (userId, message) => {
  try {
    const notification = new Notification({ user: userId, message });
    await notification.save();

    const io = socket.getIO();
    io.to(userId.toString()).emit('newNotification', notification);
  } catch (err) {
    console.error('Failed to create notification', err);
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { serviceCategory, date, startTime, endTime, address, lat, lng, paymentMethod } = req.body;

    // Basic Validation
    if (!serviceCategory || !date || !startTime || !address || lat === undefined || lng === undefined) {
      return res.status(400).json(createResponse(false, 'Missing required fields or location coordinates.'));
    }

    const bookingDate = new Date(date);
    if (isNaN(bookingDate)) {
      return res.status(400).json(createResponse(false, 'Invalid date format.'));
    }

    // Lock price
    const priceAtBooking = 500; // Flat fee for now
    const tax = priceAtBooking * 0.12;
    const totalAmount = priceAtBooking + tax;

    let paymentUrl = null;
    let paymentReference = null;

    // Handle digital payments
    if (paymentMethod && paymentMethod !== 'Cash') {
      try {
        let paymongoSecret = process.env.PAYMONGO_SECRET_KEY;
        if (paymongoSecret && !paymongoSecret.startsWith('sk_') && process.env.PAYMONGO_PUBLIC_KEY && process.env.PAYMONGO_PUBLIC_KEY.startsWith('sk_')) {
          paymongoSecret = process.env.PAYMONGO_PUBLIC_KEY;
        }
        const encodedSecret = Buffer.from(`${paymongoSecret}:`).toString('base64');

        const paymentData = {
          data: {
            attributes: {
              send_email_receipt: true,
              show_description: true,
              show_line_items: true,
              line_items: [
                {
                  currency: 'PHP',
                  amount: Math.round(totalAmount * 100),
                  description: `FixConnect Booking: ${serviceCategory} on ${date} at ${startTime}`,
                  name: `Service: ${serviceCategory}`,
                  quantity: 1
                }
              ],
              payment_method_types: ['gcash', 'paymaya', 'card', 'qrph'],
              description: `FixConnect Booking: ${serviceCategory}`
            }
          }
        };

        const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', paymentData, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Basic ${encodedSecret}`
          }
        });

        if (response.data && response.data.data) {
          paymentUrl = response.data.data.attributes.checkout_url;
          paymentReference = response.data.data.id;
        }
      } catch (paymentError) {
        console.error('PayMongo link creation error:', paymentError.response?.data || paymentError.message);
        return res.status(500).json(createResponse(false, 'Failed to initialize payment gateway.'));
      }
    }

    // Set expiration 10 minutes from now for 'pending' state
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newBooking = new Booking({
      userId: req.user._id,
      serviceCategory,
      date: bookingDate,
      startTime,
      endTime,
      address,
      coordinates: { lat, lng },
      priceAtBooking,
      tax,
      totalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || 'Cash',
      paymentUrl,
      paymentReference,
      paymentStatus: paymentUrl ? 'pending' : 'paid', // simplistic logic
      expiresAt
    });

    const savedBooking = await newBooking.save();

    // Broadcast to available workers
    const io = socket.getIO();
    io.emit('newAvailableJob', savedBooking);

    await createAndEmitNotification(req.user._id, `Your booking for ${serviceCategory} was created and is pending worker acceptance.`);

    res.status(201).json(createResponse(true, 'Booking successfully created!', savedBooking));
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json(createResponse(false, 'Failed to create booking.'));
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json(createResponse(false, 'Only workers can view the job pool.'));
    }

    // Auto-cancel expired 'pending' bookings
    await Booking.updateMany({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    }, {
      $set: { status: 'cancelled', cancelledAt: new Date() }
    });

    const jobs = await Booking.find({
      status: 'pending',
      serviceCategory: worker.category
    }).populate('userId', 'name email location').sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Available Jobs Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch available jobs.'));
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json(createResponse(false, 'Only workers can accept jobs.'));
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json(createResponse(false, 'Booking not found.'));
    }

    // Strict state check
    if (booking.status !== 'pending') {
      return res.status(400).json(createResponse(false, `Booking cannot be accepted. Current status is ${booking.status}.`));
    }

    // Double Booking Prevention
    const conflictBooking = await Booking.findOne({
      workerId: worker._id,
      date: booking.date,
      startTime: booking.startTime,
      status: { $in: ['accepted', 'in_progress'] }
    });

    if (conflictBooking) {
      return res.status(409).json(createResponse(false, 'You already have an active booking at this time.'));
    }

    booking.workerId = worker._id;
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate('workerId userId');

    const io = socket.getIO();
    io.to(booking.userId.toString()).emit('jobAccepted', populatedBooking);
    io.emit('jobRemoved', booking._id);

    await createAndEmitNotification(booking.userId, `Your booking for ${booking.serviceCategory} has been accepted by ${worker.name}.`);

    res.status(200).json(createResponse(true, 'Job accepted successfully!', populatedBooking));
  } catch (error) {
    console.error('Accept Job Error:', error);
    res.status(500).json(createResponse(false, 'Failed to accept job.'));
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lat, lng } = req.body;
    const userId = req.user._id.toString();

    const booking = await Booking.findById(id).populate('workerId userId');
    if (!booking) {
      return res.status(404).json(createResponse(false, 'Booking not found.'));
    }

    // Authorization: Only assigned worker can update status
    if (booking.workerId) {
      if (booking.workerId.userId.toString() !== userId) {
        return res.status(403).json(createResponse(false, 'You are not authorized to update this booking.'));
      }
    } else {
      // If unassigned (pending), only the customer can reject/cancel their own booking.
      // Workers should use the 'acceptJob' route, not this generic status updater.
      if (booking.userId._id.toString() !== userId) {
        return res.status(403).json(createResponse(false, 'You are not authorized to update this booking.'));
      }
    }

    // State machine logic
    const currentStatus = booking.status;
    let validTransition = false;

    if (currentStatus === 'pending' && status === 'rejected') validTransition = true;
    if (currentStatus === 'accepted' && status === 'in_progress') validTransition = true;
    if (currentStatus === 'in_progress' && status === 'completed') validTransition = true;

    // Cancellation rules
    if (status === 'cancelled') {
        if (currentStatus === 'pending') validTransition = true; // Anyone can cancel pending
        if (currentStatus === 'accepted') validTransition = true; // Handled below
    }

    if (!validTransition) {
       return res.status(400).json(createResponse(false, `Invalid state transition from ${currentStatus} to ${status}.`));
    }

    booking.status = status;

    if (status === 'completed') booking.completedAt = new Date();
    if (status === 'cancelled') booking.cancelledAt = new Date();

    if (lat && lng) {
      booking.workerLocation = { lat, lng };
    }

    await booking.save();

    // Emits
    const io = socket.getIO();
    io.to(id).emit('bookingStatusUpdated', booking);
    io.to(booking.userId._id.toString()).emit('bookingStatusUpdated', booking);

    await createAndEmitNotification(booking.userId._id, `Your booking status was updated to ${status}.`);

    res.status(200).json(createResponse(true, 'Booking status updated successfully.', booking));
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json(createResponse(false, 'Failed to update booking status.'));
  }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString();

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json(createResponse(false, 'Booking not found.'));
        }

        const isCustomer = booking.userId.toString() === userId;
        // Populate worker to check user ID
        await booking.populate('workerId');
        const isAssignedWorker = booking.workerId && booking.workerId.userId.toString() === userId;

        if (!isCustomer && !isAssignedWorker) {
             return res.status(403).json(createResponse(false, 'Not authorized to cancel this booking.'));
        }

        // Customer Cancellation Rules
        if (isCustomer) {
            if (booking.status !== 'pending' && booking.status !== 'accepted') {
                return res.status(400).json(createResponse(false, 'Customer can only cancel pending or accepted bookings.'));
            }
        }

        // Worker Cancellation Rules
        if (isAssignedWorker) {
            if (booking.status !== 'accepted') {
                return res.status(400).json(createResponse(false, 'Worker can only cancel accepted bookings before they start.'));
            }
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        await booking.save();

        const io = socket.getIO();
        io.to(id).emit('bookingStatusUpdated', booking);
        io.to(booking.userId.toString()).emit('bookingStatusUpdated', booking);

        // Notify the other party
        if (isCustomer && booking.workerId) {
             await createAndEmitNotification(booking.workerId.userId, `Customer cancelled the booking for ${booking.serviceCategory}.`);
        } else if (isAssignedWorker) {
             await createAndEmitNotification(booking.userId, `Worker cancelled the booking for ${booking.serviceCategory}.`);
        }

        res.status(200).json(createResponse(true, 'Booking cancelled successfully.', booking));
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json(createResponse(false, 'Failed to cancel booking.'));
    }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const workerProfile = await Worker.findOne({ userId });
    let query = { userId };
    if (workerProfile) {
        query = { $or: [{ userId: userId }, { workerId: workerProfile._id }] };
    }

    const bookings = await Booking.find(query).populate('workerId userId').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch user bookings.'));
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json(createResponse(false, 'Failed to fetch bookings.'));
  }
};
