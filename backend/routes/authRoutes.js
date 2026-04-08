const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

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

module.exports = router;
