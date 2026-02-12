import { Request, Response, NextFunction } from 'express';
import { CreateTodoUseCase } from '@application/use-cases/CreateTodoUseCase.js';
import { GetUserTodosUseCase } from '@application/use-cases/GetUserTodosUseCase.js';
import { GetTodoUseCase } from '@application/use-cases/GetTodoUseCase.js';
import { UpdateTodoUseCase } from '@application/use-cases/UpdateTodoUseCase.js';
import { DeleteTodoUseCase } from '@application/use-cases/DeleteTodoUseCase.js';

// Express Request에 user 속성 추가
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }
  }
}

export class TodoController {
  constructor(
    private readonly createTodoUseCase: CreateTodoUseCase,
    private readonly getUserTodosUseCase: GetUserTodosUseCase,
    private readonly getTodoUseCase: GetTodoUseCase,
    private readonly updateTodoUseCase: UpdateTodoUseCase,
    private readonly deleteTodoUseCase: DeleteTodoUseCase
  ) {}

  async getTodos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const todos = await this.getUserTodosUseCase.execute(userId);
      res.status(200).json({ success: true, data: todos });
    } catch (error) {
      next(error);
    }
  }

  async getTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todoId = parseInt(req.params.id as string);
      const userId = req.user!.id;
      const todo = await this.getTodoUseCase.execute(todoId, userId);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async createTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, description, dueDate } = req.body;

      const todo = await this.createTodoUseCase.execute({
        userId,
        title,
        description: description || null,
        dueDate,
      });

      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async updateTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todoId = parseInt(req.params.id as string);
      const userId = req.user!.id;

      const todo = await this.updateTodoUseCase.execute(todoId, userId, req.body);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const todoId = parseInt(req.params.id as string);
      const userId = req.user!.id;

      await this.deleteTodoUseCase.execute(todoId, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
