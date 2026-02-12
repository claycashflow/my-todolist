import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoMapper, DbTodoRow } from '@application/mappers/TodoMapper.js';
import pool from '../../config/database.js';

export class TodoRepositoryPostgres implements ITodoRepository {
  async findById(id: number): Promise<Todo | null> {
    const result = await pool.query<DbTodoRow>(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at
       FROM todos
       WHERE id = $1`,
      [id]
    );

    if (!result.rows[0]) return null;
    return TodoMapper.toDomain(result.rows[0]);
  }

  async findByUserId(userId: number): Promise<Todo[]> {
    const result = await pool.query<DbTodoRow>(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at
       FROM todos
       WHERE user_id = $1
       ORDER BY due_date ASC`,
      [userId]
    );

    return result.rows.map(row => TodoMapper.toDomain(row));
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Todo | null> {
    const result = await pool.query<DbTodoRow>(
      `SELECT id, user_id, title, description, due_date, done, created_at, updated_at
       FROM todos
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!result.rows[0]) return null;
    return TodoMapper.toDomain(result.rows[0]);
  }

  async save(
    todoProps: Omit<TodoProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Todo> {
    const result = await pool.query<DbTodoRow>(
      `INSERT INTO todos (user_id, title, description, due_date, done)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
      [
        todoProps.userId,
        todoProps.title.getValue(),
        todoProps.description,
        todoProps.dueDate.getValue(),
        todoProps.done,
      ]
    );

    return TodoMapper.toDomain(result.rows[0]);
  }

  async update(todo: Todo): Promise<Todo> {
    const result = await pool.query<DbTodoRow>(
      `UPDATE todos
       SET title = $1, description = $2, due_date = $3, done = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, user_id, title, description, due_date, done, created_at, updated_at`,
      [
        todo.getTitle(),
        todo.getDescription(),
        todo.getDueDate(),
        todo.isDone(),
        todo.getId(),
      ]
    );

    return TodoMapper.toDomain(result.rows[0]);
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}
