const User = require('../models/User');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    res.json({ totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
