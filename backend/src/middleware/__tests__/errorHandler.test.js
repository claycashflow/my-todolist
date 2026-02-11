import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { errorHandler } from '../errorHandler.js';

describe('errorHandler', () => {
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

  test('should handle custom error with status code', () => {
    const error = new Error('Custom error');
    error.statusCode = 404;
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Custom error'
    });
  });

  test('should handle database unique violation error', () => {
    const error = new Error('Duplicate entry');
    error.code = '23505'; // PostgreSQL unique violation
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: '이미 사용 중인 아이디입니다'
    });
  });

  test('should handle generic server error', () => {
    const error = new Error('Generic error');
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Generic error'
    });
  });

  test('should handle error without message', () => {
    const error = {}; // Error object without message property
    
    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: '서버 오류가 발생했습니다'
    });
  });
});