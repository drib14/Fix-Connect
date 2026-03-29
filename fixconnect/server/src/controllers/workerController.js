const Worker = require('../models/Worker');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
