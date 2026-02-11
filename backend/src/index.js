import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
import { errorHandler } from './middleware/index.js';
import pool, { checkDatabaseHealth, closeDatabaseConnection } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 라우트
app.use(routes);

// 헬스 체크 엔드포인트
app.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: 'ok',
    database: dbHealth,
    timestamp: new Date().toISOString()
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '할 일 관리 API 서버',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      todos: '/api/todos/*'
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다'
  });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const server = app.listen(PORT, () => {
  console.log(`[서버] http://localhost:${PORT} 에서 실행 중`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('[종료] SIGTERM 신호 수신');
  server.close(async () => {
    await closeDatabaseConnection();
    console.log('[종료] 서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('[종료] SIGINT 신호 수신 (Ctrl+C)');
  server.close(async () => {
    await closeDatabaseConnection();
    console.log('[종료] 서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
});

export default app;
