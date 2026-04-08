const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
    },
    type: {
      type: String,
      required: [true, 'Please provide event type'],
      enum: ['Tech', 'Fun', 'Business', 'Educational', 'Sports', 'Other'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Please provide event date and time'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please provide event duration'],
    },
    location: {
      type: String,
      required: false,
    },
    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide speaker ID'],
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide organizer ID'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxParticipants: {
      type: Number,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Populate speaker and organizer details
eventSchema.pre(/^find/, function () {
  this.populate('speakerId', 'name email');
  this.populate('organizerId', 'name email');
});

module.exports = mongoose.model('Event', eventSchema);
