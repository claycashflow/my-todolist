import { describe, test, expect, beforeEach } from '@jest/globals';
import { Todo, TodoProps } from '../Todo.js';
import { TodoTitle } from '../../value-objects/TodoTitle.js';
import { DueDate } from '../../value-objects/DueDate.js';
import { InvalidTitleError } from '../../exceptions/InvalidTitleError.js';
import { InvalidDueDateError } from '../../exceptions/InvalidDueDateError.js';

describe('Todo Entity', () => {
  let sampleProps: TodoProps;

  beforeEach(() => {
    sampleProps = {
      id: 1,
      userId: 100,
      title: new TodoTitle('할 일 제목'),
      description: '할 일 설명',
      dueDate: new DueDate('2024-12-31'),
      done: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };
  });

  describe('생성', () => {
    test('유효한 props로 Todo를 생성할 수 있어야 함', () => {
      const todo = new Todo(sampleProps);
      expect(todo.getId()).toBe(1);
      expect(todo.getUserId()).toBe(100);
      expect(todo.getTitle()).toBe('할 일 제목');
      expect(todo.getDescription()).toBe('할 일 설명');
      expect(todo.getDueDate()).toBe('2024-12-31');
      expect(todo.isDone()).toBe(false);
    });

    test('create 메서드로 새 Todo props를 생성할 수 있어야 함', () => {
      const props = Todo.create(100, '새 할 일', '설명', '2024-12-31');
      expect(props.userId).toBe(100);
      expect(props.title.getValue()).toBe('새 할 일');
      expect(props.description).toBe('설명');
      expect(props.dueDate.getValue()).toBe('2024-12-31');
      expect(props.done).toBe(false);
    });

    test('create 메서드는 잘못된 제목에 대해 예외를 던져야 함', () => {
      expect(() => Todo.create(100, '', '설명', '2024-12-31')).toThrow(InvalidTitleError);
    });

    test('create 메서드는 잘못된 날짜에 대해 예외를 던져야 함', () => {
      expect(() => Todo.create(100, '제목', '설명', 'invalid')).toThrow(InvalidDueDateError);
    });
  });

  describe('isOverdue', () => {
    test('미완료 Todo가 기한이 지났으면 overdue여야 함', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const props = {
        ...sampleProps,
        dueDate: new DueDate(pastDateStr),
        done: false,
      };
      const todo = new Todo(props);
      expect(todo.isOverdue()).toBe(true);
    });

    test('완료된 Todo는 기한이 지나도 overdue가 아니어야 함', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      const props = {
        ...sampleProps,
        dueDate: new DueDate(pastDateStr),
        done: true,
      };
      const todo = new Todo(props);
      expect(todo.isOverdue()).toBe(false);
    });
  });

  describe('complete/uncomplete/toggleDone', () => {
    test('complete 메서드는 done을 true로 설정해야 함', () => {
      const todo = new Todo(sampleProps);
      todo.complete();
      expect(todo.isDone()).toBe(true);
    });

    test('uncomplete 메서드는 done을 false로 설정해야 함', () => {
      const props = { ...sampleProps, done: true };
      const todo = new Todo(props);
      todo.uncomplete();
      expect(todo.isDone()).toBe(false);
    });

    test('toggleDone 메서드는 done 상태를 토글해야 함', () => {
      const todo = new Todo(sampleProps);
      expect(todo.isDone()).toBe(false);
      todo.toggleDone();
      expect(todo.isDone()).toBe(true);
      todo.toggleDone();
      expect(todo.isDone()).toBe(false);
    });
  });

  describe('update 메서드들', () => {
    test('updateTitle은 제목을 변경해야 함', () => {
      const todo = new Todo(sampleProps);
      todo.updateTitle('새로운 제목');
      expect(todo.getTitle()).toBe('새로운 제목');
    });

    test('updateTitle은 잘못된 제목에 대해 예외를 던져야 함', () => {
      const todo = new Todo(sampleProps);
      expect(() => todo.updateTitle('')).toThrow(InvalidTitleError);
    });

    test('updateDescription은 설명을 변경해야 함', () => {
      const todo = new Todo(sampleProps);
      todo.updateDescription('새로운 설명');
      expect(todo.getDescription()).toBe('새로운 설명');
    });

    test('updateDescription은 null을 허용해야 함', () => {
      const todo = new Todo(sampleProps);
      todo.updateDescription(null);
      expect(todo.getDescription()).toBeNull();
    });

    test('updateDueDate는 마감일을 변경해야 함', () => {
      const todo = new Todo(sampleProps);
      todo.updateDueDate('2025-01-01');
      expect(todo.getDueDate()).toBe('2025-01-01');
    });

    test('updateDueDate는 잘못된 날짜에 대해 예외를 던져야 함', () => {
      const todo = new Todo(sampleProps);
      expect(() => todo.updateDueDate('invalid')).toThrow(InvalidDueDateError);
    });
  });

  describe('belongsTo', () => {
    test('동일한 userId일 경우 true를 반환해야 함', () => {
      const todo = new Todo(sampleProps);
      expect(todo.belongsTo(100)).toBe(true);
    });

    test('다른 userId일 경우 false를 반환해야 함', () => {
      const todo = new Todo(sampleProps);
      expect(todo.belongsTo(999)).toBe(false);
    });
  });
});
