import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CreateTodoUseCase } from '../CreateTodoUseCase.js';
import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoTitle } from '@domain/value-objects/TodoTitle.js';
import { DueDate } from '@domain/value-objects/DueDate.js';
import { InvalidTitleError } from '@domain/exceptions/InvalidTitleError.js';
import { InvalidDueDateError } from '@domain/exceptions/InvalidDueDateError.js';

describe('CreateTodoUseCase', () => {
  let mockRepository: jest.Mocked<ITodoRepository>;
  let useCase: CreateTodoUseCase;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByIdAndUserId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ITodoRepository>;

    useCase = new CreateTodoUseCase(mockRepository);
  });

  test('유효한 입력으로 Todo를 생성해야 함', async () => {
    const dto = {
      userId: 1,
      title: '할 일 제목',
      description: '할 일 설명',
      dueDate: '2024-12-31',
    };

    const savedTodoProps: TodoProps = {
      id: 1,
      userId: 1,
      title: new TodoTitle('할 일 제목'),
      description: '할 일 설명',
      dueDate: new DueDate('2024-12-31'),
      done: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const savedTodo = new Todo(savedTodoProps);

    mockRepository.save.mockResolvedValue(savedTodo);

    const result = await useCase.execute(dto);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        done: false,
      })
    );
    expect(result.id).toBe(1);
    expect(result.title).toBe('할 일 제목');
    expect(result.userId).toBe(1);
    expect(result.done).toBe(false);
  });

  test('잘못된 제목으로 생성 시 예외를 던져야 함', async () => {
    const dto = {
      userId: 1,
      title: '', // 빈 제목
      description: '설명',
      dueDate: '2024-12-31',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidTitleError);
  });

  test('잘못된 날짜로 생성 시 예외를 던져야 함', async () => {
    const dto = {
      userId: 1,
      title: '제목',
      description: '설명',
      dueDate: 'invalid-date',
    };

    await expect(useCase.execute(dto)).rejects.toThrow(InvalidDueDateError);
  });

  test('description이 null일 수 있어야 함', async () => {
    const dto = {
      userId: 1,
      title: '제목',
      description: null,
      dueDate: '2024-12-31',
    };

    const savedTodoProps: TodoProps = {
      id: 1,
      userId: 1,
      title: new TodoTitle('제목'),
      description: null,
      dueDate: new DueDate('2024-12-31'),
      done: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
    const savedTodo = new Todo(savedTodoProps);

    mockRepository.save.mockResolvedValue(savedTodo);

    const result = await useCase.execute(dto);

    expect(result.description).toBeNull();
  });
});
