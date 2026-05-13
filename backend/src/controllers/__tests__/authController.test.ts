import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, googleAuth } from '../authController';
import User from '../../models/User';
import Profile from '../../models/Profile';
import Trainer from '../../models/Trainer';
import bcrypt from 'bcrypt';
import generateToken from '../../utils/generateToken';
import { OAuth2Client } from 'google-auth-library';

// Mocking dependencies
vi.mock('../../models/User');
vi.mock('../../models/Profile');
vi.mock('../../models/Trainer');
vi.mock('bcrypt');
vi.mock('../../utils/generateToken');

// Complex mock for Google OAuth to handle the instance methods correctly
vi.mock('google-auth-library', () => {
  const verifyIdTokenMock = vi.fn();
  return {
    OAuth2Client: vi.fn().mockImplementation(() => ({
      verifyIdToken: verifyIdTokenMock,
    })),
  };
});

describe('Auth Controller', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should register a new user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      (User.findOne as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (User.create as any).mockResolvedValue({
        _id: 'user_id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'learner',
      });
      (generateToken as any).mockReturnValue('mock_token');

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mock_token',
        role: 'learner',
      }));
    });

    it('should return 400 if user already exists', async () => {
      req.body = { email: 'existing@example.com', password: 'password123' };
      (User.findOne as any).mockResolvedValue({ email: 'existing@example.com' });

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        _id: 'user_id',
        email: 'test@example.com',
        password: 'hashed_password',
        provider: 'local',
        role: 'learner',
        name: 'Test User'
      };
      (User.findOne as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (Profile.findOne as any).mockResolvedValue(null);
      (Trainer.findOne as any).mockResolvedValue(null);
      (generateToken as any).mockReturnValue('mock_token');

      await login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mock_token',
        hasProfile: false,
      }));
    });

    it('should return 400 for invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrong_password' };
      (User.findOne as any).mockResolvedValue({ email: 'test@example.com', provider: 'local' });
      (bcrypt.compare as any).mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials: Password incorrect' });
    });
  });

  describe('googleAuth', () => {
    it('should login/register via Google successfully', async () => {
      req.body = { credential: 'google_token' };
      
      const mockPayload = {
        email: 'google@example.com',
        sub: 'google_id',
        name: 'Google User',
      };

      // Get the mocked client instance
      const clientInstance = new OAuth2Client();
      (clientInstance.verifyIdToken as any).mockResolvedValue({
        getPayload: () => mockPayload,
      });

      (User.findOne as any).mockResolvedValue(null);
      (User.create as any).mockResolvedValue({
        _id: 'google_user_id',
        email: 'google@example.com',
        role: 'learner',
        name: 'Google User'
      });
      
      (Profile.findOne as any).mockResolvedValue(null);
      (Trainer.findOne as any).mockResolvedValue(null);
      (generateToken as any).mockReturnValue('mock_token');

      await googleAuth(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'mock_token',
        name: 'Google User',
      }));
    });

    it('should return 400 if Google token is invalid', async () => {
      req.body = { credential: 'invalid_token' };
      
      const clientInstance = new OAuth2Client();
      (clientInstance.verifyIdToken as any).mockResolvedValue({
        getPayload: () => null, // Invalid payload
      });

      await googleAuth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Google token' });
    });
  });
});
