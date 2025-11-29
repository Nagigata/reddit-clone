import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/clientApp';
import { notificationService, Notification, UserPreferences, BackendNotificationResponse } from '../services/notificationService';
import { socketService } from '../services/socketService';

export const useNotifications = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // Helper function to map backend notification to frontend format
  const mapNotification = useCallback((item: any): Notification => ({
    id: item.id,
    userId: item.userId || 'unknown', 
    title: item.title,
    message: item.body,
    type: (item.type === 'comment_created' ? 'comment' : 
           item.type === 'like_created' ? 'like' :
           item.type === 'follow_created' ? 'follow' :
           item.type === 'mention_created' ? 'mention' : 'comment') as 'comment' | 'like' | 'follow' | 'mention',
    read: item.isRead || false, 
    createdAt: item.createdAt,
    data: item.metadata
  }), []);

  const fetchNotifications = useCallback(async (limit: number = 20, cursor?: string) => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    
    try {
      const response: BackendNotificationResponse = await notificationService.getNotifications(user.uid, limit, cursor);
      console.log('Full API response:', response);
      console.log('response.items:', response.items);
      
      // Map backend response to frontend format
      const notifications = (response.items || []).map(mapNotification);
      
      setNotifications(notifications);
      const unreadCount = notifications.filter(n => !n.read).length;
      console.log('Total notifications:', notifications.length);
      console.log('Unread count:', unreadCount);
      console.log('Notifications status:', notifications.map(n => ({ id: n.id, read: n.read })));
      setUnreadCount(unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, mapNotification]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      // Only call API, let WebSocket handle the state update
      await notificationService.markAsRead(notificationId, user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  }, [user?.uid]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      // Only call API, let WebSocket handle the state update
      await notificationService.markAllAsRead(user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  }, [user?.uid]);

  const fetchPreferences = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const prefs = await notificationService.getUserPreferences(user.uid);
      setPreferences(prefs);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [user?.uid]);

  const updatePreferences = useCallback(async (newPreferences: Partial<UserPreferences>) => {
    if (!user?.uid || !preferences) return;

    try {
      const updatedPrefs = await notificationService.updateUserPreferences({
        ...preferences,
        ...newPreferences,
      });
      setPreferences(updatedPrefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    }
  }, [user?.uid, preferences]);

  useEffect(() => {
    // Only fetch on client-side to avoid hydration mismatch
    if (typeof window !== 'undefined' && user?.uid) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user?.uid, fetchNotifications, fetchPreferences, mapNotification]);

  // Socket.IO setup
  useEffect(() => {
    if (!user?.uid || typeof window === 'undefined') return;

    // Connect to socket
    socketService.connect(user.uid);
    setSocketConnected(true);

    // Join user room
    socketService.joinUserRoom(user.uid);

    // Listen for new notifications
    socketService.onNewNotification((newNotification) => {
      console.log('🔔 Real-time notification received:', newNotification);
      
      // Map and add new notification to the list
      const mappedNotification = mapNotification(newNotification);
      
      setNotifications(prev => {
        // Check if notification already exists (avoid duplicates)
        const exists = prev.some(n => n.id === mappedNotification.id);
        if (exists) return prev;
        
        // Add new notification at the beginning
        return [mappedNotification, ...prev];
      });
      
      // Update unread count
      if (!mappedNotification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Listen for notification updates
    socketService.onNotificationUpdate((notificationId, updates) => {
      console.log('📝 Real-time notification update:', notificationId, updates);
      
      // Handle "mark all as read" case
      if (notificationId === 'all' && updates.read) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        return;
      }
      
      // Update notifications and unread count in one go
      setNotifications(prev => {
        const updatedNotifications = prev.map(n => 
          n.id === notificationId 
            ? { ...n, ...updates }
            : n
        );
        
        // Update unread count based on the change
        if (updates.hasOwnProperty('read')) {
          const notification = prev.find(n => n.id === notificationId);
          if (notification) {
            setUnreadCount(currentCount => {
              if (updates.read && !notification.read) {
                console.log('Marking as read:', notificationId);
                return Math.max(0, currentCount - 1); // Mark as read
              } else if (!updates.read && notification.read) {
                return currentCount + 1; // Mark as unread
              }
              return currentCount;
            });
          }
        }
        
        return updatedNotifications;
      });
    });

    // Listen for notification deletions
    socketService.onNotificationDeleted((notificationId) => {
      console.log('🗑️ Real-time notification deleted:', notificationId);
      
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const newNotifications = prev.filter(n => n.id !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        
        return newNotifications;
      });
    });

    // Cleanup on unmount
    return () => {
      socketService.leaveUserRoom(user.uid);
      socketService.disconnect();
      setSocketConnected(false);
    };
  }, [user?.uid, mapNotification]);

  // Update socket connection status
  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(socketService.isSocketConnected());
    };

    // Check connection status periodically
    const interval = setInterval(checkConnection, 5000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    preferences,
    socketConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
};
