const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @route   POST /api/payments/checkout
// @desc    Process a simulated or live PayMongo transaction
// @access  Private
router.post('/checkout', protect, async (req, res) => {
  const { bookingId, cardName, cardNumber, expiry, cvc, paymentMethod } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized transaction request' });
    }

    // Simulate PayMongo processing delays
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple card validator simulation
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        return res.status(400).json({ success: false, message: 'Invalid card number' });
      }
      if (!cvc || cvc.length < 3) {
        return res.status(400).json({ success: false, message: 'Invalid CVC security code' });
      }
    }

    // Generate mock PayMongo Reference Transaction Details
    const mockPaymentId = `pay_test_${Math.random().toString(36).substring(2, 15)}`;
    
    booking.paymentStatus = 'paid';
    booking.paymentDetails = {
      gateway: 'PayMongo',
      paymentId: mockPaymentId,
      paymentMethod: paymentMethod || 'card',
      cardLast4: cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '4242',
      paidAt: new Date(),
    };
    
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully through PayMongo Secure API',
      paymentDetails: booking.paymentDetails,
    });
  } catch (error) {
    console.error(`PayMongo Checkout Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
