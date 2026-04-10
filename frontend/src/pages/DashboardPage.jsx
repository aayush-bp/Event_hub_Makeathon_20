import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { EventCard } from '../components/EventCard';
import { LoadingSpinner, ErrorAlert } from '../components/AlertComponents';
import { eventService } from '../services/eventService';
import { recommendationService } from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [eventsList, registeredList, recommendedList] = await Promise.all([
        eventService.getAllEvents({ status: 'APPROVED' }),
        eventService.getUserRegisteredEvents(),
        recommendationService.getPersonalizedRecommendations(),
      ]);

      setEvents(Array.isArray(eventsList) ? eventsList : []);
      setRegisteredEvents(Array.isArray(registeredList) ? registeredList : []);
      setRecommendedEvents(Array.isArray(recommendedList) ? recommendedList : []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await eventService.registerForEvent(eventId);
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to register for event');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await eventService.unregisterFromEvent(eventId);
      await fetchDashboardData();
    } catch (err) {
      setError('Failed to unregister from event');
    }
  };

  const isEventRegistered = (eventId) => {
    return registeredEvents.some((e) => e._id === eventId);
  };

  if (loading && !events.length) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <div className="mb-8">
            <h3 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
              Welcome back, {(user?.user?.name).split(" ")[0]}!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg font-medium transition-colors duration-300">
              Explore and discover amazing events
            </p>
          </div>

          {error && (
            <ErrorAlert message={error} onClose={() => setError('')} />
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:scale-105 transform border border-white dark:border-gray-700 border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Registered Events</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    {registeredEvents.length}
                  </p>
                </div>
                <Calendar className="w-16 h-16 text-primary dark:text-blue-400 opacity-15" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:scale-105 transform border border-white dark:border-gray-700 border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Total Events</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-accent to-green-600 bg-clip-text text-transparent">
                    {events.length}
                  </p>
                </div>
                <TrendingUp className="w-16 h-16 text-accent dark:text-green-400 opacity-15" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-50 backdrop-blur-md rounded-xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:scale-105 transform border border-white dark:border-gray-700 border-opacity-20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Recommended</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">
                    {recommendedEvents.length}
                  </p>
                </div>
                <Users className="w-16 h-16 text-warning dark:text-yellow-400 opacity-15" />
              </div>
            </div>
          </div>

          {/* My Events */}
          {registeredEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
                My Registered Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isRegistered={true}
                    onUnregister={handleUnregister}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Events */}
          {recommendedEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    isRegistered={isEventRegistered(event._id)}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              All Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  isRegistered={isEventRegistered(event._id)}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};
