const Booking = require('../models/booking.model');
const paymentService = require('../services/payment.service');

const createPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethodType, cardDetails } = req.body;
    const userId = req.user.id;

    if (!bookingId || !paymentMethodType) {
      return res.status(400).json({ message: 'Booking ID and payment method type are required' });
    }

    const booking = await Booking.findById(bookingId).populate('userId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'This booking has already been paid' });
    }

    // 1. Create Payment Intent
    const description = `Fix-Connect Booking Ref: ${booking._id}`;
    const intent = await paymentService.createPaymentIntent(booking.amount, description);

    // 2. Create Payment Method
    const billing = {
      name: booking.userId.fullName,
      email: booking.userId.email,
      phone: booking.userId.phoneNumber,
    };
    const method = await paymentService.createPaymentMethod(paymentMethodType, {
      card: cardDetails,
      billing,
    });

    // 3. Attach Payment Method to Intent
    const attachResult = await paymentService.attachPaymentMethod(
      intent.id,
      method.id,
      intent.attributes.client_key
    );

    // 4. Save references to Booking
    booking.paymentIntentId = intent.id;
    booking.paymentMethodId = method.id;

    // Check payment status from attach response
    const status = attachResult.attributes.status;
    let redirectUrl = null;

    if (status === 'succeeded') {
      booking.paymentStatus = 'PAID';
    } else if (
      status === 'awaiting_next_action' &&
      attachResult.attributes.next_action &&
      attachResult.attributes.next_action.redirect
    ) {
      redirectUrl = attachResult.attributes.next_action.redirect.url;
    }

    await booking.save();

    res.status(200).json({
      message: 'Payment initialized',
      status,
      redirectUrl,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment Intent ID is required' });
    }

    const intent = await paymentService.getPaymentIntent(paymentIntentId);
    const status = intent.attributes.status;

    if (status === 'succeeded') {
      const booking = await Booking.findOne({ paymentIntentId });
      if (booking && booking.paymentStatus !== 'PAID') {
        booking.paymentStatus = 'PAID';
        await booking.save();
      }
      return res.status(200).json({ message: 'Payment succeeded', status, booking });
    }

    res.status(200).json({ message: `Payment is in state: ${status}`, status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  confirmPayment,
};
