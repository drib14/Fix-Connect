const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const uploadCloud = require('../middleware/uploadCloud');

router.get('/me', protect, getMe);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadCloud.single('avatar'), updateProfile);

module.exports = router;
