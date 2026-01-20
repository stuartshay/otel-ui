import { UserManager, User, WebStorageStateStore } from 'oidc-client-ts';

/**
 * Authentication Service using OAuth2/PKCE with AWS Cognito
 *
 * This service handles:
 * - User authentication via Cognito hosted UI
 * - OAuth2 PKCE flow (login, callback, logout)
 * - Token management (access token, refresh token)
 * - User session persistence
 */

// Cognito configuration from environment variables
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
const issuer = import.meta.env.VITE_COGNITO_ISSUER;

if (!cognitoDomain || !clientId || !redirectUri || !issuer) {
  throw new Error('Missing required Cognito environment variables. Check .env.local or .env file.');
}

// Get origin safely (will be available when UserManager is instantiated)
const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for SSR or build time
  return redirectUri.replace(/\/callback$/, '');
};

// Create singleton WebStorageStateStore to avoid recreating instances
const createStateStore = () => {
  if (typeof window === 'undefined') {
    return undefined; // SSR - let oidc-client-ts use default
  }
  return new WebStorageStateStore({
    store: window.localStorage,
  });
};

const stateStore = createStateStore();

// UserManager configuration for OIDC client
const userManagerConfig = {
  authority: issuer,
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'openid profile email',
  get post_logout_redirect_uri() {
    return getOrigin();
  },
  userStore: stateStore, // Use singleton for user data persistence
  stateStore: stateStore, // CRITICAL: Use same singleton for OAuth state
  automaticSilentRenew: true,
  get silent_redirect_uri() {
    return `${getOrigin()}/silent-renew.html`;
  },
  metadata: {
    issuer: issuer,
    authorization_endpoint: `https://${cognitoDomain}/oauth2/authorize`,
    token_endpoint: `https://${cognitoDomain}/oauth2/token`,
    userinfo_endpoint: `https://${cognitoDomain}/oauth2/userInfo`,
    get end_session_endpoint() {
      return `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${getOrigin()}`;
    },
  },
};

// Create UserManager instance
const userManager = new UserManager(userManagerConfig);

/**
 * Authentication Service
 */
class AuthService {
  private userManager: UserManager;

  constructor() {
    this.userManager = userManager;

    // Event handlers for token renewal
    this.userManager.events.addAccessTokenExpiring(() => {
      console.log('Access token expiring, attempting silent renewal...');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
      this.logout();
    });

    this.userManager.events.addSilentRenewError(error => {
      console.error('Silent renew error:', error);
      this.logout();
    });

    this.userManager.events.addUserLoaded(user => {
      console.log('User loaded:', user.profile.email);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('User unloaded');
    });
  }

  /**
   * Initiate login flow - redirects to Cognito hosted UI
   */
  async login(): Promise<void> {
    try {
      await this.userManager.signinRedirect({
        state: window.location.pathname, // Save current path to redirect back after login
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to initiate login');
    }
  }

  /**
   * Handle OAuth callback after Cognito redirects back
   * Call this on the callback page
   */
  async handleCallback(): Promise<User> {
    try {
      const user = await this.userManager.signinRedirectCallback();
      console.log('Login successful:', user.profile.email);

      // Redirect to original path or home
      const returnUrl = (typeof user.state === 'string' ? user.state : null) || '/';
      window.history.replaceState({}, document.title, returnUrl);

      return user;
    } catch (error) {
      console.error('Callback error:', error);
      throw new Error('Failed to handle OAuth callback');
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local storage even if redirect fails
      await this.userManager.removeUser();
      window.location.href = '/';
    }
  }

  /**
   * Get current authenticated user
   */
  async getUser(): Promise<User | null> {
    try {
      return await this.userManager.getUser();
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null && !user.expired;
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser();
    return user?.access_token || null;
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{
    email?: string;
    name?: string;
    sub?: string;
  } | null> {
    const user = await this.getUser();
    if (!user) return null;

    return {
      email: user.profile.email as string,
      name: user.profile.name as string,
      sub: user.profile.sub as string,
    };
  }

  /**
   * Manually trigger token renewal
   */
  async renewToken(): Promise<User | null> {
    try {
      const user = await this.userManager.signinSilent();
      console.log('Token renewed successfully');
      return user;
    } catch (error) {
      console.error('Token renewal error:', error);
      return null;
    }
  }

  /**
   * Clear user session without redirect (useful for testing)
   */
  async clearSession(): Promise<void> {
    await this.userManager.removeUser();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
