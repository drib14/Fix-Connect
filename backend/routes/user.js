const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   PUT /api/users/onboard
// @desc    Complete client onboarding
// @access  Private
router.put('/onboard', protect, upload.single('avatar'), async (req, res) => {
  const { phone, address, longitude, latitude, interests } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.phone = phone || user.phone;
    user.address = address || user.address;
    
    if (longitude && latitude) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (interests) {
      // interests comes as stringified array or standard array
      user.interests = Array.isArray(interests) 
        ? interests 
        : JSON.parse(interests || '[]');
    }

    if (req.file) {
      user.avatar = req.file.path; // Cloudinary secure URL
    }

    user.onboardingCompleted = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user,
    });
  } catch (error) {
    console.error(`Onboarding Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update standard user profile
// @access  Private
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  const { name, phone, address, longitude, latitude } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (longitude && latitude) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    if (req.file) {
      user.avatar = req.file.path;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error(`Profile Update Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
