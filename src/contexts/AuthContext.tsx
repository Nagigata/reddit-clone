import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = async () => {
    if (!userService.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const userData = await userService.getProfile();
      setUser(userData);
      userService.setStoredUser(userData);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      // If token is invalid, clear everything
      userService.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await userService.login({ email, password });
      await refreshUser();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Login failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      await userService.register({ email, password, full_name: fullName });
      await refreshUser();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Registration failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    userService.clearTokens();
    setUser(null);
    setError(null);
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check if we have a stored user
      const storedUser = userService.getStoredUser();
      
      if (storedUser && userService.isAuthenticated()) {
        // Validate token and refresh user data
        try {
          await userService.validateToken();
          await refreshUser();
        } catch {
          // Token invalid, clear everything
          userService.clearTokens();
          setUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

