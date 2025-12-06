const USER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface RegisterDto {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  is_admin: boolean;
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name: string;
  avatar: string | null;
  gender: boolean | null;
  updated_at: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  is_admin: boolean;
  updated_at: string;
  created_at: string;
  profile?: UserProfile;
}

export interface UpdateProfileDto {
  full_name?: string;
  gender?: string; // '0' or '1'
  avatar?: File;
}

class UserService {
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${USER_API_BASE_URL}${endpoint}`;
    const accessToken = this.getAccessToken();

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    // Add Authorization header if token exists
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Don't set Content-Type for multipart/form-data (browser will set it with boundary)
    if (!(options?.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens
    this.setTokens(response.access_token, response.refresh_token);

    return response;
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens
    this.setTokens(response.access_token, response.refresh_token);

    return response;
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'GET',
    });
  }

  async getUserById(userId: number | string): Promise<User> {
    return this.request<User>(`/users/${userId}`, {
      method: 'GET',
    });
  }

  async updateProfile(data: UpdateProfileDto): Promise<{
    message: string;
    profile: UserProfile;
  }> {
    const formData = new FormData();

    if (data.full_name) {
      formData.append('full_name', data.full_name);
    }

    if (data.gender !== undefined) {
      formData.append('gender', data.gender);
    }

    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    return this.request<{ message: string; profile: UserProfile }>(
      '/users/profile',
      {
        method: 'PUT',
        body: formData,
      }
    );
  }

  async validateToken(): Promise<{ valid: boolean }> {
    return this.request<{ valid: boolean }>('/auth/validate', {
      method: 'GET',
    });
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  setStoredUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export const userService = new UserService();

