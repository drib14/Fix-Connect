const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');
const socketModule = require('../socket');

router.get('/:bookingId', protect, async (req, res) => {
    try {
        const messages = await Message.find({ booking: req.params.bookingId })
            .populate('sender', 'firstName lastName')
            .sort({ createdAt: 1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/:bookingId', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Check if 24 hours have passed since acceptance
        // In a real app we might track acceptedAt, but we'll use createdAt for simplicity in this demo if status is completed, or check if it's over 24h
        const acceptedAt = booking.updatedAt; // rough approximation for demo
        const now = new Date();
        const diffHours = Math.abs(now - acceptedAt) / 36e5;

        if (booking.status === 'completed' && diffHours > 24) {
             return res.status(403).json({ success: false, message: 'Chat is locked 24 hours after completion.' });
        }

        const message = await Message.create({
            booking: req.params.bookingId,
            sender: req.user._id,
            content: req.body.content
        });

        const populatedMessage = await Message.findById(message._id).populate('sender', 'firstName lastName');

        const io = socketModule.getIO();
        io.to(req.params.bookingId.toString()).emit('receiveMessage', populatedMessage);

        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
