const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ message: 'Server error retrieving notifications.' });
  }
};

/**
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    res.json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ message: 'Server error marking notification as read.' });
  }
};
