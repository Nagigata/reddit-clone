import { io, Socket } from 'socket.io-client';

const NOTIFICATION_API_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(NOTIFICATION_API_BASE_URL, {
      auth: {
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Socket reconnection error:', error);
    });

    // Listen for room join confirmation
    this.socket.on('joined-room', (data) => {
      console.log('✅ Joined room confirmed:', data);
    });

    // Listen for errors
    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  // Listen for new notifications
  onNewNotification(callback: (notification: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      callback(notification);
    });
  }

  // Listen for notification updates (mark as read, etc.)
  onNotificationUpdate(callback: (notificationId: string, updates: any) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('notification:updated', (data) => {
      console.log('📝 Notification updated:', data);
      callback(data.notificationId, data.updates);
    });
  }

  // Listen for notification deletions
  onNotificationDeleted(callback: (notificationId: string) => void): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.on('notification:deleted', (notificationId) => {
      console.log('🗑️ Notification deleted:', notificationId);
      callback(notificationId);
    });
  }

  // Join user-specific room for notifications
  joinUserRoom(userId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('join-user-room', userId);
    console.log('🏠 Joined user room:', userId);
  }

  // Leave user-specific room
  leaveUserRoom(userId: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('leave-user-room', userId);
    console.log('🚪 Left user room:', userId);
  }

  // Get connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
