# CLAUDE.md — Flect Quick Mode (SWAI 배포용)

이 문서는 Flect에 **Quick Mode**를 추가하기 위한 작업 지침입니다.
Quick Mode는 SWAI 수업의 일반인 현장 배포(in-the-wild deployment)용 간소화 파이프라인으로,
기존 full pipeline과 **같은 레포·같은 백엔드**를 공유하되 진입점만 분리합니다.

아래 Task를 **T1부터 순서대로** 구현하세요. 각 Task의 "완료 조건"을 충족하면 다음으로 넘어갑니다.

---

## 0. 핵심 원칙 (먼저 읽기)

- **목표 시간 7~10분.** 마찰의 주범은 긴 Q&A이므로 Q&A를 짧게/스킵 가능하게 만드는 것이 핵심.
- **정체성 유지: "사람이 쓰고 AI가 돕는다."** 대필 기능은 만들지 않는다.
- **full pipeline 코드를 삭제하지 않는다.** Quick Mode는 기존 컴포넌트·로직을 재사용하는 별도 진입점.
- 모든 단계는 **모바일 우선(mobile-first)**으로 설계한다.
- XYZ 가설 검정을 위해 각 분기점에서 **이벤트 로깅**을 수행한다.

---

## 1. 진입점 분리

```
/app/write/[id]      → full pipeline (HAI용, 기존 코드 그대로 유지)
/app/write/quick     → Quick Mode (SWAI 배포 진입점) ★신규
```

지인에게 공유하는 링크는 `/app/write/quick`으로 시작한다.
공유 컴포넌트(에디터, 커뮤니티, lib, types)는 재사용하고, Quick Mode 전용 로직만 신규 작성한다.

---

## 2. Quick Mode 파이프라인 개요

```
Structured Input (간소화)
   필수 질문만, AI 개입도 관련 질문 제거
        ↓
Q&A Session (Quick)
   4요소 × 메인 1개 (필수) + 서브질문 총 4개 예산 (동적) = 상한 8개
   메인질문 스킵 불가 / 서브질문 또는 요소 단위 skip 가능
   Q&A 통째 스킵 경로 존재 (작게)
        ↓
Outline Composition
   기존과 동일. 단, Q&A 스킵/부족 시 빈 카드 상태 허용
   Outline 통째 스킵 경로 존재 (작게)
        ↓
Writing Phase (Quick)
   직접 집필 + Suggest(다음 문장) 보조 기능만
   Fix / Formalize 미포함
        ↓
Publish → 커뮤니티 (기존 커뮤니티 기능 그대로)
```

---

## 3. Structured Input (간소화)

- 기존 5개 필수 질문 (AI 개입도 제외)만 사용. **"더 많은 정보" 게이트 이후의 선택 질문 5개 전부 제거.**
- **AI 개입도(`userInterventionWant`) 질문 및 `lib/intervention.ts` 계산 로직 전체를 Quick Mode 경로에서 제거.**
  - Q&A 질문 수는 개입도와 무관하게 고정 상한 8개로 동작.
- 남기는 필수 질문: 장르 / 주제 문장 / 쓸 내용 정리 정도 / 글쓰기 빈도. (기존 구조 재사용)
- 한 화면 한 질문(onboarding flow) 유지, 모바일 세로 레이아웃.

**완료 조건:** Quick Mode 진입 시 선택 질문·개입도 슬라이더가 보이지 않음.

---

## 4. Q&A Session (Quick) — 가장 중요

### 4.1 질문 수 체계
- **4요소**(orientation → feelings → evaluation → takeaway) 각각 **메인질문 1개씩 = 베이스 4개.**
- 서브질문(꼬리질문)은 **총 4개까지** 동적 추가 가능 (요소당 고정이 아니라 **전체 예산 4개**).
- **전체 질문 상한 = 8개 (하드 캡).** 8개에 도달하면 즉시 세션 종료.
- 서브질문을 어느 요소에 쓸지는 LLM의 **[무엇을 더 파고들지 판단]** 규칙으로 결정.

### 4.2 프롬프트 수정 (기존 ideation 프롬프트 기준)
- **[질문 전개 방식 — 한 카테고리씩 꼬리물기] 규칙 무시.** 4요소를 고정 순서로 1개씩 진행.
- **[무엇을 더 파고들지 판단] 규칙은 유지.** 단, 이 판단으로 생성되는 구체화 질문은 서브질문 예산(4개)에서 차감.
- 매 턴 클라이언트가 LLM에 주입: 현재 요소, 지금까지 사용한 질문 수, 남은 서브질문 예산.
- 예산 소진 또는 8개 도달 시 LLM은 다음 요소 메인질문으로만 진행, 더 이상 서브질문 생성 금지.

### 4.3 Skip 동작
- **skip = 현재 요소 종료 → 다음 요소의 메인질문으로 이동.**
- skip한 질문은 **질문 수 카운트에서 제외** (상한 8개 계산에 미포함).
- **메인질문은 skip 불가:**
  - skip 버튼을 회색(disabled) 처리.
  - hover(또는 모바일에선 tap) 시 작은 안내: **"이 질문은 대답해주세요."**
- 서브질문에서만 skip 활성화.

### 4.4 4요소 완성도 게이지 (Progress Circles)
- 기존 0–100 완성도 평가 로직(LLM이 매 턴 평가, 클라이언트에서 역행 방지 보정) **유지.**
- **시각화 전면 교체:**
  - 화면 **최상단에 세로 높이의 약 1/5** 차지하는 가로로 긴 직사각형 프레임.
  - 그 안에 **progress bar가 아니라 progress circle 4개** (파이차트처럼 각 요소의 채움 %를 원형으로 표시).
  - **현재 진행 중인 요소**의 circle은 강조 (테두리/크기/색 강조).
  - **100% 채워진** circle은 "완료됨"을 나타내는 색으로 처리 (예: 채움색을 성공색으로).
- 모바일에서 4개 circle이 가로 한 줄에 들어가야 함. 작은 화면 대응 필수.

### 4.5 최소 질문 floor
- **최소 4개 (각 요소 메인질문 1개씩) 답변을 권장 기준으로 둔다.**
- Outline으로 넘어가기 전, 답변한 메인질문이 4개 미만이면 경고 모달:
  - **"정보가 너무 적어서, AI가 도움을 드릴 수 없어요. 넘어가시겠어요?"** (계속 / 더 답하기)
- 경고는 차단이 아니라 확인. 사용자가 "넘어가기"를 누르면 진행 허용.

### 4.6 Q&A 통째 스킵 경로
- Q&A 세션 화면에 **"Q&A 건너뛰기"** 경로 제공.
- **버튼은 작게/덜 눈에 띄게** 배치 (남용 방지). 단, XYZ 가설 측정을 위해 클릭 시 이벤트 로깅.
- 스킵 시 Outline은 빈 카드 상태로 진입 (§5 참조).

### 4.7 서버 측 예산 상태 머신 (구현 명세 — 반드시 준수)
질문 수 제어는 **반드시 서버(`/api/ideation/questions`)가 소유**한다. 클라이언트에서 질문 수를 세면
새로고침·이중요청에 취약하다. 현재 full pipeline은 `completionThreshold`로 요소 전환을 게이트하지만,
Quick Mode는 **예산(budget)**으로 게이트한다.

- 진입점이 매 턴 `mode: 'quick'`을 함께 보낸다. **신규 라우트를 만들지 말고 기존 라우트에 분기**해
  평가자(`evaluateAnswer`)·생성기(`generateQuestion`)·종료(`generateClosing`)를 그대로 재사용한다.
- 매 턴 클라이언트가 echo back하는 **신규 서버 상태**(기존 `currentElement`/`completedElements` 패턴과 동일):
  - `mainAsked`: 지금까지 던진 메인질문 수 (0–4)
  - `followupBudget`: 남은 서브질문 예산 (시작값 4)
- **전환 규칙 (메인질문 답변 후, 요소 E):**
  1. 평가자가 약함(gap 존재 또는 `progress[E] < QUICK_BAR`)으로 보고 `followupBudget > 0`이면
     → 같은 요소 E에 꼬리질문 1개(`qType=followup`), `followupBudget--`.
  2. 아니면 → E 완료 처리 후 다음 미완료 요소의 메인질문(`qType=main`, `mainAsked++`).
- **전환 규칙 (꼬리질문 답변 후):** 예산이 남고 여전히 약하면 같은 요소를 한 번 더 파고들 수 있으나
  (예산은 4요소 공용 풀), 기본은 다음 요소 메인질문으로 전진.
- **하드 캡:** `mainAsked + (4 - followupBudget) >= 8`이면 즉시 종료. (메인4 + 서브4 = 8로 자연 상한,
  명시 캡은 안전망.)
- **`completionThreshold`는 Quick Mode에서 전환을 게이트하지 않는다.** progress(0–100)는
  progress circle 시각화를 위해 계속 계산하되(§4.4), 전환 결정은 예산이 한다.
- **메인질문 skip 불가:** 클라이언트는 메인질문에서 skip 센티넬을 보내지 않는다(버튼 disabled, §4.3).
  방어적으로, 서버가 메인 맥락에서 skip intent를 받으면 fabricate 없이 다음 요소로 전진(예산 미차감).
- skip된 꼬리질문은 질문 수·예산 카운트에서 제외(§4.3).

**완료 조건:** 메인질문 스킵 불가, 서브질문 예산 4개 동작, 상한 8개에서 종료, progress circle 4개 동작, floor 경고 동작.

---

## 5. Outline Composition

- **기존 로직 그대로 유지.**
- Q&A를 스킵했거나 최소 질문 미달이면 **빈 카드 상태**로 진입 (정상 상태로 간주).
  - 질문 한두 개라도 답했으면 그 내용만큼 재료 카드 생성.
- 빈/부족 상태에서 사용자는:
  - 재료 카드를 **수동으로 추가**, 또는
  - Outline도 스킵하고 **바로 Writing으로 이동**.
- **Outline 통째 스킵 경로** 제공. 버튼은 작게 배치 (Q&A 스킵과 동일 정책). 클릭 시 이벤트 로깅.

**완료 조건:** 빈 카드 상태에서도 크래시 없이 수동 추가/스킵 가능.

---

## 6. Writing Phase (Quick)

- 직접 집필 + **Suggest(다음 문장 제안, Tab) 보조 기능만** 활성화.
- **Fix / Formalize 기능은 Quick Mode에서 제외** (시간 단축).
- Outline 사이드바(빈 카드 가능)와 Q&A 답변 참조는 기존 방식 유지.
- 모바일에서 Suggest UI가 키보드를 가리지 않도록 배치.

**완료 조건:** Suggest만 노출, 글 작성 후 Publish 가능.

---

## 7. 네이버 책 검색 API

- **유지하되 독후감 장르에만 적용.**
- 독후감일 때만 주제 문장으로 책 검색 → 제목·저자·출판사·소개를 Q&A LLM 맥락으로 1회 주입.
- 검색 실패 시 맥락 없이 정상 진행(graceful degradation).
- 독후감이 아닌 장르에서는 책 검색 호출 자체를 하지 않음.

**완료 조건:** 독후감에서만 책 컨텍스트 주입, 타 장르는 호출 없음.

---

## 8. 이벤트 로깅 (XYZ 가설 검정용)

### 8.1 events 시트 (수동 선행 작업)
Google Sheet에 `events` 탭 추가, 1행 헤더:
```
device_id | stage | timestamp
```

### 8.2 로깅 훅 (`hooks/useEventLogger.ts` 또는 `lib/events.ts`)
- `logEvent(stage: Stage)` 함수: `/api/gas`로 `action=insert&table=events` 1줄 추가.
- `device_id`는 `getDeviceId()`에서, `timestamp`는 ISO 문자열.
- 실패해도 사용자 흐름을 막지 않음 (fire-and-forget, 에러는 콘솔만).

### 8.3 로깅 지점 (Stage)
| stage | 시점 |
|---|---|
| `quick_start` | Quick Mode 진입 (`/app/write/quick` 마운트) |
| `structured_first_input` | Structured Input에서 첫 답을 입력한 순간 (H1 분모) |
| `structured_done` | Structured Input 완료 |
| `qa_skipped` | Q&A 통째 스킵 클릭 |
| `qa_done` | Q&A 세션 정상 종료 (또는 floor 경고 후 진행) |
| `outline_reached` | Outline Composition 화면 도달 |
| `outline_skipped` | Outline 통째 스킵 클릭 |
| `writing_reached` | Writing Phase 도달 |
| `publish_opened` | **발행 모달(PublishModal) 오픈 = "발행 화면 도달"** (H2 분모) |
| `published` | 커뮤니티 발행 완료 (H2 분자) |
| `community_visit` | 커뮤니티 피드 방문 |
| `like` | 좋아요 클릭 |

> `publish_opened`(발행 의도 = 모달 오픈)와 `published`(발행 확정)는 **반드시 구분**해 로깅한다.
> H2의 분모는 `writing_reached`가 아니라 `publish_opened`다 (§8.4).

### 8.4 가설 ↔ 측정 매핑 (분모/분자)
집계는 **device_id 기준 distinct**로 한다 (한 기기가 같은 stage를 여러 번 찍어도 1로 셈).

| 가설 | 분모 (denominator) | 분자 (numerator) | 목표 |
|---|---|---|---|
| H1 활성화 | `quick_start` 찍은 device | `outline_reached` 찍은 device | ≥40% |
| H2 공유 | `publish_opened` 찍은 device | `published` 찍은 device | ≥50% |
| H3 참여 | `community_visit` 찍은 device | `like` 찍은 device | ≥30% |

- **H1 분자 정의:** Q&A를 통째 스킵해도 빈 카드로 `outline_reached`가 찍히므로, 스킵 경로 사용자도
  분자에 포함된다 — 의도된 정의(가치 경험 = 구조 화면 도달). 보고 시 스킵 경유 비율을 함께 명시.
- **(선택) `session_id` 컬럼:** events 시트에 글 단위 식별자를 추가하면 한 기기가 여러 글을 쓴 경우도
  글 단위 funnel로 분해할 수 있다. 베타 1차에는 device 단위로 충분.

**완료 조건:** 각 분기점에서 events 시트에 행이 정확히 쌓이고, 위 3개 funnel이 시트에서 집계 가능.

---

## 9. 모바일 UX 명세

Quick Mode 전 화면은 모바일 우선으로 구현한다.

### 9.1 공통
- **챗봇 형식 유지**, 대신 mobile-friendly하게 폰트 사이즈 크게.
- 주요 액션 버튼(다음/skip)은 **화면 하단 고정(sticky bottom)** — 엄지로 닿는 영역.
- textarea 포커스 시 모바일 키보드가 입력창을 가리지 않도록 스크롤 보정.
- 폰트·터치 타깃 최소 44px 확보.

### 9.2 Q&A 화면 레이아웃 (위→아래)
```
┌─────────────────────────────┐
│ Progress Circles (4개)       │  ← 세로 1/5, 가로 직사각형 프레임
├─────────────────────────────┤
│                             │
│ 현재 질문 (요소 라벨 + 질문)  │  ← 채팅 인터페이스, 중앙, 넉넉한 여백
│                             │
│ [답변 textarea]              │
│                             │
├─────────────────────────────┤
│ [질문 건너뛰기(작게)]  [다음 →]   │  ← sticky bottom
└─────────────────────────────┘
```
- "Q&A 전체 건너뛰기" 같은 통째 스킵은 화면 구석에 **작게** (텍스트 링크 수준).

### 9.3 Progress Circles
- 4개를 가로로 균등 배치, 작은 화면에서도 한 줄 유지.
- 현재 요소 강조(크기 확대 또는 외곽선), 완료 요소는 성공색 채움.
- circle 아래 작은 한글 요소 라벨 (영어 4요소 용어 비노출).

**완료 조건:** 360px 폭 모바일 뷰포트에서 레이아웃 깨짐 없음.

---

## 10. 디렉토리 규칙

```
app/app/write/quick/page.tsx          # [신규] Quick Mode 진입점
components/quick/
├── QuickStructuredInput.tsx           # 간소화 설문
├── QuickQASession.tsx                 # Quick Q&A
├── ProgressCircles.tsx                # 4요소 원형 게이지
├── SkipGuard.tsx                      # 메인질문 skip 비활성 + 안내
└── MinQuestionWarning.tsx             # floor 경고 모달
hooks/useQuickIdeation.ts              # Quick Q&A 상태/질문수/예산 관리
hooks/useEventLogger.ts                # 이벤트 로깅
lib/events.ts                          # logEvent + Stage 타입
lib/prompts/quickIdeation.ts           # Quick용 수정 프롬프트
```
기존 store(ideationStore, writingStore, structuredInputStore)는 재사용.
Quick 전용 상태(질문 수, 서브질문 예산, skip 카운트)는 `useQuickIdeation`에서 관리.

---

## 11. 코드 컨벤션
- TypeScript strict. 기존 타입 재사용.
- full pipeline 컴포넌트를 수정하지 말고, 필요하면 prop으로 mode를 받거나 Quick 전용 래퍼를 신규 작성.
- 이벤트 로깅은 사용자 흐름을 절대 막지 않음 (fire-and-forget).
- 한국어 UI, 기존 Flect 디자인 톤 유지.

## 12. 작업 시 주의
- `lib/intervention.ts`는 full pipeline에서 여전히 쓰이므로 **삭제하지 말 것.** Quick 경로에서 호출만 하지 않음.
- progress circle은 기존 완성도 평가 로직을 재사용하되 **시각화만 교체**.
- Q&A/Outline 통째 스킵 버튼은 작게 두되, 반드시 이벤트 로깅을 건다 (가설 측정 데이터).
- events 시트 헤더 추가는 수동 선행 작업. GAS 코드 수정은 불필요(범용 CRUD).
- `app/api/ideation/questions/route.ts`의 `logs/` 파일 기록은 **Netlify 서버리스에서 영속되지 않는다**
  (휘발성 fs, try/catch로 조용히 실패). XYZ 측정의 **source of truth는 events 시트**이며, `logs/`는 로컬 디버깅 전용이다.
- 측정 인프라(§8 events 시트 + `lib/events.ts`)를 **다른 UI Task보다 먼저** 구현한다. 로깅이 빠진 채 배포되면 베타 데이터가 통째로 유실된다.
