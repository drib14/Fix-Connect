const Promo = require('../models/Promo');

// Self-healing seed logic to ensure test coupon FIX50 is always available
async function seedDefaultPromo() {
  try {
    const existing = await Promo.findOne({ code: 'FIX50' });
    if (!existing) {
      await Promo.create({
        code: 'FIX50',
        discount_amount: 50,
        discount_type: 'fixed',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        max_uses: 1000,
        used_count: 0,
        active: true,
      });
      console.log('✅ Default Promo Code FIX50 successfully seeded to database.');
    }
  } catch (err) {
    console.error('❌ Failed to seed default promo:', err.message);
  }
}

seedDefaultPromo();

/**
 * POST /api/promos/validate
 */
exports.validatePromo = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const promo = await Promo.findOne({ code: code.trim().toUpperCase() });
    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code.' });
    }

    if (!promo.active) {
      return res.status(400).json({ message: 'This promo code is no longer active.' });
    }

    if (promo.expires_at < new Date()) {
      return res.status(400).json({ message: 'This promo code has expired.' });
    }

    if (promo.used_count >= promo.max_uses) {
      return res.status(400).json({ message: 'This promo code has reached its maximum limit.' });
    }

    res.json({
      message: 'Promo code applied successfully!',
      promo: {
        code: promo.code,
        discount_amount: promo.discount_amount,
        discount_type: promo.discount_type,
      },
    });
  } catch (error) {
    console.error('ValidatePromo error:', error);
    res.status(500).json({ message: 'Server error during promo code validation.' });
  }
};
