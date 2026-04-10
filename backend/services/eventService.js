const Event = require('../models/Event');
const notificationEmitter = require('../utils/eventEmitter');

/**
 * Service for event operations
 */
class EventService {
  /**
   * Create a new event
   * @param {object} eventData - Event data
   * @param {string|array} speakerId - Speaker ID(s)
   * @param {string} organizerId - Organizer ID
   * @returns {object} Created event
   */
  async createEvent(eventData, speakerId, organizerId) {
    try {
      const event = await Event.create({
        ...eventData,
        speakerId: Array.isArray(speakerId) ? speakerId[0] : speakerId,
        speakerIds: Array.isArray(speakerId) ? speakerId : [speakerId],
        organizerId,
      });

      await event.populate('speakerId', 'name email dcLocation');
      await event.populate('speakerIds', 'name email dcLocation');
      await event.populate('organizerId', 'name email dcLocation');

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all events with optional filtering
   * @param {object} filters - Query filters
   * @returns {array} Events
   */
  async getAllEvents(filters = {}) {
    try {
      const query = {};

      // Filter by status
      if (filters.status) {
        query.status = filters.status;
      }

      // Filter by type
      if (filters.type) {
        query.type = filters.type;
      }

      // Filter by date range
      if (filters.startDate || filters.endDate) {
        query.dateTime = {};
        if (filters.startDate) {
          query.dateTime.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.dateTime.$lte = new Date(filters.endDate);
        }
      }

      const events = await Event.find(query)
        .sort({ dateTime: 1 })
        .exec();

      return events;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {object} Event
   */
  async getEventById(eventId) {
    try {
      const event = await Event.findById(eventId).populate('organizerId', 'name email');

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update event
   * @param {string} eventId - Event ID
   * @param {object} updateData - Update data
   * @returns {object} Updated event
   */
  async updateEvent(eventId, updateData) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Approve event
   * @param {string} eventId - Event ID
   * @returns {object} Updated event
   */
  async approveEvent(eventId) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { status: 'APPROVED' },
        { new: true }
      );

      if (!event) {
        throw new Error('Event not found');
      }

      // Emit event for notifications
      notificationEmitter.emit('eventApproved', event);

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Reject event
   * @param {string} eventId - Event ID
   * @param {string} reason - Rejection reason
   * @returns {object} Updated event
   */
  async rejectEvent(eventId, reason) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { status: 'REJECTED' },
        { new: true }
      );

      if (!event) {
        throw new Error('Event not found');
      }

      // Emit event for notifications
      notificationEmitter.emit('eventRejected', { event, reason });

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Register user for event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {object} Updated event
   */
  async registerForEvent(eventId, userId) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      // Check if already registered
      if (event.participants.includes(userId)) {
        throw new Error('Already registered for this event');
      }

      // Check max participants
      if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
        throw new Error('Event is full');
      }

      // Add participant
      event.participants.push(userId);
      await event.save();

      // Emit event for notifications
      notificationEmitter.emit('userRegistered', { event, userId });

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Unregister user from event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {object} Updated event
   */
  async unregisterFromEvent(eventId, userId) {
    try {
      const event = await Event.findByIdAndUpdate(
        eventId,
        { $pull: { participants: userId } },
        { new: true }
      );

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get events by speaker
   * @param {string} speakerId - Speaker ID
   * @returns {array} Events
   */
  async getEventsBySpeaker(speakerId) {
    try {
      const events = await Event.find({ speakerId }).sort({ dateTime: 1 });
      return events;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get events by organizer
   * @param {string} organizerId - Organizer ID
   * @returns {array} Events
   */
  async getEventsByOrganizer(organizerId) {
    try {
      const events = await Event.find({ organizerId }).sort({ dateTime: 1 });
      return events;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get user's registered events
   * @param {string} userId - User ID
   * @returns {array} Events
   */
  async getUserRegisteredEvents(userId) {
    try {
      const events = await Event.find({
        participants: userId,
        status: 'APPROVED',
      }).sort({ dateTime: 1 });
      return events;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get pending events assigned to speaker for approval
   * @param {string} speakerId - Speaker ID
   * @returns {array} Events
   */
  async getSpeakerPendingEvents(speakerId) {
    try {
      const events = await Event.find({
        speakerIds: speakerId,
        status: 'PENDING',
      }).sort({ dateTime: 1 });
      return events;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new EventService();
