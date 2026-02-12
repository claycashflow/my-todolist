import express from 'express';
import { AuthController } from './controllers/index.js';
import { authMiddleware } from './middleware/index.js';
import { Container } from './infrastructure/di/Container.js';
import { TodoController } from './presentation/controllers/TodoController.js';

const router = express.Router();
const container = Container.getInstance();

// Use Cases를 주입받아 TodoController 생성
const todoController = new TodoController(
  container.createTodoUseCase,
  container.getUserTodosUseCase,
  container.getTodoUseCase,
  container.updateTodoUseCase,
  container.deleteTodoUseCase
);

// 인증 라우트 (기존 JavaScript Controller 사용)
router.post('/api/auth/register', (req, res, next) => AuthController.register(req, res, next));
router.post('/api/auth/login', (req, res, next) => AuthController.login(req, res, next));

// 할일 라우트 (새로운 TypeScript Controller 사용)
router.get('/api/todos', authMiddleware, (req, res, next) => todoController.getTodos(req, res, next));
router.get('/api/todos/:id', authMiddleware, (req, res, next) => todoController.getTodo(req, res, next));
router.post('/api/todos', authMiddleware, (req, res, next) => todoController.createTodo(req, res, next));
router.put('/api/todos/:id', authMiddleware, (req, res, next) => todoController.updateTodo(req, res, next));
router.delete('/api/todos/:id', authMiddleware, (req, res, next) => todoController.deleteTodo(req, res, next));

export default router;
