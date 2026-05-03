const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    serviceType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'en_route', 'completed', 'cancelled'], default: 'pending' },
    location: { address: { type: String, required: true }, lat: { type: Number, required: true }, lng: { type: Number, required: true } },
    priceAtBooking: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    amountPaid: { type: Number, default: 0 },
    invoiceId: { type: String },
    paymongoCheckoutSessionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
