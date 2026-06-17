const Booking = require('../models/booking.model');

const createPaymentIntent = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Mock response representing Paymongo checkout session metadata
    res.status(200).json({
      checkoutUrl: `/paymongo-simulator?bookingId=${booking._id}&amount=${booking.price}`,
      paymentIntentId: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
      amount: booking.price,
      currency: 'PHP',
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, paymentId } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ message: 'Booking ID and payment method are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = 'PAID';
    booking.paymentId = paymentId || `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
    await booking.save();

    res.status(200).json({
      message: 'Payment completed and booking updated successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
};
