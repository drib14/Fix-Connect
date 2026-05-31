const express = require('express');
const router = express.Router();
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/admin/stats
// @desc    Get complete administrative dashboard analytics
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalBookings = await Booking.countDocuments();
    
    // Sum total earnings
    const completedBookings = await Booking.find({ status: 'completed' });
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Get bookings grouped by status
    const pendingCount = await Booking.countDocuments({ status: 'pending' });
    const activeCount = await Booking.countDocuments({ status: 'in_progress' });
    const completedCount = await Booking.countDocuments({ status: 'completed' });
    const cancelledCount = await Booking.countDocuments({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalWorkers,
        totalBookings,
        totalEarnings,
        statusBreakdown: {
          pending: pendingCount,
          active: activeCount,
          completed: completedCount,
          cancelled: cancelledCount,
        },
      },
    });
  } catch (error) {
    console.error(`Fetch Admin Stats Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/workers/pending
// @desc    List all worker profiles awaiting admin verification
// @access  Private/Admin
router.get('/workers/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingWorkers = await WorkerProfile.find({ isVerifiedByAdmin: false })
      .populate('userId', 'name email phone avatar address');

    res.status(200).json({
      success: true,
      count: pendingWorkers.length,
      data: pendingWorkers,
    });
  } catch (error) {
    console.error(`Fetch Pending Workers Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/workers/:id/verify
// @desc    Approve/Verify a worker profile
// @access  Private/Admin
router.put('/workers/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const profile = await WorkerProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Worker profile record not found' });
    }

    profile.isVerifiedByAdmin = true;
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Worker profile has been verified successfully',
      profile,
    });
  } catch (error) {
    console.error(`Verify Worker Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    List all registered users and workers in the platform
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(`Fetch Users Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Toggle status between active and suspended
// @access  Private/Admin
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status parameter' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot moderate other administrator accounts' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user,
    });
  } catch (error) {
    console.error(`Change User Status Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
