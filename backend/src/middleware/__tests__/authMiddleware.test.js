import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../authMiddleware.js';

describe('authMiddleware', () => {
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

  test('should call next with error when no authorization header is present', async () => {
    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: '로그인이 필요합니다'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should call next with error when authorization header does not start with Bearer', async () => {
    mockReq.headers = { authorization: 'Basic token' };

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: '로그인이 필요합니다'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should decode token and attach user to req when token is valid', async () => {
    const mockDecoded = { id: '123', username: 'testuser' };
    const token = 'valid_token';
    
    mockReq.headers = { authorization: `Bearer ${token}` };
    jwt.verify = jest.fn().mockReturnValue(mockDecoded);

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(mockReq.user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  test('should return 401 when token is invalid', async () => {
    const token = 'invalid_token';
    
    mockReq.headers = { authorization: `Bearer ${token}` };
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: '유효하지 않은 토큰입니다'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});