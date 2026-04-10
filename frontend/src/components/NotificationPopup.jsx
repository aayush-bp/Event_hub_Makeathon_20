import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const LAST_ACTIVE_KEY = 'eventhub_last_active';
const LAST_POPUP_KEY = 'eventhub_last_popup';
const SCHEDULED_FIRED_KEY = 'eventhub_scheduled_fired';

export const NotificationPopup = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { notifications, unreadCount, fetchNotifications } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [reason, setReason] = useState(''); // 'return' | 'scheduled'
  const scheduledTimerRef = useRef(null);

  const userData = user?.user || user;
  const prefs = userData?.preferences || {};
  const popupMode = prefs.popupMode || 'on-return';
  const popupTimes = prefs.popupTimes || ['09:00'];
  const awayThreshold = (prefs.awayThresholdMinutes || 60) * 60 * 1000;

  // Track last active time — update every 30s while page is visible
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActive = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    updateActive();
    const interval = setInterval(updateActive, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // --- ON-RETURN / AWAY DETECTION ---
  useEffect(() => {
    if (!isAuthenticated) return;
    if (popupMode === 'scheduled' || popupMode === 'never') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
        const lastPopup = parseInt(localStorage.getItem(LAST_POPUP_KEY) || '0', 10);
        const now = Date.now();

        const wasAway = now - lastActive > awayThreshold;
        const popupCooldown = now - lastPopup > 5 * 60 * 1000; // min 5 min between popups

        if (wasAway && popupCooldown) {
          fetchNotifications().then(() => {
            triggerPopup('return');
          });
        }

        // Update active timestamp on return
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, popupMode, awayThreshold, fetchNotifications]);

  // --- SCHEDULED TIME DETECTION ---
  useEffect(() => {
    if (!isAuthenticated) return;
    if (popupMode === 'on-return' || popupMode === 'never') return;

    const checkSchedule = () => {
      const now = new Date();
      const currentTime =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');

      const todayKey = now.toDateString();
      const firedRaw = localStorage.getItem(SCHEDULED_FIRED_KEY);
      let firedToday = {};
      try {
        firedToday = JSON.parse(firedRaw) || {};
      } catch {}

      // Reset if different day
      if (firedToday._date !== todayKey) {
        firedToday = { _date: todayKey };
      }

      for (const time of popupTimes) {
        if (!time) continue;
        // Match within a 1-minute window
        if (currentTime === time && !firedToday[time]) {
          firedToday[time] = true;
          localStorage.setItem(SCHEDULED_FIRED_KEY, JSON.stringify(firedToday));

          fetchNotifications().then(() => {
            triggerPopup('scheduled');
          });
          break;
        }
      }
    };

    // Check every 30s
    scheduledTimerRef.current = setInterval(checkSchedule, 30000);
    checkSchedule(); // immediate check

    return () => {
      if (scheduledTimerRef.current) clearInterval(scheduledTimerRef.current);
    };
  }, [isAuthenticated, popupMode, popupTimes, fetchNotifications]);

  const triggerPopup = useCallback(
    (triggerReason) => {
      setReason(triggerReason);
      setVisible(true);
      localStorage.setItem(LAST_POPUP_KEY, Date.now().toString());
    },
    []
  );

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleViewAll = () => {
    setVisible(false);
    navigate('/notifications');
  };

  if (!visible || !isAuthenticated || popupMode === 'never') return null;

  const unreadNotifications = (notifications || []).filter((n) => !n.isRead && !n.read);
  const displayItems = unreadNotifications.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 pointer-events-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
        onClick={handleDismiss}
      />

      {/* Popup card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 w-full max-w-md mx-4 pointer-events-auto border border-gray-200 dark:border-gray-700 overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {reason === 'return' ? 'Welcome back!' : 'Notification Check-in'}
              </h3>
              <p className="text-blue-100 text-sm">
                {reason === 'return'
                  ? 'Here\'s what happened while you were away'
                  : 'Your scheduled notification summary'}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {displayItems.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                You're all caught up!
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                No new notifications
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {displayItems.map((notif) => (
                <div
                  key={notif._id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-gray-700/50 border border-blue-100 dark:border-gray-600"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
              {unreadNotifications.length > 5 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  +{unreadNotifications.length - 5} more notifications
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {reason === 'return' ? 'Triggered on return' : `Scheduled popup`}
            </span>
          </div>
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm font-semibold text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
