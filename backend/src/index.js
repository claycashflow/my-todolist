import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import routes from './routes.js';
import { errorHandler } from './middleware/index.js';
import pool, { checkDatabaseHealth, closeDatabaseConnection } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const swaggerDocument = JSON.parse(
  readFileSync(join(__dirname, '../swagger.json'), 'utf8')
);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 - 여러 출처 허용
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    // origin이 undefined인 경우는 같은 출처 요청 (Postman, curl 등)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
      docs: '/api-docs',
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
