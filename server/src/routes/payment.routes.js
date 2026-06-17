const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate); // All payment routes require authentication

router.post('/create-payment', paymentController.createPayment);
router.post('/confirm-payment', paymentController.confirmPayment);

module.exports = router;
