const eventService = require('../services/eventService');
const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (ADMIN/ORGANIZER)
 */
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, type, dateTime, duration, locations, speakerIds, maxParticipants, imageUrl } = req.body;

    // Validation
    if (!title || !description || !type || !dateTime || !duration) {
      return sendError(res, 400, 'Please provide all required fields');
    }

    const eventData = {
      title,
      description,
      type,
      dateTime,
      duration,
      locations: locations || [],
      maxParticipants,
      imageUrl,
    };

    // Event creator (admin/organizer) is the organizer
    // speakerIds are provided in the request
    const speakers = speakerIds && speakerIds.length > 0 ? speakerIds : [req.user._id];
    const event = await eventService.createEvent(eventData, speakers, req.user._id);

    sendSuccess(res, 201, 'Event created successfully', event);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Public
 */
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status, type, startDate, endDate } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const events = await eventService.getAllEvents(filters);

    sendSuccess(res, 200, 'Events retrieved successfully', events);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
exports.getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    sendSuccess(res, 200, 'Event retrieved successfully', event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (SPEAKER or ADMIN)
 */
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    // Check if user is owner or admin
    if (event.speakerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Not authorized to update this event');
    }

    const updatedEvent = await eventService.updateEvent(req.params.id, req.body);

    sendSuccess(res, 200, 'Event updated successfully', updatedEvent);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   PUT /api/events/:id/approve
 * @desc    Approve event
 * @access  Private (ORGANIZER or ADMIN)
 */
exports.approveEvent = async (req, res, next) => {
  try {
    const event = await eventService.approveEvent(req.params.id);
    sendSuccess(res, 200, 'Event approved successfully', event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   PUT /api/events/:id/reject
 * @desc    Reject event
 * @access  Private (ORGANIZER or ADMIN)
 */
exports.rejectEvent = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const event = await eventService.rejectEvent(req.params.id, reason);
    sendSuccess(res, 200, 'Event rejected successfully', event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   POST /api/events/:id/register
 * @desc    Register user for event
 * @access  Private
 */
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await eventService.registerForEvent(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Registered for event successfully', event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    if (err.message.includes('Already registered') || err.message === 'Event is full') {
      return sendError(res, 400, err.message);
    }
    next(err);
  }
};

/**
 * @route   POST /api/events/:id/unregister
 * @desc    Unregister user from event
 * @access  Private
 */
exports.unregisterFromEvent = async (req, res, next) => {
  try {
    const event = await eventService.unregisterFromEvent(req.params.id, req.user._id);
    sendSuccess(res, 200, 'Unregistered from event successfully', event);
  } catch (err) {
    if (err.message === 'Event not found') {
      return sendError(res, 404, 'Event not found');
    }
    next(err);
  }
};

/**
 * @route   GET /api/events/user/registered
 * @desc    Get user's registered events
 * @access  Private
 */
exports.getUserRegisteredEvents = async (req, res, next) => {
  try {
    const events = await eventService.getUserRegisteredEvents(req.user._id);
    sendSuccess(res, 200, 'User registered events retrieved', events);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/speaker/:speakerId
 * @desc    Get events by speaker
 * @access  Public
 */
exports.getEventsBySpeaker = async (req, res, next) => {
  try {
    const events = await eventService.getEventsBySpeaker(req.params.speakerId);
    sendSuccess(res, 200, 'Speaker events retrieved', events);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/events/speaker/pending/assignments
 * @desc    Get pending events assigned to current speaker for approval
 * @access  Private (SPEAKER)
 */
exports.getSpeakerPendingEvents = async (req, res, next) => {
  try {
    const events = await eventService.getSpeakerPendingEvents(req.user._id);
    sendSuccess(res, 200, 'Pending events retrieved', events);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/events/:id/transcribe-audio
 * @desc    Upload audio, transcribe it, summarize, and save to event
 * @access  Private (ORGANIZER/ADMIN)
 */
exports.transcribeAudio = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);

    // Only organizer, speaker, or admin can add transcription
    const isOrganizer = event.organizerId._id?.toString() === req.user._id.toString() || event.organizerId.toString() === req.user._id.toString();
    const isSpeaker = (event.speakerIds || []).some(s => (s._id || s).toString() === req.user._id.toString());
    if (!isOrganizer && !isSpeaker && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Only the organizer, speaker, or admin can add transcriptions');
    }

    if (!req.file) {
      return sendError(res, 400, 'Please upload an audio file');
    }

    const mimeType = req.file.mimetype;
    const audioBuffer = req.file.buffer;

    // Transcribe audio using Gemini
    const transcription = await aiService.transcribeAudio(audioBuffer, mimeType);

    // Summarize the transcription
    const summary = await aiService.summarizeTranscription(transcription, event.title);

    // Update event
    const updatedEvent = await eventService.updateEvent(req.params.id, {
      transcription,
      summary,
    });

    sendSuccess(res, 200, 'Audio transcribed and summarized successfully', updatedEvent);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/events/:id/transcription-text
 * @desc    Submit transcription text, summarize, and save to event
 * @access  Private (ORGANIZER/ADMIN)
 */
exports.addTranscriptionText = async (req, res, next) => {
  try {
    const { transcription } = req.body;

    if (!transcription || !transcription.trim()) {
      return sendError(res, 400, 'Please provide transcription text');
    }

    const event = await eventService.getEventById(req.params.id);

    const isOrganizer = event.organizerId._id?.toString() === req.user._id.toString() || event.organizerId.toString() === req.user._id.toString();
    const isSpeaker = (event.speakerIds || []).some(s => (s._id || s).toString() === req.user._id.toString());
    if (!isOrganizer && !isSpeaker && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Only the organizer, speaker, or admin can add transcriptions');
    }

    // Summarize the transcription
    const summary = await aiService.summarizeTranscription(transcription.trim(), event.title);

    // Update event
    const updatedEvent = await eventService.updateEvent(req.params.id, {
      transcription: transcription.trim(),
      summary,
    });

    sendSuccess(res, 200, 'Transcription added and summarized successfully', updatedEvent);
  } catch (err) {
    next(err);
  }
};
