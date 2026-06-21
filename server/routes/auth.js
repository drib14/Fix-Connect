const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Sync Clerk user with MongoDB
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const { email, name, avatar, role } = req.body;
    let user = await User.findOne({ clerkId: req.auth.userId });

    if (!user) {
      user = new User({
        clerkId: req.auth.userId,
        email,
        name,
        avatar: avatar || '',
        role: role || 'customer'
      });
      await user.save();
    } else {
      // Update details if profile exists
      user.name = name || user.name;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error during sync', error: error.message });
  }
});

// Update role (Customer <-> Worker)
router.post('/role', requireAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'worker'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile details (phone, bio, skills, category, status, coordinates)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { phone, bio, skills, category, status, coordinates } = req.body;
    const updateData = {};

    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    
    // Worker details update
    if (bio !== undefined || skills !== undefined || category !== undefined) {
      const user = await User.findOne({ clerkId: req.auth.userId });
      if (user) {
        updateData.workerDetails = {
          ...user.workerDetails.toObject(),
          bio: bio !== undefined ? bio : user.workerDetails.bio,
          skills: skills !== undefined ? skills : user.workerDetails.skills,
          category: category !== undefined ? category : user.workerDetails.category
        };
      }
    }

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      updateData.location = {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
