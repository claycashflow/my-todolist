import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { UpdateTodoUseCase } from '../UpdateTodoUseCase.js';
import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoTitle } from '@domain/value-objects/TodoTitle.js';
import { DueDate } from '@domain/value-objects/DueDate.js';
import { TodoNotFoundError } from '@domain/exceptions/TodoNotFoundError.js';
import { UnauthorizedAccessError } from '@domain/exceptions/UnauthorizedAccessError.js';

describe('UpdateTodoUseCase', () => {
  let mockRepository: jest.Mocked<ITodoRepository>;
  let useCase: UpdateTodoUseCase;
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

    useCase = new UpdateTodoUseCase(mockRepository);

    const props: TodoProps = {
      id: 1,
      userId: 100,
      title: new TodoTitle('기존 제목'),
      description: '기존 설명',
      dueDate: new DueDate('2024-12-31'),
      done: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    existingTodo = new Todo(props);
  });

  test('제목을 업데이트할 수 있어야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);
    mockRepository.update.mockResolvedValue(existingTodo);

    const updates = { title: '새로운 제목' };
    const result = await useCase.execute(1, 100, updates);

    expect(mockRepository.update).toHaveBeenCalled();
    expect(result.title).toBe('새로운 제목');
  });

  test('완료 상태를 변경할 수 있어야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);
    mockRepository.update.mockResolvedValue(existingTodo);

    const updates = { done: true };
    await useCase.execute(1, 100, updates);

    expect(existingTodo.isDone()).toBe(true);
  });

  test('존재하지 않는 Todo 업데이트 시 예외를 던져야 함', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const updates = { title: '새 제목' };
    await expect(useCase.execute(999, 100, updates)).rejects.toThrow(
      TodoNotFoundError
    );
  });

  test('다른 사용자의 Todo 업데이트 시 예외를 던져야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);

    const updates = { title: '새 제목' };
    await expect(useCase.execute(1, 999, updates)).rejects.toThrow(
      UnauthorizedAccessError
    );
  });

  test('여러 필드를 동시에 업데이트할 수 있어야 함', async () => {
    mockRepository.findById.mockResolvedValue(existingTodo);
    mockRepository.update.mockResolvedValue(existingTodo);

    const updates = {
      title: '새 제목',
      description: '새 설명',
      dueDate: '2025-01-01',
      done: true,
    };

    const result = await useCase.execute(1, 100, updates);

    expect(result.title).toBe('새 제목');
    expect(result.description).toBe('새 설명');
    expect(result.dueDate).toBe('2025-01-01');
    expect(result.done).toBe(true);
  });
});
