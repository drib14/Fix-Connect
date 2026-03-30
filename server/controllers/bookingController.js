const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
  try {
    const { serviceCategory, date, time, address, price, userId } = req.body;

    // Validate basic inputs
    if (!serviceCategory || !date || !time || !address || !price) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newBooking = new Booking({
      userId,
      serviceCategory,
      date,
      time,
      address,
      price
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
