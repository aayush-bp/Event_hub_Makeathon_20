const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/auth/register
 * @desc    Register a user
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, dcLocation } = req.body;

    // Validation
    if (!name || !email || !password || !dcLocation) {
      return sendError(res, 400, 'Please provide name, email, password, and DC location');
    }

    const result = await authService.register({ name, email, password, role, dcLocation });

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
    const { eventTypes, notificationFrequency, popupMode, popupTimes, awayThresholdMinutes } = req.body;

    const prefs = { eventTypes, notificationFrequency };
    if (popupMode !== undefined) prefs.popupMode = popupMode;
    if (popupTimes !== undefined) prefs.popupTimes = popupTimes;
    if (awayThresholdMinutes !== undefined) prefs.awayThresholdMinutes = awayThresholdMinutes;

    const user = await authService.updatePreferences(req.user._id, prefs);

    sendSuccess(res, 200, 'Preferences updated successfully', user);
  } catch (err) {
    if (err.message.includes('User not found')) {
      return sendError(res, 404, err.message);
    }
    next(err);
  }
};

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    sendSuccess(res, 200, 'Users retrieved successfully', users);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/auth/users/:userId/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role) {
      return sendError(res, 400, 'Please provide a role');
    }

    const user = await authService.updateUserRole(req.params.userId, role);
    sendSuccess(res, 200, 'User role updated successfully', user);
  } catch (err) {
    if (err.message.includes('User not found')) {
      return sendError(res, 404, err.message);
    }
    if (err.message === 'Invalid role') {
      return sendError(res, 400, err.message);
    }
    next(err);
  }
};
