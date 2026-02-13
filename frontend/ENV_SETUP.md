# 프론트엔드 환경변수 설정 가이드

## 로컬 개발 환경

### 1. 환경변수 파일 확인

프로젝트에 `.env` 파일이 이미 설정되어 있습니다:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:3000/api

# Frontend Configuration
VITE_FRONTEND_URL=http://localhost:5173
```

### 2. 개발 서버 실행

```bash
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행되며, 백엔드 API는 `http://localhost:3000/api`에 연결됩니다.

---

## 프로덕션 배포 (Vercel)

### Vercel 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

1. **Vercel 프로젝트 대시보드** 접속
2. **Settings** → **Environment Variables** 메뉴 이동
3. 다음 환경변수 추가:

| 변수명 | 값 예시 | 설명 |
|--------|---------|------|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` | 백엔드 API 주소 |
| `VITE_FRONTEND_URL` | `https://your-frontend.vercel.app` | 프론트엔드 주소 |

4. **Environment**: `Production`, `Preview`, `Development` 모두 선택
5. **Save** 클릭

### 배포 후 확인

배포가 완료되면:
1. 프론트엔드 URL 접속
2. 개발자 도구 (F12) → Network 탭에서 API 요청 확인
3. 백엔드 API와 정상적으로 통신하는지 확인

---

## 로컬에서 프로덕션 빌드 테스트

로컬에서 프로덕션 빌드를 테스트하려면:

### 1. `.env.production` 파일 생성

`.env.production.example`을 복사하여 `.env.production` 생성:

```bash
cp .env.production.example .env.production
```

### 2. 실제 프로덕션 URL로 수정

```env
VITE_API_URL=https://your-actual-backend.vercel.app/api
VITE_FRONTEND_URL=https://your-actual-frontend.vercel.app
```

### 3. 프로덕션 빌드 및 미리보기

```bash
npm run build
npm run preview
```

---

## 환경변수 참고사항

### Vite 환경변수 규칙

- 환경변수는 **반드시 `VITE_` 접두사**로 시작해야 합니다
- 코드에서 `import.meta.env.VITE_API_URL` 형식으로 접근합니다
- 빌드 시점에 환경변수가 번들에 포함됩니다 (런타임 변경 불가)

### 보안 주의사항

- `.env` 파일은 git에 커밋되지 않습니다 (`.gitignore`에 포함)
- **민감한 정보(API 키, 비밀번호 등)는 환경변수에 포함하지 마세요**
- 프론트엔드 환경변수는 클라이언트에 노출되므로 공개 정보만 포함하세요

### 환경변수 우선순위

1. `.env.production` (프로덕션 빌드 시)
2. `.env.development` (개발 서버 실행 시)
3. `.env` (공통 설정)

---

## 문제 해결

### API 연결 실패

**증상**: 로그인/회원가입 시 네트워크 에러 발생

**해결**:
1. 백엔드 서버가 실행 중인지 확인
2. `VITE_API_URL`이 올바른 주소인지 확인
3. CORS 설정 확인 (백엔드에서 프론트엔드 URL 허용 필요)

### 환경변수 변경이 반영되지 않음

**해결**:
1. 개발 서버 재시작 (`Ctrl+C` 후 `npm run dev` 재실행)
2. 브라우저 캐시 삭제 (Hard Refresh: `Ctrl+Shift+R`)

### Vercel 배포 시 환경변수 누락

**해결**:
1. Vercel 대시보드에서 환경변수 설정 확인
2. 재배포 (Settings → Deployments → Redeploy)
