import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import UserDAO from '../UserDAO.js';

// Mock the database module to prevent actual connection
const mockQuery = jest.fn();

jest.mock('../../config/database.js', () => {
  return {
    __esModule: true,
    default: {
      query: mockQuery,
      on: jest.fn(),
      end: jest.fn(),
    },
    checkDatabaseHealth: jest.fn(),
    closeDatabaseConnection: jest.fn()
  };
});

describe('UserDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    test('사용자명으로 사용자를 성공적으로 조회해야 함', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        password: 'hashedpassword',
        created_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await UserDAO.findByUsername('testuser');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, username, password, created_at FROM users WHERE username = $1',
        ['testuser']
      );
      expect(result).toEqual(mockUser);
    });

    test('존재하지 않는 사용자명일 경우 null을 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await UserDAO.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    test('ID로 사용자를 성공적으로 조회해야 함', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        password: 'hashedpassword',
        created_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await UserDAO.findById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, username, password, created_at FROM users WHERE id = $1',
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockUser);
    });

    test('존재하지 않는 ID일 경우 null을 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await UserDAO.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('새로운 사용자를 성공적으로 생성해야 함', async () => {
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'newuser',
        created_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const result = await UserDAO.create('newuser', 'hashedpassword');

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
        ['newuser', 'hashedpassword']
      );
      expect(result).toEqual(mockUser);
    });

    test('중복 사용자명일 경우 에러를 발생시켜야 함', async () => {
      const duplicateError = new Error('duplicate key value violates unique constraint');
      duplicateError.code = '23505';
      mockQuery.mockRejectedValueOnce(duplicateError);

      await expect(UserDAO.create('existinguser', 'hashedpassword'))
        .rejects
        .toThrow('아이디가 이미 존재합니다');
    });

    test('기타 데이터베이스 에러 발생 시 전달해야 함', async () => {
      const dbError = new Error('database error');
      mockQuery.mockRejectedValueOnce(dbError);

      await expect(UserDAO.create('newuser', 'hashedpassword'))
        .rejects
        .toThrow('database error');
    });
  });
});