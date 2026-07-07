const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createPaymentIntent,
  paymentWebhook,
  getPaymentHistory,
} = require('../controllers/paymentController');

router.post('/create-intent', auth, createPaymentIntent);
router.post('/webhook', paymentWebhook); // No auth - PayMongo webhook
router.get('/history', auth, getPaymentHistory);

module.exports = router;
