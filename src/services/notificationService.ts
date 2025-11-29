const NOTIFICATION_API_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL 

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'comment' | 'like' | 'follow' | 'mention';
  read: boolean;
  createdAt: string;
  data?: any;
}

export interface UserPreferences {
  userId: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  types: Record<string, any>;
  quietHours: Record<string, any>;
  language: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export interface BackendNotificationResponse {
  items: BackendNotificationItem[];
  nextCursor: string | null;
}

export interface BackendNotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata: any;
  dedupeKey: string;
}

class NotificationService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${NOTIFICATION_API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getNotifications(userId: string, limit: number = 20, cursor?: string): Promise<BackendNotificationResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
    });
    
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    return this.request(`/notifications?${params.toString()}`);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.request(`/preferences?userId=${userId}`);
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
    return this.request('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }
}

export const notificationService = new NotificationService();
