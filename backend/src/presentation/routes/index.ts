import express, { Router } from 'express';
import todoRoutes from './todoRoutes.js';
// import authRoutes from './authRoutes.js'; // 나중에 추가

const router: Router = express.Router();

// Auth routes는 나중에 추가
// router.use(authRoutes);

// Todo routes
router.use(todoRoutes);

export default router;
