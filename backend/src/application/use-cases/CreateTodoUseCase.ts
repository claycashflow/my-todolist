import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { Todo } from '@domain/entities/Todo.js';
import { CreateTodoDTO } from '../dtos/CreateTodoDTO.js';
import { TodoResponseDTO } from '../dtos/TodoResponseDTO.js';
import { TodoMapper } from '../mappers/TodoMapper.js';

export class CreateTodoUseCase {
  constructor(private readonly todoRepository: ITodoRepository) {}

  async execute(dto: CreateTodoDTO): Promise<TodoResponseDTO> {
    const todoProps = Todo.create(
      dto.userId,
      dto.title,
      dto.description,
      dto.dueDate
    );

    const createdTodo = await this.todoRepository.save(todoProps);
    return TodoMapper.toResponseDTO(createdTodo);
  }
}
