const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const axios = require('axios');

exports.createBooking = async (req, res) => {
  try {
    const { serviceCategory, date, time, address, paymentMethod } = req.body;

    // Validate basic inputs
    if (!serviceCategory || !date || !time || !address || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // For Grab-style on demand, there is a fixed base price per category
    // or calculated price. For MVP, we'll assign a flat base fee for any category.
    const price = 500;

    // Calculate tax and total amount
    const tax = price * 0.12;
    const totalAmount = price + tax;

    let paymentUrl = null;
    let paymentReference = null;

    // Create PayMongo link only if paymentMethod is PayMongo, GCash, Maya, or Credit / Debit
    if (paymentMethod === 'PayMongo' || paymentMethod === 'GCash' || paymentMethod === 'Maya' || paymentMethod === 'Credit / Debit') {
      try {
        let paymongoSecret = process.env.PAYMONGO_SECRET_KEY;
        // In case the user swapped public and secret keys in .env
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
                amount: Math.round(totalAmount * 100), // PayMongo accepts amount in cents
                description: `FixConnect Booking: ${serviceCategory} on ${date} at ${time}`,
                name: `Service: ${serviceCategory}`,
                quantity: 1
              }
            ],
            payment_method_types: ['gcash', 'paymaya', 'card', 'dob', 'dob_ubp', 'qrph'],
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
        // We can choose to fail the booking if payment link creation fails, or proceed without it
        return res.status(500).json({ message: 'Failed to initialize payment gateway.' });
      }
    }

    // Set expiration 2 minutes from now
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    const newBooking = new Booking({
      userId: req.user._id, // Use authenticated user's ID
      serviceCategory,
      date,
      time,
      address,
      price,
      tax,
      totalAmount,
      paymentUrl,
      paymentReference,
      paymentMethod,
      paymentType: 'one-time',
      paymentStatus: paymentMethod === 'Cash' ? 'pending' : (paymentUrl ? 'pending' : 'paid'), // Just a mock for logic
      status: 'Searching', // Matches user with worker
      expiresAt
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking successfully created!', booking: savedBooking });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Failed to create booking.' });
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

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-cancel expired 'Searching' bookings
    await Booking.updateMany({
      status: 'Searching',
      expiresAt: { $lt: new Date() }
    }, {
      $set: { status: 'Cancelled' }
    });

    // For workers, we might want to see bookings where they are the worker
    const workerProfile = await Worker.findOne({ userId });

    let query = { userId };
    if (workerProfile) {
        // If they are a worker, fetch both bookings they made and bookings they received
        query = { $or: [{ userId: userId }, { workerId: workerProfile._id }] };
    }

    const bookings = await Booking.find(query).populate('workerId userId').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Searching', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: 'Failed to update booking status.' });
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(403).json({ message: 'Only workers can view the job pool.' });
    }

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

    // Assign worker and move to next status based on payment logic
    booking.workerId = worker._id;
    booking.status = booking.paymentMethod === 'Cash' ? 'Confirmed' : 'Pending';
    await booking.save();

    res.status(200).json({ message: 'Job accepted successfully!', booking });
  } catch (error) {
    console.error('Accept Job Error:', error);
    res.status(500).json({ message: 'Failed to accept job.' });
  }
};
