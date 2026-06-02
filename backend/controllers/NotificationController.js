import { Notification } from '../models/Notification.js';
import { AppError } from '../middleware/errorMiddleware.js';

export class NotificationController {
  // GET /api/notifications
  getNotifications = async (req, res, next) => {
    try {
      const { page = 1, limit = 30 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find({ user: req.user.id })
          .populate('relatedBooking', 'referenceNumber status category')
          .populate('relatedUser', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Notification.countDocuments({ user: req.user.id }),
        Notification.countDocuments({ user: req.user.id, isRead: false }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          notifications,
          unreadCount,
          pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        },
      });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/notifications/:id/read
  markOneRead = async (req, res, next) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isRead: true },
        { new: true }
      );
      if (!notification) return next(new AppError('Notification not found', 404));

      res.status(200).json({ status: 'success', data: { notification } });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/notifications/read-all
  markAllRead = async (req, res, next) => {
    try {
      await Notification.updateMany(
        { user: req.user.id, isRead: false },
        { isRead: true }
      );
      res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/notifications/:id
  deleteNotification = async (req, res, next) => {
    try {
      await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      res.status(200).json({ status: 'success', message: 'Notification deleted' });
    } catch (err) {
      next(err);
    }
  };
}
