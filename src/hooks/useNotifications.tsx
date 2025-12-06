import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, Notification, NotificationPreferences } from '../services/notificationService';
import { socketService } from '../services/socketService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (limit: number = 20, cursor?: string, append: boolean = false) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await notificationService.getNotifications(user.id.toString(), limit, cursor);
      
      const newNotifications = response.items || [];
      
      setNotifications(prev => {
        const updatedNotifications = append 
          ? [...prev, ...newNotifications]
          : newNotifications;
        
        // Calculate unread count
        const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
        
        return updatedNotifications;
      });
      
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      // Only call API, let WebSocket handle the state update
      await notificationService.markAsRead(notificationId, user.id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Only call API, let WebSocket handle the state update
      await notificationService.markAllAsRead(user.id.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [user?.id]);

  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const prefs = await notificationService.getPreferences(user.id.toString());
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [user?.id]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user?.id) return;

    try {
      const updatedPrefs = await notificationService.updatePreferences({
        userId: user.id.toString(),
        ...newPreferences,
      });
      setPreferences(updatedPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      fetchNotifications();
      fetchPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') return;

    socketService.connect(user.id.toString());
    setSocketConnected(true);

    socketService.joinUserRoom(user.id.toString());

    socketService.onNewNotification((newNotification: Notification) => {
      console.log('Real-time notification received:', newNotification);
      
      setNotifications(prev => {
        const exists = prev.some(n => n.id === newNotification.id);
        if (exists) return prev;
        
        return [newNotification, ...prev];
      });
      
      if (!newNotification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    });

    socketService.onNotificationUpdate((notificationId, updates) => {
      console.log('Real-time notification update:', notificationId, updates);
      
      if (notificationId === 'all' && updates.isRead) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        return;
      }
      
      setNotifications(prev => {
        const updatedNotifications = prev.map(n => 
          n.id === notificationId 
            ? { ...n, ...updates }
            : n
        );
        
        if (updates.hasOwnProperty('isRead')) {
          const notification = prev.find(n => n.id === notificationId);
          if (notification) {
            setUnreadCount(currentCount => {
              if (updates.isRead && !notification.isRead) {
                console.log('Marking as read:', notificationId);
                return Math.max(0, currentCount - 1);
              } else if (!updates.isRead && notification.isRead) {
                return currentCount + 1;
              }
              return currentCount;
            });
          }
        }
        
        return updatedNotifications;
      });
    });

    socketService.onNotificationDeleted((notificationId) => {
      console.log('Real-time notification deleted:', notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        
        return newNotifications;
      });
    });

    return () => {
      socketService.leaveUserRoom(user.id.toString());
      socketService.disconnect();
      setSocketConnected(false);
    };
  }, [user?.id]);

  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(socketService.isSocketConnected());
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    socketConnected,
    nextCursor,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
};
