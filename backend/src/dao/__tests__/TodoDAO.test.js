import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import TodoDAO from '../TodoDAO.js';

// Mock the database module to prevent actual connection
const mockQuery = jest.fn();

jest.mock('../../config/database.js', () => {
  return {
    __esModule: true,
    default: {
      query: mockQuery
    },
    checkDatabaseHealth: jest.fn(),
    closeDatabaseConnection: jest.fn()
  };
});

describe('TodoDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    test('사용자 ID로 할일 목록을 성공적으로 조회해야 함', async () => {
      const mockTodos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'Test Todo',
          description: 'Test Description',
          due_date: '2026-02-15',
          done: false,
          created_at: '2026-02-11T10:30:00Z',
          updated_at: '2026-02-11T10:30:00Z'
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTodos });

      const result = await TodoDAO.findByUserId('123e4567-e89b-12d3-a456-426614174000');

      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE user_id = $1 
       ORDER BY due_date ASC`,
        ['123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockTodos);
    });

    test('할일이 없는 경우 빈 배열을 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await TodoDAO.findByUserId('123e4567-e89b-12d3-a456-426614174000');

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    test('할일 ID로 할일을 성공적으로 조회해야 함', async () => {
      const mockTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Todo',
        description: 'Test Description',
        due_date: '2026-02-15',
        done: false,
        created_at: '2026-02-11T10:30:00Z',
        updated_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

      const result = await TodoDAO.findById('550e8400-e29b-41d4-a716-446655440000');

      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE id = $1`,
        ['550e8400-e29b-41d4-a716-446655440000']
      );
      expect(result).toEqual(mockTodo);
    });

    test('존재하지 않는 할일 ID일 경우 null을 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await TodoDAO.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByIdAndUserId', () => {
    test('할일 ID와 사용자 ID로 할일을 성공적으로 조회해야 함', async () => {
      const mockTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Todo',
        description: 'Test Description',
        due_date: '2026-02-15',
        done: false,
        created_at: '2026-02-11T10:30:00Z',
        updated_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

      const result = await TodoDAO.findByIdAndUserId(
        '550e8400-e29b-41d4-a716-446655440000',
        '123e4567-e89b-12d3-a456-426614174000'
      );

      expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, user_id, title, description, due_date, done, created_at, updated_at 
       FROM todos 
       WHERE id = $1 AND user_id = $2`,
        ['550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000']
      );
      expect(result).toEqual(mockTodo);
    });

    test('사용자에게 속하지 않는 할일일 경우 null을 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const result = await TodoDAO.findByIdAndUserId(
        '550e8400-e29b-41d4-a716-446655440000',
        'different-user-id'
      );

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('새로운 할일을 성공적으로 생성해야 함', async () => {
      const mockTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'New Todo',
        description: 'New Description',
        due_date: '2026-02-15',
        done: false,
        created_at: '2026-02-11T10:30:00Z',
        updated_at: '2026-02-11T10:30:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

      const result = await TodoDAO.create(
        '123e4567-e89b-12d3-a456-426614174000',
        'New Todo',
        'New Description',
        '2026-02-15'
      );

      expect(mockQuery).toHaveBeenCalledWith(
        `INSERT INTO todos (user_id, title, description, due_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
        ['123e4567-e89b-12d3-a456-426614174000', 'New Todo', 'New Description', '2026-02-15']
      );
      expect(result).toEqual(mockTodo);
    });
  });

  describe('update', () => {
    test('할일을 성공적으로 업데이트해야 함', async () => {
      const mockUpdatedTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Todo',
        description: 'Updated Description',
        due_date: '2026-02-20',
        done: true,
        created_at: '2026-02-11T10:30:00Z',
        updated_at: '2026-02-11T15:45:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedTodo] });

      const result = await TodoDAO.update('550e8400-e29b-41d4-a716-446655440000', {
        title: 'Updated Todo',
        description: 'Updated Description',
        due_date: '2026-02-20',
        done: true
      });

      expect(mockQuery).toHaveBeenCalledWith(
        `UPDATE todos SET title = $1, description = $2, due_date = $3, done = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
        ['Updated Todo', 'Updated Description', '2026-02-20', true, '550e8400-e29b-41d4-a716-446655440000']
      );
      expect(result).toEqual(mockUpdatedTodo);
    });

    test('업데이트할 필드가 없을 경우 null을 반환해야 함', async () => {
      const result = await TodoDAO.update('550e8400-e29b-41d4-a716-446655440000', {});

      expect(result).toBeNull();
    });

    test('부분 업데이트를 지원해야 함', async () => {
      const mockUpdatedTodo = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Title Only',
        description: 'Original Description',
        due_date: '2026-02-15',
        done: false,
        created_at: '2026-02-11T10:30:00Z',
        updated_at: '2026-02-11T15:45:00Z'
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedTodo] });

      const result = await TodoDAO.update('550e8400-e29b-41d4-a716-446655440000', {
        title: 'Updated Title Only'
      });

      expect(mockQuery).toHaveBeenCalledWith(
        `UPDATE todos SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
        ['Updated Title Only', '550e8400-e29b-41d4-a716-446655440000']
      );
      expect(result).toEqual(mockUpdatedTodo);
    });
  });

  describe('delete', () => {
    test('할일을 성공적으로 삭제해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const result = await TodoDAO.delete('550e8400-e29b-41d4-a716-446655440000');

      expect(mockQuery).toHaveBeenCalledWith(
        'DELETE FROM todos WHERE id = $1',
        ['550e8400-e29b-41d4-a716-446655440000']
      );
      expect(result).toBe(true);
    });

    test('존재하지 않는 할일 삭제 시 false를 반환해야 함', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });

      const result = await TodoDAO.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });
});