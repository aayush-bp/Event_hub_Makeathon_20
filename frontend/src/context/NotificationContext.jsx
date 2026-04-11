import React, { createContext, useState, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext(null);
export { NotificationContext };

const sendBrowserNotif = (notif) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(notif.title || 'Event Hub', {
    body: notif.message || '',
    icon: '/favicon.ico',
    tag: `eventhub-${notif._id}`,
  });
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const prevIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead && !n.read).length);

      // Send browser notification for newly arrived items
      const currentIds = new Set(list.map((n) => n._id));
      if (prevIdsRef.current.size > 0) {
        list.forEach((n) => {
          if (!prevIdsRef.current.has(n._id) && !n.isRead && !n.read) {
            sendBrowserNotif(n);
          }
        });
      }
      prevIdsRef.current = currentIds;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      const count = typeof data === 'number' ? data : (data?.count || 0);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationId)
      );
      await fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
