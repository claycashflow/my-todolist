import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { GetTodoUseCase } from '../GetTodoUseCase.js';
import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoTitle } from '@domain/value-objects/TodoTitle.js';
import { DueDate } from '@domain/value-objects/DueDate.js';
import { TodoNotFoundError } from '@domain/exceptions/TodoNotFoundError.js';
import { UnauthorizedAccessError } from '@domain/exceptions/UnauthorizedAccessError.js';

describe('GetTodoUseCase', () => {
  let mockRepository: jest.Mocked<ITodoRepository>;
  let useCase: GetTodoUseCase;
  let existingTodo: Todo;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByIdAndUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ITodoRepository>;

    useCase = new GetTodoUseCase(mockRepository);

    const props: TodoProps = {
      id: 1,
      userId: 100,
      title: new TodoTitle('할 일 제목'),
      description: '할 일 설명',
      dueDate: new DueDate('2024-12-31'),
      done: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    existingTodo = new Todo(props);
  });

  test('소유자가 Todo를 조회할 수 있어야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);

    const result = await useCase.execute(1, 100);

    expect(result.id).toBe(1);
    expect(result.userId).toBe(100);
    expect(result.title).toBe('할 일 제목');
  });

  test('존재하지 않는 Todo 조회 시 예외를 던져야 함', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999, 100)).rejects.toThrow(TodoNotFoundError);
  });

  test('다른 사용자의 Todo 조회 시 예외를 던져야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);

    await expect(useCase.execute(1, 999)).rejects.toThrow(
      UnauthorizedAccessError
    );
  });

  test('isOverdue 필드가 포함되어야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);

    const result = await useCase.execute(1, 100);

    expect(result.isOverdue).toBeDefined();
    expect(typeof result.isOverdue).toBe('boolean');
  });
});
