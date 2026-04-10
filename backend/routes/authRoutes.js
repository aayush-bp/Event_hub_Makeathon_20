const express = require('express');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * Public Routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * Private Routes
 */
router.get('/me', protect, authController.getMe);
router.put('/preferences', protect, authController.updatePreferences);
router.get('/users', protect, authorize('ADMIN', 'ORGANIZER'), authController.getAllUsers);
router.put('/users/:userId/role', protect, authorize('ADMIN'), authController.updateUserRole);

module.exports = router;
