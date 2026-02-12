import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { UpdateTodoDTO } from '../dtos/UpdateTodoDTO.js';
import { TodoResponseDTO } from '../dtos/TodoResponseDTO.js';
import { TodoMapper } from '../mappers/TodoMapper.js';
import { TodoNotFoundError } from '@domain/exceptions/TodoNotFoundError.js';
import { UnauthorizedAccessError } from '@domain/exceptions/UnauthorizedAccessError.js';

export class UpdateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(
    todoId: number,
    userId: number,
    updates: UpdateTodoDTO
  ): Promise<TodoResponseDTO> {
    const todo = await this.todoRepository.findById(todoId);

    if (!todo) {
      throw new TodoNotFoundError('할일을 찾을 수 없습니다');
    }

    if (!todo.belongsTo(userId)) {
      throw new UnauthorizedAccessError('이 할일을 수정할 권한이 없습니다');
    }

    if (updates.title !== undefined) {
      todo.updateTitle(updates.title);
    }

    if (updates.description !== undefined) {
      todo.updateDescription(updates.description);
    }

    if (updates.dueDate !== undefined) {
      todo.updateDueDate(updates.dueDate);
    }

    if (updates.done !== undefined) {
      if (updates.done) {
        todo.complete();
      } else {
        todo.uncomplete();
      }
    }

    const updatedTodo = await this.todoRepository.update(todo);
    return TodoMapper.toResponseDTO(updatedTodo);
  }
}
