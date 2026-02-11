import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import TodoService from '../TodoService.js';

// Mock the database module to prevent actual connection
jest.mock('../../config/database.js', () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn(),
      on: jest.fn(),
      end: jest.fn(),
    },
    checkDatabaseHealth: jest.fn(),
    closeDatabaseConnection: jest.fn()
  };
});

// Mock the TodoDAO
const mockTodoDAO = {
  findByUserId: jest.fn(),
  findById: jest.fn(),
  findByIdAndUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../dao/index.js', () => ({
  TodoDAO: mockTodoDAO
}));

// Import after mocking
const { TodoDAO } = await import('../../dao/index.js');

describe('TodoService', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser'
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateIsOverdue', () => {
    test('완료된 할일은 마감일이 지나도 overdue가 아니어야 함', () => {
      const result = TodoService.calculateIsOverdue('2026-02-10', true);
      expect(result).toBe(false);
    });

    test('미완료된 할일이 마감일이 지났을 경우 overdue여야 함', () => {
      // Mock today to be after due date
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super('2026-02-12T10:00:00Z');
        }
      };

      const result = TodoService.calculateIsOverdue('2026-02-11', false);
      expect(result).toBe(true);

      global.Date = originalDate;
    });

    test('미완료된 할일이 마감일이 지나지 않았을 경우 overdue가 아니어야 함', () => {
      // Mock today to be before due date
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super('2026-02-10T10:00:00Z');
        }
      };

      const result = TodoService.calculateIsOverdue('2026-02-11', false);
      expect(result).toBe(false);

      global.Date = originalDate;
    });

    test('오늘이 마감일이고 미완료 상태일 경우 overdue가 아니어야 함', () => {
      // Mock today to be the same as due date
      const originalDate = Date;
      global.Date = class extends Date {
        constructor() {
          super('2026-02-11T10:00:00Z');
        }
      };

      const result = TodoService.calculateIsOverdue('2026-02-11', false);
      expect(result).toBe(false);

      global.Date = originalDate;
    });
  });

  describe('getUserTodos', () => {
    test('사용자의 모든 할일을 성공적으로 조회해야 함', async () => {
      mockTodoDAO.findByUserId.mockResolvedValueOnce([mockTodo]);

      const result = await TodoService.getUserTodos(mockUser.id);

      expect(mockTodoDAO.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...mockTodo,
        isOverdue: false // Assuming today is before due date
      });
    });

    test('할일이 없을 경우 빈 배열을 반환해야 함', async () => {
      mockTodoDAO.findByUserId.mockResolvedValueOnce([]);

      const result = await TodoService.getUserTodos(mockUser.id);

      expect(result).toEqual([]);
    });
  });

  describe('getTodo', () => {
    test('사용자의 할일을 성공적으로 조회해야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);

      const result = await TodoService.getTodo(mockTodo.id, mockUser.id);

      expect(mockTodoDAO.findByIdAndUserId).toHaveBeenCalledWith(mockTodo.id, mockUser.id);
      expect(result).toEqual({
        ...mockTodo,
        isOverdue: false // Assuming today is before due date
      });
    });

    test('사용자가 소유하지 않은 할일일 경우 에러를 발생시켜야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(TodoService.getTodo(mockTodo.id, mockUser.id))
        .rejects
        .toThrow('할일을 찾을 수 없습니다');
    });
  });

  describe('createTodo', () => {
    test('유효한 입력으로 할일을 성공적으로 생성해야 함', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Description',
        dueDate: '2026-02-20'
      };

      mockTodoDAO.create.mockResolvedValueOnce(mockTodo);

      const result = await TodoService.createTodo(mockUser.id, newTodoData.title, newTodoData.description, newTodoData.dueDate);

      expect(mockTodoDAO.create).toHaveBeenCalledWith(mockUser.id, newTodoData.title, newTodoData.description, newTodoData.dueDate);
      expect(result).toEqual({
        ...mockTodo,
        isOverdue: false // Assuming today is before due date
      });
    });

    test('제목이 없을 경우 에러를 발생시켜야 함', async () => {
      await expect(TodoService.createTodo(mockUser.id, '', 'Description', '2026-02-20'))
        .rejects
        .toThrow('제목은 1~100자로 입력해주세요');
    });

    test('제목이 100자 초과일 경우 에러를 발생시켜야 함', async () => {
      await expect(TodoService.createTodo(mockUser.id, 'a'.repeat(101), 'Description', '2026-02-20'))
        .rejects
        .toThrow('제목은 1~100자로 입력해주세요');
    });

    test('마감일이 없을 경우 에러를 발생시켜야 함', async () => {
      await expect(TodoService.createTodo(mockUser.id, 'Valid Title', 'Description', ''))
        .rejects
        .toThrow('유효한 마감일을 입력해주세요');
    });

    test('날짜 형식이 잘못되었을 경우 에러를 발생시켜야 함', async () => {
      await expect(TodoService.createTodo(mockUser.id, 'Valid Title', 'Description', 'invalid-date'))
        .rejects
        .toThrow('유효한 마감일을 입력해주세요');
    });
  });

  describe('updateTodo', () => {
    test('사용자의 할일을 성공적으로 업데이트해야 함', async () => {
      const updates = {
        title: 'Updated Title',
        done: true
      };

      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);
      mockTodoDAO.update.mockResolvedValueOnce({ ...mockTodo, title: 'Updated Title', done: true });

      const result = await TodoService.updateTodo(mockTodo.id, mockUser.id, updates);

      expect(mockTodoDAO.findByIdAndUserId).toHaveBeenCalledWith(mockTodo.id, mockUser.id);
      expect(mockTodoDAO.update).toHaveBeenCalledWith(mockTodo.id, updates);
      expect(result).toEqual({
        ...mockTodo,
        title: 'Updated Title',
        done: true,
        isOverdue: false // Assuming today is before due date
      });
    });

    test('사용자가 소유하지 않은 할일을 업데이트하려 할 경우 에러를 발생시켜야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(TodoService.updateTodo(mockTodo.id, mockUser.id, { title: 'Updated Title' }))
        .rejects
        .toThrow('권한이 없습니다');
    });

    test('제목이 100자 초과일 경우 에러를 발생시켜야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);

      await expect(TodoService.updateTodo(mockTodo.id, mockUser.id, { title: 'a'.repeat(101) }))
        .rejects
        .toThrow('제목은 1~100자로 입력해주세요');
    });

    test('날짜 형식이 잘못되었을 경우 에러를 발생시켜야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);

      await expect(TodoService.updateTodo(mockTodo.id, mockUser.id, { due_date: 'invalid-date' }))
        .rejects
        .toThrow('유효한 마감일을 입력해주세요');
    });

    test('업데이트할 필드가 없을 경우 null을 반환해야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);
      mockTodoDAO.update.mockResolvedValueOnce(null);

      const result = await TodoService.updateTodo(mockTodo.id, mockUser.id, {});

      expect(result).toBeNull();
    });
  });

  describe('deleteTodo', () => {
    test('사용자의 할일을 성공적으로 삭제해야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(mockTodo);
      mockTodoDAO.delete.mockResolvedValueOnce(true);

      const result = await TodoService.deleteTodo(mockTodo.id, mockUser.id);

      expect(mockTodoDAO.findByIdAndUserId).toHaveBeenCalledWith(mockTodo.id, mockUser.id);
      expect(mockTodoDAO.delete).toHaveBeenCalledWith(mockTodo.id);
      expect(result).toBe(true);
    });

    test('사용자가 소유하지 않은 할일을 삭제하려 할 경우 에러를 발생시켜야 함', async () => {
      mockTodoDAO.findByIdAndUserId.mockResolvedValueOnce(null);

      await expect(TodoService.deleteTodo(mockTodo.id, mockUser.id))
        .rejects
        .toThrow('권한이 없습니다');
    });
  });
});