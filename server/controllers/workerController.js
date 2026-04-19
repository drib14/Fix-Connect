const Worker = require('../models/Worker');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.applyWorker = async (req, res) => {
  try {
    const { name, category, description, jobsOffered, dailyRate, monthlyRate, oneTimeRate } = req.body;

    // Check if user already applied
    const existing = await Worker.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied as a worker.' });
    }

    let documentUrl = '';
    if (req.file) {
      documentUrl = req.file.path;
    }

    const newWorker = new Worker({
      userId: req.user._id,
      name,
      category,
      description,
      jobsOffered: jobsOffered ? jobsOffered.split(',').map(j => j.trim()) : [],
      dailyRate: dailyRate || null,
      monthlyRate: monthlyRate || null,
      oneTimeRate: oneTimeRate || null,
      documentUrl,
      status: 'Pending' // In reality pending, but we'll let them post for MVP demo
    });

    await newWorker.save();
    res.status(201).json(newWorker);
  } catch (error) {
    console.error('Error applying worker:', error);
    res.status(500).json({ message: 'Failed to apply as worker.' });
  }
};

exports.getMyWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found.' });
    }
    res.status(200).json(worker);
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    res.status(500).json({ message: 'Failed to fetch worker profile.' });
  }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Worker.distinct('category', { status: 'Active' });
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
};
