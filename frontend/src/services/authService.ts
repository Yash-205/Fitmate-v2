import { fetchClient } from './client';

/**
 * Auth Service
 * Handles user authentication lifecycle and token management.
 */
export const AuthService = {
  /**
   * standard Email/Password Login
   */
  login: async (credentials: { email: string; password: string }) => {
    // 1. Send the login request to the backend
    const data = await fetchClient('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    });

    // 2. If successful, persist the session data in the browser's localStorage
    localStorage.setItem('token', data.token);              // The JWT for API authorization
    localStorage.setItem('isLoggedIn', 'true');            // Simple flag for quick UI checks
    localStorage.setItem('userEmail', credentials.email);   // User's email for profile display
    localStorage.setItem('userName', data.name || '');      // User's display name
    localStorage.setItem('userRole', data.role);            // 'learner', 'trainer', or 'admin'
    
    // 3. Store profile completion status (used for conditional routing)
    localStorage.setItem('hasProfile', data.hasProfile ? 'true' : 'false');
    localStorage.setItem('hasTrainerProfile', data.hasTrainerProfile ? 'true' : 'false');
    
    return data;
  },

  /**
   * standard Email/Password Signup
   */
  signup: async (userData: { email: string; password: string; name?: string }) => {
    // 1. Send user registration details to the backend
    const data = await fetchClient('/auth/signup', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });

    // 2. Store the returned token and base user info
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', data.name || userData.name || '');
    localStorage.setItem('userRole', data.role);
    
    return data;
  },

  /**
   * Google OAuth specific authentication
   * @param credential The ID Token (JWT) provided by Google's SDK
   */
  googleAuth: async (credential: string) => {
    // 1. Forward the Google credential to our backend for verification
    const data = await fetchClient('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });

    // 2. Persist session data (same as local login)
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', data.name || '');
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('hasProfile', data.hasProfile ? 'true' : 'false');
    localStorage.setItem('hasTrainerProfile', data.hasTrainerProfile ? 'true' : 'false');
    
    return data;
  },

  /**
   * Clears the session and logs the user out
   */
  logout: () => {
    // Wipe all Fitmate-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasProfile');
    localStorage.removeItem('hasTrainerProfile');
  }
};
