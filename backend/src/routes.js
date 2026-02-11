import express from 'express';
import { AuthController } from './controllers/index.js';
import { TodoController } from './controllers/index.js';
import { authMiddleware } from './middleware/index.js';

const router = express.Router();

// 인증 라우트
router.post('/api/auth/register', (req, res, next) => AuthController.register(req, res, next));
router.post('/api/auth/login', (req, res, next) => AuthController.login(req, res, next));

// 할일 라우트 (인증 필수)
router.get('/api/todos', authMiddleware, (req, res, next) => TodoController.getTodos(req, res, next));
router.get('/api/todos/:id', authMiddleware, (req, res, next) => TodoController.getTodo(req, res, next));
router.post('/api/todos', authMiddleware, (req, res, next) => TodoController.createTodo(req, res, next));
router.put('/api/todos/:id', authMiddleware, (req, res, next) => TodoController.updateTodo(req, res, next));
router.delete('/api/todos/:id', authMiddleware, (req, res, next) => TodoController.deleteTodo(req, res, next));

export default router;