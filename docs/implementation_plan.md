# Implementation Plan

## 구현 계획

1. 웹사이트 구조 및 파이프라인 기술 스택 정하기
2. Landing Page 만들기
3. 프론트엔드 (빈 껍데기) 만들기 w/ Claude Design
4. 백엔드 제작하기
5. Prompt Engineering으로 LLM 사용법 정하기
6. 프론트엔드 및 백엔드 연결

## 기술 스택

웹서비스로 구현

```
[Browser]
    ↓
[Next.js on Netlify]   ← 모든 UI, 라우팅
    ├── / (Landing)           → Fake Door 재활용 가능
    ├── /app (메모장 UI)       → 로그인 후 진입
    ├── /app/write (Writing Page) → 메인 파이프라인
    └── /community (if 시간됨)  → 공개된 글 피드
    ↓
[두 개의 백엔드를 용도별로 분리]
├── Google Apps Script + Sheets  ← SWAI 수업 요구사항 충족
│     • 방문자 분석 (visitors 테이블)
│     • 이메일 waitlist / 조언 수집
│     • Community 피드용 '공개 발행된 글' 저장
│     • '공개 발행' 시 URL 생성 (GAS가 short id 반환)
│
└── Next.js API Routes → Claude API  ← HAI 핵심 로직
      • /api/ideation/question (Socratic Q&A)
      • /api/ideation/outline (Outline Composition)
      • /api/writing/suggest (CoAuthor-식 next-sentence)
      • /api/editing/review (Critical Review)
```

- **전체 디렉토리 구조**
    
    ```
    project-root/
    │
    ├── CLAUDE.md                          # ← 나중에 만들 예정 (Claude Code용 컨텍스트)
    ├── .env.local                         # ANTHROPIC_API_KEY 등 (절대 커밋 X)
    ├── .env.example                       # 팀/Claude Code에게 공유용 env 템플릿
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── components.json                    # shadcn/ui CLI 설정
    ├── tsconfig.json
    └── package.json
    │
    │
    ├── app/                               # Next.js App Router 루트
    │   │
    │   ├── layout.tsx                     # Root layout (폰트, 전역 CSS)
    │   ├── page.tsx                       # ★ Main Page (Landing / Fake Door)
    │   │
    │   ├── app/                           # "로그인된" 사용자 영역
    │   │   ├── layout.tsx                 # App 공통 레이아웃 (사이드바 등)
    │   │   ├── page.tsx                   # User Page (메모장 UI, 글 목록)
    │   │   └── write/
    │   │       ├── page.tsx               # 새 글 시작 (Session 생성 후 [id]로 리다이렉트)
    │   │       └── [id]/
    │   │           └── page.tsx           # ★ Writing Page (Ideation→Writing→Editing 파이프라인)
    │   │
    │   ├── community/                     # SWAI용 커뮤니티 피드 (시간 되면 구현)
    │   │   └── page.tsx
    │   │
    │   └── api/                           # Next.js API Routes (서버 사이드 로직)
    │       │
    │       ├── ideation/
    │       │   ├── questions/route.ts     # Socratic Q&A 질문 생성
    │       │   └── outline/route.ts       # 아웃라인 컴포지션 생성
    │       │
    │       ├── writing/
    │       │   └── suggest/route.ts       # CoAuthor식 next-sentence 제안
    │       │
    │       ├── editing/
    │       │   └── review/route.ts        # Critical review (Editing Phase)
    │       │
    │       └── gas/
    │           └── route.ts               # GAS 프록시 (CORS 우회, SWAI 백엔드 연결)
    │
    │
    ├── components/                        # UI 컴포넌트
    │   │
    │   ├── ui/                            # shadcn/ui 자동생성 파일들 (건드리지 말 것)
    │   │   ├── button.tsx
    │   │   ├── slider.tsx
    │   │   ├── card.tsx
    │   │   └── ...
    │   │
    │   ├── landing/                       # Landing Page 전용 컴포넌트
    │   │   ├── HeroSection.tsx            # 서비스 설명 히어로
    │   │   ├── FeatureSection.tsx         # 스크롤 시 기능 소개 (Framer Motion)
    │   │   └── WaitlistForm.tsx           # 이메일+조언 폼 → GAS 호출
    │   │
    │   ├── onboarding/                    # Getting Started 설문 (Writing Page 첫 단계)
    │   │   ├── SurveyFlow.tsx             # 한 화면에 한 질문씩 Step 컨테이너
    │   │   ├── CardPickerQuestion.tsx     # 글의 종류 선택 (카드 형태)
    │   │   ├── SliderQuestion.tsx         # Ordinal 값 (경험, 중요도 등) 슬라이더
    │   │   └── TextQuestion.tsx           # Open question (주제/소재 단답)
    │   │
    │   ├── ideation/                      # Ideation Phase 컴포넌트
    │   │   ├── QASession.tsx              # Q&A 채팅 컨테이너
    │   │   ├── QuestionBubble.tsx         # AI 질문 말풍선
    │   │   ├── AnswerInput.tsx            # 사용자 답변 입력창
    │   │   └── OutlineView.tsx            # 완성된 아웃라인 표시 + 편집
    │   │
    │   ├── editor/                        # Writing Phase (Tiptap 에디터)
    │   │   ├── WritingEditor.tsx          # Tiptap 인스턴스 + extension 조합
    │   │   ├── SlashCommandMenu.tsx       # / 입력 시 뜨는 커맨드 팝업
    │   │   ├── GhostTextSuggestion.tsx    # Tab키 → CoAuthor식 ghost text 표시
    │   │   └── OutlineSidebar.tsx         # 아웃라인 사이드 패널 (글 쓰면서 참조)
    │   │
    │   ├── editing/                       # Editing Phase 컴포넌트
    │   │   ├── FeedbackPanel.tsx          # AI 피드백 우측 패널
    │   │   └── InlineAnnotation.tsx       # Grammarly식 밑줄 + 호버 팝오버
    │   │
    │   └── shared/                        # 전 Phase 공통 컴포넌트
    │       ├── AISuggestionCard.tsx       # ★ AI 제안 accept/reject UI (핵심 공통 컴포넌트)
    │       ├── PhaseProgressBar.tsx       # Ideation→Writing→Editing 진행 상태
    │       └── LoadingDots.tsx            # LLM 스트리밍 대기 인디케이터
    │
    │
    ├── lib/                               # 순수 로직 (컴포넌트 아님)
    │   │
    │   ├── anthropic.ts                   # Anthropic SDK 클라이언트 싱글톤
    │   ├── gas.ts                         # GAS API 호출 함수들 (래퍼)
    │   │
    │   └── prompts/                       # ★ LLM 프롬프트 빌더 (나중에 채울 것)
    │       ├── ideation.ts                # buildIdeationPrompt(structuredInput, history)
    │       ├── outline.ts                 # buildOutlinePrompt(structuredInput, qaHistory)
    │       ├── suggest.ts                 # buildSuggestPrompt(structuredInput, currentText)
    │       └── editing.ts                 # buildEditingPrompt(structuredInput, fullDraft)
    │
    │
    ├── hooks/                             # Custom React hooks
    │   ├── useIdeationSession.ts          # Q&A 세션 상태 + API 호출 관리
    │   ├── useWritingSession.ts           # 에디터 상태 + AI 트리거 관리
    │   └── useGASTracker.ts              # 방문자 분석 GAS 호출 (Landing Page용)
    │
    │
    ├── store/                             # Zustand 전역 상태
    │   ├── structuredInputStore.ts        # Getting Started 설문 응답 저장
    │   ├── ideationStore.ts               # Q&A 히스토리, 완성된 아웃라인
    │   └── writingStore.ts                # 현재 문서, AI 인터랙션 로그
    │
    │
    └── types/                             # TypeScript 타입 정의
        ├── structured-input.ts            # StructuredInput 인터페이스
        ├── ideation.ts                    # QAPair, IdeationSession, Outline 등
        └── writing.ts                     # Document, AIInteraction (User Study 로깅용)
    ```
    
- **데이터 흐름 요약**
    
    ```
    사용자 행동              컴포넌트                  상태/백엔드
    ──────────────────────────────────────────────────────────────
    Landing 방문      →  HeroSection             →  GAS (visitors 테이블)
    이메일 제출       →  WaitlistForm            →  GAS (tab_final 테이블)
    
    로그인 클릭       →  app/page.tsx            →  structuredInputStore 초기화
    설문 완료         →  SurveyFlow              →  structuredInputStore.set()
    
    Q&A 시작         →  QASession               →  POST /api/ideation/questions
                                                 →  ideationStore.addQAPair()
    아웃라인 생성     →  OutlineView             →  POST /api/ideation/outline
                                                 →  ideationStore.setOutline()
    
    Tab 키           →  GhostTextSuggestion     →  POST /api/writing/suggest
                                                 →  writingStore.logInteraction()
    수락/거절         →  AISuggestionCard        →  writingStore.logInteraction()
                                                 (accept/reject/edit 구분해서 기록)
    
    Editing 시작     →  FeedbackPanel           →  POST /api/editing/review
    공개 발행         →  (버튼)                  →  POST /api/gas (community_posts)
    ```
    

### Frontend

**Next.js 15 + TypeScript**

- **Tiptap (ProseMirror 기반)**: Ideation 이후 모든 에디터 로직의 핵심. 이전 답변에서 설명한 것과 동일
- **shadcn/ui + TailwindCSS**: shadcn은 Radix 기반이라 슬라이더/다이얼로그/팝오버가 전부 예쁘고 접근성도 챙김. 설문 UI(ordinal 슬라이더 등)에 최적
- **Framer Motion**: Onboarding flow의 한 화면씩 전환 애니메이션
- **Zustand**: Structured Input, Ideation 상태 관리
- **axios**: GAS 호출용 (수업에서 배운 그대로 사용 → 일관성)

### Backend

#### **LLM Backend**

**Next.js API Routes** + **Anthropic/OpenAI SDK**

- **Vercel AI SDK** (`ai` 패키지): Claude 스트리밍을 `useChat` 훅으로 간단 처리. Netlify에서도 문제없이 동작

#### SWAI Backend

- **Google Apps Script**: 수업 코드의 `doGet` + CRUD 프레임워크 그대로 재사용
- **Google Sheets**: 테이블 확장해서 써먹기
    - `visitors` (Fake Door에서 만든 것 그대로, 본 서비스 분석에도 사용)
    - `waitlist` (Fake Door에서 모은 이메일)
    - `community_posts` (공개 발행된 글: `id / author_hash / title / content / published_at`)
    - `ai_interactions` (선택적, User Study 로깅용)
- **Netlify**: 배포

# Design

## 로고 디자인

### Why ‘Flect’?

- Re’flect’ (비추다) → Our system aims for reflective essays, The system could ‘reflect’ one’s internal states and extract it into a full writing
- In’flect’ (굴절시키다) → Change one’s fuzzy area into a concrete structure
- ~flect : to bend (e.g. reflect, deflect, flexible) → The writer can flexibly accept or decline AI suggestions

### Design Candidates

**A. 'F'를 반사된 형태로 (Reflected F, Mirror Wordmark)**

'F' 글자 옆에 거울에 비친 듯한 반사상이 살짝 보임. 워드마크와 심볼이 자연스럽게 결합되는 방식. 명함이나 favicon에도 적용하기 좋음. 미니멀하고 포근한 톤에 잘 맞음.

**B. 휘어진 선 (Bent Stroke)**

'F' 또는 'l'의 직선 한 부분이 부드럽게 굽어 있는 형태. *flectere(굽히다)* 어원을 시각화. 손글씨처럼 자연스러운 곡선을 사용해 포근함을 강조.

**C. 반으로 접힌 종이 (Folded Paper)**

글쓰기 메타포 + flect의 굽힘 의미. 종이가 살짝 접혀 그림자가 지는 형태의 아이콘. 메모장 UI 컨셉과도 연결됨. 베이지 배경에서 페이퍼 텍스처가 따뜻한 인상을 줌.

**D. 이중 곡선 / 무한 루프 (Double Curve)**

두 개의 곡선이 서로 마주보며 부드럽게 만나는 형태. 인간과 AI의 협업, 양방향 대화(Q&A Session)의 시각화. *re-flect*에서의 'reflexive' 관계를 표현. 미니멀한 라인 아트로 구현 가능.

## 비주얼 레퍼런스 / 무드

### 레퍼런스

- [**Claude.ai**](http://claude.ai/): 따뜻한 크림/앰버 계열 컬러, 휴머니스트 세리프 느낌의 헤딩 폰트,
여백이 많고 글자가 주인공인 레이아웃

### 톤

- 따뜻하고 정겨운 / 친근하지만 과하지 않은 / 조용히 확신 있는
- 영업적이거나 과장된 카피 금지 ("혁신적인!", "최고의!" 같은 단어 쓰지 말 것)
- 글 쓰는 사람의 감정에 공감하는 톤

### 컬러 방향

- 메인: 따뜻한 크림/베이지 배경 (#FAF7F2 계열)
- 포인트: 앰버/테라코타 계열 (#D97757 또는 유사)
- 텍스트: 진한 브라운-블랙 (#2D2520 계열)
- 세부 컬러는 Claude Design에게 위임

### 타이포그래피

- 헤딩: 세리프 또는 휴머니스트 세리프 (Noto Serif KR 또는 Pretendard 중 부드러운 weight)
- 본문: 읽기 편한 산세리프 (Pretendard)

# Main Page (Landing Page)

모던한 AI서비스 대문처럼, 서비스 설명 + 로그인 페이지

스크롤하면 각각의 서비스 기능 보이게끔

for Fake Door

Login 버튼 누르면 자동으로 User Page로 넘김 (로그인 기능 구현 미정, 프로토타입에서는 로그인했다고 가정하고 user page 사용)

# User Page

(로그인을 했다고 가정했을 때 페이지)

메모장 UI

(애플 메모장 사진 첨부)

‘새 글 생성’ 누르면 Writing Page로 이동

# Writing Page

프로젝트의 메인 글쓰기 파이프라인!

## Getting Started

Onboarding Flow 느낌으로, 한 화면에 한 질문씩 물어보기

Survey 형식, Multiple Choice Questions, Single Answer
(예외로 “글의 주제나 소재” 질문은 Short-Answer Open Question)

질문들의 선택지는 시각화하여 좋은 UX 제공 

Ordinal values: 슬라이더로 시각화

Categorical values: [TODO]

Open question: 텍스트박스, Placeholder Text: 예시 제시

다음과 같은 질문 순차적으로 질문

- **글의 종류**는 무엇인가요? (비평/평론, 독후감, 리뷰, 여행기, 성찰 일지)
- **글의 주제나 소재**를 한 문장으로 적어 주세요. (OPEN QUESTION)
- **머릿속에 생각해 놓은 내용**이 얼마나 되나요? (없음 / 조금 있음 / 꽤 있음 / 거의 다 있고 정리만 필요)
- **작가의 글쓰기 경험/전문성**은 얼마나 되나요?
- **글의 중요성**은 얼마나 되나요? (얼마나 잘 써야 하는 글인지, 아니면 대충 써도 되는지)
→ Ideation을 얼마나 진행해야 하는지 체크
→ AI 피드백이 얼마나 강할지 체크

Optional Questions (설문 끝에 ”더 많은 정보를 주고 싶으신가요?”라는 버튼 누르면 추가적인 질문들 순차적으로 활성화)

- 글의 예상 독자는 누구인가요? (나/친구/대중/학계/…)
    - 공유하고 싶은 글인가요, 아니면 나 자신에게 쓰는 글인가요?
    - 이 글을 어디에 업로드할 예정인가요? (개인 블로그 / 커뮤니티 / 공식적 웹사이트 / 리뷰 사이트 / 전문 매체 / 아직 모름 / 공유 안 함)
- 원하는 글의 어조는 무엇인가요? (따뜻하고 개인적 / 성찰적이고 진지 / 날카롭고 비판적 / 유머러스 / 잘 모르겠음)
- 글의 예상 길이는 어떻게 되나요? (짧게 (300자 이내, 댓글 형식) / 보통 (300자~1000자, 몇 문단) / 길게 (1000자 이상, 에세이))
- AI 피드백이 어땠으면 좋겠나요? (비판적 / 미온적 / 공식적으로 / 친근하게) 
→ 페르소나 설정? 
*(일단 구현 X)*

해당 질문들의 답변은 구조화하여 LLM Prompt로 사용

## Q&A Session

**Structured Input에서 얻은 결과에 따른 구조화된 질문 + (필요시) LLM 보완 질문** 

Structured Input → 정해진 Q&A 템플릿 (장르별 고정) → LLM이 답변 분석 → 부족한 부분이 있으면 추가 질문 1~2개 생성 → Outline Composition

### 고려사항

- 고정 질문과 사용자 맥락이 맞아야 한다!
- LLM 보완 질문용 Prompt Engineering

### 질문 내용

장르별

[TODO]

### 추가 질문 AI Prompt

[TODO]

## Outline Composition

### LLM Prompt

[TODO]

## Writing Phase

### AI Assistance Trigger Method

- Slash commands & in-line command menu
- 타이핑하다가 text cursor를 (우클릭하면/오른쪽으로 드래그하면) 세 가지 태스크 선택 가능?

*[TODO]: hasn’t decided on which method to use*

글을 쓰는 중 어느때나 불러올 수 있음 

### LLM Prompt

각각의 태스크 (suggest, fix, formalize)마다 프롬프트 존재, 이 프롬프트의 틀은 모두 같지만 세부 내용은 ‘Idea Phase’에서 구조화한 idea를 반영

### Tasks

#### Fix

Grammar fix

*[TODO]: Relate to other writing systems*

#### Suggest

CoAuthor Interface 그대로 사용?

#### Formalize

word 단위: Synonym 여러개 제안

phrase 단위: 비슷한 문장 여러개 제안 

CoAuthor Interface처럼 단어/문장 여러개를 아래로 쌓아서 제안

## Editing Phase

*[IMPORTANT] 아직 구현하지 않기*

### LLM Prompting

전체 글을 입력 후 판단 유도

피드백의 강도는 structured input의 

### UI

Content Gatekeeping 반영

에이전트가 수정이 필요한/수정 피드백을 제안하는 부분에서 (grammarly처럼) 밑줄이 그이고 robot icon이 말풍선으로 LLM-generated suggestion을 보여준 후에, 
마우스를 호버링하면 실제 어떻게 해당 문장이 변형되는지 보여주고(이 단계에서 텍스트 수동 편집 가능),
(Cursor와 같은 coding agent의 suggestion 기능처럼) 의견을 받아들일지 yes/no로 선택

### 기능

- 문법, 어색한 문장 수정 제안 (내용 보존하면서)
- Ideation Phase의 idea와, 실제 적힌 내용 사이의 간극 찾기
- 논리 흐름 살펴보고, 흐름에 벗어나는 내용 태클 걸기
- 논리 흐름을 보강할 수 있는 추가 내용 제안 (”이런 내용은 어떨까요?” 라고 아이디어만 제시하고, 직접 적는 것은 작가 담당)

### 기능 구현 세부

*[TODO]: Ideation Stage first, put placeholders for the current implementation*

## Final Draft

글을 다 쓴 후 ‘공유’ 버튼 존재 (추후에 Community Page와 연결)

# Community Page

TBA

*[IMPORTANT] HAI 수업 범위에서는 구현하지 않기*