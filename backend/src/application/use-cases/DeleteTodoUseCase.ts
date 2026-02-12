import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { TodoNotFoundError } from '@domain/exceptions/TodoNotFoundError.js';
import { UnauthorizedAccessError } from '@domain/exceptions/UnauthorizedAccessError.js';

export class DeleteTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(todoId: number, userId: number): Promise<boolean> {
    const todo = await this.todoRepository.findById(todoId);

    if (!todo) {
      throw new TodoNotFoundError('할일을 찾을 수 없습니다');
    }

    if (!todo.belongsTo(userId)) {
      throw new UnauthorizedAccessError('이 할일을 삭제할 권한이 없습니다');
    }

    return await this.todoRepository.delete(todoId, userId);
  }
}
