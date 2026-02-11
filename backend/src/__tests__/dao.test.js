import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock database
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
    closeDatabaseConnection: jest.fn(),
  };
});

// Import DAOs after mocking dependencies
let UserDAO, TodoDAO;
beforeAll(async () => {
  const modules = await import('../../dao/index.js');
  UserDAO = modules.UserDAO;
  TodoDAO = modules.TodoDAO;
});

describe('UserDAO Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockQuery to return empty results by default
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('should find user by username', async () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      password: 'hashedpassword',
      created_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await UserDAO.findByUsername('testuser');

    expect(result).toEqual(mockUser);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, username, password, created_at FROM users WHERE username = $1'),
      ['testuser']
    );
  });

  test('should return null when user not found by username', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await UserDAO.findByUsername('nonexistent');

    expect(result).toBeNull();
  });

  test('should find user by id', async () => {
    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      password: 'hashedpassword',
      created_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await UserDAO.findById('user-1');

    expect(result).toEqual(mockUser);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, username, password, created_at FROM users WHERE id = $1'),
      ['user-1']
    );
  });

  test('should return null when user not found by id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await UserDAO.findById('nonexistent');

    expect(result).toBeNull();
  });

  test('should create user successfully', async () => {
    const mockUser = {
      id: 'new-user-id',
      username: 'newuser',
      created_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

    const result = await UserDAO.create('newuser', 'hashedpassword');

    expect(result).toEqual(mockUser);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at'),
      ['newuser', 'hashedpassword']
    );
  });

  test('should throw error for duplicate username', async () => {
    const error = new Error('duplicate key value violates unique constraint');
    error.code = '23505'; // PostgreSQL unique violation code
    mockQuery.mockRejectedValue(error);

    await expect(UserDAO.create('existinguser', 'hashedpassword'))
      .rejects
      .toThrow('아이디가 이미 존재합니다');
  });

  test('should rethrow non-duplicate errors', async () => {
    const error = new Error('some other database error');
    mockQuery.mockRejectedValue(error);

    await expect(UserDAO.create('user', 'password'))
      .rejects
      .toThrow('some other database error');
  });
});

describe('TodoDAO Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockQuery to return empty results by default
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('should find todos by user id', async () => {
    const mockTodos = [
      {
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Todo 1',
        description: 'Description 1',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }
    ];
    
    mockQuery.mockResolvedValueOnce({ rows: mockTodos });

    const result = await TodoDAO.findByUserId('user-1');

    expect(result).toEqual(mockTodos);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, user_id, title, description, due_date, done, created_at, updated_at FROM todos WHERE user_id = $1 ORDER BY due_date ASC'),
      ['user-1']
    );
  });

  test('should return empty array when no todos found for user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await TodoDAO.findByUserId('user-1');

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test('should find todo by id', async () => {
    const mockTodo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: 'Todo 1',
      description: 'Description 1',
      due_date: '2026-12-31',
      done: false,
      created_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

    const result = await TodoDAO.findById('todo-1');

    expect(result).toEqual(mockTodo);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, user_id, title, description, due_date, done, created_at, updated_at FROM todos WHERE id = $1'),
      ['todo-1']
    );
  });

  test('should return null when todo not found by id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await TodoDAO.findById('nonexistent');

    expect(result).toBeNull();
  });

  test('should find todo by id and user id', async () => {
    const mockTodo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: 'Todo 1',
      description: 'Description 1',
      due_date: '2026-12-31',
      done: false,
      created_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

    const result = await TodoDAO.findByIdAndUserId('todo-1', 'user-1');

    expect(result).toEqual(mockTodo);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, user_id, title, description, due_date, done, created_at, updated_at FROM todos WHERE id = $1 AND user_id = $2'),
      ['todo-1', 'user-1']
    );
  });

  test('should return null when todo not found by id and user id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const result = await TodoDAO.findByIdAndUserId('todo-1', 'different-user');

    expect(result).toBeNull();
  });

  test('should create todo successfully', async () => {
    const mockTodo = {
      id: 'new-todo-id',
      user_id: 'user-1',
      title: 'New Todo',
      description: 'New Description',
      due_date: '2026-12-31',
      done: false,
      created_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-11T10:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockTodo] });

    const result = await TodoDAO.create('user-1', 'New Todo', 'New Description', '2026-12-31');

    expect(result).toEqual(mockTodo);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO todos (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING id, user_id, title, description, due_date, done, created_at, updated_at'),
      ['user-1', 'New Todo', 'New Description', '2026-12-31']
    );
  });

  test('should update todo with partial fields', async () => {
    const mockUpdatedTodo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: 'Updated Title',
      description: 'Updated Description',
      due_date: '2026-12-31',
      done: true,
      created_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-11T11:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedTodo] });

    const result = await TodoDAO.update('todo-1', {
      title: 'Updated Title',
      done: true
    });

    expect(result).toEqual(mockUpdatedTodo);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE todos SET title = $1, done = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, user_id, title, description, due_date, done, created_at, updated_at'),
      ['Updated Title', true, 'todo-1']
    );
  });

  test('should update todo with all fields', async () => {
    const mockUpdatedTodo = {
      id: 'todo-1',
      user_id: 'user-1',
      title: 'Updated Title',
      description: 'Updated Description',
      due_date: '2026-12-31',
      done: true,
      created_at: '2026-02-11T10:00:00Z',
      updated_at: '2026-02-11T11:00:00Z'
    };
    
    mockQuery.mockResolvedValueOnce({ rows: [mockUpdatedTodo] });

    const result = await TodoDAO.update('todo-1', {
      title: 'Updated Title',
      description: 'Updated Description',
      due_date: '2026-12-31',
      done: true
    });

    expect(result).toEqual(mockUpdatedTodo);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE todos SET title = $1, description = $2, due_date = $3, done = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, user_id, title, description, due_date, done, created_at, updated_at'),
      ['Updated Title', 'Updated Description', '2026-12-31', true, 'todo-1']
    );
  });

  test('should return null when no fields to update', async () => {
    const result = await TodoDAO.update('todo-1', {});

    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('should delete todo successfully', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await TodoDAO.delete('todo-1');

    expect(result).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(
      'DELETE FROM todos WHERE id = $1',
      ['todo-1']
    );
  });

  test('should return false when todo not found for deletion', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await TodoDAO.delete('nonexistent');

    expect(result).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(
      'DELETE FROM todos WHERE id = $1',
      ['nonexistent']
    );
  });
});