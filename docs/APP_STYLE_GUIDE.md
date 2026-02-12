# APP 스타일 가이드
## my-todolist 프로젝트

---

**버전**: 1.0
**작성일**: 2026-02-12
**기반 문서**: 8-wireframe.md
**디자인 시스템**: Google Calendar Material Design

---

## 목차

1. [컬러 팔레트](#1-컬러-팔레트)
2. [타이포그래피](#2-타이포그래피)
3. [간격 체계](#3-간격-체계)
4. [그림자](#4-그림자)
5. [둥근 모서리](#5-둥근-모서리)
6. [상태별 UI 변화](#6-상태별-ui-변화)
7. [접근성](#7-접근성)
8. [애니메이션](#8-애니메이션)
9. [디자인 토큰](#9-디자인-토큰)

---

## 1. 컬러 팔레트

> **디자인 참고**: Google Calendar Material Design 스타일 적용

### 1.1 Primary 컬러

| 용도 | 컬러 코드 | RGB | 용도 설명 |
|------|----------|-----|---------|
| Primary | #1a73e8 | rgb(26, 115, 232) | 주요 버튼, 링크, 선택 상태 |
| Primary Hover | #1557b0 | rgb(21, 87, 176) | 버튼 호버 상태 |
| Primary Active | #174ea6 | rgb(23, 78, 166) | 버튼 클릭 상태 |
| Primary Light | #e8f0fe | rgb(232, 240, 254) | 배경 강조 (연한 파랑) |
| Primary Dark | #0d47a1 | rgb(13, 71, 161) | 진한 강조 |

### 1.2 Semantic 컬러 (Google Material)

| 용도 | 컬러 코드 | RGB | 용도 설명 |
|------|----------|-----|---------|
| Success | #0f9d58 | rgb(15, 157, 88) | 성공 메시지, 완료 아이콘 (Google Green) |
| Success Light | #e6f4ea | rgb(230, 244, 234) | 성공 배경 |
| Warning | #f9ab00 | rgb(249, 171, 0) | 경고 메시지 (Google Yellow) |
| Warning Light | #fef7e0 | rgb(254, 247, 224) | 경고 배경 |
| Danger | #d93025 | rgb(217, 48, 37) | 에러 메시지, 삭제 버튼 (Google Red) |
| Danger Light | #fce8e6 | rgb(252, 232, 230) | 지연된 할일 배경 (연한 빨강) |
| Info | #039be5 | rgb(3, 155, 229) | 정보 메시지 (Google Light Blue) |
| Info Light | #e1f5fe | rgb(225, 245, 254) | 정보 배경 |
| Purple | #9334e6 | rgb(147, 52, 230) | 보조 강조색 (설날 연휴 등) |
| Purple Light | #f3e8fd | rgb(243, 232, 253) | 보조 배경 |

### 1.3 Neutral 컬러 (Google Material Gray)

| 용도 | 컬러 코드 | RGB | 용도 설명 |
|------|----------|-----|---------|
| Text Primary | #3c4043 | rgb(60, 64, 67) | 주요 텍스트 (Google Gray 900) |
| Text Secondary | #5f6368 | rgb(95, 99, 104) | 보조 텍스트 (Google Gray 700) |
| Text Tertiary | #80868b | rgb(128, 134, 139) | 비활성/힌트 텍스트 (Google Gray 600) |
| Text Muted | #9aa0a6 | rgb(154, 160, 166) | 완료/비활성 텍스트 (Google Gray 500) |
| Border | #dadce0 | rgb(218, 220, 224) | 기본 테두리 (Google Gray 300) |
| Border Light | #e8eaed | rgb(232, 234, 237) | 얇은 테두리 (Google Gray 200) |
| Background | #ffffff | rgb(255, 255, 255) | 기본 배경 |
| Background Gray | #f8f9fa | rgb(248, 249, 250) | 보조 배경 (Google Gray 100) |
| Background Dark | #f1f3f4 | rgb(241, 243, 244) | 컨테이너 배경 (Google Gray 50) |

### 1.4 상태별 컬러

| 상태 | 배경 | 텍스트 | 테두리 | 용도 |
|------|------|--------|--------|------|
| 일반 할일 | #ffffff | #3c4043 | #dadce0 | 미완료, 마감일 정상 |
| 지연 할일 | #fce8e6 | #d93025 | #f28b82 | 미완료, 마감일 지남 (연한 빨강) |
| 완료 할일 | #f8f9fa | #9aa0a6 | #e8eaed | 완료 상태 (회색) |
| 중요 할일 | #e8f0fe | #1a73e8 | #aecbfa | 우선순위 높음 (연한 파랑) |

### 1.5 이벤트/카테고리 컬러 (Google Calendar 스타일)

| 카테고리 | 컬러 코드 | 용도 |
|---------|----------|------|
| Red (빨강) | #d93025 | 긴급/중요 |
| Orange (주황) | #f6bf26 | 경고/주의 |
| Yellow (노랑) | #f9ab00 | 알림 |
| Green (초록) | #0f9d58 | 완료/성공 |
| Blue (파랑) | #039be5 | 일반/기본 |
| Purple (보라) | #9334e6 | 특별/이벤트 |
| Gray (회색) | #5f6368 | 비활성 |

---

## 2. 타이포그래피

### 2.1 폰트 패밀리

```css
body {
  font-family: 'Noto Sans KR', 'Apple SD Gothic Neo',
               'Malgun Gothic', sans-serif;
}
```

### 2.2 폰트 크기 체계

| 레벨 | 크기 | 용도 | 행간 | 굵기 |
|------|------|------|------|------|
| H1 | 32px | 페이지 제목 | 1.5 | 700 (Bold) |
| H2 | 24px | 섹션 제목 | 1.5 | 700 (Bold) |
| H3 | 20px | 카드 제목 | 1.4 | 600 (SemiBold) |
| Body Large | 18px | 할일 제목 | 1.6 | 600 (SemiBold) |
| Body | 16px | 본문 텍스트 | 1.6 | 400 (Regular) |
| Body Small | 14px | 보조 텍스트 | 1.5 | 400 (Regular) |
| Caption | 12px | 힌트, 라벨 | 1.4 | 400 (Regular) |

### 2.3 폰트 굵기

| 굵기 | 값 | 용도 |
|------|-----|------|
| Regular | 400 | 본문 텍스트 |
| Medium | 500 | 강조 텍스트 |
| SemiBold | 600 | 제목, 버튼 |
| Bold | 700 | 페이지 제목 |

### 2.4 타이포그래피 예시

**제목 (H1)**
```
할일 목록
- Font: Noto Sans KR
- Size: 32px
- Weight: 700
- Color: #333
- Line-height: 48px
```

**할일 제목 (Body Large)**
```
프로젝트 기획서 작성
- Font: Noto Sans KR
- Size: 18px
- Weight: 600
- Color: #333
- Line-height: 28px
```

**마감일 (Body Small)**
```
마감일: 2026-02-15
- Font: Noto Sans KR
- Size: 14px
- Weight: 400
- Color: #666
- Line-height: 21px
```

**힌트 텍스트 (Caption)**
```
4~20자, 영문/숫자만
- Font: Noto Sans KR
- Size: 12px
- Weight: 400
- Color: #999
- Line-height: 18px
```

### 2.5 반응형 폰트 크기

| 요소 | 모바일 | 태블릿 | 데스크톱 |
|------|--------|--------|---------|
| 제목 (H1) | 24px | 28px | 32px |
| 할일 제목 | 16px | 18px | 18px |
| 본문 텍스트 | 14px | 14px | 16px |
| 힌트 텍스트 | 12px | 12px | 14px |
| 버튼 텍스트 | 14px | 14px | 16px |

---

## 3. 간격 체계

### 3.1 패딩 (Padding)

| 사이즈 | 값 | 용도 |
|--------|-----|------|
| XS | 4px | 아이콘 주변 |
| SM | 8px | 작은 요소 |
| MD | 16px | 기본 패딩 |
| LG | 24px | 카드 내부 |
| XL | 32px | 섹션 패딩 |
| XXL | 48px | 페이지 여백 |

### 3.2 마진 (Margin)

| 사이즈 | 값 | 용도 |
|--------|-----|------|
| XS | 4px | 인라인 요소 간격 |
| SM | 8px | 작은 요소 간격 |
| MD | 16px | 기본 간격 |
| LG | 24px | 카드 간격 |
| XL | 32px | 섹션 간격 |
| XXL | 48px | 페이지 간격 |

### 3.3 간격 예시

**할일 카드 간격**
```
[카드 1]
   ↓ 16px (LG)
[카드 2]
   ↓ 16px (LG)
[카드 3]
```

**버튼 간격**
```
[취소] ← 8px (SM) → [추가하기]
```

**입력 필드 간격**
```
아이디
[_______]
   ↓ 16px (MD)
비밀번호
[_______]
```

---

## 4. 그림자

### 4.1 카드 그림자

| 레벨 | 값 | 용도 |
|------|-----|------|
| Level 1 | 0 1px 3px rgba(0,0,0,0.1) | 기본 카드 |
| Level 2 | 0 2px 6px rgba(0,0,0,0.15) | 호버 카드 |
| Level 3 | 0 4px 12px rgba(0,0,0,0.2) | 모달 |
| Level 4 | 0 8px 24px rgba(0,0,0,0.25) | 드롭다운 |

### 4.2 그림자 예시

**일반 카드**
```css
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

**호버 시 카드**
```css
box-shadow: 0 2px 6px rgba(0,0,0,0.15);
transition: box-shadow 0.3s ease;
```

**모달**
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.2);
```

---

## 5. 둥근 모서리

### 5.1 Border Radius

| 사이즈 | 값 | 용도 |
|--------|-----|------|
| SM | 4px | 버튼, 입력 필드 |
| MD | 8px | 카드, 모달 |
| LG | 12px | 큰 컨테이너 |
| Round | 50% | 원형 아이콘 |

---

## 6. 상태별 UI 변화

### 6.1 입력 필드 상태

#### 6.1.1 기본 상태
```
- 테두리: #ddd (회색)
- 배경: 흰색
```

#### 6.1.2 Focus 상태
```
- 테두리: #007bff (파란색)
- 테두리 두께: 2px
- 그림자: 0 0 0 3px rgba(0,123,255,0.25)
```

#### 6.1.3 Error 상태
```
- 테두리: #dc3545 (빨간색)
- 배경: #fff5f5 (연한 빨간색)
- 에러 메시지: #dc3545
```

#### 6.1.4 Success 상태
```
- 테두리: #28a745 (초록색)
- 성공 메시지: #28a745
```

#### 6.1.5 Disabled 상태
```
- 테두리: #e0e0e0
- 배경: #f5f5f5
- 텍스트: #999 (회색)
- 커서: not-allowed
```

### 6.2 버튼 상태

#### 6.2.1 기본 버튼 (Primary)

**Normal**
```
- 배경: #007bff
- 텍스트: 흰색
- 테두리: 없음
```

**Hover**
```
- 배경: #0056b3
- 커서: pointer
```

**Active (클릭 중)**
```
- 배경: #004085
- 그림자: inset 0 3px 5px rgba(0,0,0,0.125)
```

**Loading**
```
- 배경: #0056b3
- 스피너 표시
- 커서: wait
- 클릭 비활성화
```

**Disabled**
```
- 배경: #cccccc
- 텍스트: #999
- 커서: not-allowed
```

#### 6.2.2 보조 버튼 (Secondary)

**Normal**
```
- 배경: 투명
- 텍스트: #6c757d
- 테두리: 1px solid #6c757d
```

**Hover**
```
- 배경: #6c757d
- 텍스트: 흰색
```

#### 6.2.3 위험 버튼 (Danger)

**Normal**
```
- 배경: #dc3545
- 텍스트: 흰색
```

**Hover**
```
- 배경: #c82333
```

### 6.3 할일 카드 상태별 스타일

**일반 할일 (미완료, 마감일 정상)**
```
- 배경색: 흰색 (#ffffff)
- 테두리: 회색 (#ddd)
- 텍스트: 검은색 (#333)
```

**지연된 할일 (미완료, 마감일 지남)**
```
- 배경색: 빨간색 (#ffebee)
- 테두리: 빨간색 (#f44336)
- 텍스트: 검은색 (#333)
- 아이콘: 경고 아이콘 표시 (⚠️)
- 마감일 텍스트: 빨간색
```

**완료된 할일**
```
- 배경색: 연한 회색 (#f5f5f5)
- 테두리: 회색 (#ddd)
- 텍스트: 회색 (#999)
- 취소선: 제목에 적용
- 체크 아이콘: ☑ 표시
```

---

## 7. 접근성

### 7.1 색상 대비 (WCAG AA 수준)

| 조합 | 대비율 | 기준 | 통과 |
|------|--------|------|------|
| #333 on #fff | 12.63:1 | 4.5:1 | ✓ |
| #666 on #fff | 5.74:1 | 4.5:1 | ✓ |
| #007bff on #fff | 4.56:1 | 4.5:1 | ✓ |
| #fff on #007bff | 4.56:1 | 4.5:1 | ✓ |
| #fff on #dc3545 | 5.48:1 | 4.5:1 | ✓ |
| #333 on #ffebee | 11.02:1 | 4.5:1 | ✓ |

### 7.2 키보드 네비게이션

#### 7.2.1 키보드 단축키

| 키 | 동작 |
|-----|------|
| Tab | 다음 요소로 이동 |
| Shift + Tab | 이전 요소로 이동 |
| Enter | 버튼 클릭, 링크 이동 |
| Space | 체크박스 토글 |
| Escape | 모달 닫기 |

#### 7.2.2 Focus 표시

모든 인터랙티브 요소는 Focus 시 명확한 시각적 표시:

```css
- outline: 2px solid #007bff
- outline-offset: 2px
```

### 7.3 모바일 접근성

#### 7.3.1 터치 영역
- 최소 크기: 44x44px
- 터치 요소 간 간격: 최소 8px

#### 7.3.2 확대/축소
- 최대 200% 확대 가능
- 텍스트 리플로우 지원

---

## 8. 애니메이션

### 8.1 페이지 전환 애니메이션

#### 8.1.1 페이드 인
```
opacity: 0 → 1
duration: 0.3s
easing: ease-in-out
```

#### 8.1.2 슬라이드 업
```
transform: translateY(20px) → translateY(0)
opacity: 0 → 1
duration: 0.4s
easing: ease-out
```

### 8.2 모달 애니메이션

#### 8.2.1 모달 열기
```
배경 오버레이:
  opacity: 0 → 0.5
  duration: 0.3s

모달 컨테이너:
  transform: scale(0.9) → scale(1)
  opacity: 0 → 1
  duration: 0.3s
  easing: ease-out
```

#### 8.2.2 모달 닫기
```
배경 오버레이:
  opacity: 0.5 → 0
  duration: 0.2s

모달 컨테이너:
  transform: scale(1) → scale(0.9)
  opacity: 1 → 0
  duration: 0.2s
  easing: ease-in
```

### 8.3 버튼 인터랙션

#### 8.3.1 호버 전환
```css
background-color: 0.2s ease;
transform: 0.2s ease;
box-shadow: 0.2s ease;
```

#### 8.3.2 클릭 효과 (Ripple)
```
1. 클릭 지점에서 원형 확산
2. opacity: 0.3 → 0
3. scale: 0 → 2
4. duration: 0.6s
```

### 8.4 할일 카드 애니메이션

#### 8.4.1 카드 추가
```
1. 새 카드가 리스트 상단에 삽입
2. transform: translateY(-20px) → translateY(0)
3. opacity: 0 → 1
4. duration: 0.4s
5. 기존 카드들은 아래로 슬라이드
```

#### 8.4.2 카드 삭제
```
1. transform: translateX(-100%)
2. opacity: 1 → 0
3. max-height: current → 0
4. duration: 0.3s
5. 하위 카드들이 위로 슬라이드
```

#### 8.4.3 완료 처리 애니메이션
```
1. 체크박스 체크 (0.2s)
2. 취소선 좌→우 애니메이션 (0.3s)
3. 텍스트 색상 fade (0.3s)
4. 카드 배경색 변경 (0.3s)
```

### 8.5 체크박스 애니메이션

#### 8.5.1 미완료 → 완료
```
[ ] → [○] → [☑]
     (0.1초)  (0.2초)

애니메이션:
1. 클릭 시 체크박스가 살짝 커짐 (scale 1.1)
2. 체크 아이콘 페이드 인
3. 할일 텍스트에 취소선 애니메이션 (좌→우)
4. 텍스트 색상 페이드 아웃 (회색으로)
```

#### 8.5.2 완료 → 미완료
```
[☑] → [○] → [ ]
     (0.1초)  (0.2초)

애니메이션:
1. 클릭 시 체크박스가 살짝 작아짐 (scale 0.9)
2. 체크 아이콘 페이드 아웃
3. 취소선 제거 애니메이션
4. 텍스트 색상 복원 (검은색으로)
```

### 8.6 토스트 애니메이션

#### 8.6.1 토스트 표시
```
1. transform: translateY(-100%) → translateY(0)
2. opacity: 0 → 1
3. duration: 0.3s
4. easing: ease-out
```

#### 8.6.2 토스트 사라짐
```
1. 3초 대기
2. opacity: 1 → 0
3. transform: translateY(0) → translateY(-20px)
4. duration: 0.3s
5. easing: ease-in
```

---

## 9. 디자인 토큰

### 9.1 JSON 형식

```json
{
  "colors": {
    "primary": "#007bff",
    "success": "#28a745",
    "danger": "#dc3545",
    "warning": "#ffc107",
    "text": "#333333",
    "textSecondary": "#666666",
    "background": "#ffffff",
    "border": "#dddddd"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "xxl": "48px"
  },
  "fontSize": {
    "h1": "32px",
    "h2": "24px",
    "body": "16px",
    "bodySmall": "14px",
    "caption": "12px"
  },
  "fontWeight": {
    "regular": 400,
    "medium": 500,
    "semibold": 600,
    "bold": 700
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  },
  "shadow": {
    "card": "0 1px 3px rgba(0,0,0,0.1)",
    "cardHover": "0 2px 6px rgba(0,0,0,0.15)",
    "modal": "0 4px 12px rgba(0,0,0,0.2)"
  },
  "animation": {
    "duration": {
      "fast": "0.2s",
      "normal": "0.3s",
      "slow": "0.4s"
    },
    "easing": {
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out"
    }
  }
}
```

### 9.2 CSS 변수

```css
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-background: #ffffff;
  --color-border: #dddddd;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-xxl: 48px;

  /* Font Size */
  --font-size-h1: 32px;
  --font-size-h2: 24px;
  --font-size-body: 16px;
  --font-size-body-small: 14px;
  --font-size-caption: 12px;

  /* Font Weight */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Border Radius */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;

  /* Shadow */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-card-hover: 0 2px 6px rgba(0,0,0,0.15);
  --shadow-modal: 0 4px 12px rgba(0,0,0,0.2);

  /* Animation */
  --animation-duration-fast: 0.2s;
  --animation-duration-normal: 0.3s;
  --animation-duration-slow: 0.4s;
}
```

---

## 10. 반응형 브레이크포인트

### 10.1 브레이크포인트 정의

| 디바이스 | 화면 너비 | 컨테이너 최대 너비 | 레이아웃 변화 |
|---------|----------|------------------|-------------|
| 모바일 (XS) | < 576px | 100% | 세로 스택, 한 줄에 하나 |
| 태블릿 (SM) | 576px ~ 768px | 540px | 여백 증가, 폰트 크기 조정 |
| 태블릿 (MD) | 768px ~ 992px | 720px | 2열 가능 |
| 데스크톱 (LG) | 992px ~ 1200px | 960px | 넓은 레이아웃 |
| 데스크톱 (XL) | ≥ 1200px | 1140px | 최대 너비 제한 |

---

## 부록: 적용 예시

### A. 버튼 컴포넌트 스타일

```css
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  transition: background-color var(--animation-duration-fast) ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-primary:active {
  background-color: #004085;
  box-shadow: inset 0 3px 5px rgba(0,0,0,0.125);
}

.btn-primary:disabled {
  background-color: #cccccc;
  color: #999;
  cursor: not-allowed;
}
```

### B. 카드 컴포넌트 스타일

```css
.todo-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--animation-duration-normal) ease,
              transform var(--animation-duration-normal) ease;
}

.todo-card:hover {
  box-shadow: var(--shadow-card-hover);
  transform: translateY(-2px);
}

.todo-card.overdue {
  background-color: #ffebee;
  border-color: #f44336;
}

.todo-card.completed {
  background-color: #f5f5f5;
  color: #999;
}
```

---

**문서 작성 완료**

이 스타일 가이드는 8-wireframe.md를 기반으로 작성되었으며, 일관된 UI/UX 구현을 위한 디자인 시스템 문서입니다.
