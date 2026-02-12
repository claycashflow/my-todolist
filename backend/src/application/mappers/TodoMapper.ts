import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoTitle } from '@domain/value-objects/TodoTitle.js';
import { DueDate } from '@domain/value-objects/DueDate.js';
import { TodoResponseDTO } from '../dtos/TodoResponseDTO.js';

export interface DbTodoRow {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | Date; // PostgreSQL DATE는 Date 객체로 변환될 수 있음
  done: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TodoMapper {
  /**
   * DB 레코드를 Domain Entity로 변환
   */
  static toDomain(dbRow: DbTodoRow): Todo {
    // PostgreSQL DATE 타입은 Date 객체로 변환될 수 있으므로 문자열로 변환
    const dueDateStr = dbRow.due_date instanceof Date
      ? dbRow.due_date.toISOString().split('T')[0]
      : dbRow.due_date;

    const props: TodoProps = {
      id: dbRow.id,
      userId: dbRow.user_id,
      title: new TodoTitle(dbRow.title),
      description: dbRow.description,
      dueDate: new DueDate(dueDateStr),
      done: dbRow.done,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
    return new Todo(props);
  }

  /**
   * Entity를 Response DTO로 변환
   */
  static toResponseDTO(todo: Todo): TodoResponseDTO {
    return {
      id: todo.getId(),
      userId: todo.getUserId(),
      title: todo.getTitle(),
      description: todo.getDescription(),
      dueDate: todo.getDueDate(),
      done: todo.isDone(),
      isOverdue: todo.isOverdue(),
      createdAt: todo.getCreatedAt().toISOString(),
      updatedAt: todo.getUpdatedAt().toISOString(),
    };
  }

  /**
   * DB 레코드 배열을 Response DTO 배열로 변환
   */
  static toResponseDTOList(dbRows: DbTodoRow[]): TodoResponseDTO[] {
    return dbRows.map(row => {
      const entity = this.toDomain(row);
      return this.toResponseDTO(entity);
    });
  }
}
