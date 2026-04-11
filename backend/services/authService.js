const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendWelcomeEmail } = require('../utils/mailer');

/**
 * Service for authentication operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User data
   * @returns {object} User and token
   */
  async register(userData) {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      if (user) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'USER',
        dcLocation: userData.dcLocation,
      });

      // Generate token
      const token = generateToken(user._id);

      // Send welcome email (non-blocking)
      console.log('[AuthService] About to send welcome email to:', user.email);
      sendWelcomeEmail(user.email, user.name).catch(err => 
        console.error('[AuthService] Welcome email promise rejected:', err.message)
      );

      return {
        user: user.toJSON(),
        token,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} User and token
   */
  async login(email, password) {
    try {
      // Validate email & password
      if (!email || !password) {
        throw new Error('Please provide an email and password');
      }

      // Check for user (include password)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = generateToken(user._id);

      return {
        user: user.toJSON(),
        token,
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User data
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {object} preferences - User preferences
   * @returns {object} Updated user
   */
  async updatePreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { preferences },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get all users
   * @returns {array} All users
   */
  async getAllUsers() {
    try {
      const users = await User.find().select('-password');
      return users;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {object} Updated user
   */
  async updateUserRole(userId, role) {
    try {
      if (!['ADMIN', 'ORGANIZER', 'SPEAKER', 'USER'].includes(role)) {
        throw new Error('Invalid role');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new AuthService();
