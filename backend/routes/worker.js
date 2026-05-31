const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Haversine Distance Formula (km)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @route   PUT /api/workers/onboard
// @desc    Complete worker onboarding
// @access  Private
router.put('/onboard', protect, upload.array('certifications', 5), async (req, res) => {
  const { title, skills, hourlyRate, bio, startHour, endHour, address, longitude, latitude } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new WorkerProfile({ userId: req.user._id });
    }

    // Save user geographic location
    user.address = address || user.address;
    if (longitude && latitude) {
      user.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }
    user.onboardingCompleted = true;
    await user.save();

    // Save worker profile specifications
    profile.title = title || profile.title;
    profile.hourlyRate = parseFloat(hourlyRate || 0);
    profile.bio = bio || profile.bio;
    profile.workingHours = {
      start: startHour || '08:00',
      end: endHour || '17:00',
    };

    if (skills) {
      profile.skills = Array.isArray(skills) 
        ? skills 
        : JSON.parse(skills || '[]');
    }

    if (req.files && req.files.length > 0) {
      const urls = req.files.map((file) => file.path);
      profile.certifications = [...profile.certifications, ...urls];
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Worker onboarding completed. Pending admin approval.',
      user,
      profile,
    });
  } catch (error) {
    console.error(`Worker Onboard Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/workers/search
// @desc    Discover and search workers (optionally sorted by distance)
// @access  Public
router.get('/search', async (req, res) => {
  const { category, search, lat, lng, maxDist } = req.query;

  try {
    // 1. Get all verified and onboarded workers
    const activeWorkers = await User.find({
      role: 'worker',
      onboardingCompleted: true,
      status: 'active',
    }).select('-password');

    const workerIds = activeWorkers.map((w) => w._id);

    // 2. Fetch their corresponding profiles
    let profiles = await WorkerProfile.find({
      userId: { $in: workerIds },
      availability: true,
    }).populate('userId');

    // 3. Filter by category if requested
    if (category) {
      profiles = profiles.filter((p) =>
        p.skills.some((skill) => skill.toLowerCase() === category.toLowerCase())
      );
    }

    // 4. Filter by text search if requested
    if (search) {
      const query = search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.bio.toLowerCase().includes(query) ||
          p.userId.name.toLowerCase().includes(query)
      );
    }

    // 5. Calculate distances and format response
    let results = profiles.map((p) => {
      let distance = null;
      if (lat && lng && p.userId.location && p.userId.location.coordinates) {
        const [wLng, wLat] = p.userId.location.coordinates;
        // Check to ensure we have valid coordinates
        if (wLng !== 0 || wLat !== 0) {
          distance = getDistance(
            parseFloat(lat),
            parseFloat(lng),
            wLat,
            wLng
          );
        }
      }

      return {
        profileId: p._id,
        userId: p.userId._id,
        name: p.userId.name,
        avatar: p.userId.avatar,
        address: p.userId.address,
        title: p.title,
        skills: p.skills,
        hourlyRate: p.hourlyRate,
        bio: p.bio,
        rating: p.rating,
        reviewCount: p.reviewCount,
        availability: p.availability,
        workingHours: p.workingHours,
        isVerifiedByAdmin: p.isVerifiedByAdmin,
        distance: distance !== null ? parseFloat(distance.toFixed(1)) : null,
      };
    });

    // 6. Filter by maximum distance if requested
    if (maxDist && lat && lng) {
      const distanceLimit = parseFloat(maxDist);
      results = results.filter(
        (r) => r.distance !== null && r.distance <= distanceLimit
      );
    }

    // 7. Sort: distance first (if coordinates exist), then higher rating
    results.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return b.rating - a.rating;
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error(`Worker Search Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/workers/profile/:userId
// @desc    Get detailed worker profile and review history
// @access  Public
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user || user.role !== 'worker') {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const profile = await WorkerProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile details not established' });
    }

    res.status(200).json({
      success: true,
      worker: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        location: user.location,
        onboardingCompleted: user.onboardingCompleted,
      },
      profile,
    });
  } catch (error) {
    console.error(`Get Worker Profile Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/workers/availability
// @desc    Toggle worker availability
// @access  Private
router.put('/availability', protect, async (req, res) => {
  try {
    const profile = await WorkerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.availability = !profile.availability;
    await profile.save();

    res.status(200).json({
      success: true,
      message: `Availability toggled to ${profile.availability ? 'Available' : 'Unavailable'}`,
      availability: profile.availability,
    });
  } catch (error) {
    console.error(`Toggle Availability Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
