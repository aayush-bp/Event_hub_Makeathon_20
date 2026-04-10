import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, User } from 'lucide-react';
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

                {isRegistered ? (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
