const EventEmitter = require('events');

/**
 * Custom event emitter for notifications
 * This handles async event propagation without external message queues
 */
class NotificationEmitter extends EventEmitter {}

const notificationEmitter = new NotificationEmitter();

// Set max listeners to avoid memory leak warnings
notificationEmitter.setMaxListeners(20);

module.exports = notificationEmitter;
