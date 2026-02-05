# Project-K AI - 제품 요구사항 문서 (PRD)
## 개발 생산성을 향상시키는 GitHub Action

**작성일**: 2026년 2월 5일  
**버전**: 1.0  
**팀**: 4명 × 10시간 = 40인시

---

# 목차

| # | 섹션 |
|---|------|
| 1 | [요약](#1-요약) |
| 2 | [문제 정의](#2-문제-정의) |
| 3 | [솔루션](#3-솔루션) |
| 4 | [기능 명세](#4-기능-명세) |
| 5 | [기술 명세](#5-기술-명세) |
| 6 | [개발 계획](#6-개발-계획) |
| 7 | [성공 지표](#7-성공-지표) |
| 8 | [Andrej Karpathy 리뷰](#8-andrej-karpathy-리뷰) |
| 9 | [Kent Beck 리뷰](#9-kent-beck-리뷰) |
| 10 | [최종 평가 및 개선 제안](#10-최종-평가-및-개선-제안) |

---

# 1. 요약

## 1.1 제품 개요

| 항목 | 내용 |
|------|------|
| **제품명** | Project-K AI |
| **카테고리** | GitHub Action (개발자 도구) |
| **타겟** | 소프트웨어 개발팀 |
| **가치 제안** | PR 생성부터 머지까지 시간을 87% 단축 |

## 1.2 3가지 핵심 기능

```
┌─────────────────────────────────────────────────────────────┐
│                      Project-K AI                              │
├─────────────────────────────────────────────────────────────┤
│  1️⃣ 복잡도 체커       CC ≤ 10, CoC ≤ 15 자동 검증           │
│  2️⃣ AI 코드 리뷰      Claude/GPT 기반 자동 리뷰             │
│  3️⃣ 커밋 메시지 AI    diff → 의미 있는 메시지 생성          │
└─────────────────────────────────────────────────────────────┘
```

## 1.3 해커톤 테마와의 정합성

> **테마**: 「価値あるプロダクトを早く届ける」 (가치 있는 프로덕트를 빠르게 전달)  
> **과제**: 「プロダクトの開発生産性を向上させる、なにかしらのモノ・仕組み」 (개발 생산성 향상)

**Project-K AI의 답변**:
- PR 리뷰 대기 시간: 4시간 → 30분 (**87% 단축**)
- 코드 품질 문제 조기 발견: 머지 전 자동 감지
- 개발자 경험 향상: 귀찮은 작업 자동화

---

# 2. 문제 정의

## 2.1 현재의 문제점

### 문제 1: PR 리뷰 지연

```
현재 상황:
├── 리뷰어 배정까지: 평균 2시간
├── 첫 번째 코멘트까지: 평균 4시간
├── 승인까지: 평균 8시간
└── 머지까지: 평균 12시간

문제점:
├── 개발자의 컨텍스트 스위칭 증가
├── 피드백 루프 지연
└── 배포 빈도 저하
```

### 문제 2: 복잡한 코드의 머지

```
현재 상황:
├── 복잡도가 높은 함수가 리뷰를 통과
├── 나중에 "기술 부채"로 쌓임
└── 유지보수 비용 증가

문제점:
├── 순환 복잡도 > 10인 함수 양산
├── 인지 복잡도 > 15로 가독성 저하
└── 테스트하기 어려운 코드 증가
```

### 문제 3: 의미 없는 커밋 메시지

```
실제 커밋 이력:
├── "fix"
├── "update"
├── "wip"
├── "asdf"
└── "final final v2"

문제점:
├── 변경 이력 추적 어려움
├── 릴리즈 노트 작성 공수 증가
└── 팀 간 커뮤니케이션 방해
```

## 2.2 타겟 사용자

| 페르소나 | 문제점 | Project-K AI의 가치 |
|---------|--------|------------------|
| **주니어 개발자** | 리뷰 대기로 블로킹 | 즉시 AI 피드백 획득 |
| **시니어 개발자** | 리뷰 공수가 많음 | AI가 1차 스크리닝 |
| **테크 리드** | 코드 품질 유지 | 복잡도 자동 게이트 |
| **프로젝트 매니저** | 딜리버리 속도 | PR 사이클 타임 단축 |

---

# 3. 솔루션

## 3.1 제품 컨셉

**"PR을 생성하는 순간, 3가지 가치를 자동 제공"**

```
개발자가 PR 생성
       │
       ▼
┌─────────────────────────────────────────┐
│           Project-K AI 실행               │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │복잡도   │ │AI 리뷰  │ │커밋     │   │
│  │체크     │ │         │ │메시지   │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│       │          │          │         │
│       ▼          ▼          ▼         │
│  ┌─────────────────────────────────┐   │
│  │      통합 코멘트 게시           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
       │
       ▼
개발자가 바로 개선 액션
```

## 3.2 차별화 포인트

| 기존 도구 | Project-K AI |
|-----------|------------|
| 복잡도 체크만 | 복잡도 + AI 리뷰 + 메시지 생성 |
| 설정이 복잡함 | 제로 컨피그로 즉시 사용 |
| 영어만 지원 | 일본어/한국어 지원 |
| 유료 SaaS | 오픈소스, 무료 |
| 유료 AI API 필수 | **Google Gemini 무료 티어 지원** |

## 3.3 💡 비용 제로 전략: Google Gemini 무료 티어

### 왜 Gemini 무료 티어인가?

> **해커톤 팀의 현실**: API 키 비용 부담 없이 AI 기능을 구현하고 싶다

Project-K AI는 **Google Gemini API 무료 티어**를 기본 옵션으로 지원하여, 개발팀이 **비용 부담 없이** AI 코드 리뷰를 도입할 수 있습니다.

### Gemini 무료 티어 스펙 (2026년 1월 기준)

| 항목 | 무료 티어 제한 |
|------|---------------|
| **요청 수** | 5-15 RPM (모델별 상이) |
| **토큰** | 250,000 TPM (분당 토큰) |
| **일일 제한** | 1,000 요청/일 |
| **컨텍스트 윈도우** | **1M 토큰** (ChatGPT의 8배!) |
| **신용카드** | ❌ 필요 없음 |
| **지원 모델** | **Gemini 3.0 Pro Preview**, Gemini 2.5 Pro, 2.5 Flash |

### Project-K AI에서의 활용

```
┌─────────────────────────────────────────────────────────────┐
│                    무료 티어로 충분한 이유                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 일반적인 PR 분석                                         │
│  ├── 평균 diff 크기: ~5,000 토큰                            │
│  ├── 프롬프트 + 응답: ~10,000 토큰                          │
│  └── 하루 100개 PR 처리 가능 (무료!)                        │
│                                                              │
│  💡 1M 컨텍스트 윈도우의 장점                                │
│  ├── 대형 PR도 분할 없이 전체 분석 가능                      │
│  ├── 프로젝트 컨텍스트 포함 가능                             │
│  └── 더 정확한 리뷰 결과                                    │
│                                                              │
│  🚀 Gemini 3.0의 장점                                       │
│  ├── 최신 모델로 더 정확한 코드 이해                         │
│  ├── 향상된 추론 능력                                       │
│  └── 무료 Preview 접근 가능                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 비용 비교

| 프로바이더 | 무료 티어 | 유료 가격 (1M 토큰) |
|-----------|----------|-------------------|
| **Google Gemini 3.0 Pro** ⭐ | ✅ Preview 무료 | $2.00 입력 / $8.00 출력 |
| **Google Gemini 2.5 Flash** | ✅ 1,000요청/일 무료 | $0.10 입력 / $0.40 출력 |
| OpenAI GPT-4o | ❌ 없음 | $2.50 입력 / $10.00 출력 |
| Anthropic Claude 3.5 | ❌ 없음 | $3.00 입력 / $15.00 출력 |

### 권장 설정

```yaml
# 🚀 최신 모델 설정 (Gemini 3.0 - 권장)
ai-provider: 'gemini'
ai-model: 'gemini-3.0-pro'      # 최신 모델, Preview 무료
ai-api-key: ${{ secrets.GEMINI_API_KEY }}

# ⚡ 속도 우선 설정 (Gemini 2.5 Flash)
ai-provider: 'gemini'
ai-model: 'gemini-2.5-flash'    # 가장 빠름, 무료 티어 활용
```

### API 키 발급 방법 (5분 이내)

```
1. Google AI Studio 접속
   https://aistudio.google.com/

2. Google 계정 로그인

3. "Get API Key" 클릭

4. 무료 API 키 발급 완료!
   (신용카드 등록 불필요)

5. GitHub Secrets에 등록
   Settings → Secrets → GEMINI_API_KEY
```

---

# 4. 기능 명세

## 4.1 기능 1: 복잡도 체커

### 개요

| 항목 | 내용 |
|------|------|
| **트리거** | PR 생성/업데이트 시 (자동) |
| **분석 대상** | 변경된 파일 (.ts, .js, .tsx, .jsx) |
| **규칙** | CC ≤ 10, CoC ≤ 15 |
| **출력** | PR 코멘트 |

### 출력 예시

```markdown
## 🔍 복잡도 체크 결과

### 요약
| 지표 | 임계값 | 결과 | 상태 |
|------|--------|------|------|
| 순환 복잡도 | ≤ 10 | 최대: 8 | ✅ 통과 |
| 인지 복잡도 | ≤ 15 | 최대: 12 | ✅ 통과 |

### 상세
✅ 5개 파일 모두 복잡도 검사 통과

<details>
<summary>📊 파일별 상세</summary>

| 파일 | CC | CoC |
|------|-----|-----|
| src/api/handler.ts | 8 | 12 |
| src/utils/parser.ts | 6 | 9 |
| src/services/auth.ts | 4 | 7 |

</details>
```

### 실패 시 출력

```markdown
## 🔍 복잡도 체크 결과

### 요약
| 지표 | 임계값 | 결과 | 상태 |
|------|--------|------|------|
| 순환 복잡도 | ≤ 10 | 최대: 14 | ❌ 실패 |
| 인지 복잡도 | ≤ 15 | 최대: 22 | ❌ 실패 |

### ❌ 발견된 문제

#### `src/services/dataProcessor.ts`

| 라인 | 함수 | CC | CoC | 문제 |
|------|------|-----|-----|------|
| 42 | `processUserData()` | 14 | 22 | 둘 다 초과 |
| 89 | `validateInput()` | 11 | 18 | 둘 다 초과 |

### 💡 리팩토링 제안

**`processUserData()` (라인 42)**
```typescript
// ❌ 현재: 중첩 조건문 (CC=14, CoC=22)
function processUserData(data) {
  if (data) {
    if (data.type === 'premium') {
      if (data.status === 'active') {
        // 깊은 중첩...
      }
    }
  }
}

// ✅ 제안: 가드 절 + 함수 추출
function processUserData(data) {
  if (!data) return { error: 'No data' };
  if (!isPremiumActive(data)) return { error: 'Not eligible' };
  
  return processPremiumUser(data);
}
```
```

---

## 4.2 기능 2: AI 코드 리뷰

### 개요

| 항목 | 내용 |
|------|------|
| **트리거** | PR 생성/업데이트 시 (자동) |
| **AI** | Claude 3.5 Sonnet / GPT-4 |
| **리뷰 관점** | 보안, 성능, 베스트 프랙티스 |
| **출력** | PR 코멘트 |

### AI 프롬프트 설계

```
당신은 경험이 풍부한 시니어 엔지니어입니다.
아래 코드 변경사항을 리뷰해 주세요.

## 리뷰 관점
1. 보안 취약점 (SQL 인젝션, XSS, 인증 누락 등)
2. 성능 문제 (N+1 쿼리, 불필요한 리렌더링 등)
3. 에러 핸들링 부족
4. 코드 중복
5. 네이밍 규칙 위반

## 출력 형식
각 문제에 대해:
- 🔴 Critical / 🟡 Warning / 🔵 Info
- 해당 파일 및 라인 번호
- 문제 설명
- 수정 제안

## 제약
- 최대 5개 지적으로 제한 (중요도 순)
- 건설적인 피드백만
- 한국어로 출력
```

### 출력 예시

```markdown
## 🤖 AI 코드 리뷰

### 지적 사항 (3건)

#### 🔴 Critical: SQL 인젝션 가능성
**파일**: `src/db/queries.ts:28`

```typescript
// ❌ 현재 코드
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 수정 제안
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.execute(query, [userId]);
```

---

#### 🟡 Warning: 처리되지 않은 Promise rejection
**파일**: `src/api/handler.ts:45`

```typescript
// ❌ 현재 코드
async function fetchData() {
  const data = await api.get('/data'); // 에러 시 예외
  return data;
}

// ✅ 수정 제안
async function fetchData() {
  try {
    const data = await api.get('/data');
    return { success: true, data };
  } catch (error) {
    console.error('Fetch failed:', error);
    return { success: false, error };
  }
}
```

---

#### 🔵 Info: 매직 넘버 사용
**파일**: `src/utils/calc.ts:12`

```typescript
// ❌ 현재 코드
if (retryCount > 3) { ... }

// ✅ 수정 제안
const MAX_RETRY_COUNT = 3;
if (retryCount > MAX_RETRY_COUNT) { ... }
```
```

---

## 4.3 기능 3: 커밋 메시지 AI 생성

### 개요

| 항목 | 내용 |
|------|------|
| **트리거** | PR 코멘트에서 `/suggest-commit` |
| **입력** | PR 내 모든 커밋의 diff |
| **출력** | Conventional Commits 형식의 메시지 제안 |

### 사용 방법

```markdown
개발자가 PR에 코멘트:
> /suggest-commit

Project-K AI가 답변:
> ## 📝 커밋 메시지 제안
>
> 이 PR의 변경사항을 기반으로 커밋 메시지를 제안합니다:
>
> ### 옵션 1 (권장)
> ```
> feat(auth): JWT 토큰 갱신 메커니즘 추가
>
> - 만료 전 자동 토큰 갱신 구현
> - 보안 쿠키에 리프레시 토큰 저장
> - 갱신 실패 시 재시도 로직 포함
> ```
>
> ### 옵션 2
> ```
> feat(auth): 보안 저장소를 활용한 토큰 갱신 구현
> ```
>
> ### 옵션 3
> ```
> add jwt refresh feature
> ```
```

---

# 5. 기술 명세

## 5.1 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                                                              │
│  PR 생성/업데이트                                            │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              GitHub Actions Workflow                     │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────────────┐   │ │
│  │  │              Project-K AI Action                    │   │ │
│  │  │                                                   │   │ │
│  │  │  1. 코드 체크아웃                                 │   │ │
│  │  │  2. 변경 파일 목록 조회                           │   │ │
│  │  │  3. 복잡도 검사 (ESLint + SonarJS)               │   │ │
│  │  │  4. AI API 호출 (Claude/GPT)                     │   │ │
│  │  │  5. 커밋 메시지 제안 생성                         │   │ │
│  │  │  6. PR에 코멘트 게시                              │   │ │
│  │  │                                                   │   │ │
│  │  └──────────────────────────────────────────────────┘   │ │
│  │                          │                               │ │
│  │                          ▼                               │ │
│  │                 ┌─────────────┐                          │ │
│  │                 │ PR 코멘트   │                          │ │
│  │                 └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 5.2 기술 스택

```yaml
Runtime: Node.js 20
Language: TypeScript 5.x
Linting: ESLint + eslint-plugin-sonarjs
AI API: 
  - Google Gemini 3.0 Pro (무료 Preview) ⭐ 권장
  - Google Gemini 2.5 Flash (무료 티어)
  - Anthropic Claude API (옵션)
  - OpenAI API (옵션)
GitHub: @actions/core, @actions/github
Testing: Vitest
Build: esbuild
```

### AI 프로바이더 비교

| 프로바이더 | 무료 티어 | 장점 | 단점 |
|-----------|----------|------|------|
| **Gemini 3.0 Pro** ⭐ | ✅ Preview 무료 | 최신 모델, 높은 정확도, 무료 | Preview 단계 |
| **Gemini 2.5 Flash** | ✅ 1,000요청/일 | 빠름, 무료, 1M 컨텍스트 | 3.0보다 정확도 낮음 |
| Claude 3.5 Sonnet | ❌ | 높은 정확도 | 유료 필수 |
| GPT-4o | ❌ | 널리 사용됨 | 유료 필수 |

## 5.3 프로젝트 구조

```
Project-K/
├── action.yml                    # Action 정의
├── src/
│   ├── index.ts                  # 진입점
│   ├── complexity/
│   │   ├── checker.ts            # 복잡도 분석
│   │   ├── eslint-config.ts      # ESLint 설정
│   │   └── reporter.ts           # 결과 포맷
│   ├── ai-review/
│   │   ├── reviewer.ts           # AI 리뷰 실행
│   │   ├── prompts.ts            # 프롬프트 템플릿
│   │   └── claude-client.ts      # Claude API 클라이언트
│   ├── commit-message/
│   │   ├── generator.ts          # 메시지 생성
│   │   └── conventional.ts       # Conventional Commits 파서
│   ├── github/
│   │   ├── pr.ts                 # PR 정보 조회
│   │   ├── diff.ts               # diff 조회
│   │   └── comment.ts            # 코멘트 게시
│   └── utils/
│       ├── logger.ts             # 로깅
│       └── config.ts             # 설정 관리
├── __tests__/
│   ├── complexity.test.ts
│   ├── ai-review.test.ts
│   └── commit-message.test.ts
├── .eslintrc.js
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

## 5.4 복잡도 제약 (자체 적용)

**Project-K AI 자체 코드도 복잡도 제약 준수**:

| 파일 | CC 상한 | CoC 상한 |
|------|--------|---------|
| 모든 .ts 파일 | ≤ 10 | ≤ 15 |
| 함수당 라인 수 | ≤ 50 | - |
| 중첩 깊이 | ≤ 3 | - |

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['sonarjs'],
  rules: {
    'complexity': ['error', { max: 10 }],
    'sonarjs/cognitive-complexity': ['error', 15],
    'max-depth': ['error', 3],
    'max-lines-per-function': ['error', 50],
  }
};
```

## 5.5 API 설계

### action.yml

```yaml
name: 'Project-K AI'
description: 'PR 복잡도 자동 검사, AI 코드 리뷰, 커밋 메시지 제안'
author: 'Your Team'

inputs:
  github-token:
    description: 'PR 코멘트용 GitHub 토큰'
    required: true
  ai-provider:
    description: 'AI 프로바이더 (gemini, claude, openai)'
    required: false
    default: 'gemini'  # 무료 티어 활용을 위해 기본값 변경
  ai-model:
    description: 'AI 모델 (gemini-3.0-pro, gemini-2.5-flash, claude-3.5-sonnet, gpt-4o)'
    required: false
    default: 'gemini-3.0-pro'  # 최신 모델, Preview 무료
  ai-api-key:
    description: 'AI 프로바이더 API 키 (Gemini는 무료 발급 가능)'
    required: true
  complexity-cc-threshold:
    description: '순환 복잡도 임계값'
    required: false
    default: '10'
  complexity-coc-threshold:
    description: '인지 복잡도 임계값'
    required: false
    default: '15'
  language:
    description: '출력 언어 (en, ja, ko)'
    required: false
    default: 'ko'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

### 사용 예시 (워크플로우)

```yaml
# .github/workflows/Project-K.yml
name: Project-K AI

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  Project-K:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # 🚀 Gemini 3.0 Pro 사용 (최신 모델, 권장)
      - name: Project-K AI (Gemini 3.0)
        uses: your-org/Project-K@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          ai-provider: 'gemini'
          ai-model: 'gemini-3.0-pro'
          ai-api-key: ${{ secrets.GEMINI_API_KEY }}
          language: 'ko'

      # ⚡ 또는 Gemini 2.5 Flash 사용 (빠른 속도)
      # - name: Project-K AI (Flash)
      #   uses: your-org/Project-K@v1
      #   with:
      #     github-token: ${{ secrets.GITHUB_TOKEN }}
      #     ai-provider: 'gemini'
      #     ai-model: 'gemini-2.5-flash'
      #     ai-api-key: ${{ secrets.GEMINI_API_KEY }}
      #     language: 'ko'
```

---

# 6. 개발 계획

## 6.1 팀 역할 분담

| 멤버 | 역할 | 담당 기능 |
|------|------|----------|
| **Dev 1** | 인프라 | Action 구조, GitHub API 연동 |
| **Dev 2** | 복잡도 | ESLint 설정, 복잡도 분석 로직 |
| **SF Dev 1** | AI 연동 | Claude API, 프롬프트 설계 |
| **SF Dev 2** | 통합/발표 | 커밋 메시지 AI, README, 프레젠테이션 |

## 6.2 타임라인 (10시간)

```
시간       Dev 1              Dev 2              SF Dev 1           SF Dev 2
──────────────────────────────────────────────────────────────────────────────
0:00-0:30  설계/역할 확인      설계/역할 확인      설계/역할 확인      설계/역할 확인
──────────────────────────────────────────────────────────────────────────────
0:30-2:00  Action 기본 구조   ESLint 설정        Claude API 조사    커밋 메시지 설계
           action.yml 작성    SonarJS 설정       API 키 설정        프롬프트 설계
──────────────────────────────────────────────────────────────────────────────
2:00-4:00  PR 정보 조회       복잡도 분석 구현    리뷰 프롬프트      메시지 생성 구현
           diff 조회          결과 파싱          AI 클라이언트      Conventional 형식
──────────────────────────────────────────────────────────────────────────────
4:00-6:00  코멘트 게시        포맷 구현          리뷰 구현          통합 작업
           에러 핸들링        리팩토링 제안      출력 포맷          테스트
──────────────────────────────────────────────────────────────────────────────
6:00-8:00  통합 테스트        통합 테스트        통합 테스트        README 작성
           버그 수정          버그 수정          버그 수정          사용 예시 작성
──────────────────────────────────────────────────────────────────────────────
8:00-10:00 최종 테스트        데모 PR 생성       데모 PR 생성       발표 자료
           릴리즈 준비        스크린샷           스크린샷           발표 연습
```

## 6.3 마일스톤

| 시간 | 마일스톤 | 완료 기준 |
|------|---------|----------|
| 2시간 | 기반 완성 | Action 동작, PR 정보 조회 가능 |
| 4시간 | 복잡도 체크 완성 | PR에 복잡도 리포트 코멘트됨 |
| 6시간 | AI 리뷰 완성 | PR에 AI 리뷰 결과 코멘트됨 |
| 8시간 | 전체 기능 완성 | 3개 기능 모두 동작 |
| 10시간 | 데모 준비 완료 | 발표 자료, 데모 PR 준비 완료 |

---

# 7. 성공 지표

## 7.1 정량적 지표

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| PR 리뷰 시작 시간 | 4시간 | 즉시 (자동) | Action 실행 로그 |
| 복잡도 위반 감지율 | 0% (수동) | 100% (자동) | Action 실행 결과 |
| 커밋 메시지 품질 | "fix" 다수 | Conventional 준수 | 메시지 분석 |

## 7.2 해커톤 평가 기준과의 정합성

| 평가 기준 | Project-K AI의 대응 |
|----------|------------------|
| **테마 적합성** | "개발 생산성 향상"을 직접 해결 |
| **기술적 완성도** | TDD, 복잡도 제한, 클린 코드 |
| **실용성** | 당일 도입 가능, 제로 컨피그 |
| **데모 임팩트** | 실제 PR에서 즉시 결과 표시 |
| **지속성** | GitHub Marketplace 공개 가능 |

---

# 8. Andrej Karpathy 리뷰

## 8.1 Karpathy의 관점

> Andrej Karpathy: AI 연구자, Tesla AI Director, OpenAI 창립 멤버
> "Software 2.0" 제창자 - 뉴럴 네트워크가 소프트웨어를 작성하는 시대

### 평가 포인트

#### ✅ 잘된 점

**1. AI를 "도구"로 적절히 포지셔닝**
```
Karpathy의 원칙: "AI는 인간을 대체하는 것이 아니라 증강한다"

Project-K AI의 구현:
├── AI는 리뷰를 "제안"할 뿐
├── 최종 판단은 인간이 수행
└── 인간 리뷰어의 부담을 경감
```

**2. 프롬프트 엔지니어링의 중요성 이해**
```
Karpathy의 원칙: "프롬프트는 코드다"

Project-K AI의 구현:
├── 리뷰 관점을 명확히 정의
├── 출력 형식을 구조화
└── 일본어/한국어/영어 전환 대응
```

**3. 실용성 중시**
```
Karpathy의 원칙: "Research → Production 갭을 메운다"

Project-K AI의 구현:
├── 연구 수준의 AI를 실무 도구로 변환
├── GitHub 워크플로우에 심리스하게 통합
└── 개발자의 일상에 자연스럽게 녹아듦
```

#### ⚠️ 개선 제안

**1. AI 출력의 불확실성 대처**
```
문제:
└── AI의 제안이 항상 정확하지는 않음

Karpathy의 제안:
├── 신뢰도 점수 표시
├── "이 제안은 자동 생성되었습니다" 명시
└── 인간 리뷰의 중요성 강조

구현 제안:
## 🤖 AI 코드 리뷰 (신뢰도: 85%)
> ⚠️ 이것은 AI가 생성한 리뷰입니다. 인간의 검증을 권장합니다.
```

**2. 피드백 루프 구축**
```
문제:
└── AI 정확도 향상 메커니즘이 없음

Karpathy의 제안:
├── "도움이 됨/안 됨" 버튼
├── 잘못된 제안 신고 기능
└── 향후 파인튜닝용 데이터 수집

구현 제안:
> 이 리뷰가 도움이 되었나요? 👍 👎
```

**3. 컨텍스트 윈도우 제한**
```
문제:
└── 큰 PR에서 토큰 제한에 도달

Karpathy의 제안:
├── 청킹 전략 구현
├── 중요도 기반 파일 우선순위
└── diff 요약 생성

구현 제안:
// 큰 PR의 경우
if (diffTokens > MAX_TOKENS) {
  // 변경이 큰 파일을 우선
  // 또는 여러 번으로 나누어 리뷰
}
```

### 8.2 Karpathy 스타일 개선 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    Project-K AI v2 (Karpathy Edition)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  입력: PR diff                                               │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────┐                                        │
│  │ 프리프로세서    │ ← 토큰 최적화, 청킹                     │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ AI 리뷰         │ ← 신뢰도 점수 첨부                      │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ 인간 피드백     │ ← 👍/👎 버튼                            │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ 학습 데이터 수집│ ← 향후 개선용                           │
│  └─────────────────┘                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 9. Kent Beck 리뷰

## 9.1 Kent Beck의 관점

> Kent Beck: XP 창시자, TDD 제창자, JUnit 저자
> "Make it work, make it right, make it fast"

### 평가 포인트

#### ✅ 잘된 점

**1. TDD 원칙에 맞는 설계**
```
Beck의 원칙: "Test First"

Project-K AI의 구현:
├── 모든 기능에 테스트 선행
├── Red-Green-Refactor 사이클
└── 테스트가 문서가 됨

// 예: checker.test.ts
describe('ComplexityChecker', () => {
  it('CC > 10을 감지해야 함', () => { ... });
  it('CoC > 15를 감지해야 함', () => { ... });
  it('올바른 코드는 통과해야 함', () => { ... });
});
```

**2. 단순함의 추구**
```
Beck의 원칙: "Do the simplest thing that could possibly work"

Project-K AI의 구현:
├── 3개의 명확한 기능만
├── 각 기능이 독립적
└── 설정은 옵션 (기본값으로 동작)
```

**3. 지속적 개선을 위한 설계**
```
Beck의 원칙: "Embrace change"

Project-K AI의 구현:
├── 모듈러 설계로 기능 추가 용이
├── 설정으로 임계값 변경 가능
└── 새 AI 프로바이더 추가 가능
```

#### ⚠️ 개선 제안

**1. 더 작은 함수로 분할**
```
Beck의 원칙: "함수는 하나의 일만 해야 한다"

문제:
└── reviewer.ts가 여러 책임을 가질 가능성

제안:
// Before: 하나의 큰 함수
async function reviewCode(diff: string): Promise<Review> {
  // diff 분석
  // 프롬프트 구성
  // API 호출
  // 결과 파싱
  // 포맷팅
}

// After: 단일 책임
async function reviewCode(diff: string): Promise<Review> {
  const parsed = parseDiff(diff);
  const prompt = buildPrompt(parsed);
  const response = await callAI(prompt);
  const review = parseResponse(response);
  return formatReview(review);
}
```

**2. 테스트 커버리지 명시**
```
Beck의 원칙: "테스트는 안심을 가져다준다"

제안:
├── 커버리지 목표: 80% 이상
├── 크리티컬 패스: 100%
└── CI/CD에서 커버리지 강제

// vitest.config.ts
export default {
  coverage: {
    thresholds: {
      lines: 80,
      branches: 80,
      functions: 80,
    }
  }
};
```

**3. 페어 프로그래밍 촉진 기능**
```
Beck의 원칙: "페어 프로그래밍은 지식을 공유한다"

제안:
└── 리뷰 결과를 학습 자료로 활용

## 🤖 AI 코드 리뷰

### 📚 학습 기회
이 지적은 팀의 다른 멤버에게도 도움이 될 수 있습니다.
Slack에 공유하시겠습니까? [#dev-tips에 공유]
```

### 9.2 Beck 스타일 리팩토링 제안

**Before: 복잡한 조건 분기**
```typescript
// 순환 복잡도: 12
function determineAction(result: AnalysisResult): Action {
  if (result.complexity.cc > 10) {
    if (result.complexity.coc > 15) {
      if (result.security.critical > 0) {
        return Action.BlockMerge;
      } else {
        return Action.RequestChanges;
      }
    } else {
      return Action.Warning;
    }
  } else if (result.security.critical > 0) {
    return Action.BlockMerge;
  } else if (result.security.warning > 0) {
    return Action.Warning;
  } else {
    return Action.Approve;
  }
}
```

**After: Kent Beck 스타일**
```typescript
// 순환 복잡도: 4
function determineAction(result: AnalysisResult): Action {
  if (hasCriticalSecurityIssue(result)) return Action.BlockMerge;
  if (exceedsComplexityThresholds(result)) return Action.RequestChanges;
  if (hasWarnings(result)) return Action.Warning;
  return Action.Approve;
}

// 단일 책임의 술어 함수
const hasCriticalSecurityIssue = (r: AnalysisResult) => 
  r.security.critical > 0;

const exceedsComplexityThresholds = (r: AnalysisResult) =>
  r.complexity.cc > 10 && r.complexity.coc > 15;

const hasWarnings = (r: AnalysisResult) =>
  r.security.warning > 0 || r.complexity.cc > 10;
```

---

# 10. 최종 평가 및 개선 제안

## 10.1 종합 평가

| 평가자 | 점수 | 코멘트 |
|--------|------|--------|
| **Andrej Karpathy** | 8/10 | AI 활용 적절함. 신뢰도 표시와 피드백 루프 추가하면 완벽 |
| **Kent Beck** | 8.5/10 | TDD 정신에 부합. 함수 분할을 더 철저히 하면 모범적 |

## 10.2 v1.0 구현 우선순위

### 필수 (해커톤 당일)

| 기능 | 이유 |
|------|------|
| 복잡도 체크 | 핵심 기능, 데모 필수 |
| AI 코드 리뷰 | 차별화 포인트 |
| 기본 코멘트 게시 | 동작 확인에 필요 |

### Nice to Have (시간 되면)

| 기능 | 이유 |
|------|------|
| 커밋 메시지 생성 | 추가 가치 |
| 한국어/일본어/영어 전환 | 국제화 |
| 신뢰도 점수 표시 | Karpathy 제안 |

### 향후 버전

| 기능 | 이유 |
|------|------|
| 피드백 버튼 | 지속적 개선 |
| 학습 데이터 수집 | AI 정확도 향상 |
| Slack 연동 | 팀 공유 |

## 10.3 리스크와 대책

| 리스크 | 확률 | 대책 |
|--------|------|------|
| AI API 장애 | 중 | 폴백 (복잡도 체크만 실행) |
| 토큰 제한 초과 | 중 | 큰 PR은 분할 처리 |
| GitHub API 레이트 제한 | 낮음 | 캐시, 배치 처리 |
| 리뷰 정확도 부족 | 중 | "AI 생성" 명시, 인간 리뷰 권장 |

## 10.4 성공의 정의

### 해커톤 당일

```
✅ 성공 기준:
├── 3개 기능 모두 동작
├── 실제 PR에서 데모 가능
├── 5분 이내에 셋업 완료
└── 심사위원이 "쓰고 싶다"고 말함
```

### 지속적 성공

```
✅ 장기 성공 기준:
├── GitHub Marketplace 공개
├── 100+ Star 획득
├── 실제 팀에서 채택
└── 피드백에 의한 지속 개선
```

---

# 부록

## A. 참고 자료

| 토픽 | 리소스 |
|------|--------|
| Kent Beck TDD | [Test Driven Development: By Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530) |
| Andrej Karpathy | [Software 2.0](https://karpathy.medium.com/software-2-0-a64152b37c35) |
| ESLint Complexity | [ESLint complexity rule](https://eslint.org/docs/latest/rules/complexity) |
| SonarJS | [eslint-plugin-sonarjs](https://github.com/SonarSource/eslint-plugin-sonarjs) |
| GitHub Actions | [Creating actions](https://docs.github.com/en/actions/creating-actions) |

## B. 용어집

| 용어 | 설명 |
|------|------|
| CC | Cyclomatic Complexity (순환 복잡도) |
| CoC | Cognitive Complexity (인지 복잡도) |
| TDD | Test-Driven Development (테스트 주도 개발) |
| PR | Pull Request |
| LLM | Large Language Model (대규모 언어 모델) |

---

**PRD 작성일**: 2026년 2월 5일  
**리뷰어**: Andrej Karpathy 관점, Kent Beck 관점  
**다음 업데이트**: 해커톤 후 회고
