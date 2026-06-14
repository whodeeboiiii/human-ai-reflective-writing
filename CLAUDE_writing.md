# CLAUDE.md

> Sprint: **Writing Phase — Text Editor + AI Suggest & Fix**
> Updated: 2026-05-26
> Context: First Writing Phase sprint. Builds the page at `/app/write/[id]`, which is the target navigation from Outline Composition's "다음 단계로 →" button. Implement a Tiptap-based text editor with an outline sidebar and two AI features.

---

## 0. Reference Documents

Before writing any code, read:

- `docs/specs.md` §14 — Design tokens
- `store/ideationStore.ts` — source of outline data (`outline.cards`, `outline.userArrangedOrder`)
- `store/structuredInputStore.ts` — source of genre, topic, audience for prompt context

Do not read other docs unless a specific question requires it.

---

## 1. Current State (already done — do not rewrite)

**Pages (Ideation Phase — done)**
- `app/app/write/[id]/structured-input/page.tsx`
- `app/app/write/[id]/qa/page.tsx`
- `app/app/write/[id]/outline/page.tsx`

**Writing Phase target route (does NOT exist yet)**
- `app/app/write/[id]/page.tsx` — 404 until this sprint. The "다음 단계로 →" button in Outline already navigates here.

**Stores**
- `store/ideationStore.ts` — contains `outline: Outline | null`. The `Outline` type has `cards: MaterialCard[]` and `userArrangedOrder: string[] | null`.
- `store/structuredInputStore.ts` — contains genre, topic, audience, interventionLevel, etc.

**LLM Client** — `lib/upstage.ts` (`SOLAR_MODEL = 'solar-pro'`).

**Tiptap** — already installed (`@tiptap/react`, `@tiptap/starter-kit`). Do not install additional Tiptap extensions unless specified below.

---

## 2. This Sprint

Three groups.

---

### Group A — Page Shell & Editor Layout

#### A-1. Writing Phase Page

**구현 내용**: `/app/write/[id]` 서버 컴포넌트 페이지 쉘을 생성한다.

**구현 방식**:
```typescript
// app/app/write/[id]/page.tsx
export default async function WritingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WritingView sessionId={id} />;
}
```

#### A-2. Two-Column Layout

**구현 내용**: 왼쪽에 아웃라인 사이드바, 오른쪽에 텍스트 에디터가 배치된 2단 레이아웃.

**구현 방식**:
- `components/writing/WritingView.tsx` — 클라이언트 컴포넌트. 최상위 레이아웃 컨트롤러.
- CSS Grid: `grid-template-columns: 280px 1fr`. 사이드바 너비 고정 280px.
- 사이드바는 collapse/expand 가능 (클릭 시 토글, 아이콘 버튼). Collapsed 상태에서는 너비 48px (아이콘만).
- 레이아웃 상태(`sidebarOpen: boolean`)는 로컬 React state로 관리. persist 불필요.

#### A-3. Outline Sidebar

**구현 내용**: Ideation Phase에서 확정한 아웃라인 카드를 왼쪽 사이드바에 **읽기 전용**으로 표시한다.

**구현 포인트**:
- `ideationStore.outline`에서 카드 목록을 읽는다.
- 카드 순서는 `userArrangedOrder`가 있으면 그 순서, 없으면 `cards` 배열 순서.
- `sourceElement` 라벨은 표시하지 않는다 (Outline 스프린트 결정과 동일).
- 카드 내용은 편집 불가 (이 단계에서 outline 수정은 하지 않음).

**구현 방식**:
- `components/writing/OutlineSidebar.tsx` — 새 컴포넌트.
- `outline`이 null이면 빈 상태 메시지: "아웃라인이 없어요. 이전 단계로 돌아가 아웃라인을 만들어 주세요."
- 각 카드는 작은 텍스트 블록으로 렌더. 카드 사이에 구분선.
- 사이드바 상단에 "아웃라인" 타이틀 + collapse 버튼.

---

### Group B — Text Editor

#### B-1. Tiptap Editor

**구현 내용**: Tiptap StarterKit 기반 한국어 텍스트 에디터를 구현한다.

**구현 포인트**:
- `useEditor` 훅으로 에디터 인스턴스 생성.
- 에디터 내용(HTML)을 `writingStore`에 실시간 저장 (`onUpdate` 콜백).
- 마운트 시 `writingStore.draft`가 있으면 해당 내용으로 초기화 (세션 재진입 지원).

**구현 방식**:
```typescript
const editor = useEditor({
  extensions: [StarterKit],
  content: writingStore.draft || '',
  onUpdate: ({ editor }) => {
    writingStore.setDraft(editor.getHTML());
  },
});
```

에디터 컨테이너:
- `components/writing/EditorArea.tsx` — 새 컴포넌트.
- 최소 높이: `calc(100vh - 120px)`. 사용자가 스크롤하며 긴 글을 작성할 수 있도록.
- 폰트: `var(--font-body)`. 줄 간격: `1.8`. 글씨 크기: `1rem`.
- placeholder: "여기서 글을 시작해 보세요…" (Tiptap Placeholder extension 없이 CSS `::before`로 구현).
- 포커스 상태에서 outline border 없앰 (기본 focus ring 제거).

#### B-2. Draft 저장 Store

**구현 내용**: 드래프트 내용과 AI 인터랙션 기록을 관리하는 Zustand store.

**구현 방식**: 새 파일 `store/writingStore.ts` 생성.

```typescript
// types/writing.ts (새 파일)
export type AIInteractionType = 'suggest' | 'fix';
export type AIDecision = 'accepted' | 'rejected';

export interface AIWritingInteraction {
  id: string;
  type: AIInteractionType;
  triggeredAt: number;
  inputContext: string;       // 커서 앞 텍스트 또는 선택 텍스트
  suggestions: string[];      // LLM이 반환한 제안 목록
  decision: AIDecision;
  acceptedIndex?: number;     // 'suggest' 시 몇 번째 제안을 선택했는지
  finalText?: string;         // 'fix' 시 실제 적용된 텍스트
}

// store/writingStore.ts
interface WritingStore {
  draft: string;                          // Tiptap HTML
  setDraft: (html: string) => void;
  interactions: AIWritingInteraction[];
  addInteraction: (i: AIWritingInteraction) => void;
  reset: () => void;
}
```

`persist` middleware 사용. key: `'flect-writing'`. version: 1.

---

### Group C — AI Features

#### C-1. Context Menu System

**구현 내용**: 에디터에서 우클릭 시 브라우저 기본 컨텍스트 메뉴를 막고, Flect 커스텀 컨텍스트 메뉴를 표시한다.

**구현 포인트**: 선택 상태에 따라 메뉴 항목이 달라진다.
- **텍스트가 선택된 경우**: "✦ AI 문법 수정" 항목만 표시.
- **텍스트가 선택되지 않은 경우(커서만)**: "✦ 다음 문장 제안" 항목만 표시.

**구현 방식**:
- `components/writing/AIContextMenu.tsx` — 새 컴포넌트. React portal로 `document.body`에 렌더.
- 에디터 컨테이너에 `onContextMenu` 핸들러 부착:
  ```typescript
  onContextMenu={(e) => {
    e.preventDefault();
    const hasSelection = !editor.state.selection.empty;
    setContextMenu({ x: e.clientX, y: e.clientY, mode: hasSelection ? 'fix' : 'suggest' });
  }}
  ```
- 메뉴 외부 클릭 시 닫힘 (`useEffect`로 `mousedown` 이벤트 리스닝).
- 메뉴가 화면 우측·하단 경계를 벗어나면 반대 방향으로 위치 보정.
- 스타일: 흰색 배경, `var(--border)` 테두리, `var(--shadow-elevated)` 그림자. 항목 높이 36px.

#### C-2. AI 생성 (Next Sentence Suggest)

**구현 내용**: 컨텍스트 메뉴의 "다음 문장 제안" 또는 **Tab 키**를 누르면 LLM이 다음 이어질 문장 3가지를 제안한다.

**CoAuthor 적용 방식**:
- CoAuthor 원본: Tab 키 → GPT-3에 현재 텍스트 전송 → 5개 제안 표시 → 방향키로 탐색 → Enter로 선택.
- Flect 적용: 우클릭 메뉴 또는 Tab 키 → LLM에 컨텍스트 전송 → **3개 제안 카드 패널** → 클릭으로 선택 또는 Escape로 닫기.
- 제안 수를 5 → 3으로 줄인 이유: 인지 부담 감소. Flect 사용자는 CoAuthor의 전문 작가보다 선택에 어려움을 느낄 수 있다.

**구현 방식**:

**Tab 키 핸들러**:
```typescript
editor.setOptions({
  editorProps: {
    handleKeyDown: (view, event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        triggerSuggest(editor); // C-2에서 정의
        return true;
      }
      return false;
    },
  },
});
```

**API 호출**: `POST /api/writing/suggest`

Request body:
```typescript
interface SuggestRequest {
  genreLabel: string;
  topicSentence: string;
  outlineSummary: string;   // cards의 content를 줄바꿈으로 join (최대 300자)
  recentText: string;       // 커서 앞 최대 500자
}
```

Response:
```typescript
interface SuggestResponse {
  suggestions: string[];    // 정확히 3개
}
```

**제안 패널 UI** — `components/writing/SuggestionPanel.tsx`:
- 커서 위치(`editor.view.coordsAtPos(selection.anchor)`) 기준으로 패널을 화면에 위치시킨다.
- 3개 카드를 세로로 나열. 각 카드: 제안 텍스트 + "적용" 버튼.
- 카드 클릭 → `editor.commands.insertContent(suggestion)` → 패널 닫힘.
- Escape → 패널 닫힘 (텍스트 삽입 안 함).
- 로딩 중에는 3개의 skeleton card 표시.
- 패널이 열려있는 동안 에디터 입력은 막지 않는다 (자유롭게 타이핑 가능, 타이핑 시작하면 패널 닫힘).

**API Route** — `app/api/writing/suggest/route.ts`:

System prompt (인라인 상수로 정의):
```
[ROLE]
너는 글쓰기를 돕는 AI 작가 파트너다.
사용자가 지금까지 쓴 글 다음에 자연스럽게 이어질 한 문장을 제안한다.

[INPUT]
- 글의 장르: {genreLabel}
- 글의 주제: {topicSentence}
- 글의 아웃라인:
{outlineSummary}
- 지금까지 작성한 글 (최근 500자):
{recentText}

[TASK]
위 글에서 다음에 자연스럽게 이어지는 문장 3가지를 생성한다.

[규칙]
- 각 제안은 정확히 한 문장이어야 한다. 마침표 또는 물음표로 끝난다.
- 3가지 제안은 서로 다른 방향이어야 한다. 같은 표현이나 구조를 반복하지 않는다.
- 사용자가 지금까지 사용한 어조와 문체를 유지한다.
- 아웃라인을 참고하되, 이미 다룬 내용을 반복하지 않는다.
- 사용자가 쓴 내용을 요약·재서술하지 않는다. 새로운 내용을 더한다.
- 두 문장 이상 출력하지 않는다.

[금지]
- 제안 앞에 번호·불릿·설명을 붙이지 않는다.
- 마크다운 서식을 사용하지 않는다.

[출력 형식]
JSON 배열만 출력한다. 다른 텍스트 없이:
["제안 문장 1", "제안 문장 2", "제안 문장 3"]
```

Route 구현:
1. Request body에서 `{ genreLabel, topicSentence, outlineSummary, recentText }` 읽기.
2. `{...}` 플레이스홀더를 실제 값으로 치환.
3. `generateText(upstage(SOLAR_MODEL), ...)` 호출.
4. JSON 배열 파싱. 파싱 실패 시 HTTP 500 반환.
5. 배열 길이가 3이 아니면: 3개로 slice하거나 부족하면 500 반환.
6. 성공 시 `{ suggestions }` 반환.

**인터랙션 로깅**: 사용자가 제안을 수락하면 클라이언트에서 `writingStore.addInteraction(...)` 호출.

#### C-3. AI 수정 (Grammar Fix)

**구현 내용**: 텍스트를 드래그해 선택 후 컨텍스트 메뉴에서 "AI 문법 수정"을 누르면 LLM이 교정된 버전을 제안하고, diff 미리보기 후 적용/취소를 선택한다.

**구현 방식**:

**선택 텍스트 추출**:
```typescript
const { from, to } = editor.state.selection;
const selectedText = editor.state.doc.textBetween(from, to);
const surroundingContext = editor.state.doc.textBetween(
  Math.max(0, from - 200),
  Math.min(editor.state.doc.content.size, to + 200),
);
```

**API 호출**: `POST /api/writing/fix`

Request body:
```typescript
interface FixRequest {
  genreLabel: string;
  audienceLabel: string;     // structuredInputStore에서 가져옴
  selectedText: string;
  surroundingContext: string; // 앞뒤 200자 포함한 주변 텍스트
}
```

Response:
```typescript
interface FixResponse {
  correctedText: string;
}
```

**Diff 미리보기 UI** — `components/writing/DiffPreview.tsx`:
- 모달 또는 에디터 내 인라인 오버레이로 표시. **인라인 방식 채택**: 선택 영역 위에 작은 카드가 뜬다 (포지셔닝은 C-2 SuggestionPanel과 동일한 `coordsAtPos` 방식).
- 원문: 취소선 + 회색 텍스트.
- 교정문: 녹색 텍스트.
- 두 버튼: "적용" (초록) / "취소" (회색).
- "적용" 클릭 → `editor.commands.setTextSelection({ from, to })` → `editor.commands.insertContent(correctedText)` → 카드 닫힘.
- "취소" 클릭 → 카드 닫힘, 원문 유지.
- 로딩 중에는 스피너만 표시.

**API Route** — `app/api/writing/fix/route.ts`:

System prompt (인라인 상수):
```
[ROLE]
너는 한국어 글쓰기 교정 전문가다.
선택된 텍스트의 문법과 표현을 교정한다.
내용(사실, 의견, 감정)은 절대 바꾸지 않는다.

[INPUT]
- 글의 장르: {genreLabel}
- 예상 독자: {audienceLabel}
- 앞뒤 맥락:
{surroundingContext}
- 교정 대상:
{selectedText}

[TASK]
교정 대상 텍스트의 문법 오류, 맞춤법, 어색한 표현을 교정한 버전을 반환한다.

[규칙]
- 내용(사실, 의견, 감정, 논지)은 절대 바꾸지 않는다. 표현 방식만 교정한다.
- 사용자의 문체와 어조를 최대한 유지한다.
- 불필요하게 문장을 길게 늘리거나 내용을 추가하지 않는다.
- 원문이 이미 올바른 경우 원문 그대로 반환한다.
- 수정 이유나 설명을 붙이지 않는다.

[출력 형식]
교정된 텍스트만 출력한다. JSON이나 마크다운 없이 순수 텍스트만.
```

Route 구현:
1. Request body 읽기.
2. 플레이스홀더 치환.
3. `generateText(upstage(SOLAR_MODEL), ...)` 호출.
4. 응답을 `.trim()`으로 정리해 `{ correctedText }` 반환.
5. 오류 시 HTTP 500.

---

## 3. Key Files

### Touch / create

```
types/writing.ts                             ← new — AIWritingInteraction, AIInteractionType, AIDecision
store/writingStore.ts                        ← new — draft, interactions, persist v1
app/app/write/[id]/page.tsx                  ← new — server page shell
components/writing/WritingView.tsx           ← new — main client component, layout controller
components/writing/OutlineSidebar.tsx        ← new — read-only outline cards
components/writing/EditorArea.tsx            ← new — Tiptap editor wrapper
components/writing/AIContextMenu.tsx         ← new — right-click context menu (portal)
components/writing/SuggestionPanel.tsx       ← new — suggest cards panel
components/writing/DiffPreview.tsx           ← new — fix diff preview card
components/writing/writing.module.css        ← new — CSS module using design tokens
app/api/writing/suggest/route.ts             ← new — LLM next sentence generation
app/api/writing/fix/route.ts                 ← new — LLM grammar correction
```

### Do not touch

```
app/globals.css
components/ui/*
components/ideation/*                        ← ideation phase, done
store/ideationStore.ts                       ← read only from here
store/structuredInputStore.ts                ← read only from here
lib/upstage.ts
app/api/ideation/*
```

---

## 4. Acceptance Criteria

1. `npm run dev` starts with zero TypeScript errors. No `any` types.
2. Navigating to `/app/write/[id]` (from Outline "다음 단계로 →") renders the Writing Phase page without errors.
3. **Layout**: Left sidebar (280px) shows outline cards from `ideationStore.outline`. Right area shows the text editor. Sidebar can be collapsed/expanded via button.
4. **Sidebar**: If `ideationStore.outline` is null, an appropriate empty state message is shown instead of crashing.
5. **Editor**: Tiptap editor is functional — typing, backspace, newline all work. Content is persisted to `writingStore` on every update and survives page refresh.
6. **Right-click with selection**: Shows context menu with "AI 문법 수정" item only.
7. **Right-click without selection**: Shows context menu with "다음 문장 제안" item only.
8. **Tab key**: Triggers the same flow as "다음 문장 제안".
9. **생성 — Loading**: While fetching, 3 skeleton cards appear in the suggestion panel.
10. **생성 — Success**: 3 distinct suggestion cards appear. Clicking one inserts it at cursor position. Escape dismisses without inserting.
11. **생성 — Typing after panel open**: Panel closes; typing is not blocked.
12. **수정 — Loading**: Spinner appears near selection.
13. **수정 — Success**: Diff preview shows original (strikethrough) and corrected text (green). "적용" replaces text. "취소" keeps original.
14. **Interaction logging**: Accepting a suggestion or applying a fix calls `writingStore.addInteraction(...)`. `localStorage['flect-writing']` contains the interaction log.
15. **생성 API failure**: If `/api/writing/suggest` returns 500, show a brief error message in place of cards. Do not crash the page.
16. **수정 API failure**: If `/api/writing/fix` returns 500, show inline error near selection. Do not crash.

---

## 5. Constraints

- No `any` types.
- CSS variables only — no hardcoded colors or spacing.
- Do not install new npm packages. Tiptap StarterKit is already installed. Use only existing dependencies.
  - `coordsAtPos` is available via `editor.view` — no additional positioning library needed.
  - Context menu and suggestion panel can be positioned with `position: fixed` + coordinates from `onContextMenu` / `coordsAtPos`.
- `localStorage` access guarded by `typeof window !== 'undefined'` (handled by `persist`).
- The suggestion prompt must produce **exactly 3** items. If parsing yields fewer, return HTTP 500 rather than showing partial results.
- Fix prompt must **never change content** — only grammar and expression. This is a hard constraint reflecting Hwang et al.'s Authenticity principle.
- Do not implement Editing Phase features (inline annotation, Cursor-style diff for full review) in this sprint. The DiffPreview here is scoped to AI Fix only.
- `writingStore.interactions` is for User Study logging only. Do not expose it in the UI.
- The outline sidebar is **read-only**. Do not add any editing controls to it.
