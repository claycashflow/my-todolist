import express, { Router } from 'express';
import { Container } from '@infrastructure/di/Container.js';
import { TodoController } from '../controllers/TodoController.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';

const router: Router = express.Router();
const container = Container.getInstance();

// Use Cases를 주입받아 Controller 생성
const todoController = new TodoController(
  container.createTodoUseCase,
  container.getUserTodosUseCase,
  container.getTodoUseCase,
  container.updateTodoUseCase,
  container.deleteTodoUseCase
);

// 할일 라우트 (인증 필수)
router.get('/api/todos', authMiddleware, (req, res, next) =>
  todoController.getTodos(req, res, next)
);

router.get('/api/todos/:id', authMiddleware, (req, res, next) =>
  todoController.getTodo(req, res, next)
);

router.post('/api/todos', authMiddleware, (req, res, next) =>
  todoController.createTodo(req, res, next)
);

router.put('/api/todos/:id', authMiddleware, (req, res, next) =>
  todoController.updateTodo(req, res, next)
);

router.delete('/api/todos/:id', authMiddleware, (req, res, next) =>
  todoController.deleteTodo(req, res, next)
);

export default router;
