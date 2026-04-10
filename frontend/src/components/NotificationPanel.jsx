import React from 'react';
import { X } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, loading, markAsRead, deleteNotification, markAllAsRead } =
    useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
      <div
        className="absolute right-0 top-16 w-96 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Notifications</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="w-full p-2 text-sm text-primary hover:bg-blue-50 border-b"
          >
            Mark all as read
          </button>
        )}

        <div className="divide-y">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No notifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
