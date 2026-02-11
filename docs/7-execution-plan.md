# 실행계획서 (Execution Plan)
## PostgreSQL + Express + React 기반 Todo 관리 시스템 신규 개발

**버전**: 2.2
**작성일**: 2026-02-11
**작성자**: 제품 관리팀 & 기술 아키텍처팀
**상태**: 계획 수립 완료
**목표 완료일**: 2026-02-13 (2일)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 배경
기존 LokiJS 기반 인메모리 시스템의 한계를 극복하고, PostgreSQL을 기반으로 한 프로덕션급 Todo 관리 시스템을 처음부터 신규 개발하는 프로젝트입니다.

### 1.2 기술 스택
- **데이터베이스**: PostgreSQL 17 (관계형 데이터베이스)
- **백엔드**: Node.js >= 22.0.0 + Express 4.x
- **프론트엔드**: React 18.x + Vite (SPA)
- **인증**: JWT (JSON Web Token) - 24시간 유효기간
- **비밀번호 암호화**: bcryptjs
- **API**: RESTful 기반

### 1.3 개발 범위
| 영역 | 범위 |
|------|------|
| **데이터베이스** | PostgreSQL 설치, 스키마 설계 및 적용 |
| **백엔드** | Express REST API, 인증, CRUD 기능 |
| **프론트엔드** | React SPA, 인증 UI, Todo CRUD UI |
| **테스트** | 단위 테스트, 통합 테스트, E2E 테스트 |
| **보안** | SQL Injection 방지, XSS 방지, CSRF 방지 |

### 1.4 프로젝트 일정
- **총 소요 기간**: 2일 (Day 1 ~ Day 2)
- **Phase 1 (DB)**: 1일 (2026-02-11)
- **Phase 2 (BE)**: 1일 (2026-02-12)
- **Phase 3 (FE)**: 1일 (2026-02-13 오전)
- **Phase 4 (TEST)**: 2시간 (2026-02-13 오후)
- **Phase 5 (배포 준비)**: 1시간 (2026-02-13 오후)

---

## 2. Phase 1: 데이터베이스 구축 (Day 1)

### 목표
PostgreSQL 17 설치, 데이터베이스 생성, 스키마 적용 완료

### Task DB-1: PostgreSQL 17 설치 및 초기 설정
**시간 추정**: 1시간
**담당자**: DevOps / 개발 환경 담당자

#### 완료 조건 체크리스트
- [x] PostgreSQL 17 설치 완료 (Windows/Mac/Linux 또는 Docker)
- [x] 포트 5432 정상 작동 확인
- [x] 초기 접속 테스트 성공 (`psql -U postgres`)
- [x] postgres 기본 사용자 암호 설정 완료
- [x] PostgreSQL 버전 확인 (`SELECT version()`)

#### 의존성
- 없음 (독립 작업)

#### 상세 작업 내용
1. PostgreSQL 17 다운로드 및 설치
   - Windows: https://www.postgresql.org/download/windows/
   - macOS: `brew install postgresql@17`
   - Linux: `sudo apt-get install postgresql-17`
   - Docker: `docker run --name postgres17 -e POSTGRES_PASSWORD=devpassword -p 5432:5432 -d postgres:17`

2. 기본 설정 확인
   - 포트 5432 오픈 확인
   - 기본 사용자 postgres 접근 가능 확인

3. 명령어 테스트
   ```bash
   psql --version
   # 출력: psql (PostgreSQL) 17.x

   psql -U postgres -c "SELECT version();"
   # 출력: PostgreSQL 17.x on ... (응답 확인)
   ```

---

### Task DB-2: 데이터베이스 및 애플리케이션 사용자 생성
**시간 추정**: 30분
**담당자**: 데이터베이스 관리자

#### 완료 조건 체크리스트
- [x] `my_todolist` 데이터베이스 생성 완료
- [x] `todoapp` 애플리케이션 사용자 생성 완료
- [x] todoapp 사용자에 권한 부여 완료
- [x] 접속 테스트 성공 (`psql -U todoapp -d my_todolist`)

#### 의존성
- DB-1 완료 필수

#### SQL 명령어
```bash
# postgres 사용자로 접속
psql -U postgres
```

```sql
-- 1. 데이터베이스 생성
CREATE DATABASE my_todolist
  WITH OWNER postgres
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';

-- 2. 애플리케이션 사용자 생성
CREATE USER todoapp WITH PASSWORD 'todoapp_secure_password_12345';

-- 3. todoapp 사용자에 my_todolist 데이터베이스 사용 권한 부여
GRANT CONNECT ON DATABASE my_todolist TO todoapp;

-- 4. my_todolist 데이터베이스로 전환
\c my_todolist

-- 5. public 스키마에 대한 권한 부여
GRANT USAGE ON SCHEMA public TO todoapp;
GRANT CREATE ON SCHEMA public TO todoapp;

-- 6. 향후 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO todoapp;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO todoapp;

-- 7. 기존 모든 객체에 대한 권한 부여 (스키마 적용 후)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO todoapp;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todoapp;
```

#### 접속 테스트
```bash
# todoapp 사용자로 접속 확인
psql -U todoapp -d my_todolist -c "SELECT current_user, current_database();"
# 출력: current_user | current_database
#      -----------|------------------
#       todoapp  | my_todolist
```

---

### Task DB-3: 스키마 적용 (schema.sql 실행)
**시간 추정**: 20분
**담당자**: 데이터베이스 관리자

#### 완료 조건 체크리스트
- [x] `database/schema.sql` 실행 완료
- [x] users 테이블 생성 확인
- [x] todos 테이블 생성 확인
- [x] 인덱스 생성 확인 (11개 - 7개 명시적 인덱스 + PRIMARY KEY 및 UNIQUE 제약)
- [x] 트리거 생성 확인 (updated_at 자동 갱신)
- [x] 테이블 구조 및 제약조건 확인

#### 의존성
- DB-2 완료 필수

#### 실행 방법
```bash
# Option 1: psql 명령어로 스키마 적용 (권장)
psql -U todoapp -d my_todolist -f database/schema.sql

# 실행 후 확인
psql -U todoapp -d my_todolist -c "\dt"
# 출력:
#            List of relations
# Schema | Name  | Type  | Owner
# --------+-------+-------+--------
# public | users | table | todoapp
# public | todos | table | todoapp
```

#### 검증 쿼리
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
-- 출력: todos, users

-- 컬럼 확인
\d users
\d todos

-- 인덱스 확인
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY indexname;
-- 출력: 7개 인덱스 (idx_users_username, idx_users_created_at,
--      idx_todos_user_id, idx_todos_due_date, idx_todos_done,
--      idx_todos_user_id_due_date, idx_todos_user_id_done,
--      idx_todos_created_at)

-- 트리거 확인
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- 출력: todos_update_timestamp | todos
```

---

### Task DB-4: 샘플 데이터 생성 (선택)
**시간 추정**: 20분
**담당자**: 데이터베이스 관리자

#### 완료 조건 체크리스트
- [x] 샘플 사용자 2명 생성 완료 (gdhong, mrlee)
- [x] 각 사용자별 샘플 할일 3개씩 생성 완료 (총 6개)
- [x] 다양한 마감일 포함 (과거: 2026-02-08, 현재/미래: 2026-02-12~25)
- [x] 일부 할일의 완료 상태 설정 (done=true: 1개, done=false: 5개)
- [x] 데이터 정합성 검증 완료

#### 의존성
- DB-3 완료 필수

#### 상세 작업 내용
```sql
-- 1. bcrypt 해시 생성 (Node.js에서 생성 권장)
-- 패스워드: "password123" → bcrypt 해시값으로 대체
-- 예시: $2b$10$example_bcrypt_hash_value_here_60_chars

-- 2. 샘플 사용자 생성
INSERT INTO users (username, password) VALUES
('gdhong', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeJKpg9LE'),  -- password123
('mrlee', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeJKpg9LE')   -- password123
ON CONFLICT (username) DO NOTHING;

-- 3. 샘플 할일 생성 (gdhong 사용자)
INSERT INTO todos (user_id, title, description, due_date, done) VALUES
(
  (SELECT id FROM users WHERE username = 'gdhong'),
  '프로젝트 기획서 작성',
  '분기 실적 보고서 및 차기 분기 목표 설정',
  '2026-02-15',
  false
),
(
  (SELECT id FROM users WHERE username = 'gdhong'),
  'API 문서 업데이트',
  'Swagger/OpenAPI 명세 최신화',
  '2026-02-12',
  true
),
(
  (SELECT id FROM users WHERE username = 'gdhong'),
  '코드 리뷰',
  '팀원 PR 검토',
  '2026-02-20',
  false
)
ON CONFLICT DO NOTHING;

-- 4. 샘플 할일 생성 (mrlee 사용자)
INSERT INTO todos (user_id, title, description, due_date, done) VALUES
(
  (SELECT id FROM users WHERE username = 'mrlee'),
  '데이터베이스 설계',
  'ERD 작성 및 DDL 생성',
  '2026-02-14',
  false
),
(
  (SELECT id FROM users WHERE username = 'mrlee'),
  '성능 테스트',
  '부하 테스트 및 최적화',
  '2026-02-08',
  false
),
(
  (SELECT id FROM users WHERE username = 'mrlee'),
  '배포 준비',
  'CI/CD 파이프라인 구성',
  '2026-02-25',
  false
)
ON CONFLICT DO NOTHING;

-- 5. 데이터 정합성 검증
SELECT u.username, COUNT(t.id) as todo_count
FROM users u
LEFT JOIN todos t ON u.id = t.user_id
GROUP BY u.id, u.username;
-- 출력: gdhong | 3
--      mrlee | 3
```

---

## 3. Phase 2: 백엔드 개발 (Day 2-6)

### 목표
Express 기반 REST API 신규 개발, PostgreSQL 연동, 인증 및 CRUD 기능 구현

### Task BE-1: Node.js 프로젝트 초기화
**시간 추정**: 30분
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] 신규 Express 프로젝트 생성 완료
- [ ] package.json 설정 완료 (프로젝트명, 버전, 엔진)
- [ ] 기본 폴더 구조 생성 완료
- [ ] .gitignore 파일 생성 완료
- [ ] .env 파일 템플릿 생성 완료

#### 의존성
- 없음 (독립 작업)

#### 프로젝트 구조
```
backend/
├── src/
│   ├── index.js                 # Express 앱 진입점
│   ├── config/
│   │   └── database.js          # PostgreSQL 연결 설정
│   ├── dao/
│   │   ├── UserDAO.js
│   │   ├── TodoDAO.js
│   │   └── index.js
│   ├── services/
│   │   ├── AuthService.js
│   │   ├── TodoService.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── TodoController.js
│   │   └── index.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validatorMiddleware.js
│   └── routes.js
├── .env.example
├── .gitignore
├── package.json
├── babel.config.js              # ES6+ 트랜스파일 설정
└── README.md
```

#### 실행 방법
```bash
# 신규 디렉토리 생성
mkdir backend
cd backend

# npm 초기화
npm init -y

# package.json 수정 (engines 필드 추가)
# {
#   "name": "my-todolist-backend",
#   "version": "1.0.0",
#   "description": "PostgreSQL based Todo management API",
#   "main": "build/index.js",
#   "engines": {
#     "node": ">=22.0.0",
#     "npm": ">=10.0.0"
#   },
#   ...
# }

# .gitignore 생성
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "build/" >> .gitignore
echo "dist/" >> .gitignore

# .env.example 생성
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://todoapp:password@localhost:5432/my_todolist
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
EOF
```

---

### Task BE-2: 필수 라이브러리 설치
**시간 추정**: 30분
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] Express 설치 완료 (`npm install express`)
- [ ] PostgreSQL 클라이언트 라이브러리 설치 (`npm install pg`)
- [ ] 인증 관련 라이브러리 설치 (bcryptjs, jsonwebtoken)
- [ ] 환경변수 라이브러리 설치 (`npm install dotenv`)
- [ ] 유틸리티 라이브러리 설치 (cors, uuid 등)
- [ ] 개발 도구 설치 (babel, nodemon)
- [ ] package.json 의존성 확인

#### 의존성
- BE-1 완료 필수

#### 설치 명령어
```bash
# 핵심 라이브러리
npm install express pg dotenv cors uuid

# 인증 및 보안
npm install bcryptjs jsonwebtoken

# 유틸리티
npm install morgan helmet

# 개발 도구
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save-dev babel-node @babel/node nodemon
npm install --save-dev jest supertest  # 테스트 프레임워크

# 타입스크립트 (선택)
# npm install --save-dev typescript @types/node @types/express
```

#### package.json scripts 추가
```json
{
  "scripts": {
    "dev": "babel-node src/index.js",
    "build": "babel src -d build",
    "start": "npm run build && node build/index.js",
    "test": "jest --testEnvironment=node"
  }
}
```

---

### Task BE-3: PostgreSQL 연결 설정
**시간 추정**: 1시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] `src/config/database.js` 파일 생성 완료
- [ ] Connection Pool 설정 완료 (pg.Pool)
- [ ] 환경변수 DATABASE_URL 처리 완료
- [ ] 에러 핸들링 구현 완료 (pool error event)
- [ ] 연결 테스트 성공 (SELECT 1 쿼리)
- [ ] 타임아웃 및 재시도 정책 설정 완료

#### 의존성
- BE-2 완료 필수

#### 코드 예시
```javascript
// src/config/database.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://todoapp:todoapp_secure_password_12345@localhost:5432/my_todolist',
  max: 20,                    // 최대 연결 수
  idleTimeoutMillis: 30000,   // 30초 유휴 타임아웃
  connectionTimeoutMillis: 5000, // 5초 연결 타임아웃
});

// 에러 핸들링
pool.on('error', (err) => {
  console.error('[DB ERROR] Unexpected error on idle client:', err);
  process.exit(-1);
});

// 연결 테스트
pool.query('SELECT version()', (err, res) => {
  if (err) {
    console.error('[DB ERROR] Connection failed:', err.message);
    process.exit(-1);
  } else {
    console.log('[DB SUCCESS] Connected:', res.rows[0].version);
  }
});

export default pool;
```

#### 환경변수 설정 (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://todoapp:todoapp_secure_password_12345@localhost:5432/my_todolist
JWT_SECRET=my_super_secret_jwt_key_minimum_32_characters_long!
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
```

---

### Task BE-4: DAO 계층 개발 (User & Todo)
**시간 추정**: 4시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트

##### UserDAO
- [ ] `findByUsername(username)` 메서드 구현
  - 반환: User 객체 또는 null
- [ ] `findById(id)` 메서드 구현
  - 반환: User 객체 또는 null
- [ ] `create(username, hashedPassword)` 메서드 구현
  - 반환: 생성된 User 객체 (id 포함)
  - 에러 처리: UNIQUE 제약 위반 → throw Error

##### TodoDAO
- [ ] `findByUserId(userId)` 메서드 구현
  - 정렬: due_date ASC (마감일순)
  - 반환: Todo[] 배열
- [ ] `findById(todoId)` 메서드 구현
  - 반환: Todo 객체 또는 null
- [ ] `findByIdAndUserId(todoId, userId)` 메서드 구현
  - 반환: Todo 객체 또는 null (소유권 검증용)
- [ ] `create(userId, title, description, dueDate)` 메서드 구현
  - 반환: 생성된 Todo 객체
- [ ] `update(todoId, updates)` 메서드 구현
  - partial update 지원 (변경할 필드만 전달)
  - 반환: 업데이트된 Todo 객체
- [ ] `delete(todoId)` 메서드 구현
  - 반환: 삭제 성공 여부 (boolean)

#### 의존성
- BE-3 완료 필수

#### 코드 예시
```javascript
// src/dao/UserDAO.js
import pool from '../config/database.js';

class UserDAO {
  async findByUsername(username) {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(username, hashedPassword) {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        [username, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // UNIQUE violation
        throw new Error('아이디가 이미 존재합니다');
      }
      throw error;
    }
  }
}

export default new UserDAO();

// src/dao/TodoDAO.js
import pool from '../config/database.js';

class TodoDAO {
  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY due_date ASC',
      [userId]
    );
    return result.rows;
  }

  async findById(todoId) {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1',
      [todoId]
    );
    return result.rows[0] || null;
  }

  async findByIdAndUserId(todoId, userId) {
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [todoId, userId]
    );
    return result.rows[0] || null;
  }

  async create(userId, title, description, dueDate) {
    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description, due_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, title, description, dueDate]
    );
    return result.rows[0];
  }

  async update(todoId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.due_date !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(updates.due_date);
    }
    if (updates.done !== undefined) {
      fields.push(`done = $${paramCount++}`);
      values.push(updates.done);
    }

    if (fields.length === 0) return null;

    values.push(todoId);
    const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(todoId) {
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1',
      [todoId]
    );
    return result.rowCount > 0;
  }
}

export default new TodoDAO();
```

---

### Task BE-5: 서비스 계층 개발
**시간 추정**: 2시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트

##### AuthService
- [ ] `register(username, password)` 메서드 구현
  - 입력값 검증 (username 4-20자, password 8자 이상)
  - bcrypt 해시화
  - DAO.create() 호출
  - 중복 username 에러 처리 (409)
  - 반환: { id, username, createdAt }
- [ ] `login(username, password)` 메서드 구현
  - DAO.findByUsername() 호출
  - bcrypt.compare() 검증
  - 불일치 에러 처리 (401)
  - JWT 토큰 생성 및 반환
  - 반환: { token, user: { id, username } }

##### TodoService
- [ ] `getUserTodos(userId)` 메서드 구현
  - DAO.findByUserId() 호출
  - isOverdue 필드 계산 및 추가
  - 반환: Todo[] with isOverdue
- [ ] `getTodo(todoId, userId)` 메서드 구현
  - DAO.findByIdAndUserId() 호출 (소유권 검증)
  - 없는 할일 에러 처리 (404)
  - isOverdue 필드 계산 및 추가
  - 반환: Todo with isOverdue
- [ ] `createTodo(userId, title, description, dueDate)` 메서드 구현
  - 입력값 검증
  - DAO.create() 호출
  - isOverdue 계산
  - 반환: 생성된 Todo with isOverdue
- [ ] `updateTodo(todoId, userId, updates)` 메서드 구현
  - 소유권 검증
  - 입력값 검증
  - DAO.update() 호출
  - isOverdue 계산
  - 반환: 업데이트된 Todo with isOverdue
- [ ] `deleteTodo(todoId, userId)` 메서드 구현
  - 소유권 검증
  - DAO.delete() 호출
  - 반환: 성공 여부

#### 의존성
- BE-4 완료 필수

#### 코드 예시
```javascript
// src/services/AuthService.js
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserDAO from '../dao/UserDAO.js';

class AuthService {
  async register(username, password) {
    // 입력값 검증
    if (!username || username.length < 4 || username.length > 20) {
      throw new Error('아이디는 4~20자로 입력해주세요');
    }
    if (!password || password.length < 8) {
      throw new Error('비밀번호는 8자 이상으로 입력해주세요');
    }

    // bcrypt 해시화
    const hashedPassword = await bcryptjs.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // 사용자 생성
    const user = await UserDAO.create(username, hashedPassword);
    return {
      id: user.id,
      username: user.username,
      createdAt: user.created_at
    };
  }

  async login(username, password) {
    // 사용자 조회
    const user = await UserDAO.findByUsername(username);
    if (!user) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('아이디 또는 비밀번호가 일치하지 않습니다');
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username
      }
    };
  }
}

export default new AuthService();

// src/services/TodoService.js
import TodoDAO from '../dao/TodoDAO.js';

class TodoService {
  calculateIsOverdue(dueDate, done) {
    if (done) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  }

  async getUserTodos(userId) {
    const todos = await TodoDAO.findByUserId(userId);
    return todos.map(todo => ({
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    }));
  }

  async getTodo(todoId, userId) {
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('할일을 찾을 수 없습니다');
    }
    return {
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    };
  }

  async createTodo(userId, title, description, dueDate) {
    // 입력값 검증
    if (!title || title.trim().length === 0 || title.length > 100) {
      throw new Error('제목은 1~100자로 입력해주세요');
    }
    if (!dueDate) {
      throw new Error('유효한 마감일을 입력해주세요');
    }

    const todo = await TodoDAO.create(userId, title, description, dueDate);
    return {
      ...todo,
      isOverdue: this.calculateIsOverdue(todo.due_date, todo.done)
    };
  }

  async updateTodo(todoId, userId, updates) {
    // 소유권 검증
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('권한이 없습니다');
    }

    // 입력값 검증
    if (updates.title !== undefined && (!updates.title || updates.title.length > 100)) {
      throw new Error('제목은 1~100자로 입력해주세요');
    }

    const updated = await TodoDAO.update(todoId, updates);
    return {
      ...updated,
      isOverdue: this.calculateIsOverdue(updated.due_date, updated.done)
    };
  }

  async deleteTodo(todoId, userId) {
    // 소유권 검증
    const todo = await TodoDAO.findByIdAndUserId(todoId, userId);
    if (!todo) {
      throw new Error('권한이 없습니다');
    }

    return await TodoDAO.delete(todoId);
  }
}

export default new TodoService();
```

---

### Task BE-6: 컨트롤러 계층 개발
**시간 추정**: 2시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트

##### AuthController
- [ ] `register(req, res, next)` 메서드 구현
  - Service.register() 호출
  - 201 응답 (성공)
  - 에러 처리 (400, 409)
- [ ] `login(req, res, next)` 메서드 구현
  - Service.login() 호출
  - 200 응답 + JWT 토큰
  - 에러 처리 (400, 401)

##### TodoController
- [ ] `getTodos(req, res, next)` 메서드 구현
  - Service.getUserTodos() 호출
  - 200 응답 + Todo[]
  - isOverdue 필드 포함
- [ ] `getTodo(req, res, next)` 메서드 구현
  - Service.getTodo() 호출
  - 200 응답 + Todo
  - 에러 처리 (404)
- [ ] `createTodo(req, res, next)` 메서드 구현
  - Service.createTodo() 호출
  - 201 응답
  - 에러 처리 (400)
- [ ] `updateTodo(req, res, next)` 메서드 구현
  - Service.updateTodo() 호출
  - 200 응답
  - 부분 수정 지원
  - 에러 처리 (400, 403, 404)
- [ ] `deleteTodo(req, res, next)` 메서드 구현
  - Service.deleteTodo() 호출
  - 204 응답
  - 에러 처리 (403, 404)

#### 의존성
- BE-5 완료 필수

#### 코드 예시
```javascript
// src/controllers/AuthController.js
import AuthService from '../services/AuthService.js';

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password } = req.body;
      const user = await AuthService.register(username, password);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login(username, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

// src/controllers/TodoController.js
import TodoService from '../services/TodoService.js';

class TodoController {
  async getTodos(req, res, next) {
    try {
      const userId = req.user.id;
      const todos = await TodoService.getUserTodos(userId);
      res.status(200).json({ success: true, data: todos });
    } catch (error) {
      next(error);
    }
  }

  async getTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const todo = await TodoService.getTodo(id, userId);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async createTodo(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, description, dueDate } = req.body;
      const todo = await TodoService.createTodo(userId, title, description, dueDate);
      res.status(201).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async updateTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const todo = await TodoService.updateTodo(id, userId, req.body);
      res.status(200).json({ success: true, data: todo });
    } catch (error) {
      next(error);
    }
  }

  async deleteTodo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await TodoService.deleteTodo(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TodoController();
```

---

### Task BE-7: 미들웨어 개발
**시간 추정**: 1.5시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] `authMiddleware` 구현 완료
  - Authorization 헤더에서 JWT 추출
  - JWT 검증 (유효성, 만료)
  - req.user에 payload 저장
  - 401 에러 처리
- [ ] `errorHandler` 미들웨어 구현 완료
  - 표준화된 에러 응답
  - 한국어 에러 메시지
  - HTTP 상태 코드 설정
  - 로깅 (개발 환경)
- [ ] `validatorMiddleware` 구현 (선택)
  - 필수 필드 검증
  - 데이터 타입 검증

#### 의존성
- BE-6 완료 권장

#### 코드 예시
```javascript
// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '로그인이 필요합니다'
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다'
    });
  }
};

// src/middleware/errorHandler.js
export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || '서버 오류가 발생했습니다';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ERROR]', error);
  }

  // 데이터베이스 에러 처리
  if (error.code === '23505') { // UNIQUE violation
    return res.status(409).json({
      success: false,
      message: '이미 사용 중인 아이디입니다'
    });
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
};
```

---

### Task BE-8: 라우트 정의
**시간 추정**: 1시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] 인증 라우트 정의
  - POST /api/auth/register
  - POST /api/auth/login
- [ ] 할일 라우트 정의 (authMiddleware 적용)
  - GET /api/todos
  - GET /api/todos/:id
  - POST /api/todos
  - PUT /api/todos/:id
  - DELETE /api/todos/:id
- [ ] 모든 라우트에 적절한 미들웨어 적용
- [ ] CORS 설정 완료
- [ ] 응답 형식 통일

#### 의존성
- BE-7 완료 필수

#### 코드 예시
```javascript
// src/routes.js
import express from 'express';
import AuthController from './controllers/AuthController.js';
import TodoController from './controllers/TodoController.js';
import { authMiddleware } from './middleware/authMiddleware.js';

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

// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
import { errorHandler } from './middleware/errorHandler.js';

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

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`);
});
```

---

### Task BE-9: 백엔드 테스트 및 검증
**시간 추정**: 2시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] 단위 테스트 작성 및 통과 (DAO, Service)
- [ ] 통합 테스트 작성 및 통과 (API Endpoints)
- [ ] 모든 API 엔드포인트 manual 테스트 완료 (Postman)
- [ ] 에러 처리 검증 완료 (모든 에러 한국어)
- [ ] 성능 확인 (API 응답 < 200ms)
- [ ] 로컬 환경 실행 테스트 완료

#### 의존성
- BE-8 완료 필수

#### 테스트 체크리스트
```
[인증 API]
- [ ] POST /api/auth/register - 정상 가입 (201)
- [ ] POST /api/auth/register - 중복 아이디 (409)
- [ ] POST /api/auth/register - 짧은 password (400)
- [ ] POST /api/auth/login - 정상 로그인 (200)
- [ ] POST /api/auth/login - 잘못된 정보 (401)

[할일 API]
- [ ] GET /api/todos - 정상 조회 (200)
- [ ] GET /api/todos - 미인증 (401)
- [ ] GET /api/todos/:id - 정상 조회 (200)
- [ ] GET /api/todos/:id - 없는 할일 (404)
- [ ] POST /api/todos - 정상 생성 (201)
- [ ] POST /api/todos - 필수값 누락 (400)
- [ ] PUT /api/todos/:id - 정상 수정 (200)
- [ ] PUT /api/todos/:id - 타인 할일 (403)
- [ ] DELETE /api/todos/:id - 정상 삭제 (204)
- [ ] DELETE /api/todos/:id - 타인 할일 (403)
```

---

### Task BE-10: 백엔드 최종 검증
**시간 추정**: 1시간
**담당자**: 백엔드 개발자

#### 완료 조건 체크리스트
- [ ] 로컬 환경 서버 실행 성공 (`npm run dev`)
- [ ] 데이터베이스 연결 확인
- [ ] 전체 API 엔드포인트 동작 확인
- [ ] 에러 메시지 한국어 확인
- [ ] HTTP 상태 코드 정확성 확인
- [ ] 성능 확인 (< 200ms)
- [ ] 보안 검증 (SQL Injection 방지)

#### 의존성
- BE-9 완료 필수

---

## 4. Phase 3: 프론트엔드 개발 (Day 7-11)

### 목표
React 기반 SPA 신규 개발, 백엔드 API 연동, 완전한 UI/UX 구현

### Task FE-1: React 프로젝트 초기화
**시간 추정**: 1시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] Vite 또는 CRA로 React 프로젝트 생성 완료
- [ ] package.json 설정 완료
- [ ] 폴더 구조 생성 완료
- [ ] .env.example 생성 완료
- [ ] 개발 서버 실행 확인

#### 의존성
- 없음 (독립 작업)

#### 프로젝트 구조
```
frontend/
├── src/
│   ├── index.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Register.jsx
│   │   │   └── Login.jsx
│   │   ├── Todo/
│   │   │   ├── TodoList.jsx
│   │   │   ├── TodoItem.jsx
│   │   │   ├── TodoForm.jsx
│   │   │   └── TodoDetail.jsx
│   │   └── Common/
│   │       ├── Header.jsx
│   │       ├── Footer.jsx
│   │       └── ErrorBoundary.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── TodoPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── todoService.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── TodoContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTodo.js
│   ├── styles/
│   │   ├── index.css
│   │   └── components.css
│   └── utils/
│       ├── dateUtils.js
│       └── validation.js
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

### Task FE-2: API 클라이언트 개발
**시간 추정**: 1.5시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] API 클라이언트 설정 완료 (axios 또는 fetch)
- [ ] 인증 서비스 구현 완료 (register, login)
- [ ] Todo API 서비스 구현 완료 (CRUD)
- [ ] 요청/응답 인터셉터 구현
- [ ] 토큰 관리 (localStorage) 완료
- [ ] 에러 처리 구현 완료

#### 의존성
- FE-1 완료 필수

#### 코드 예시
```javascript
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 (토큰 포함)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/authService.js
import api from './api';

export const authService = {
  register: (username, password) =>
    api.post('/auth/register', { username, password }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

// src/services/todoService.js
import api from './api';

export const todoService = {
  getTodos: () => api.get('/todos'),
  getTodo: (id) => api.get(`/todos/${id}`),
  createTodo: (title, description, dueDate) =>
    api.post('/todos', { title, description, dueDate }),
  updateTodo: (id, updates) =>
    api.put(`/todos/${id}`, updates),
  deleteTodo: (id) =>
    api.delete(`/todos/${id}`)
};
```

---

### Task FE-3: 인증 UI 개발
**시간 추정**: 2시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] 회원가입 페이지 UI 개발 완료
  - username 입력 (4-20자 검증)
  - password 입력 (8자 이상 검증)
  - 가입 버튼 및 로그인 링크
  - 에러 메시지 표시
- [ ] 로그인 페이지 UI 개발 완료
  - username/password 입력
  - 로그인 버튼 및 회원가입 링크
  - 에러 메시지 표시
- [ ] 입력값 클라이언트 검증 구현
- [ ] 로딩 상태 표시 (버튼 disabled)
- [ ] 성공 후 자동 리다이렉트

#### 의존성
- FE-2 완료 필수

#### 화면 요소
```
[회원가입 페이지]
├─ 제목: "회원가입"
├─ 아이디 입력: <4~20자, 영문/숫자>
├─ 비밀번호 입력: <8자 이상>
├─ 비밀번호 확인: <일치 여부 검증>
├─ 가입 버튼
├─ 로그인 링크
└─ 에러 메시지: 색상 빨강 (#f44336)

[로그인 페이지]
├─ 제목: "로그인"
├─ 아이디 입력
├─ 비밀번호 입력
├─ 로그인 버튼
├─ 회원가입 링크
└─ 에러 메시지
```

---

### Task FE-4: Todo CRUD UI 개발
**시간 추정**: 3시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] Todo 목록 UI 개발 완료
  - 제목, 마감일, 상태 표시
  - 마감일순 정렬
  - 마감일 지난 항목 빨간색 배경 (#ffebee)
  - 완료 항목 취소선 + 회색 텍스트
- [ ] Todo 추가 UI 개발 완료
  - 제목, 설명, 마감일 입력
  - 추가 버튼
  - 입력값 검증
- [ ] Todo 수정 UI 개발 완료
  - 기존 정보 로드
  - 부분 수정 지원
  - 수정 버튼
- [ ] Todo 삭제 UI 개발 완료
  - 확인 모달
  - 삭제 버튼
- [ ] 완료 상태 토글 기능
  - 체크박스 클릭
  - 즉시 상태 변경

#### 의존성
- FE-3 완료 필수

#### 화면 요소
```
[할일 목록]
├─ 헤더
│  ├─ 사용자명 표시
│  ├─ 새 할일 추가 버튼
│  └─ 로그아웃 버튼
├─ 검색/필터 (선택)
│  └─ 완료/미완료 필터
└─ 할일 목록
   └─ 각 할일 항목
      ├─ 체크박스 (완료 토글)
      ├─ 제목 (텍스트)
      ├─ 마감일 (YYYY-MM-DD)
      ├─ 수정 버튼
      ├─ 삭제 버튼
      └─ 조건부 스타일
         ├─ 지연 (마감일 < 오늘): 빨간색 배경
         ├─ 완료: 취소선 + 회색

[새 할일 추가 폼]
├─ 제목: <1~100자, 필수>
├─ 설명: <최대 1000자, 선택>
├─ 마감일: <YYYY-MM-DD, 필수>
├─ 추가 버튼
└─ 취소 버튼

[할일 상세/수정 폼]
├─ 제목 수정
├─ 설명 수정
├─ 마감일 수정
├─ 저장 버튼
└─ 취소 버튼
```

---

### Task FE-5: 상태 관리 구현
**시간 추정**: 2시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] 인증 상태 관리 (Context 또는 Redux)
  - 로그인 사용자 정보
  - JWT 토큰
  - 로그인 상태
- [ ] Todo 상태 관리
  - Todo 목록 (배열)
  - 로딩 상태
  - 에러 메시지
- [ ] 커스텀 훅 개발
  - useAuth() - 인증 정보 및 함수
  - useTodo() - Todo 정보 및 함수

#### 의존성
- FE-4 완료 권장

#### 코드 예시
```javascript
// src/context/AuthContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));

  const login = useCallback(async (username, password) => {
    const result = await authService.login(username, password);
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setToken(result.data.token);
    setUser(result.data.user);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### Task FE-6: 반응형 UI 및 스타일 적용
**시간 추정**: 2시간
**담당자**: 프론트엌드 개발자

#### 완료 조건 체크리스트
- [ ] 모바일 레이아웃 (375px) 최적화
  - 가로 스크롤 없음
  - 터치 버튼 크기 충분 (44x44px)
  - 여백 적절
- [ ] 태블릿 레이아웃 (768px) 최적화
- [ ] 데스크톱 레이아웃 (1920px) 최적화
- [ ] 다크모드 지원 (선택)
- [ ] 접근성 개선
  - alt 텍스트
  - ARIA 라벨
  - 키보드 네비게이션

#### 의존성
- FE-5 완료 권장

---

### Task FE-7: 프론트엔드 테스트 및 검증
**시간 추정**: 2시간
**담당자**: 프론트엔드 개발자

#### 완료 조건 체크리스트
- [ ] 회원가입 플로우 테스트 완료
- [ ] 로그인 플로우 테스트 완료
- [ ] Todo CRUD 기능 테스트 완료
- [ ] 마감일 지연 표시 테스트 완료
- [ ] 권한 검증 테스트 완료
- [ ] 브라우저 호환성 테스트 (Chrome, Firefox, Safari, Edge)
- [ ] 반응형 UI 테스트 (375px, 768px, 1920px)

#### 의존성
- FE-6 완료 필수

---

## 5. Phase 4: 통합 및 테스트 (Day 12-14)

### Task TEST-1: 전체 시스템 통합 테스트
**시간 추정**: 2시간
**담당자**: QA 담당자

#### 완료 조건 체크리스트
- [ ] 회원가입 ~ 로그인 ~ Todo 추가 전체 플로우 테스트
- [ ] 멀티 사용자 시나리오 테스트 (사용자 A, B 권한 검증)
- [ ] 마감일 지연 시나리오 테스트
- [ ] 동시성 테스트 (병렬 요청)
- [ ] 에러 복구 테스트 (서버 재시작 등)

---

### Task TEST-2: 성능 테스트
**시간 추정**: 1.5시간
**담당자**: 성능 테스트 담당자

#### 완료 조건 체크리스트
- [ ] API 응답 시간 측정
  - GET /todos: < 150ms
  - POST /todos: < 200ms
  - PUT /todos/:id: < 200ms
- [ ] 프론트엔드 로딩 시간 < 2초
- [ ] 동시 사용자 10명 테스트

---

### Task TEST-3: 보안 검증
**시간 추정**: 1.5시간
**담당자**: 보안 담당자

#### 완료 조건 체크리스트
- [ ] SQL Injection 방지 확인 (파라미터화된 쿼리)
- [ ] XSS 방지 확인 (React 자동 이스케이프)
- [ ] CSRF 방지 확인 (CORS 설정)
- [ ] 비밀번호 보안 확인 (bcryptjs 해시)
- [ ] JWT 토큰 보안 확인 (만료 시간, 서명)

---

### Task TEST-4: 문서 정합성 검증
**시간 추정**: 1시간
**담당자**: 문서 관리자

#### 완료 조건 체크리스트
- [ ] API 엔드포인트 vs PRD 일치성 검증
- [ ] 데이터 스키마 vs ERD 일치성 검증
- [ ] 비즈니스 규칙 구현 일치성 검증
- [ ] 아키텍처 vs 실제 구현 일치성 검증

---

### Task TEST-5: 최종 E2E 시나리오 테스트
**시간 추정**: 2시간
**담당자**: QA 담당자

#### 완료 조건 체크리스트
- [ ] 신규 사용자 가입 → 로그인 → Todo 생성/수정/삭제 전체 플로우
- [ ] 마감일 지연 시나리오 (과거 마감일 → 빨간색 표시 → 완료 처리)
- [ ] 권한 검증 시나리오 (타인 할일 접근 거부)
- [ ] 반응형 UI 시나리오 (모바일/태블릿/데스크톱)

---

## 6. Phase 5: 배포 준비 (Day 15-16)

### Task DEPLOY-1: 배포 환경 구성
**시간 추정**: 2시간
**담당자**: DevOps

#### 완료 조건 체크리스트
- [ ] 프로덕션 데이터베이스 설정 완료
- [ ] 백엔드 빌드 및 배포 준비
- [ ] 프론트엔드 빌드 완료 (npm run build)
- [ ] 환경 변수 설정 완료

---

## 7. 의존성 다이어그램

```mermaid
graph TD
    A["DB-1: PostgreSQL 설치"]
    B["DB-2: 데이터베이스 생성"]
    C["DB-3: 스키마 적용"]
    D["DB-4: 샘플 데이터"]
    E["BE-1: 프로젝트 초기화"]
    F["BE-2: 라이브러리 설치"]
    G["BE-3: DB 연결 설정"]
    H["BE-4: DAO 개발"]
    I["BE-5: 서비스 개발"]
    J["BE-6: 컨트롤러 개발"]
    K["BE-7: 미들웨어 개발"]
    L["BE-8: 라우트 정의"]
    M["BE-9: 백엔드 테스트"]
    N["BE-10: 백엔드 검증"]
    O["FE-1: 프로젝트 초기화"]
    P["FE-2: API 클라이언트"]
    Q["FE-3: 인증 UI"]
    R["FE-4: Todo CRUD UI"]
    S["FE-5: 상태 관리"]
    T["FE-6: 반응형 스타일"]
    U["FE-7: 프론트엔드 테스트"]
    V["TEST-1: 통합 테스트"]
    W["TEST-2: 성능 테스트"]
    X["TEST-3: 보안 검증"]
    Y["TEST-4: 문서 검증"]
    Z["TEST-5: E2E 테스트"]
    AA["DEPLOY-1: 배포 준비"]

    A --> B
    B --> C
    C --> D
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    O --> P
    P --> Q
    Q --> R
    R --> S
    S --> T
    T --> U
    N --> V
    U --> V
    V --> W
    W --> X
    X --> Y
    Y --> Z
    Z --> AA

    style A fill:#e8f5e9
    style B fill:#e8f5e9
    style C fill:#e8f5e9
    style D fill:#e8f5e9
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
    style M fill:#fff3e0
    style N fill:#fff3e0
    style O fill:#e3f2fd
    style P fill:#e3f2fd
    style Q fill:#e3f2fd
    style R fill:#e3f2fd
    style S fill:#e3f2fd
    style T fill:#e3f2fd
    style U fill:#e3f2fd
    style V fill:#fce4ec
    style W fill:#fce4ec
    style X fill:#fce4ec
    style Y fill:#fce4ec
    style Z fill:#fce4ec
    style AA fill:#f3e5f5
```

---

## 8. 타임라인 및 마일스톤

### 프로젝트 일정

| 날짜 | 요일 | Phase | Task | 예상 시간 | 담당자 |
|------|------|-------|------|---------|--------|
| 2/11 | 수 | DB | DB-1 ~ DB-4 | 1일 | DB 관리자 |
| 2/12 | 목 | BE | BE-1 ~ BE-10 | 1일 | 백엔드 개발자 |
| 2/13 | 금 | FE | FE-1 ~ FE-7 | 4시간 (오전) | 프론트엔드 개발자 |
| 2/13 | 금 | TEST | TEST-1 ~ TEST-5 | 2시간 (오후) | QA + 보안 담당자 |
| 2/13 | 금 | DEPLOY | DEPLOY-1 | 1시간 (오후) | DevOps |

### 마일스톤

| 마일스톤 | 날짜 | 체크포인트 | 성공 기준 |
|---------|------|----------|---------|
| **Phase 1 완료** | 2/11 | DB 구축 완료 | 스키마 적용, 샘플 데이터 생성 |
| **Phase 2 완료** | 2/12 | 백엔드 API 완료 | 모든 엔드포인트 작동, 테스트 통과 |
| **Phase 3 완료** | 2/13 | 프론트엔드 완료 | 모든 UI 완성, 통합 테스트 준비 |
| **Phase 4 완료** | 2/13 | 전체 테스트 완료 | 모든 테스트 케이스 통과 |
| **프로젝트 완료** | 2/13 | 배포 준비 완료 | 프로덕션 배포 가능 상태 |

---

## 9. 위험 요소 및 대응 방안

| 위험 요소 | 영향도 | 확률 | 대응 방안 |
|---------|--------|------|---------|
| PostgreSQL 설치 오류 | 높음 | 중간 | Docker 사용으로 표준화, 사전 테스트 |
| 데이터베이스 연결 오류 | 높음 | 중간 | Connection Pool 설정 검증, timeout 테스트 |
| DAO 구현 미흡 | 높음 | 중간 | 단위 테스트 철저, 코드 리뷰 |
| API 응답 성능 저하 | 중간 | 중간 | 쿼리 최적화, 인덱스 추가 |
| 프론트엔드 호환성 문제 | 중간 | 낮음 | 다중 브라우저 테스트 |
| 보안 취약점 발견 | 높음 | 낮음 | 보안 검토, 즉시 패치 |
| 일정 지연 | 높음 | 중간 | 일일 스탠드업, 위험 조기 감지 |

---

## 10. 리소스 및 역할 정의

### 팀 구성
- **제품 매니저**: 전체 프로젝트 관리, 진도 추적
- **데이터베이스 관리자**: Phase 1 담당
- **백엔드 개발자** (1-2명): Phase 2 담당
- **프론트엔드 개발자** (1-2명): Phase 3 담당
- **QA 담당자**: Phase 4 담당
- **DevOps**: Phase 5 담당

### 필수 도구
- PostgreSQL 17
- Node.js >= 22.0.0
- npm >= 10.0.0
- Git
- VS Code (또는 선호하는 에디터)
- Postman (API 테스트)
- Docker (선택)

---

## 11. 성공 기준

### MVP 완료 기준
- [ ] 모든 데이터베이스 Task 완료 (DB-1 ~ DB-4)
- [ ] 모든 백엔드 Task 완료 (BE-1 ~ BE-10)
- [ ] 모든 프론트엔드 Task 완료 (FE-1 ~ FE-7)
- [ ] 모든 테스트 Task 통과 (TEST-1 ~ TEST-5)
- [ ] 배포 준비 완료 (DEPLOY-1)

### 품질 기준
- API 응답 시간: 평균 < 150ms
- 프론트엔드 로딩: < 2초
- 버그: Critical 0개, High 0개
- 모든 에러 메시지 한국어 제공
- 브라우저 호환성: Chrome, Firefox, Safari, Edge 모두 통과
- 반응형 UI: 375px, 768px, 1920px 모두 최적화

### 사용자 경험 기준
- 직관적인 UI/UX
- 명확한 피드백 (로딩, 에러, 성공)
- 접근성 개선 (키보드 네비게이션 등)
- 마감일 지연 시각적 알림

---

## 12. 체크리스트 (최종 검수용)

### 각 Phase별 완료 확인
- [ ] Phase 1: DB 구축 완료
- [ ] Phase 2: 백엔드 개발 완료
- [ ] Phase 3: 프론트엔드 개발 완료
- [ ] Phase 4: 테스트 완료
- [ ] Phase 5: 배포 준비 완료

### 전체 프로젝트 최종 체크
- [ ] 모든 Task 완료됨
- [ ] 모든 테스트 통과됨
- [ ] 문서 최종 검증 완료됨
- [ ] 코드 품질 기준 충족됨
- [ ] 보안 검증 완료됨
- [ ] 성능 기준 충족됨
- [ ] 배포 가능 상태 확인됨

---

## 13. 문서 및 참고 자료

### 관련 문서
- `docs/1-domain-definition.md` - 도메인 정의 및 비즈니스 규칙
- `docs/2-PRD.md` - 제품 요구사항 명세
- `docs/3-user-scenario.md` - 사용자 시나리오
- `docs/4-project-principle.md` - 프로젝트 원칙
- `docs/5-arch-diagram.md` - 아키텍처 다이어그램
- `docs/6-ERD.md` - 데이터베이스 ERD
- `database/schema.sql` - PostgreSQL DDL

### 기술 참고
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/17/
- Node.js pg 라이브러리: https://node-postgres.com/
- Express 공식 문서: https://expressjs.com/
- React 공식 문서: https://react.dev/
- Vite 공식 문서: https://vitejs.dev/

---

## 14. 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2026-02-11 | 마이그레이션 관점 실행계획 작성 | 제품 관리팀 |
| 2.0 | 2026-02-11 | 신규 개발 관점으로 전면 재작성 (PostgreSQL + Express + React) | 제품 관리팀 |
| 2.1 | 2026-02-11 | 일정 압축 (전체 일정을 2/11 당일 완료로 조정) | 제품 관리팀 |
| 2.2 | 2026-02-11 | 마감일 조정 (2/13으로 조정) | 제품 관리팀 |

---

**문서 완료 일시**: 2026-02-11
**예상 프로젝트 완료**: 2026-02-13
**최종 배포 가능**: 2026-02-13

