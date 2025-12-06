// Compatibility hook that mimics react-firebase-hooks useAuthState
// This allows gradual migration from Firebase auth to JWT auth
import { useAuth } from '../contexts/AuthContext';

export const useAuthState = () => {
  const { user, loading, error } = useAuth();
  
  // Return in the same format as react-firebase-hooks useAuthState
  // [user, loading, error]
  return [user, loading, error] as const;
};

