const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/create-intent', authenticate, paymentController.createPaymentIntent);
router.post('/confirm', authenticate, paymentController.confirmPayment);

module.exports = router;
