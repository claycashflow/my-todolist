import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthService from '../AuthService.js';

// Mock dependencies first
const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
};

jest.mock('bcryptjs', () => mockBcrypt);
jest.mock('jsonwebtoken', () => mockJwt);

// Mock the database module to prevent actual connection
jest.mock('../../config/database.js', () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn()
    },
    checkDatabaseHealth: jest.fn(),
    closeDatabaseConnection: jest.fn()
  };
});

// Mock the UserDAO
const mockUserDAO = {
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
};

jest.mock('../../dao/index.js', () => ({
  UserDAO: mockUserDAO
}));

// Import after mocking
const { UserDAO } = await import('../../dao/index.js');

describe('AuthService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: 'hashedpassword',
    created_at: '2026-02-11T10:30:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default environment variables
    process.env.JWT_SECRET = 'test_secret_key_minimum_32_characters';
    process.env.JWT_EXPIRES_IN = '24h';
    process.env.BCRYPT_ROUNDS = '10';
  });

  describe('register', () => {
    test('유효한 입력으로 사용자 등록을 성공해야 함', async () => {
      const userData = { username: 'newuser', password: 'password123' };
      
      mockUserDAO.create.mockResolvedValueOnce(mockUser);
      mockBcrypt.hash.mockResolvedValue('hashedpassword');
      mockJwt.sign.mockReturnValueOnce('jwt_token');

      const result = await AuthService.register(userData.username, userData.password);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserDAO.create).toHaveBeenCalledWith(userData.username, 'hashedpassword');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, username: mockUser.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          createdAt: mockUser.created_at
        }
      });
    });

    test('사용자명이 4자 미만일 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('abc', 'password123'))
        .rejects
        .toThrow('아이디는 4~20자로 입력해주세요');
    });

    test('사용자명이 20자 초과일 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('a'.repeat(21), 'password123'))
        .rejects
        .toThrow('아이디는 4~20자로 입력해주세요');
    });

    test('비밀번호가 8자 미만일 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('validuser', 'pass'))
        .rejects
        .toThrow('비밀번호는 8자 이상으로 입력해주세요');
    });

    test('사용자명에 영문/숫자 외 문자가 포함될 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('user@name', 'password123'))
        .rejects
        .toThrow('아이디는 영문과 숫자만 입력해주세요');
    });

    test('사용자명이 없을 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('', 'password123'))
        .rejects
        .toThrow('아이디는 4~20자로 입력해주세요');
    });

    test('비밀번호가 없을 경우 에러를 발생시켜야 함', async () => {
      await expect(AuthService.register('validuser', ''))
        .rejects
        .toThrow('비밀번호는 8자 이상으로 입력해주세요');
    });
  });

  describe('login', () => {
    test('유효한 자격 증명으로 로그인을 성공해야 함', async () => {
      const loginData = { username: 'testuser', password: 'password123' };
      
      mockUserDAO.findByUsername.mockResolvedValueOnce(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign.mockReturnValueOnce('jwt_token');

      const result = await AuthService.login(loginData.username, loginData.password);

      expect(mockUserDAO.findByUsername).toHaveBeenCalledWith(loginData.username);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, username: mockUser.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(result).toEqual({
        token: 'jwt_token',
        user: {
          id: mockUser.id,
          username: mockUser.username,
          createdAt: mockUser.created_at
        }
      });
    });

    test('존재하지 않는 사용자일 경우 에러를 발생시켜야 함', async () => {
      mockUserDAO.findByUsername.mockResolvedValueOnce(null);

      await expect(AuthService.login('nonexistent', 'password123'))
        .rejects
        .toThrow('아이디 또는 비밀번호가 일치하지 않습니다');
    });

    test('비밀번호가 일치하지 않을 경우 에러를 발생시켜야 함', async () => {
      mockUserDAO.findByUsername.mockResolvedValueOnce(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(AuthService.login('testuser', 'wrongpassword'))
        .rejects
        .toThrow('아이디 또는 비밀번호가 일치하지 않습니다');
    });
  });
});