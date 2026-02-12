import { Todo } from '../entities/Todo.js';

export interface ITodoRepository {
  findById(id: number): Promise<Todo | null>;
  findByUserId(userId: number): Promise<Todo[]>;
  findByIdAndUserId(id: number, userId: number): Promise<Todo | null>;
  save(todo: Omit<import('../entities/Todo.js').TodoProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo>;
  update(todo: Todo): Promise<Todo>;
  delete(id: number, userId: number): Promise<boolean>;
}
