import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, User, Upload, FileText, Sparkles, Mic } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '../components/AlertComponents';
import { eventService } from '../services/eventService';
import { formatDate, getTimeUntilEvent } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';

export const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [transcriptionMode, setTranscriptionMode] = useState(null); // 'audio' | 'text'
  const [transcriptionText, setTranscriptionText] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const audioInputRef = useRef(null);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      // Get event details
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
      
      // Check if current user is in participants array
      if (user && eventData.participants) {
        setIsRegistered(
          eventData.participants.some((p) => p._id === user.user._id || p === user.user._id)
        );
      }
    } catch (err) {
      setError('Failed to load event details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await eventService.registerForEvent(eventId);
      setSuccess('Successfully registered for event!');
      setIsRegistered(true);
      await fetchEventDetails();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register for event'
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      await eventService.unregisterFromEvent(eventId);
      setSuccess('Successfully unregistered from event!');
      setIsRegistered(false);
      await fetchEventDetails();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to unregister from event'
      );
    } finally {
      setRegistering(false);
    }
  };

  const isPastEvent = event && new Date(event.dateTime) < new Date();
  const userData = user?.user || user;
  const isOrganizer = event && userData && (
    event.organizerId?._id === userData._id || event.organizerId === userData._id
  );
  const isAdmin = userData?.role === 'ADMIN';
  const isSpeaker = event && userData && (
    (event.speakerIds || []).some(s => (s._id || s) === userData._id)
  );
  const canAddTranscription = isPastEvent && (isOrganizer || isAdmin || isSpeaker);

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setAiProcessing(true);
      setError('');
      await eventService.uploadAudioTranscription(eventId, file);
      setSuccess('Audio transcribed and summarized successfully!');
      setTranscriptionMode(null);
      await fetchEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to transcribe audio');
    } finally {
      setAiProcessing(false);
      if (audioInputRef.current) audioInputRef.current.value = '';
    }
  };

  const handleTextTranscription = async () => {
    if (!transcriptionText.trim()) {
      setError('Please enter transcription text');
      return;
    }

    try {
      setAiProcessing(true);
      setError('');
      await eventService.addTranscriptionText(eventId, transcriptionText);
      setSuccess('Transcription added and summarized successfully!');
      setTranscriptionText('');
      setTranscriptionMode(null);
      await fetchEventDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process transcription');
    } finally {
      setAiProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <ErrorAlert message="Event not found" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Events
          </button>

          {error && (
            <ErrorAlert message={error} onClose={() => setError('')} />
          )}
          {success && (
            <SuccessAlert message={success} onClose={() => setSuccess('')} />
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl p-8 dark:border dark:border-gray-700">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors">{event.description}</p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Date and Time</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                        {formatDate(event.dateTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Location</p>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                        {event.locations && event.locations.length > 0
                          ? event.locations.map((loc, idx) => (
                              <p key={idx}>{loc}</p>
                            ))
                          : 'No location specified'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Time Until Event</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                        {getTimeUntilEvent(event.dateTime)}
                      </p>
                    </div>
                  </div>

                  {event.organizerId && (
                    <div className="flex items-start gap-4">
                      <User className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Organizer</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                          {event.organizerId.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                          {event.organizerId.email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <Users className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Participants</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                        {event.participants?.length || 0}/{event.maxParticipants}
                      </p>
                    </div>
                  </div>

                  {event.speakerIds && event.speakerIds.length > 0 && (
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-primary dark:text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">Speakers</p>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                          {event.speakerIds.map((speaker, idx) => (
                            <p key={idx}>
                              {speaker.name} ({speaker.email})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 h-fit transition-colors">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">Event Type</p>
                  <span className="inline-block bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                    {event.type}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-lg ${
                      event.status === 'APPROVED'
                        ? 'bg-accent dark:bg-green-600 text-white'
                        : event.status === 'PENDING'
                        ? 'bg-warning dark:bg-yellow-600 text-white'
                        : 'bg-red-500 dark:bg-red-600 text-white'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                {!isPastEvent && (isRegistered ? (
                  <button
                    onClick={handleUnregister}
                    disabled={registering}
                    className="w-full bg-red-500 dark:bg-red-600 text-white py-3 rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {registering ? 'Processing...' : 'Unregister from Event'}
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {registering ? 'Processing...' : 'Register for Event'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transcription & Summary Section */}
          {isPastEvent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl p-8 dark:border dark:border-gray-700 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Event Transcription & Summary
              </h2>

              {/* Show existing summary */}
              {event.summary && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Summary
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {event.summary}
                  </p>
                </div>
              )}

              {/* Show existing transcription */}
              {event.transcription && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Full Transcription
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                      {event.transcription}
                    </p>
                  </div>
                </div>
              )}

              {/* Add transcription controls (organizer/admin only) */}
              {canAddTranscription && (
                <div>
                  {!transcriptionMode && !aiProcessing && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setTranscriptionMode('audio')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Audio
                      </button>
                      <button
                        onClick={() => setTranscriptionMode('text')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all shadow-md"
                      >
                        <FileText className="w-4 h-4" />
                        Paste Transcription
                      </button>
                    </div>
                  )}

                  {aiProcessing && (
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <svg className="animate-spin h-5 w-5 text-indigo-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                        AI is processing... Transcribing and summarizing your content
                      </span>
                    </div>
                  )}

                  {transcriptionMode === 'audio' && !aiProcessing && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Upload an audio file (mp3, wav, m4a, webm, ogg, flac — max 25MB). AI will transcribe and summarize it.
                      </p>
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                      />
                      <button
                        onClick={() => setTranscriptionMode(null)}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {transcriptionMode === 'text' && !aiProcessing && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Paste the event transcription below. AI will generate a summary automatically.
                      </p>
                      <textarea
                        value={transcriptionText}
                        onChange={(e) => setTranscriptionText(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm h-40 resize-y"
                        placeholder="Paste event transcription here..."
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={handleTextTranscription}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          Summarize & Save
                        </button>
                        <button
                          onClick={() => { setTranscriptionMode(null); setTranscriptionText(''); }}
                          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No transcription yet message */}
              {!event.transcription && !event.summary && !canAddTranscription && (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No transcription available for this event yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
