const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { isRead: true },
        { new: true }
    );
    if (!notification) {
         return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
};
