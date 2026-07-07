const Service = require('../models/Service');

/**
 * GET /api/services
 * Returns all active services, optionally filtered by category.
 */
exports.getServices = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { is_active: true };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ category: 1, title: 1 });
    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Failed to fetch services.' });
  }
};

/**
 * GET /api/services/:id
 * Returns a single service by ID.
 */
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.json({ service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Failed to fetch service.' });
  }
};

/**
 * GET /api/services/categories
 * Returns distinct categories with counts.
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          minRate: { $min: '$base_rate' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
};
