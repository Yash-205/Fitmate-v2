import { fetchClient } from './client';

/**
 * Auth Service
 * Handles user authentication lifecycle and token management.
 */
export const AuthService = {
  login: async (credentials: { email: string; password: string }) => {
    const data = await fetchClient('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', credentials.email);
    localStorage.setItem('userRole', data.role);
    localStorage.setItem('hasProfile', data.hasProfile ? 'true' : 'false');
    localStorage.setItem('hasTrainerProfile', data.hasTrainerProfile ? 'true' : 'false');
    return data;
  },
  signup: async (userData: { email: string; password: string; name?: string }) => {
    const data = await fetchClient('/auth/signup', { 
      method: 'POST', 
      body: JSON.stringify(userData) 
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', data.role);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('hasProfile');
    localStorage.removeItem('hasTrainerProfile');
  }
};
