# Flect — Human-AI 협업 글쓰기 시스템

배포 주소: **https://flect-swai.netlify.app**

---

## 프로젝트 소개

Flect는 비전문 필자가 진정성 있는 글을 쓸 수 있도록 돕는 **단계적Human-AI 협업 글쓰기 시스템**입니다.

| 단계 | 이름 | 설명 |
|---|---|---|
| 1 | **Ideation Phase** | AI가 소크라테스식 Q&A로 필자의 생각을 끌어내고, 글의 재료(Outline)를 함께 구성합니다. |
| 2 | **Writing Phase** | 필자가 직접 글을 씁니다. AI는 문장 교정(Fix), 제안(Suggest), 격식체 변환(Formalize) 보조만 수행합니다. |

**Quick Mode** (5분 체험): Ideation Phase만 간소화해 빠르게 경험할 수 있는 진입 경로입니다.  
**Community**: 완성한 글을 발행하고 타인의 글을 열람할 수 있습니다.

---

## 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| LLM | Upstage Solar Pro 3 (AI SDK) |
| 에디터 | Tiptap |
| UI | shadcn/ui + TailwindCSS + Framer Motion |
| 상태관리 | Zustand |
| 데이터베이스 | Google Sheets + Google Apps Script |
| 배포 | Netlify |

---

## 실행 방법

### 사전 요구사항

- **Node.js** 20 이상 (`node --version`으로 확인)
- **npm** 10 이상 (Node.js 설치 시 함께 제공)
- Git

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd human-ai-reflective-writing
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 채웁니다.

```env
# LLM — Upstage API 키 (https://console.upstage.ai 에서 발급)
UPSTAGE_API_KEY=your_upstage_api_key_here

# Google Sheets 백엔드 — GAS 웹앱 URL
GAS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# 네이버 책 검색 API (선택 — 미입력 시 '장르 = 독후감'일 때 책 검색 기능 비활성)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
```

> **제출물 평가용 `.env.local` 파일**은 제출된 구글 폼에 별도로 제공됩니다.  
> 직접 키를 발급하지 않아도, 제공된 파일을 프로젝트 루트에 붙여넣으면 바로 실행됩니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 **http://localhost:3000** 접속.

### 4. 프로덕션 빌드 (선택)

```bash
npm run build
npm run start
```

---

## 주요 기능 접속 경로

| 경로 | 설명 |
|---|---|
| `/` | 랜딩 페이지 |
| `/app/write/quick` | **Quick Mode 진입** (5분 Ideation 체험) |
| `/app/write` | Full Pipeline 진입 (Ideation → Writing) |
| `/app` | 내 글 목록 (발행한 글) |
| `/community` | 커뮤니티 피드 |

### 권장 테스트 시나리오

**Quick Mode** (`/app/write/quick`)
1. 장르·주제·개인 정보 입력
2. AI Q&A 세션 (Enter로 답변 전송, Shift+Enter로 줄바꿈)
3. 개요(Outline) 구성 및 카드 편집
4. 개요 복사 모달 확인 → 글쓰기 단계로 이동

**Full Pipeline** (`/app/write`)
1. 구조화 입력(장르, 주제, 개인 정보 등) 완료
2. AI Q&A 세션
3. 개요 구성 (드래그로 카드 순서 변경 가능)
4. Writing Phase — Tiptap 에디터에서 직접 글 작성
5. 우측 상단 AI 보조 버튼(Fix / Suggest / Formalize) 사용
6. 발행(Publish) 버튼 → 커뮤니티에 글 공개

**커뮤니티** (`/community`)
1. 글 피드 열람
2. 장르 탭 필터 및 제목/닉네임/태그 검색
3. 카드 클릭 → 글 상세 열람 및 좋아요

---

## 프로젝트 구조

```
app/                  # Next.js App Router 페이지 및 API Routes
  app/write/          # Full Pipeline 및 Quick Mode 진입점
  community/          # 커뮤니티 피드 및 상세 페이지
  api/                # LLM·GAS 프록시 API Routes
components/           # UI 컴포넌트
  ideation/           # Ideation Phase (Q&A, Outline)
  writing/            # Writing Phase (에디터, 사이드바)
  quick/              # Quick Mode 전용 컴포넌트
  community/          # 커뮤니티 전용 컴포넌트
lib/                  # 비즈니스 로직 (이벤트 로깅, LLM 프롬프트 등)
store/                # Zustand 전역 상태
types/                # TypeScript 타입 정의
```

---

## 데이터 수집 안내

본 시스템은 연구 목적으로 다음 정보를 Google Sheets에 수집합니다.

- **사용 이벤트**: 각 단계 도달 여부 (익명 기기 UUID 기반)
- **랜딩 방문**: 접속 시각, 유입 경로 (IP 포함)
- **발행 글**: 커뮤니티에 직접 발행한 글 내용

수집한 데이터는 XyZ 가설 검증 연구에만 사용됩니다.
