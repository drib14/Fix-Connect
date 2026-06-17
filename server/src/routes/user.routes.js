const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/onboard', authenticate, userController.onboard);
router.get('/workers', authenticate, userController.getWorkers);
router.get('/geocode', authenticate, userController.geocodeAddress);

module.exports = router;
