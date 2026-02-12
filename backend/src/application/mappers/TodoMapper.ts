import { Todo, TodoProps } from '@domain/entities/Todo.js';
import { TodoTitle } from '@domain/value-objects/TodoTitle.js';
import { DueDate } from '@domain/value-objects/DueDate.js';
import { TodoResponseDTO } from '../dtos/TodoResponseDTO.js';

export interface DbTodoRow {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string;
  done: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TodoMapper {
  /**
   * DB 레코드를 Domain Entity로 변환
   */
  static toDomain(dbRow: DbTodoRow): Todo {
    const props: TodoProps = {
      id: dbRow.id,
      userId: dbRow.user_id,
      title: new TodoTitle(dbRow.title),
      description: dbRow.description,
      dueDate: new DueDate(dbRow.due_date),
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
