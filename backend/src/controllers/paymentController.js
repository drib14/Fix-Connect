const Transaction = require('../models/Transaction');
const Booking = require('../models/Booking');
const User = require('../models/User');

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
    const user = await User.findById(req.user.id);
    const userCurrency = user?.currency || 'PHP';

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;

    let paymongoIntentId = '';
    let clientKey = '';

    try {
      const response = await fetch('https://api.paymongo.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(booking.total_amount * 100), // PayMongo accepts centavos
              payment_method_allowed: ['card', 'gcash', 'paymaya', 'grab_pay'],
              currency: userCurrency,
              description: `FixConnect Service Booking payment: ${booking._id}`,
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          message: 'PayMongo Payment Intent creation failed.',
          error: data,
        });
      }

      paymongoIntentId = data.data.id;
      clientKey = data.data.attributes.client_key;
    } catch (err) {
      console.error('PayMongo API call error:', err.message);
      return res.status(502).json({ message: 'Failed to communicate with PayMongo gateway.' });
    }

    const transaction = await Transaction.create({
      booking_id,
      user_id: req.user.id,
      provider_id: booking.provider_id,
      payment_method,
      amount: booking.total_amount,
      paymongo_payment_intent_id: paymongoIntentId,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Payment intent created successfully via PayMongo.',
      transaction,
      clientKey,
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
