const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications for user
// @route   GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id
    })
      .sort('-createdAt')
      .limit(15)
      .populate('relatedEntity');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   POST /api/notifications/mark-read
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.body;

    // Mark single notification as read
    if (notificationId) {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          user: req.user.id  // Ensure user owns the notification
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
      }

      return res.status(200).json({
        success: true,
        data: notification
      });
    }

    // Mark all notifications as read
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: { message: 'All notifications marked as read' }
    });
  } catch (err) {
    next(err);
  }
};