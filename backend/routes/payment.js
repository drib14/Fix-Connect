const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

// ─── Luhn Algorithm Card Validation ───────────────────────────────────
const isValidCardNumber = (number) => {
  const digits = number.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
};

// @route   POST /api/payments/checkout
// @desc    Process a simulated or live PayMongo transaction
// @access  Private (rate limited)
router.post('/checkout', protect, paymentLimiter, async (req, res) => {
  const { bookingId, cardName, cardNumber, expiry, cvc, paymentMethod } = req.body;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Booking ID is required' });
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized transaction request' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This booking has already been paid' });
    }

    // Simulate PayMongo processing delays
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Card validation
    if (paymentMethod === 'card') {
      const cleanCard = (cardNumber || '').replace(/\s/g, '');
      if (!cleanCard || cleanCard.length < 13) {
        return res.status(400).json({ success: false, message: 'Invalid card number' });
      }
      if (!isValidCardNumber(cleanCard)) {
        return res.status(400).json({ success: false, message: 'Card number failed validation check' });
      }
      if (!cvc || cvc.length < 3) {
        return res.status(400).json({ success: false, message: 'Invalid CVC security code' });
      }
    }

    // Generate mock PayMongo Reference Transaction
    const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const cleanCardNum = (cardNumber || '').replace(/\s/g, '');

    booking.paymentStatus = 'paid';
    booking.paymentDetails = {
      gateway: 'PayMongo',
      paymentId: mockPaymentId,
      paymentMethod: paymentMethod || 'card',
      // Only store last 4 digits — never log or store full card number
      cardLast4: cleanCardNum.length >= 4 ? cleanCardNum.slice(-4) : '****',
      paidAt: new Date(),
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully through PayMongo Secure API',
      paymentDetails: {
        gateway: booking.paymentDetails.gateway,
        paymentId: booking.paymentDetails.paymentId,
        paymentMethod: booking.paymentDetails.paymentMethod,
        cardLast4: booking.paymentDetails.cardLast4,
        paidAt: booking.paymentDetails.paidAt,
      },
    });
  } catch (error) {
    console.error(`PayMongo Checkout Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
