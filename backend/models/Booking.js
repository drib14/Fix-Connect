const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceType: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    location: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    priceAtBooking: { type: Number, required: true },
    // Payment specific fields
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentMethod: { type: String }, // e.g., 'paymongo_gcash', 'paymongo_card', 'cash'
    amountPaid: { type: Number, default: 0 },
    invoiceId: { type: String },
    paymongoCheckoutSessionId: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
