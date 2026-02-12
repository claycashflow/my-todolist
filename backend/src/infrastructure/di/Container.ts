import { ITodoRepository } from '@domain/repositories/ITodoRepository.js';
import { TodoRepositoryPostgres } from '../persistence/TodoRepositoryPostgres.js';
import { CreateTodoUseCase } from '@application/use-cases/CreateTodoUseCase.js';
import { GetUserTodosUseCase } from '@application/use-cases/GetUserTodosUseCase.js';
import { GetTodoUseCase } from '@application/use-cases/GetTodoUseCase.js';
import { UpdateTodoUseCase } from '@application/use-cases/UpdateTodoUseCase.js';
import { DeleteTodoUseCase } from '@application/use-cases/DeleteTodoUseCase.js';
import { PasswordHasher } from '../security/PasswordHasher.js';
import { JwtTokenProvider } from '../security/JwtTokenProvider.js';

export class Container {
  private static instance: Container;

  // Repositories
  private _todoRepository?: ITodoRepository;

  // Security
  private _passwordHasher?: PasswordHasher;
  private _jwtTokenProvider?: JwtTokenProvider;

  // Use Cases
  private _createTodoUseCase?: CreateTodoUseCase;
  private _getUserTodosUseCase?: GetUserTodosUseCase;
  private _getTodoUseCase?: GetTodoUseCase;
  private _updateTodoUseCase?: UpdateTodoUseCase;
  private _deleteTodoUseCase?: DeleteTodoUseCase;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Repositories
  get todoRepository(): ITodoRepository {
    if (!this._todoRepository) {
      this._todoRepository = new TodoRepositoryPostgres();
    }
    return this._todoRepository;
  }

  // Security
  get passwordHasher(): PasswordHasher {
    if (!this._passwordHasher) {
      this._passwordHasher = new PasswordHasher();
    }
    return this._passwordHasher;
  }

  get jwtTokenProvider(): JwtTokenProvider {
    if (!this._jwtTokenProvider) {
      this._jwtTokenProvider = new JwtTokenProvider();
    }
    return this._jwtTokenProvider;
  }

  // Use Cases
  get createTodoUseCase(): CreateTodoUseCase {
    if (!this._createTodoUseCase) {
      this._createTodoUseCase = new CreateTodoUseCase(this.todoRepository);
    }
    return this._createTodoUseCase;
  }

  get getUserTodosUseCase(): GetUserTodosUseCase {
    if (!this._getUserTodosUseCase) {
      this._getUserTodosUseCase = new GetUserTodosUseCase(this.todoRepository);
    }
    return this._getUserTodosUseCase;
  }

  get getTodoUseCase(): GetTodoUseCase {
    if (!this._getTodoUseCase) {
      this._getTodoUseCase = new GetTodoUseCase(this.todoRepository);
    }
    return this._getTodoUseCase;
  }

  get updateTodoUseCase(): UpdateTodoUseCase {
    if (!this._updateTodoUseCase) {
      this._updateTodoUseCase = new UpdateTodoUseCase(this.todoRepository);
    }
    return this._updateTodoUseCase;
  }

  get deleteTodoUseCase(): DeleteTodoUseCase {
    if (!this._deleteTodoUseCase) {
      this._deleteTodoUseCase = new DeleteTodoUseCase(this.todoRepository);
    }
    return this._deleteTodoUseCase;
  }

  // 테스트용: 의존성 재설정
  reset(): void {
    this._todoRepository = undefined;
    this._passwordHasher = undefined;
    this._jwtTokenProvider = undefined;
    this._createTodoUseCase = undefined;
    this._getUserTodosUseCase = undefined;
    this._getTodoUseCase = undefined;
    this._updateTodoUseCase = undefined;
    this._deleteTodoUseCase = undefined;
  }
}
