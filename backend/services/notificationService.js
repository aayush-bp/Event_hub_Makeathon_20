const Notification = require('../models/Notification');
const notificationEmitter = require('../utils/eventEmitter');

/**
 * Service for notification operations
 */
class NotificationService {
  /**
   * Create a notification
   * @param {object} notificationData - Notification data
   * @returns {object} Created notification
   */
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      await notification.populate('userId', 'name email');
      await notification.populate('eventId', 'title type dateTime');
      return notification;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {boolean} unreadOnly - Only unread notifications
   * @returns {array} Notifications
   */
  async getUserNotifications(userId, unreadOnly = false) {
    try {
      const query = { userId };

      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .exec();

      return notifications;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {object} Updated notification
   */
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {object} Update result
   */
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {object} Deleted notification
   */
  async deleteNotification(notificationId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Send event approved notification
   * @param {object} event - Event object
   */
  async sendEventApprovedNotification(event) {
    try {
      await this.createNotification({
        userId: event.speakerId,
        eventId: event._id,
        type: 'APPROVAL',
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved!`,
        metadata: {
          eventName: event.title,
          eventDate: event.dateTime,
        },
      });
    } catch (err) {
      console.error('Error sending approval notification:', err);
    }
  }

  /**
   * Send event rejected notification
   * @param {object} event - Event object
   * @param {string} reason - Rejection reason
   */
  async sendEventRejectedNotification(event, reason) {
    try {
      await this.createNotification({
        userId: event.speakerId,
        eventId: event._id,
        type: 'REJECTION',
        title: 'Event Rejected',
        message: `Your event "${event.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
        metadata: {
          eventName: event.title,
          reason: reason || 'No reason provided',
        },
      });
    } catch (err) {
      console.error('Error sending rejection notification:', err);
    }
  }

  /**
   * Send registration notification
   * @param {object} event - Event object
   * @param {string} userId - User ID
   */
  async sendRegistrationConfirmation(event, userId) {
    try {
      await this.createNotification({
        userId,
        eventId: event._id,
        type: 'REGISTRATION',
        title: 'Registration Confirmed',
        message: `You have successfully registered for "${event.title}"`,
        metadata: {
          eventName: event.title,
          eventDate: event.dateTime,
          location: event.location,
        },
      });
    } catch (err) {
      console.error('Error sending registration notification:', err);
    }
  }

  /**
   * Send event reminder
   * @param {object} event - Event object
   * @param {array} participantIds - Participant IDs
   */
  async sendEventReminders(event, participantIds) {
    try {
      const promises = participantIds.map((userId) =>
        this.createNotification({
          userId,
          eventId: event._id,
          type: 'REMINDER',
          title: 'Upcoming Event Reminder',
          message: `Reminder: "${event.title}" is coming up!`,
          metadata: {
            eventName: event.title,
            eventDate: event.dateTime,
          },
        })
      );

      await Promise.all(promises);
    } catch (err) {
      console.error('Error sending reminder notifications:', err);
    }
  }
}

module.exports = new NotificationService();
