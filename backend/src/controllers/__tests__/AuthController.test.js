import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import AuthController from '../AuthController.js';
import AuthService from '../../services/AuthService.js';

// Mock the AuthService
jest.mock('../../services/AuthService.js', () => ({
  register: jest.fn(),
  login: jest.fn()
}));

describe('AuthController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('should call AuthService.register and return 201 status', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const mockUser = { id: '1', username: 'testuser', createdAt: '2026-02-11' };
      
      mockReq.body = userData;
      AuthService.register.mockResolvedValue(mockUser);

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(AuthService.register).toHaveBeenCalledWith(userData.username, userData.password);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when AuthService.register throws error', async () => {
      const userData = { username: 'testuser', password: 'password123' };
      const error = new Error('Registration failed');
      
      mockReq.body = userData;
      AuthService.register.mockRejectedValue(error);

      await AuthController.register(mockReq, mockRes, mockNext);

      expect(AuthService.register).toHaveBeenCalledWith(userData.username, userData.password);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('should call AuthService.login and return 200 status', async () => {
      const loginData = { username: 'testuser', password: 'password123' };
      const mockResult = { token: 'jwt_token', user: { id: '1', username: 'testuser' } };
      
      mockReq.body = loginData;
      AuthService.login.mockResolvedValue(mockResult);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(AuthService.login).toHaveBeenCalledWith(loginData.username, loginData.password);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when AuthService.login throws error', async () => {
      const loginData = { username: 'testuser', password: 'password123' };
      const error = new Error('Login failed');
      
      mockReq.body = loginData;
      AuthService.login.mockRejectedValue(error);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(AuthService.login).toHaveBeenCalledWith(loginData.username, loginData.password);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});