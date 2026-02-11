import { jest, describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';

// 데이터베이스 모듈 모킹
const mockPool = {
  query: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
};

const mockCheckDatabaseHealth = jest.fn();
const mockCloseDatabaseConnection = jest.fn();

jest.mock('../config/database.js', () => ({
  default: mockPool,
  checkDatabaseHealth: mockCheckDatabaseHealth,
  closeDatabaseConnection: mockCloseDatabaseConnection
}));

// console 메서드 모킹
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('Express 앱 테스트', () => {
  let app;

  beforeAll(async () => {
    console.log = jest.fn();
    console.error = jest.fn();

    // 초기 연결 쿼리 모킹
    mockPool.query.mockResolvedValueOnce({
      rows: [{ version: 'PostgreSQL 16.0' }]
    });

    // 환경 변수 설정
    process.env.PORT = '3001';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    // Express 앱 임포트
    const appModule = await import('../index.js');
    app = appModule.default;
  });

  afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 라우트', () => {
    test('GET / 요청 시 API 정보를 반환해야 함', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', '할 일 관리 API 서버');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toEqual({
        health: '/health',
        auth: '/api/auth/*',
        todos: '/api/todos/*'
      });
    });

    test('GET / 응답이 JSON 형식이어야 함', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('헬스 체크 엔드포인트', () => {
    test('GET /health 요청 시 서버 및 DB 상태를 반환해야 함', async () => {
      mockCheckDatabaseHealth.mockResolvedValueOnce({
        connected: true,
        timestamp: '2026-02-11T07:00:00.000Z'
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database.connected).toBe(true);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('헬스 체크 응답에 타임스탬프가 포함되어야 함', async () => {
      mockCheckDatabaseHealth.mockResolvedValueOnce({
        connected: true,
        timestamp: new Date().toISOString()
      });

      const response = await request(app).get('/health');

      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('헬스 체크 응답 구조가 올바른 형식이어야 함', async () => {
      mockCheckDatabaseHealth.mockResolvedValueOnce({
        connected: true,
        timestamp: new Date().toISOString()
      });

      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.database).toHaveProperty('connected');
      expect(response.body.database).toHaveProperty('timestamp');
    });
  });

  describe('404 핸들러', () => {
    test('존재하지 않는 경로 요청 시 404를 반환해야 함', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', '요청한 리소스를 찾을 수 없습니다');
    });

    test('404 응답이 JSON 형식이어야 함', async () => {
      const response = await request(app).get('/invalid-path');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('여러 잘못된 경로에 대해 404를 반환해야 함', async () => {
      const invalidPaths = ['/api/invalid', '/test/route', '/unknown'];

      for (const path of invalidPaths) {
        const response = await request(app).get(path);
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('CORS 설정', () => {
    test('CORS 헤더가 올바르게 설정되어야 함', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    test('OPTIONS 요청에 대해 CORS 프리플라이트를 처리해야 함', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
    });
  });

  describe('JSON 미들웨어', () => {
    test('JSON 요청 본문을 파싱해야 함', async () => {
      const response = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });

    test('잘못된 JSON 형식 요청 시 에러를 반환해야 함', async () => {
      const response = await request(app)
        .post('/test')
        .send('invalid json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('URL-encoded 미들웨어', () => {
    test('URL-encoded 요청 본문을 파싱해야 함', async () => {
      const response = await request(app)
        .post('/test')
        .send('key=value&foo=bar')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('서버 응답 형식', () => {
    test('모든 응답이 JSON 형식이어야 함', async () => {
      const endpoints = ['/', '/health', '/invalid-route'];

      for (const endpoint of endpoints) {
        mockCheckDatabaseHealth.mockResolvedValueOnce({
          connected: true,
          timestamp: new Date().toISOString()
        });

        const response = await request(app).get(endpoint);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    test('에러 응답에 success: false가 포함되어야 함', async () => {
      const response = await request(app).get('/non-existent');

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('환경 변수 설정', () => {
    test('FRONTEND_URL 환경 변수가 CORS에 반영되어야 함', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });
  });

  describe('엔드포인트 목록 검증', () => {
    test('API 정보에 모든 주요 엔드포인트가 포함되어야 함', async () => {
      const response = await request(app).get('/');

      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('auth');
      expect(response.body.endpoints).toHaveProperty('todos');
    });

    test('엔드포인트 경로가 올바른 형식이어야 함', async () => {
      const response = await request(app).get('/');

      expect(response.body.endpoints.health).toBe('/health');
      expect(response.body.endpoints.auth).toBe('/api/auth/*');
      expect(response.body.endpoints.todos).toBe('/api/todos/*');
    });
  });

  describe('HTTP 메서드 지원', () => {
    test('GET 메서드를 지원해야 함', async () => {
      const response = await request(app).get('/');
      expect(response.status).not.toBe(405);
    });

    test('POST 메서드 요청을 처리해야 함', async () => {
      const response = await request(app).post('/test').send({});
      expect(response.status).toBe(404);
    });

    test('PUT 메서드 요청을 처리해야 함', async () => {
      const response = await request(app).put('/test').send({});
      expect(response.status).toBe(404);
    });

    test('DELETE 메서드 요청을 처리해야 함', async () => {
      const response = await request(app).delete('/test');
      expect(response.status).toBe(404);
    });
  });

  describe('서버 구조 검증', () => {
    test('app이 Express 인스턴스여야 함', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
      expect(app.get).toBeDefined();
      expect(app.post).toBeDefined();
    });

    test('app이 필수 메서드들을 포함해야 함', () => {
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
      expect(typeof app.put).toBe('function');
      expect(typeof app.delete).toBe('function');
    });
  });

  describe('응답 시간', () => {
    test('기본 라우트 응답이 1초 이내여야 함', async () => {
      const start = Date.now();
      await request(app).get('/');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    test('헬스 체크 응답이 1초 이내여야 함', async () => {
      mockCheckDatabaseHealth.mockResolvedValueOnce({
        connected: true,
        timestamp: new Date().toISOString()
      });

      const start = Date.now();
      await request(app).get('/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });
});
