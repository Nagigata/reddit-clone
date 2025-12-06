const NOTIFICATION_API_BASE_URL = process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL;

export interface NotificationMetadata {
  evt: {
    eventId: string;
    eventType: string;
    occurredAt: string;
    actor: {
      userId: string;
      username: string;
    };
    target: {
      postId: number;
      commentId: number;
      ownerUserId: string;
    };
    context?: {
      snippet: string;
      postTitle?: string;
    };
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  dedupeKey?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  nextCursor: string | null;
}

export interface NotificationPreferences {
  userId: string;
  inApp: boolean;
  email: boolean;
  push: boolean;
  types?: Record<string, boolean>;
  quietHours?: Record<string, any>;
  language: string;
}

class NotificationService {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${NOTIFICATION_API_BASE_URL}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `API request failed: ${response.status} ${response.statusText}`;
      try {
        const json = JSON.parse(text);
        message = json.error || json.message || message;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json();
  }

  // Get notifications with pagination
  async getNotifications(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      userId,
      limit: String(limit),
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    return this.request<NotificationsResponse>(`/notifications?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    await this.request<void>('/notifications/read-all', {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  }

  // Get preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const params = new URLSearchParams({ userId });
    return this.request<NotificationPreferences>(`/preferences?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Update preferences
  async updatePreferences(
    preferences: Partial<NotificationPreferences> & { userId: string }
  ): Promise<NotificationPreferences> {
    return this.request<NotificationPreferences>('/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const notificationService = new NotificationService();
