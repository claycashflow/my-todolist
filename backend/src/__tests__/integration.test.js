import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database
const mockQuery = jest.fn();
jest.mock('../config/database.js', () => {
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

// Import the app after mocking dependencies
let app;
beforeAll(async () => {
  // Set environment variables
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only';
  
  // Mock console to suppress logs during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Import the app module
  const appModule = await import('../index.js');
  app = appModule.default;
});

afterAll(() => {
  // Restore console methods
  jest.restoreAllMocks();
});

describe('API Integration Tests - BE-9 & BE-10', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mockQuery to return empty results by default
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    
    // Default bcrypt and jwt mocks
    bcryptjs.hash.mockResolvedValue('$2b$10$testhashedpassword');
    bcryptjs.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('test-jwt-token');
    jwt.verify.mockReturnValue({ id: 'test-user-id', username: 'testuser' });
  });

  describe('Authentication API Tests', () => {
    test('POST /api/auth/register - successful registration', async () => {
      // Mock user not found (first check)
      mockQuery.mockResolvedValueOnce({ rows: [] });
      
      // Mock successful user creation
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'test-user-id',
          username: 'testuser',
          created_at: '2026-02-11T10:00:00Z'
        }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe('testuser');
    });

    test('POST /api/auth/register - duplicate username', async () => {
      // Mock user already exists
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'existing-user-id',
          username: 'testuser',
          password: 'hashedpassword'
        }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('이미 사용 중인 아이디입니다');
    });

    test('POST /api/auth/register - invalid input validation', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab', // Too short
          password: '123'  // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('POST /api/auth/login - successful login', async () => {
      // Mock user found
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'test-user-id',
          username: 'testuser',
          password: 'hashedpassword'
        }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
    });

    test('POST /api/auth/login - invalid credentials', async () => {
      // Mock user not found
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('아이디 또는 비밀번호가 일치하지 않습니다');
    });
  });

  describe('Todo API Tests (Requires Authentication)', () => {
    const validToken = 'Bearer test-jwt-token';
    
    beforeEach(() => {
      jwt.verify.mockReturnValue({ id: 'test-user-id', username: 'testuser' });
    });

    test('GET /api/todos - successful retrieval of user todos', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 'todo-1',
            user_id: 'test-user-id',
            title: 'Test Todo',
            description: 'Test Description',
            due_date: '2026-12-31',
            done: false,
            created_at: '2026-02-11T10:00:00Z',
            updated_at: '2026-02-11T10:00:00Z'
          }
        ]
      });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', validToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('isOverdue'); // Should include isOverdue
    });

    test('GET /api/todos/:id - successful retrieval of specific todo', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'todo-1',
          user_id: 'test-user-id',
          title: 'Test Todo',
          description: 'Test Description',
          due_date: '2026-12-31',
          done: false,
          created_at: '2026-02-11T10:00:00Z',
          updated_at: '2026-02-11T10:00:00Z'
        }]
      });

      const response = await request(app)
        .get('/api/todos/todo-1')
        .set('Authorization', validToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'todo-1');
      expect(response.body.data).toHaveProperty('isOverdue');
    });

    test('GET /api/todos/:id - unauthorized access to other user\'s todo', async () => {
      // Mock that the todo exists but belongs to another user
      mockQuery.mockResolvedValueOnce({ rows: [] }); // No todo found for this user

      const response = await request(app)
        .get('/api/todos/todo-1')
        .set('Authorization', validToken);

      expect(response.status).toBe(403); // Should return 403 for unauthorized access
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('권한이 없습니다');
    });

    test('POST /api/todos - successful todo creation', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'new-todo-id',
          user_id: 'test-user-id',
          title: 'New Todo',
          description: 'New Description',
          due_date: '2026-12-31',
          done: false,
          created_at: '2026-02-11T10:00:00Z',
          updated_at: '2026-02-11T10:00:00Z'
        }]
      });

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', validToken)
        .send({
          title: 'New Todo',
          description: 'New Description',
          dueDate: '2026-12-31'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', 'New Todo');
      expect(response.body.data).toHaveProperty('isOverdue');
    });

    test('POST /api/todos - validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', validToken)
        .send({
          description: 'Missing title and dueDate'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('PUT /api/todos/:id - successful todo update', async () => {
      // First mock to check if todo exists and belongs to user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'todo-1',
          user_id: 'test-user-id',
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
          user_id: 'test-user-id',
          title: 'Updated Title',
          description: 'Updated Description',
          due_date: '2026-12-31',
          done: true,
          created_at: '2026-02-11T10:00:00Z',
          updated_at: '2026-02-11T11:00:00Z'
        }]
      });

      const response = await request(app)
        .put('/api/todos/todo-1')
        .set('Authorization', validToken)
        .send({
          title: 'Updated Title',
          done: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Updated Title');
      expect(response.body.data).toHaveProperty('done', true);
      expect(response.body.data).toHaveProperty('isOverdue');
    });

    test('DELETE /api/todos/:id - successful todo deletion', async () => {
      // Mock to check if todo exists and belongs to user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'todo-1',
          user_id: 'test-user-id',
          title: 'Todo to Delete',
          description: 'Description',
          due_date: '2026-12-31',
          done: false,
          created_at: '2026-02-11T10:00:00Z',
          updated_at: '2026-02-11T10:00:00Z'
        }]
      });

      // Mock for the delete query
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/todos/todo-1')
        .set('Authorization', validToken);

      expect(response.status).toBe(204);
    });

    test('DELETE /api/todos/:id - unauthorized deletion attempt', async () => {
      // Mock that the todo doesn't belong to the user
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .delete('/api/todos/todo-1')
        .set('Authorization', validToken);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('권한이 없습니다');
    });

    test('GET /api/todos - unauthorized access without token', async () => {
      const response = await request(app)
        .get('/api/todos');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('로그인이 필요합니다');
    });

    test('GET /api/todos - unauthorized access with invalid token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('유효하지 않은 토큰입니다');
    });
  });

  describe('API Error Handling Tests', () => {
    test('GET /non-existent-endpoint - should return 404', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('요청한 리소스를 찾을 수 없습니다');
    });

    test('POST /api/auth/register - should handle database errors', async () => {
      // Mock a database error
      mockQuery.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance and Response Format Tests', () => {
    test('Response should be in JSON format', async () => {
      const response = await request(app).get('/');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('API endpoints should respond within acceptable time', async () => {
      const startTime = Date.now();
      await request(app).get('/');
      const endTime = Date.now();
      
      // Response should be under 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});