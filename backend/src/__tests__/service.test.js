import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Mock bcrypt and jwt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

// Import services after mocking dependencies
let AuthService, TodoService;
beforeAll(async () => {
  const modules = await import('../../services/index.js');
  AuthService = modules.AuthService;
  TodoService = modules.TodoService;
});

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockQuery to return empty results by default
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    
    // Default bcrypt and jwt mocks
    bcryptjs.hash.mockResolvedValue('$2b$10$testhashedpassword');
    bcryptjs.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('test-jwt-token');
  });

  test('should register a new user successfully', async () => {
    // Mock user not found (first check)
    mockQuery.mockResolvedValueOnce({ rows: [] });
    
    // Mock successful user creation
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'new-user-id',
        username: 'testuser',
        created_at: '2026-02-11T10:00:00Z'
      }]
    });

    const result = await AuthService.register('testuser', 'password123');

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user.username).toBe('testuser');
    expect(bcryptjs.hash).toHaveBeenCalledWith('password123', 4);
    expect(jwt.sign).toHaveBeenCalled();
  });

  test('should throw error for duplicate username', async () => {
    // Mock user already exists
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'existing-user-id',
        username: 'testuser',
        password: 'hashedpassword'
      }]
    });

    await expect(AuthService.register('testuser', 'password123'))
      .rejects
      .toThrow('아이디는 4~20자로 입력해주세요');
  });

  test('should throw error for invalid username length', async () => {
    await expect(AuthService.register('ab', 'password123'))
      .rejects
      .toThrow('아이디는 4~20자로 입력해주세요');
  });

  test('should throw error for invalid password length', async () => {
    await expect(AuthService.register('testuser', '123'))
      .rejects
      .toThrow('비밀번호는 8자 이상으로 입력해주세요');
  });

  test('should login successfully with valid credentials', async () => {
    // Mock user found
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'test-user-id',
        username: 'testuser',
        password: 'hashedpassword'
      }]
    });

    const result = await AuthService.login('testuser', 'password123');

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.user.username).toBe('testuser');
    expect(bcryptjs.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
  });

  test('should throw error for invalid login credentials', async () => {
    // Mock user not found
    mockQuery.mockResolvedValueOnce({ rows: [] });

    await expect(AuthService.login('nonexistent', 'wrongpassword'))
      .rejects
      .toThrow('아이디 또는 비밀번호가 일치하지 않습니다');
  });
});

describe('TodoService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockQuery to return empty results by default
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  test('should calculate isOverdue correctly for past due date and not done', async () => {
    const result = TodoService.calculateIsOverdue('2020-01-01', false);
    expect(result).toBe(true);
  });

  test('should calculate isOverdue as false for past due date but done', async () => {
    const result = TodoService.calculateIsOverdue('2020-01-01', true);
    expect(result).toBe(false);
  });

  test('should calculate isOverdue as false for future due date', async () => {
    // Mock a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const result = TodoService.calculateIsOverdue(futureDateString, false);
    expect(result).toBe(false);
  });

  test('should get user todos successfully', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'todo-1',
          user_id: 'user-1',
          title: 'Test Todo',
          description: 'Test Description',
          due_date: '2026-12-31',
          done: false,
          created_at: '2026-02-11T10:00:00Z',
          updated_at: '2026-02-11T10:00:00Z'
        }
      ]
    });

    const result = await TodoService.getUserTodos('user-1');

    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('id', 'todo-1');
    expect(result[0]).toHaveProperty('isOverdue'); // Should include isOverdue
  });

  test('should get specific todo successfully', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Test Todo',
        description: 'Test Description',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }]
    });

    const result = await TodoService.getTodo('todo-1', 'user-1');

    expect(result).toHaveProperty('id', 'todo-1');
    expect(result).toHaveProperty('isOverdue');
  });

  test('should throw error when getting non-existent todo', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // Todo not found for user

    await expect(TodoService.getTodo('nonexistent', 'user-1'))
      .rejects
      .toThrow('할일을 찾을 수 없습니다');
  });

  test('should create todo successfully', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'new-todo-id',
        user_id: 'user-1',
        title: 'New Todo',
        description: 'New Description',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }]
    });

    const result = await TodoService.createTodo('user-1', 'New Todo', 'New Description', '2026-12-31');

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title', 'New Todo');
    expect(result).toHaveProperty('isOverdue');
  });

  test('should throw error for invalid title during creation', async () => {
    await expect(TodoService.createTodo('user-1', '', 'Description', '2026-12-31'))
      .rejects
      .toThrow('제목은 1~100자로 입력해주세요');
  });

  test('should throw error for invalid date during creation', async () => {
    await expect(TodoService.createTodo('user-1', 'Valid Title', 'Description', 'invalid-date'))
      .rejects
      .toThrow('유효한 마감일을 입력해주세요');
  });

  test('should update todo successfully', async () => {
    // First mock for checking if todo exists and belongs to user
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Old Title',
        description: 'Old Description',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }]
    });

    // Second mock for the update query
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Updated Title',
        description: 'Updated Description',
        due_date: '2026-12-31',
        done: true,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T11:00:00Z'
      }]
    });

    const result = await TodoService.updateTodo('todo-1', 'user-1', {
      title: 'Updated Title',
      done: true
    });

    expect(result).toHaveProperty('title', 'Updated Title');
    expect(result).toHaveProperty('done', true);
    expect(result).toHaveProperty('isOverdue');
  });

  test('should throw error when updating non-existent todo', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // Todo not found for user

    await expect(TodoService.updateTodo('nonexistent', 'user-1', { title: 'Updated' }))
      .rejects
      .toThrow('권한이 없습니다');
  });

  test('should throw error for invalid title during update', async () => {
    // First mock for checking if todo exists and belongs to user
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Old Title',
        description: 'Old Description',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }]
    });

    await expect(TodoService.updateTodo('todo-1', 'user-1', { title: '' }))
      .rejects
      .toThrow('제목은 1~100자로 입력해주세요');
  });

  test('should delete todo successfully', async () => {
    // First mock for checking if todo exists and belongs to user
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'todo-1',
        user_id: 'user-1',
        title: 'Todo to Delete',
        description: 'Description',
        due_date: '2026-12-31',
        done: false,
        created_at: '2026-02-11T10:00:00Z',
        updated_at: '2026-02-11T10:00:00Z'
      }]
    });

    // Second mock for the delete query
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await TodoService.deleteTodo('todo-1', 'user-1');

    expect(result).toBe(true);
  });

  test('should throw error when deleting non-existent todo', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }); // Todo not found for user

    await expect(TodoService.deleteTodo('nonexistent', 'user-1'))
      .rejects
      .toThrow('권한이 없습니다');
  });
});