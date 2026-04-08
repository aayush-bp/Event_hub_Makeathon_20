const express = require('express');
const recommendationController = require('../controllers/recommendationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * Private Routes - Personalized recommendations (require authentication)
 */
router.get('/', protect, recommendationController.getRecommendations);

/**
 * Public Routes - General recommendations
 */
router.get('/upcoming', recommendationController.getUpcomingEvents);
router.get('/similar/:eventId', recommendationController.getSimilarEvents);
router.get('/popular', recommendationController.getPopularEvents);

module.exports = router;
