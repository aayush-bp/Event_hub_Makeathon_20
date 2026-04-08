const express = require('express');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * Public Routes
 */
router.get('/', eventController.getAllEvents);
router.get('/trending/popular', eventController.getAllEvents); // Redirect to trending
router.get('/user/registered', protect, eventController.getUserRegisteredEvents);
router.get('/speaker/:speakerId', eventController.getEventsBySpeaker);
router.get('/:id', eventController.getEventById);

/**
 * Private Routes - Create Event (SPEAKER)
 */
router.post('/', protect, authorize('SPEAKER', 'ADMIN'), eventController.createEvent);

/**
 * Private Routes - Update Event (SPEAKER or ADMIN)
 */
router.put('/:id', protect, eventController.updateEvent);

/**
 * Private Routes - Approve/Reject (ORGANIZER or ADMIN)
 */
router.put('/:id/approve', protect, authorize('ORGANIZER', 'ADMIN'), eventController.approveEvent);
router.put('/:id/reject', protect, authorize('ORGANIZER', 'ADMIN'), eventController.rejectEvent);

/**
 * Private Routes - Register/Unregister (USER)
 */
router.post('/:id/register', protect, eventController.registerForEvent);
router.post('/:id/unregister', protect, eventController.unregisterFromEvent);

module.exports = router;
