import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import TodoController from '../TodoController.js';
import TodoService from '../../services/TodoService.js';

// Mock the TodoService
jest.mock('../../services/TodoService.js', () => ({
  getUserTodos: jest.fn(),
  getTodo: jest.fn(),
  createTodo: jest.fn(),
  updateTodo: jest.fn(),
  deleteTodo: jest.fn()
}));

describe('TodoController', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = { user: { id: '123e4567-e89b-12d3-a456-426614174000' } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getTodos', () => {
    test('should call TodoService.getUserTodos and return 200 status', async () => {
      const mockTodos = [
        { id: '1', title: 'Test Todo', isOverdue: false }
      ];
      
      TodoService.getUserTodos.mockResolvedValue(mockTodos);

      await TodoController.getTodos(mockReq, mockRes, mockNext);

      expect(TodoService.getUserTodos).toHaveBeenCalledWith(mockReq.user.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodos
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when TodoService.getUserTodos throws error', async () => {
      const error = new Error('Failed to get todos');
      
      TodoService.getUserTodos.mockRejectedValue(error);

      await TodoController.getTodos(mockReq, mockRes, mockNext);

      expect(TodoService.getUserTodos).toHaveBeenCalledWith(mockReq.user.id);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getTodo', () => {
    test('should call TodoService.getTodo and return 200 status', async () => {
      const todoId = '1';
      const mockTodo = { id: '1', title: 'Test Todo', isOverdue: false };
      
      mockReq.params = { id: todoId };
      TodoService.getTodo.mockResolvedValue(mockTodo);

      await TodoController.getTodo(mockReq, mockRes, mockNext);

      expect(TodoService.getTodo).toHaveBeenCalledWith(todoId, mockReq.user.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when TodoService.getTodo throws error', async () => {
      const todoId = '1';
      const error = new Error('Todo not found');
      
      mockReq.params = { id: todoId };
      TodoService.getTodo.mockRejectedValue(error);

      await TodoController.getTodo(mockReq, mockRes, mockNext);

      expect(TodoService.getTodo).toHaveBeenCalledWith(todoId, mockReq.user.id);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    test('should call TodoService.createTodo and return 201 status', async () => {
      const todoData = { title: 'New Todo', description: 'Description', dueDate: '2026-02-15' };
      const mockTodo = { id: '1', title: 'New Todo', isOverdue: false };
      
      mockReq.body = todoData;
      TodoService.createTodo.mockResolvedValue(mockTodo);

      await TodoController.createTodo(mockReq, mockRes, mockNext);

      expect(TodoService.createTodo).toHaveBeenCalledWith(mockReq.user.id, todoData.title, todoData.description, todoData.dueDate);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when TodoService.createTodo throws error', async () => {
      const todoData = { title: 'New Todo', description: 'Description', dueDate: '2026-02-15' };
      const error = new Error('Failed to create todo');
      
      mockReq.body = todoData;
      TodoService.createTodo.mockRejectedValue(error);

      await TodoController.createTodo(mockReq, mockRes, mockNext);

      expect(TodoService.createTodo).toHaveBeenCalledWith(mockReq.user.id, todoData.title, todoData.description, todoData.dueDate);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('updateTodo', () => {
    test('should call TodoService.updateTodo and return 200 status', async () => {
      const todoId = '1';
      const updateData = { title: 'Updated Todo' };
      const mockTodo = { id: '1', title: 'Updated Todo', isOverdue: false };
      
      mockReq.params = { id: todoId };
      mockReq.body = updateData;
      TodoService.updateTodo.mockResolvedValue(mockTodo);

      await TodoController.updateTodo(mockReq, mockRes, mockNext);

      expect(TodoService.updateTodo).toHaveBeenCalledWith(todoId, mockReq.user.id, updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockTodo
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when TodoService.updateTodo throws error', async () => {
      const todoId = '1';
      const updateData = { title: 'Updated Todo' };
      const error = new Error('Failed to update todo');
      
      mockReq.params = { id: todoId };
      mockReq.body = updateData;
      TodoService.updateTodo.mockRejectedValue(error);

      await TodoController.updateTodo(mockReq, mockRes, mockNext);

      expect(TodoService.updateTodo).toHaveBeenCalledWith(todoId, mockReq.user.id, updateData);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    test('should call TodoService.deleteTodo and return 204 status', async () => {
      const todoId = '1';
      
      mockReq.params = { id: todoId };
      TodoService.deleteTodo.mockResolvedValue(true);

      await TodoController.deleteTodo(mockReq, mockRes, mockNext);

      expect(TodoService.deleteTodo).toHaveBeenCalledWith(todoId, mockReq.user.id);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should call next with error when TodoService.deleteTodo throws error', async () => {
      const todoId = '1';
      const error = new Error('Failed to delete todo');
      
      mockReq.params = { id: todoId };
      TodoService.deleteTodo.mockRejectedValue(error);

      await TodoController.deleteTodo(mockReq, mockRes, mockNext);

      expect(TodoService.deleteTodo).toHaveBeenCalledWith(todoId, mockReq.user.id);
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.send).not.toHaveBeenCalled();
    });
  });
});