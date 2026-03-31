const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const axios = require('axios');

exports.createBooking = async (req, res) => {
  try {
    const { workerId, serviceCategory, date, time, address, userId, paymentMethod, paymentType } = req.body;

    // Validate basic inputs
    if (!workerId || !serviceCategory || !date || !time || !address || !paymentMethod) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Securely fetch price from database
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Selected worker not found.' });
    }

    const price = worker.baseFee;

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
            amount: Math.round(totalAmount * 100), // PayMongo accepts amount in cents
            description: `FixConnect Booking: ${serviceCategory}`,
            remarks: `Booking for ${date} at ${time}`
          }
        }
      };

      const response = await axios.post('https://api.paymongo.com/v1/links', paymentData, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          authorization: `Basic ${encodedSecret}`
        }
      });

        if (response.data && response.data.data) {
          paymentUrl = response.data.data.attributes.checkout_url;
          paymentReference = response.data.data.attributes.reference_number;
        }
      } catch (paymentError) {
        console.error('PayMongo link creation error:', paymentError.response?.data || paymentError.message);
        // We can choose to fail the booking if payment link creation fails, or proceed without it
        return res.status(500).json({ message: 'Failed to initialize payment gateway.' });
      }
    }

    const newBooking = new Booking({
      userId: req.user._id, // Use authenticated user's ID
      workerId,
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
      paymentType: paymentType || 'one-time',
      paymentStatus: paymentMethod === 'Cash' ? 'pending' : (paymentUrl ? 'pending' : 'paid'), // Just a mock for logic
      status: paymentMethod === 'Cash' ? 'Confirmed' : 'Pending'
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
    const bookings = await Booking.find({ userId }).populate('workerId').sort({ createdAt: -1 });
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

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
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
