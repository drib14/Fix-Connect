const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Get services with search/category/proximity filters
router.get('/', async (req, res) => {
  try {
    const { category, search, longitude, latitude, radius } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Proximity search (LocationIQ helper / geospatial lookup)
    if (longitude && latitude) {
      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);
      const dist = parseFloat(radius) || 10000; // Default 10km radius

      // First find workers within range
      const nearbyWorkers = await User.find({
        role: 'worker',
        status: 'online',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            $maxDistance: dist
          }
        }
      });

      const workerIds = nearbyWorkers.map(w => w._id);
      query.worker = { $in: workerIds };
    }

    const services = await Service.find(query)
      .populate('worker', 'name email avatar phone workerDetails location status')
      .exec();

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('worker', 'name email avatar phone workerDetails location status');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get services offered by a specific worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const services = await Service.find({ worker: req.params.workerId });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new service (Worker only)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, category, description, price, duration } = req.body;
    
    // Find MongoDB user matching Clerk ID to get _id
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user || user.role !== 'worker') {
      return res.status(403).json({ message: 'Only registered workers can create services' });
    }

    const service = new Service({
      name,
      category,
      description,
      price,
      duration: duration || '1 hour',
      worker: user._id
    });

    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update service details (Worker only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, category, description, price, duration } = req.body;
    
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Verify ownership
    if (service.worker.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized modification' });
    }

    service.name = name || service.name;
    service.category = category || service.category;
    service.description = description !== undefined ? description : service.description;
    service.price = price || service.price;
    service.duration = duration || service.duration;

    await service.save();
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete service (Worker only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Verify ownership
    if (service.worker.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
