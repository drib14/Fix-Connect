const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');

/**
 * POST /api/payments/create-intent
 * Creates a payment record. In production, this integrates with PayMongo API.
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { booking_id, payment_method } = req.body;

    if (!booking_id || !payment_method) {
      return res.status(400).json({ message: 'Booking ID and payment method are required.' });
    }

    const booking = await Booking.findOne({ _id: booking_id, user_id: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Payment can only be created for completed bookings.' });
    }

    // Check for existing transaction
    const existing = await Transaction.findOne({ booking_id });
    if (existing && existing.status === 'paid') {
      return res.status(409).json({ message: 'Payment already completed.' });
    }

    // For cash payments, mark as pending (provider collects)
    if (payment_method === 'cash') {
      const transaction = await Transaction.create({
        booking_id,
        user_id: req.user.id,
        provider_id: booking.provider_id,
        payment_method: 'cash',
        amount: booking.total_amount,
        status: 'paid',
        paid_at: new Date(),
      });

      return res.status(201).json({
        message: 'Cash payment recorded.',
        transaction,
      });
    }

    // For e-wallet / card payments via PayMongo
    // In production, call PayMongo Create Payment Intent API here
    // https://developers.paymongo.com/reference/create-a-paymentintent
    const mockPaymongoIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction = await Transaction.create({
      booking_id,
      user_id: req.user.id,
      provider_id: booking.provider_id,
      payment_method,
      amount: booking.total_amount,
      paymongo_payment_intent_id: mockPaymongoIntentId,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Payment intent created.',
      transaction,
      clientKey: mockPaymongoIntentId,
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to create payment.' });
  }
};

/**
 * POST /api/payments/webhook
 * PayMongo webhook handler for payment status updates.
 */
exports.paymentWebhook = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !data.attributes) {
      return res.status(400).json({ message: 'Invalid webhook payload.' });
    }

    const paymentIntentId = data.attributes.payment_intent_id || data.id;
    const eventType = data.attributes.type;

    if (eventType === 'payment.paid') {
      const transaction = await Transaction.findOne({ paymongo_payment_intent_id: paymentIntentId });
      if (transaction) {
        transaction.status = 'paid';
        transaction.paid_at = new Date();
        await transaction.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
};

/**
 * GET /api/payments/history
 * Returns user's payment history.
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find({ user_id: req.user.id })
        .populate('booking_id')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments({ user_id: req.user.id }),
    ]);

    res.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history.' });
  }
};
