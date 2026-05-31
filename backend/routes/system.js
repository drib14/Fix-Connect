const express = require('express');
const router = express.Router();
const Currency = require('../models/Currency');
const Testimonial = require('../models/Testimonial');
const FooterConfig = require('../models/FooterConfig');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/system/footer
// @desc    Get dynamic footer configurations, currencies, and testimonials
// @access  Public
router.get('/footer', async (req, res) => {
  try {
    let config = await FooterConfig.findOne();
    if (!config) {
      config = {
        contactPhone: '+63 900 123 4567',
        contactEmail: 'support@fixconnect.com',
        address: '123 Service Road, Tech District, Philippines',
        socialLinks: { facebook: '', twitter: '', instagram: '' }
      };
    }

    const currencies = await Currency.find({ isActive: true });
    const testimonials = await Testimonial.find({ isActive: true }).sort('-createdAt').limit(3);

    res.status(200).json({
      success: true,
      config,
      currencies,
      testimonials,
    });
  } catch (error) {
    console.error(`Fetch Footer Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/system/footer
// @desc    Update footer config
// @access  Private/Admin
router.put('/footer', protect, authorize('admin'), async (req, res) => {
  try {
    let config = await FooterConfig.findOne();
    if (!config) {
      config = new FooterConfig(req.body);
    } else {
      config.companyName = req.body.companyName || config.companyName;
      config.address = req.body.address || config.address;
      config.email = req.body.email || config.email;
      config.phone = req.body.phone || config.phone;
      if (req.body.socialLinks) {
        config.socialLinks = { ...config.socialLinks, ...req.body.socialLinks };
      }
    }
    await config.save();
    res.status(200).json({ success: true, config });
  } catch (error) {
    console.error(`Update Footer Error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
