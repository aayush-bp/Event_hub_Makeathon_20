const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    type: {
      type: String,
      enum: ['REMINDER', 'RECOMMENDATION', 'APPROVAL', 'REJECTION', 'REGISTRATION'],
      required: [true, 'Please provide notification type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide notification title'],
    },
    message: {
      type: String,
      required: [true, 'Please provide notification message'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      // Additional data like eventName, speakerName, etc
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Populate user and event details
notificationSchema.pre(/^find/, function () {
  this.populate('userId', 'name email');
  this.populate('eventId', 'title type dateTime');
});

module.exports = mongoose.model('Notification', notificationSchema);
