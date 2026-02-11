import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection Pool 생성
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  max: 20,                          // 최대 연결 수
  min: 2,                           // 최소 연결 수
  idleTimeoutMillis: 30000,         // 유휴 타임아웃 30초
  connectionTimeoutMillis: 5000,    // 연결 타임아웃 5초
  query_timeout: 10000,             // 쿼리 타임아웃 10초
  application_name: 'my-todolist-backend'
});

// Pool 에러 핸들링
pool.on('error', (err) => {
  console.error('[DB 에러] 유휴 클라이언트에서 예기치 않은 에러 발생:', err);
  process.exit(-1);
});

// 연결 이벤트 로깅 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  pool.on('connect', () => {
    console.log('[DB 연결] 새 클라이언트가 풀에 연결되었습니다');
  });

  pool.on('acquire', () => {
    console.log('[DB 풀] 클라이언트가 풀에서 체크아웃되었습니다');
  });

  pool.on('remove', () => {
    console.log('[DB 풀] 클라이언트가 풀에서 제거되었습니다');
  });
}

// 초기 연결 테스트
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT version()');
    console.log('[DB 성공] PostgreSQL 연결 성공');
    console.log('[DB 버전]', result.rows[0].version);
    return true;
  } catch (err) {
    console.error('[DB 실패] PostgreSQL 연결 실패:', err.message);
    console.error('[DB 상세]', {
      host: process.env.POSTGRES_CONNECTION_STRING,
      error: err.stack
    });
    process.exit(-1);
  }
};

// 헬스 체크 함수
export const checkDatabaseHealth = async () => {
  try {
    const result = await pool.query('SELECT 1 as health_check');
    return {
      connected: true,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Pool 종료 함수 (graceful shutdown)
export const closeDatabaseConnection = async () => {
  try {
    await pool.end();
    console.log('[DB 종료] 연결 풀이 정상적으로 종료되었습니다');
  } catch (err) {
    console.error('[DB 종료 에러]', err);
  }
};

// 애플리케이션 시작 시 연결 테스트 실행
// 테스트 환경에서는 실행하지 않음
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export default pool;
