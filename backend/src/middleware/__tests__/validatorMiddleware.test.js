import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { validatorMiddleware } from '../validatorMiddleware.js';

describe('validatorMiddleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should call next when all required fields are present', () => {
    const schema = { required: ['username', 'password'] };
    mockReq.body = { username: 'testuser', password: 'password123' };
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  test('should return 400 when required field is missing', () => {
    const schema = { required: ['username', 'password'] };
    mockReq.body = { username: 'testuser' }; // Missing password
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'password은(는) 필수 입력값입니다'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should return 400 when multiple required fields are missing', () => {
    const schema = { required: ['username', 'password', 'email'] };
    mockReq.body = { username: 'testuser' }; // Missing password and email
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'password은(는) 필수 입력값입니다'
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should call next when no required fields in schema', () => {
    const schema = { required: [] };
    mockReq.body = { someField: 'value' };
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  test('should call next when schema has no required property', () => {
    const schema = {};
    mockReq.body = { someField: 'value' };
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  test('should call next with error when an exception occurs', () => {
    const schema = { required: ['username'] };
    mockReq.body = { username: 'testuser' };
    
    // Mock a scenario that causes an exception
    const originalHasOwnProperty = Object.prototype.hasOwnProperty;
    Object.prototype.hasOwnProperty = () => { throw new Error('Test error'); };
    
    const middleware = validatorMiddleware(schema);
    middleware(mockReq, mockRes, mockNext);
    
    // Restore original method
    Object.prototype.hasOwnProperty = originalHasOwnProperty;

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});