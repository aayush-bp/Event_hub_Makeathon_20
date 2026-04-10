import React, { useEffect } from 'react';
import { Trash2, Check } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { LoadingSpinner } from '../components/AlertComponents';
import { useNotifications } from '../hooks/useNotifications';
import { useInterval } from '../hooks/useInterval';
import { formatDate } from '../utils/dateUtils';

export const NotificationsPage = () => {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Poll for new notifications every 30 seconds
  useInterval(() => {
    fetchNotifications();
  }, 30000);

  const unreadNotifications = notifications.filter((n) => !n.read);

  if (loading && !notifications.length) {
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                {unreadNotifications.length} unread notification
                {unreadNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 text-lg">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow p-6 flex items-start justify-between ${
                    !notification.read ? 'border-l-4 border-primary' : ''
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() =>
                      !notification.read && markAsRead(notification._id)
                    }
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mt-2">{notification.message}</p>
                    <p className="text-sm text-gray-400 mt-3">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-primary"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
