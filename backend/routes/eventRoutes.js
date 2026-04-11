const express = require('express');
const multer = require('multer');
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Multer config for audio uploads (in-memory, max 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg', 'audio/flac', 'audio/x-m4a'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed (mp3, wav, m4a, webm, ogg, flac)'));
    }
  },
});

/**
 * Public Routes
 */
router.get('/', eventController.getAllEvents);
router.get('/trending/popular', eventController.getAllEvents); // Redirect to trending
router.get('/user/registered', protect, eventController.getUserRegisteredEvents);
router.get('/speaker/pending/assignments', protect, eventController.getSpeakerPendingEvents);
router.get('/speaker/:speakerId', eventController.getEventsBySpeaker);
router.get('/:id', eventController.getEventById);

/**
 * Private Routes - Create Event (SPEAKER)
 */
router.post('/', protect, authorize('SPEAKER', 'ORGANIZER', 'ADMIN'), eventController.createEvent);

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

/**
 * Private Routes - Transcription (SPEAKER, ORGANIZER or ADMIN)
 */
router.post('/:id/transcribe-audio', protect, authorize('SPEAKER', 'ORGANIZER', 'ADMIN'), upload.single('audio'), eventController.transcribeAudio);
router.post('/:id/transcription-text', protect, authorize('SPEAKER', 'ORGANIZER', 'ADMIN'), eventController.addTranscriptionText);

module.exports = router;
