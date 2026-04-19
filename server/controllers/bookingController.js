const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const socket = require('../socket');

exports.createBooking = async (req, res) => {
  try {
    const { serviceCategory, date, time, address, lat, lng } = req.body;

    if (!serviceCategory || !date || !time || !address || !lat || !lng) {
      return res.status(400).json({ message: 'All fields, including location coordinates, are required.' });
    }

    // Flat base fee for simplicity in MVP
    const price = 500;
    const tax = price * 0.12;
    const totalAmount = price + tax;

    // Set expiration 5 minutes from now for the "Searching" status
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const newBooking = new Booking({
      userId: req.user._id,
      serviceCategory,
      date,
      time,
      address,
      jobLocation: { lat, lng },
      price,
      tax,
      totalAmount,
      status: 'Searching',
      expiresAt
    });

    const savedBooking = await newBooking.save();

    // Broadcast the new job to all connected clients (workers)
    // We could narrow this down to workers matching the serviceCategory or location radius in a full system
    const io = socket.getIO();
    io.emit('newAvailableJob', savedBooking);

    res.status(201).json({ message: 'Booking successfully created!', booking: savedBooking });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Failed to create booking.' });
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json({ message: 'Only workers can view the job pool.' });
    }

    // Auto-cancel expired 'Searching' bookings before fetching
    await Booking.updateMany({
      status: 'Searching',
      expiresAt: { $lt: new Date() }
    }, {
      $set: { status: 'Cancelled' }
    });

    // Match bookings that are searching and match the worker's category
    const jobs = await Booking.find({
      status: 'Searching',
      serviceCategory: worker.category
    }).populate('userId', 'name email location').sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Get Available Jobs Error:', error);
    res.status(500).json({ message: 'Failed to fetch available jobs.' });
  }
};

exports.acceptJob = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json({ message: 'Only workers can accept jobs.' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'Searching') {
      return res.status(400).json({ message: 'This job is no longer available.' });
    }

    // Assign worker and update status
    booking.workerId = worker._id;
    booking.status = 'Accepted';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id).populate('workerId userId');

    // Notify the user who requested the booking that it was accepted
    const io = socket.getIO();
    // Emit to a specific room for the user to receive the update
    io.to(booking.userId.toString()).emit('jobAccepted', populatedBooking);

    // Also notify other workers that the job is no longer available
    io.emit('jobRemoved', booking._id);

    res.status(200).json({ message: 'Job accepted successfully!', booking: populatedBooking });
  } catch (error) {
    console.error('Accept Job Error:', error);
    res.status(500).json({ message: 'Failed to accept job.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lat, lng } = req.body;

    const validStatuses = ['Accepted', 'EnRoute', 'InProgress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const updateData = { status };
    if (lat && lng) {
      updateData.workerLocation = { lat, lng };
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true }).populate('workerId userId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Emit real-time update to the booking room
    const io = socket.getIO();
    io.to(id).emit('bookingStatusUpdated', booking);

    // Also emit to the user's personal room just in case
    io.to(booking.userId._id.toString()).emit('bookingStatusUpdated', booking);

    res.status(200).json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: 'Failed to update booking status.' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // For workers, we might want to see bookings where they are the worker
    const workerProfile = await Worker.findOne({ userId });

    let query = { userId };
    if (workerProfile) {
        query = { $or: [{ userId: userId }, { workerId: workerProfile._id }] };
    }

    const bookings = await Booking.find(query).populate('workerId userId').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings.' });
  }
};
