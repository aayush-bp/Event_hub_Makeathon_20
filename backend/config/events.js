const notificationEmitter = require('../utils/eventEmitter');
const notificationService = require('../services/notificationService');

/**
 * Initialize event listeners for notification system
 * This sets up the internal event-driven notification system
 */
const initializeEventListeners = () => {
  /**
   * Listen for eventApproved event
   * Triggered when an event is approved by organizer/admin
   */
  notificationEmitter.on('eventApproved', async (event) => {
    try {
      await notificationService.sendEventApprovedNotification(event);
    } catch (err) {
      console.error('Error handling eventApproved:', err);
    }
  });

  /**
   * Listen for eventRejected event
   * Triggered when an event is rejected by organizer/admin
   */
  notificationEmitter.on('eventRejected', async ({ event, reason }) => {
    try {
      await notificationService.sendEventRejectedNotification(event, reason);
    } catch (err) {
      console.error('Error handling eventRejected:', err);
    }
  });

  /**
   * Listen for userRegistered event
   * Triggered when a user registers for an event
   */
  notificationEmitter.on('userRegistered', async ({ event, userId }) => {
    try {
      await notificationService.sendRegistrationConfirmation(event, userId);
    } catch (err) {
      console.error('Error handling userRegistered:', err);
    }
  });

  console.log('Event listeners initialized');
};

module.exports = { initializeEventListeners };
