const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    const result = await authService.register({ name, email, password, role });

    sendSuccess(res, 201, 'User registered successfully', {
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    if (err.message.includes('User already exists')) {
      return sendError(res, 400, err.message);
    }
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    const result = await authService.login(email, password);

    sendSuccess(res, 200, 'Login successful', {
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return sendError(res, 401, 'Invalid credentials');
    }
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user._id);
    sendSuccess(res, 200, 'Current user retrieved', user);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res, next) => {
  try {
    const { eventTypes, notificationFrequency } = req.body;

    const user = await authService.updatePreferences(req.user._id, {
      eventTypes,
      notificationFrequency,
    });

    sendSuccess(res, 200, 'Preferences updated successfully', user);
  } catch (err) {
    if (err.message.includes('User not found')) {
      return sendError(res, 404, err.message);
    }
    next(err);
  }
};
