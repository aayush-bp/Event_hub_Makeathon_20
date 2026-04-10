import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, Users, ChevronLeft, ChevronRight, LayoutGrid, CalendarDays } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('week'); // '1day', '3day', 'week'
  const [viewStartDate, setViewStartDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [showTimeline, setShowTimeline] = useState(true);

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

  const viewDays = viewMode === '1day' ? 1 : viewMode === '3day' ? 3 : 7;

  const viewEndDate = useMemo(() => {
    const end = new Date(viewStartDate);
    end.setDate(end.getDate() + viewDays);
    return end;
  }, [viewStartDate, viewDays]);

  const navigateView = (direction) => {
    setViewStartDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction * viewDays);
      return d;
    });
  };

  const goToToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setViewStartDate(d);
  };

  const timelineEvents = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.dateTime);
      return d >= viewStartDate && d < viewEndDate;
    });
  }, [events, viewStartDate, viewEndDate]);

  const groupedByDay = useMemo(() => {
    const groups = {};
    const sortedEvents = [...timelineEvents].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    sortedEvents.forEach((event) => {
      const d = new Date(event.dateTime);
      const key = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    return groups;
  }, [timelineEvents]);

  const formatViewRange = () => {
    const opts = { month: 'short', day: 'numeric' };
    const start = viewStartDate.toLocaleDateString('en-US', opts);
    if (viewDays === 1) return viewStartDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const end = new Date(viewEndDate);
    end.setDate(end.getDate() - 1);
    return `${start} – ${end.toLocaleDateString('en-US', opts)}`;
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

          {/* All Events — Calendar / Grid toggle */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                All Upcoming Events
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTimeline(true)}
                  className={`p-2 rounded-lg transition-colors ${
                    showTimeline
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title="Timeline view"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowTimeline(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    !showTimeline
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>

            {showTimeline ? (
              <div>
                {/* View mode toggle & navigation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-lg p-4 mb-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* View mode buttons */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {[{ key: '1day', label: '1 Day' }, { key: '3day', label: '3 Days' }, { key: 'week', label: 'Week' }].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setViewMode(key)}
                          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                            viewMode === key
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Date navigation */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigateView(-1)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={goToToday}
                        className="px-3 py-1 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateView(1)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 ml-2 whitespace-nowrap">
                        {formatViewRange()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline grouped by day */}
                {Object.keys(groupedByDay).length === 0 ? (
                  <div className="text-center py-16">
                    <CalendarDays className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No events in this period</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different date range or switch to grid view</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedByDay).map(([dayLabel, dayEvents]) => {
                      const isToday =
                        new Date(dayEvents[0].dateTime).toDateString() === new Date().toDateString();
                      return (
                        <div key={dayLabel}>
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                isToday ? 'bg-primary animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                            <h3 className={`text-lg font-bold ${
                              isToday
                                ? 'text-primary dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {isToday ? 'Today — ' : ''}{dayLabel}
                            </h3>
                            <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-full">
                              {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {dayEvents.map((event) => (
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
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
