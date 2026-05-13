import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../authService';
import { fetchClient } from '../client';

// Mock fetchClient
vi.mock('../client', () => ({
  fetchClient: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should store user data in localStorage on success', async () => {
      const mockResponse = {
        token: 'test_token',
        name: 'Test User',
        role: 'learner',
        hasProfile: true,
        hasTrainerProfile: false,
      };
      (fetchClient as any).mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      await AuthService.login(credentials);

      expect(localStorage.getItem('token')).toBe('test_token');
      expect(localStorage.getItem('isLoggedIn')).toBe('true');
      expect(localStorage.getItem('userName')).toBe('Test User');
      expect(localStorage.getItem('userRole')).toBe('learner');
      expect(localStorage.getItem('hasProfile')).toBe('true');
    });
  });

  describe('signup', () => {
    it('should store user data in localStorage on successful signup', async () => {
      const mockResponse = {
        token: 'new_token',
        role: 'learner',
      };
      (fetchClient as any).mockResolvedValue(mockResponse);

      const userData = { email: 'new@example.com', password: 'password123', name: 'New User' };
      await AuthService.signup(userData);

      expect(localStorage.getItem('token')).toBe('new_token');
      expect(localStorage.getItem('userEmail')).toBe('new@example.com');
    });
  });

  describe('googleAuth', () => {
    it('should handle google authentication', async () => {
      const mockResponse = {
        token: 'google_jwt',
        name: 'Google User',
        role: 'learner',
      };
      (fetchClient as any).mockResolvedValue(mockResponse);

      await AuthService.googleAuth('google_credential_string');

      expect(fetchClient).toHaveBeenCalledWith('/auth/google', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ credential: 'google_credential_string' })
      }));
      expect(localStorage.getItem('token')).toBe('google_jwt');
    });
  });

  describe('logout', () => {
    it('should clear all auth data from localStorage', () => {
      localStorage.setItem('token', 'some_token');
      localStorage.setItem('isLoggedIn', 'true');

      AuthService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('isLoggedIn')).toBeNull();
    });
  });
});
