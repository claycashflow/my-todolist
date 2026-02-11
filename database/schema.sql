-- =====================================================
-- PostgreSQL Schema for Todo Management System
-- =====================================================
-- 프로젝트: my-todolist (Node.js/Express 기반 할 일 관리 API)
-- 데이터베이스: PostgreSQL
-- 작성일: 2026-02-11
-- ERD 문서: docs/6-ERD.md
-- =====================================================

-- =====================================================
-- 1. 기존 테이블 제거 (개발 환경 전용)
-- =====================================================
-- 주의: 프로덕션 환경에서는 주석 처리할 것
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 2. USERS 테이블
-- =====================================================
-- 사용자 정보를 저장하는 테이블
-- - UUID 기반 Primary Key
-- - bcrypt로 해시된 비밀번호 저장
-- - username은 고유값 (UNIQUE 제약)
-- =====================================================

CREATE TABLE users (
  -- Primary Key: UUID 자동 생성
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 사용자명: 4-20자, 영문/숫자만, 중복 불가
  username VARCHAR(20) UNIQUE NOT NULL,

  -- 비밀번호: bcrypt 해시 (60자), 평문 저장 금지
  password VARCHAR(255) NOT NULL,

  -- 계정 생성 일시
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 제약조건
  CONSTRAINT users_username_length CHECK (char_length(username) >= 4 AND char_length(username) <= 20),
  CONSTRAINT users_password_not_empty CHECK (char_length(password) >= 8)
);

-- 사용자명 검색 성능 최적화 인덱스 (UNIQUE 제약으로 자동 생성됨)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 계정 생성일 기준 정렬 인덱스
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 테이블 주석
COMMENT ON TABLE users IS '사용자 계정 정보 테이블';
COMMENT ON COLUMN users.id IS '사용자 고유 식별자 (UUID)';
COMMENT ON COLUMN users.username IS '사용자명 (4-20자, 영문/숫자, 고유값)';
COMMENT ON COLUMN users.password IS 'bcrypt 해시된 비밀번호 (최소 8자)';
COMMENT ON COLUMN users.created_at IS '계정 생성 일시';

-- =====================================================
-- 3. TODOS 테이블
-- =====================================================
-- 할 일 항목을 저장하는 테이블
-- - users 테이블과 1:N 관계
-- - CASCADE 삭제: 사용자 삭제 시 해당 할 일 자동 삭제
-- - updated_at은 트리거로 자동 갱신
-- =====================================================

CREATE TABLE todos (
  -- Primary Key: UUID 자동 생성
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key: 사용자 참조, CASCADE 삭제
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 할 일 제목: 1-100자, 필수
  title VARCHAR(100) NOT NULL,

  -- 할 일 설명: 최대 1000자, 선택사항
  description VARCHAR(1000),

  -- 마감일: YYYY-MM-DD 형식, 필수
  due_date DATE NOT NULL,

  -- 완료 여부: 기본값 false (미완료)
  done BOOLEAN NOT NULL DEFAULT FALSE,

  -- 할 일 생성 일시
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 할 일 수정 일시 (트리거로 자동 갱신)
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 제약조건
  CONSTRAINT todos_title_not_empty CHECK (char_length(trim(title)) >= 1 AND char_length(title) <= 100),
  CONSTRAINT todos_description_length CHECK (description IS NULL OR char_length(description) <= 1000)
);

-- 사용자별 할 일 조회 성능 최적화
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);

-- 마감일 기준 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);

-- 완료 상태 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);

-- 사용자별 + 마감일순 정렬 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_user_id_due_date ON todos(user_id, due_date);

-- 사용자별 + 완료 상태 필터링 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_user_id_done ON todos(user_id, done);

-- 생성일 기준 정렬 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

-- 테이블 주석
COMMENT ON TABLE todos IS '할 일 항목 테이블';
COMMENT ON COLUMN todos.id IS '할 일 고유 식별자 (UUID)';
COMMENT ON COLUMN todos.user_id IS '할 일 소유자 (users.id 참조)';
COMMENT ON COLUMN todos.title IS '할 일 제목 (1-100자, 필수)';
COMMENT ON COLUMN todos.description IS '할 일 상세 설명 (최대 1000자, 선택)';
COMMENT ON COLUMN todos.due_date IS '마감일 (YYYY-MM-DD)';
COMMENT ON COLUMN todos.done IS '완료 여부 (true: 완료, false: 미완료)';
COMMENT ON COLUMN todos.created_at IS '할 일 생성 일시';
COMMENT ON COLUMN todos.updated_at IS '할 일 최종 수정 일시 (자동 갱신)';

-- =====================================================
-- 4. 트리거 및 함수
-- =====================================================
-- updated_at 컬럼을 자동으로 현재 시각으로 갱신
-- UPDATE 작업 시에만 동작
-- =====================================================

-- updated_at 자동 갱신 함수 생성
CREATE OR REPLACE FUNCTION update_todos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 함수 주석
COMMENT ON FUNCTION update_todos_timestamp() IS 'todos 테이블의 updated_at을 자동으로 현재 시각으로 갱신';

-- todos 테이블에 트리거 적용
CREATE TRIGGER todos_update_timestamp
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION update_todos_timestamp();

-- =====================================================
-- 5. 샘플 데이터 (선택사항)
-- =====================================================
-- 개발 및 테스트 환경용 샘플 데이터
-- 프로덕션 배포 시 주석 처리 또는 제거
-- 주의: bcrypt 해시는 애플리케이션에서 생성하여 사용 권장
-- =====================================================

-- 샘플 사용자 생성 (비밀번호는 애플리케이션에서 bcrypt 해시 생성 필요)
-- INSERT INTO users (username, password) VALUES
-- ('gdhong', '$2b$10$...(bcrypt hash)...'),
-- ('mrlee', '$2b$10$...(bcrypt hash)...')
-- ON CONFLICT (username) DO NOTHING;

-- 샘플 할 일 생성
-- INSERT INTO todos (user_id, title, description, due_date, done) VALUES
-- ((SELECT id FROM users WHERE username = 'gdhong'), '프로젝트 기획서 작성', '분기 실적 보고서 작성', '2026-02-15', false),
-- ((SELECT id FROM users WHERE username = 'gdhong'), 'API 문서 업데이트', 'Swagger 명세 최신화', '2026-02-12', false),
-- ((SELECT id FROM users WHERE username = 'mrlee'), '데이터베이스 설계', 'ERD 작성 및 DDL 생성', '2026-02-14', false)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. 데이터베이스 설정 (권장)
-- =====================================================

-- 타임존 설정 (UTC 권장)
-- ALTER DATABASE my_todolist SET timezone = 'UTC';

-- =====================================================
-- 7. 권한 설정 (선택사항)
-- =====================================================
-- 애플리케이션 전용 데이터베이스 사용자 권한 부여
-- 실제 사용자명으로 변경 필요
-- =====================================================

-- 예시: todoapp 사용자에게 권한 부여
-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO todoapp;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO todoapp;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todoapp;

-- =====================================================
-- 스키마 생성 완료
-- =====================================================
-- 실행 방법:
--
-- 1. PostgreSQL 데이터베이스 생성
--    createdb -U postgres my_todolist
--
-- 2. 스키마 적용
--    psql -U postgres -d my_todolist -f database/schema.sql
--
-- 3. Node.js에서 실행
--    const { Pool } = require('pg');
--    const fs = require('fs');
--    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
--    const sql = fs.readFileSync('database/schema.sql', 'utf8');
--    await pool.query(sql);
-- =====================================================
