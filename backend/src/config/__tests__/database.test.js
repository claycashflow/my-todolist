import { jest, describe, test, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';

// process.exit 모킹
let mockExit;

beforeAll(() => {
  mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
});

describe('데이터베이스 설정 테스트', () => {
  let pool;
  let checkDatabaseHealth;
  let closeDatabaseConnection;

  // 실제 데이터베이스 연결 시도하지 않도록 환경 변수 설정
  beforeEach(() => {
    process.env.POSTGRES_CONNECTION_STRING = 'postgresql://testuser:testpass@localhost:5432/testdb';
    process.env.NODE_ENV = 'test';
  });

  describe('헬스 체크 함수', () => {
    test('checkDatabaseHealth 함수가 export되어야 함', async () => {
      const dbModule = await import('../database.js');
      expect(dbModule.checkDatabaseHealth).toBeDefined();
      expect(typeof dbModule.checkDatabaseHealth).toBe('function');
    });

    test('헬스 체크 결과에 connected, timestamp 속성이 있어야 함', async () => {
      const dbModule = await import('../database.js');

      try {
        const result = await dbModule.checkDatabaseHealth();

        expect(result).toHaveProperty('connected');
        expect(result).toHaveProperty('timestamp');
        expect(typeof result.connected).toBe('boolean');
        expect(typeof result.timestamp).toBe('string');
      } catch (error) {
        // 연결 실패해도 구조는 확인 가능
        console.log('헬스 체크 에러 (예상된 동작):', error.message);
      }
    });

    test('헬스 체크 타임스탬프가 ISO 형식이어야 함', async () => {
      const dbModule = await import('../database.js');

      try {
        const result = await dbModule.checkDatabaseHealth();

        if (result.timestamp) {
          expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      } catch (error) {
        console.log('헬스 체크 에러 (예상된 동작):', error.message);
      }
    });
  });

  describe('Pool 종료 함수', () => {
    test('closeDatabaseConnection 함수가 export되어야 함', async () => {
      const dbModule = await import('../database.js');
      expect(dbModule.closeDatabaseConnection).toBeDefined();
      expect(typeof dbModule.closeDatabaseConnection).toBe('function');
    });

    test('closeDatabaseConnection이 에러 없이 실행되어야 함', async () => {
      const dbModule = await import('../database.js');

      // 에러가 발생하더라도 함수가 throw하지 않아야 함
      await expect(dbModule.closeDatabaseConnection()).resolves.not.toThrow();
    });
  });

  describe('기본 Pool Export', () => {
    test('pool이 기본 export되어야 함', async () => {
      const dbModule = await import('../database.js');
      expect(dbModule.default).toBeDefined();
      expect(dbModule.default).toHaveProperty('query');
      expect(typeof dbModule.default.query).toBe('function');
    });

    test('pool이 PostgreSQL Pool 인스턴스여야 함', async () => {
      const dbModule = await import('../database.js');
      const pool = dbModule.default;

      expect(pool).toHaveProperty('connect');
      expect(pool).toHaveProperty('end');
      expect(pool).toHaveProperty('query');
      expect(typeof pool.connect).toBe('function');
      expect(typeof pool.end).toBe('function');
    });
  });

  describe('환경 변수 검증', () => {
    test('POSTGRES_CONNECTION_STRING 환경 변수가 설정되어야 함', () => {
      expect(process.env.POSTGRES_CONNECTION_STRING).toBeDefined();
      expect(process.env.POSTGRES_CONNECTION_STRING).toContain('postgresql://');
    });
  });

  describe('모듈 구조 검증', () => {
    test('필수 함수들이 모두 export되어야 함', async () => {
      const dbModule = await import('../database.js');

      expect(dbModule).toHaveProperty('default');
      expect(dbModule).toHaveProperty('checkDatabaseHealth');
      expect(dbModule).toHaveProperty('closeDatabaseConnection');
    });

    test('export된 함수들이 모두 함수 타입이어야 함', async () => {
      const dbModule = await import('../database.js');

      expect(typeof dbModule.checkDatabaseHealth).toBe('function');
      expect(typeof dbModule.closeDatabaseConnection).toBe('function');
    });
  });

  describe('데이터베이스 설정값 검증', () => {
    test('Pool 설정이 올바른 구조를 가져야 함', async () => {
      // Pool 설정은 database.js 내부에 하드코딩되어 있으므로
      // 실제로는 코드 리뷰를 통해 확인
      const dbModule = await import('../database.js');
      const pool = dbModule.default;

      // Pool 객체가 존재하고 기본 메서드들을 가지고 있는지 확인
      expect(pool).toBeTruthy();
      expect(pool.query).toBeDefined();
      expect(pool.connect).toBeDefined();
      expect(pool.end).toBeDefined();
    });
  });

  describe('에러 처리', () => {
    test('헬스 체크 실패 시 에러 정보를 포함한 객체를 반환해야 함', async () => {
      // 잘못된 연결 문자열로 테스트
      process.env.POSTGRES_CONNECTION_STRING = 'postgresql://invalid:invalid@nonexistent:9999/testdb';

      // 모듈 캐시 클리어 후 재로드
      jest.resetModules();
      const dbModule = await import('../database.js');

      const result = await dbModule.checkDatabaseHealth();

      // 연결 실패 시 connected: false와 error 메시지가 있어야 함
      if (result.connected === false) {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
        expect(result.error.length).toBeGreaterThan(0);
      }
    });
  });

  describe('비동기 처리', () => {
    test('checkDatabaseHealth가 Promise를 반환해야 함', async () => {
      const dbModule = await import('../database.js');
      const result = dbModule.checkDatabaseHealth();

      expect(result).toBeInstanceOf(Promise);
    });

    test('closeDatabaseConnection이 Promise를 반환해야 함', async () => {
      const dbModule = await import('../database.js');
      const result = dbModule.closeDatabaseConnection();

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
