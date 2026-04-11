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
    locations: [
      {
        type: String,
        trim: true,
      },
    ],
    speakerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Keep speakerId for backward compatibility
    speakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    audioUrl: {
      type: String,
      required: false,
    },
    transcription: {
      type: String,
      required: false,
    },
    summary: {
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
  this.populate('speakerId', 'name email dcLocation');
  this.populate('speakerIds', 'name email dcLocation');
  this.populate('organizerId', 'name email dcLocation');
});

module.exports = mongoose.model('Event', eventSchema);
