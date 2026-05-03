const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const socketModule = require('../socket');
const fetch = require('node-fetch');

router.post('/', protect, async (req, res) => {
    try {
        const { serviceType, location, priceAtBooking } = req.body;
        const booking = await Booking.create({ customer: req.user._id, serviceType, location, priceAtBooking });
        socketModule.getIO().emit('newBookingAvailable', booking);
        res.status(201).json({ success: true, data: booking });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'customer') query.customer = req.user._id;
        else if (req.user.role === 'worker') query = { $or: [{ status: 'pending' }, { worker: req.user._id }] };
        const bookings = await Booking.find(query).populate('customer', 'firstName lastName email').populate('worker', 'firstName lastName email').sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('customer', 'firstName lastName email').populate('worker', 'firstName lastName email');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (status === 'accepted' && booking.status === 'pending') booking.worker = req.user._id;
        booking.status = status;
        await booking.save();
        const populatedBooking = await Booking.findById(booking._id).populate('customer', 'firstName lastName email').populate('worker', 'firstName lastName email');
        const io = socketModule.getIO();
        io.to(booking.customer.toString()).emit('bookingStatusUpdated', { bookingId: booking._id, status: booking.status, message: `Your booking status is now: ${booking.status}` });
        io.to(booking._id.toString()).emit('bookingStatusUpdated', { bookingId: booking._id, status: booking.status });
        res.json({ success: true, data: populatedBooking });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/:id/pay', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY;
        const options = {
            method: 'POST',
            headers: { accept: 'application/json', 'content-type': 'application/json', authorization: 'Basic ' + Buffer.from(PAYMONGO_SECRET + ':').toString('base64') },
            body: JSON.stringify({ data: { attributes: { line_items: [{ currency: 'PHP', amount: booking.priceAtBooking * 100, description: `Payment for booking ${booking._id}`, name: booking.serviceType, quantity: 1 }], payment_method_types: ['gcash', 'card', 'paymaya'], description: `Booking ID: ${booking._id}`, success_url: process.env.FRONTEND_URL || 'exp://localhost:8081' } } })
        };
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
        const data = await response.json();
        if (data.errors) return res.status(400).json({ success: false, message: data.errors[0].detail });
        booking.paymongoCheckoutSessionId = data.data.id;
        await booking.save();
        res.json({ success: true, checkoutUrl: data.data.attributes.checkout_url });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.put('/:id/mark-paid', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        booking.paymentStatus = 'paid';
        booking.amountPaid = booking.priceAtBooking;
        booking.invoiceId = 'INV-' + Math.floor(Math.random() * 1000000);
        await booking.save();
        res.json({ success: true, data: booking });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});
module.exports = router;
