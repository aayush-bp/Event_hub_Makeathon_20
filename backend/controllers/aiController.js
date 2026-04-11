const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/ai/generate-event
 * @desc    Generate event details from event name using AI
 * @access  Private
 */
exports.generateEventDetails = async (req, res, next) => {
  try {
    const { eventName } = req.body;

    if (!eventName || !eventName.trim()) {
      return sendError(res, 400, 'Please provide an event name');
    }

    const details = await aiService.generateEventDetails(eventName.trim());

    sendSuccess(res, 200, 'Event details generated successfully', details);
  } catch (err) {
    next(err);
  }
};
