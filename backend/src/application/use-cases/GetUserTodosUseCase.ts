import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { TodoResponseDTO } from '../dtos/TodoResponseDTO.js';
import { TodoMapper } from '../mappers/TodoMapper.js';

export class GetUserTodosUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(userId: number): Promise<TodoResponseDTO[]> {
    const todos = await this.todoRepository.findByUserId(userId);
    return todos.map(todo => TodoMapper.toResponseDTO(todo));
  }
}
