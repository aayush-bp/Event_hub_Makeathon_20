const recommendationService = require('../services/recommendationService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   GET /api/recommendations
 * @desc    Get recommended events for current user
 * @access  Private
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const recommendations = await recommendationService.getRecommendedEvents(
      req.user._id,
      limit || 5
    );

    sendSuccess(res, 200, 'Recommendations retrieved successfully', recommendations);
  } catch (err) {
    if (err.message === 'User not found') {
      return sendError(res, 404, 'User not found');
    }
    next(err);
  }
};

/**
 * @route   GET /api/recommendations/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
exports.getUpcomingEvents = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const events = await recommendationService.getUpcomingEvents(limit || 5);

    sendSuccess(res, 200, 'Upcoming events retrieved successfully', events);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/recommendations/similar/:eventId
 * @desc    Get similar events
 * @access  Public
 */
exports.getSimilarEvents = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const events = await recommendationService.getSimilarEvents(req.params.eventId, limit || 5);

    sendSuccess(res, 200, 'Similar events retrieved successfully', events);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   GET /api/recommendations/popular
 * @desc    Get popular events
 * @access  Public
 */
exports.getPopularEvents = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const events = await recommendationService.getPopularEvents(limit || 5);

    sendSuccess(res, 200, 'Popular events retrieved successfully', events);
  } catch (err) {
    next(err);
  }
};
