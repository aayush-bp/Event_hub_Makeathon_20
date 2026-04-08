const notificationService = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for current user
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const notifications = await notificationService.getUserNotifications(
      req.user._id,
      unreadOnly === 'true'
    );

    sendSuccess(res, 200, 'Notifications retrieved successfully', notifications);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);

    // Verify ownership
    if (notification.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this notification');
    }

    sendSuccess(res, 200, 'Notification marked as read', notification);
  } catch (err) {
    if (err.message === 'Notification not found') {
      return sendError(res, 404, 'Notification not found');
    }
    next(err);
  }
};

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for current user
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    sendSuccess(res, 200, 'All notifications marked as read', result);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.deleteNotification(req.params.id);

    // Verify ownership
    if (notification.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this notification');
    }

    sendSuccess(res, 200, 'Notification deleted successfully', notification);
  } catch (err) {
    if (err.message === 'Notification not found') {
      return sendError(res, 404, 'Notification not found');
    }
    next(err);
  }
};

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get unread notification count
 * @access  Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id, true);
    sendSuccess(res, 200, 'Unread count retrieved', {
      count: notifications.length,
    });
  } catch (err) {
    next(err);
  }
};
