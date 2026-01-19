import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User } from 'oidc-client-ts';
import { authService } from '../services/auth';

/**
 * Authentication Context for React application
 *
 * Provides:
 * - User authentication state
 * - Login/logout methods
 * - Loading state during auth operations
 * - User profile information
 */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  userProfile: {
    email?: string;
    name?: string;
    sub?: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wrap your app with this provider to enable authentication
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    email?: string;
    name?: string;
    sub?: string;
  } | null>(null);

  /**
   * Load user on mount and set up event listeners
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser);

        if (currentUser) {
          const profile = await authService.getUserProfile();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Login handler
   */
  const login = async () => {
    setIsLoading(true);
    try {
      await authService.login();
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Logout handler
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get access token for API calls
   */
  const getAccessToken = async () => {
    return await authService.getAccessToken();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null && !user.expired,
    isLoading,
    login,
    logout,
    getAccessToken,
    userProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
