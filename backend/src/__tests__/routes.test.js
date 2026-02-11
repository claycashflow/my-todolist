import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../index.js';

// Mock controllers and middleware to prevent actual database calls
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockGetTodos = jest.fn();
const mockGetTodo = jest.fn();
const mockCreateTodo = jest.fn();
const mockUpdateTodo = jest.fn();
const mockDeleteTodo = jest.fn();
const mockAuthMiddleware = jest.fn();

// Mock the controllers
jest.mock('../controllers/AuthController.js', () => ({
  register: mockRegister,
  login: mockLogin
}));

jest.mock('../controllers/TodoController.js', () => ({
  getTodos: mockGetTodos,
  getTodo: mockGetTodo,
  createTodo: mockCreateTodo,
  updateTodo: mockUpdateTodo,
  deleteTodo: mockDeleteTodo
}));

jest.mock('../middleware/authMiddleware.js', () => ({
  authMiddleware: mockAuthMiddleware
}));

describe('Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Routes', () => {
    test('POST /api/auth/register should call AuthController.register', async () => {
      mockRegister.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: { id: '1', username: 'testuser' } });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockRegister).toHaveBeenCalled();
    });

    test('POST /api/auth/login should call AuthController.login', async () => {
      mockLogin.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { token: 'jwt_token' } });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  describe('Todo Routes (Protected)', () => {
    beforeEach(() => {
      // Mock auth middleware to allow requests to pass through
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        req.user = { id: '123e4567-e89b-12d3-a456-426614174000' };
        next();
      });
    });

    test('GET /api/todos should call TodoController.getTodos with auth middleware', async () => {
      mockGetTodos.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: [] });
      });

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAuthMiddleware).toHaveBeenCalled();
      expect(mockGetTodos).toHaveBeenCalled();
    });

    test('GET /api/todos/:id should call TodoController.getTodo with auth middleware', async () => {
      mockGetTodo.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { id: '1', title: 'Test Todo' } });
      });

      const response = await request(app)
        .get('/api/todos/1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAuthMiddleware).toHaveBeenCalled();
      expect(mockGetTodo).toHaveBeenCalledWith(
        expect.objectContaining({ params: { id: '1' } }),
        expect.anything(),
        expect.anything()
      );
    });

    test('POST /api/todos should call TodoController.createTodo with auth middleware', async () => {
      mockCreateTodo.mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: { id: '1', title: 'New Todo' } });
      });

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'New Todo', description: 'Description', dueDate: '2026-02-15' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockAuthMiddleware).toHaveBeenCalled();
      expect(mockCreateTodo).toHaveBeenCalled();
    });

    test('PUT /api/todos/:id should call TodoController.updateTodo with auth middleware', async () => {
      mockUpdateTodo.mockImplementation((req, res) => {
        res.status(200).json({ success: true, data: { id: '1', title: 'Updated Todo' } });
      });

      const response = await request(app)
        .put('/api/todos/1')
        .set('Authorization', 'Bearer fake-token')
        .send({ title: 'Updated Todo' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockAuthMiddleware).toHaveBeenCalled();
      expect(mockUpdateTodo).toHaveBeenCalledWith(
        expect.objectContaining({ params: { id: '1' } }),
        expect.anything(),
        expect.anything()
      );
    });

    test('DELETE /api/todos/:id should call TodoController.deleteTodo with auth middleware', async () => {
      mockDeleteTodo.mockImplementation((req, res) => {
        res.status(204).send();
      });

      const response = await request(app)
        .delete('/api/todos/1')
        .set('Authorization', 'Bearer fake-token');

      expect(response.status).toBe(204);
      expect(mockAuthMiddleware).toHaveBeenCalled();
      expect(mockDeleteTodo).toHaveBeenCalledWith(
        expect.objectContaining({ params: { id: '1' } }),
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Health Check Route', () => {
    test('GET /health should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Root Route', () => {
    test('GET / should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('todos');
    });
  });

  describe('404 Handler', () => {
    test('Non-existent route should return 404', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('요청한 리소스를 찾을 수 없습니다');
    });
  });
});