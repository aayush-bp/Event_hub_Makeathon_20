const Event = require('../models/Event');
const User = require('../models/User');

/**
 * Service for event recommendations
 */
class RecommendationService {
  /**
   * Get recommended events for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {array} Recommended events
   */
  async getRecommendedEvents(userId, limit = 5) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // If user has no preferences, return upcoming approved events
      if (!user.preferences || user.preferences.eventTypes.length === 0) {
        return await this.getUpcomingEvents(limit);
      }

      // Find events matching user preferences
      const recommendations = await Event.find({
        type: { $in: user.preferences.eventTypes },
        status: 'APPROVED',
        dateTime: { $gte: new Date() },
        participants: { $ne: userId }, // User not already registered
      })
        .sort({ dateTime: 1 })
        .limit(limit)
        .exec();

      return recommendations;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get upcoming events (no preferences filter)
   * @param {number} limit - Number of events
   * @returns {array} Upcoming events
   */
  async getUpcomingEvents(limit = 5) {
    try {
      const events = await Event.find({
        status: 'APPROVED',
        dateTime: { $gte: new Date() },
      })
        .sort({ dateTime: 1 })
        .limit(limit)
        .exec();

      return events;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get similar events based on event type
   * @param {string} eventId - Event ID
   * @param {number} limit - Number of recommendations
   * @returns {array} Similar events
   */
  async getSimilarEvents(eventId, limit = 5) {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw new Error('Event not found');
      }

      const similarEvents = await Event.find({
        type: event.type,
        status: 'APPROVED',
        _id: { $ne: eventId },
        dateTime: { $gte: new Date() },
      })
        .sort({ dateTime: 1 })
        .limit(limit)
        .exec();

      return similarEvents;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get popular events based on participant count
   * @param {number} limit - Number of events
   * @returns {array} Popular events
   */
  async getPopularEvents(limit = 5) {
    try {
      const events = await Event.find({
        status: 'APPROVED',
      })
        .sort({ 'participants': -1, dateTime: 1 })
        .limit(limit)
        .exec();

      return events;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new RecommendationService();
