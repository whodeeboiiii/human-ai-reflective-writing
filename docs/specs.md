# Flect — Project Specs

> Single source of truth for the Flect project.
> Consolidates Project_Brainstorming.md, Implementation_Plan.md, and all design decisions made through the planning chat.

**Last updated**: 2026-05-17

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Research Questions](#2-goals--research-questions)
3. [Target Users](#3-target-users)
4. [System Pipeline](#4-system-pipeline)
5. [Phase 1 — Ideation](#5-phase-1--ideation)
6. [Phase 2 — Writing](#6-phase-2--writing)
7. [Phase 3 — Editing (Out of Scope)](#7-phase-3--editing-out-of-scope)
8. [Community Feature](#8-community-feature)
9. [Scope Boundaries (HAI vs SWAI)](#9-scope-boundaries-hai-vs-swai)
10. [Tech Stack](#10-tech-stack)
11. [Repository Structure](#11-repository-structure)
12. [Data Model](#12-data-model)
13. [API Endpoints](#13-api-endpoints)
14. [Design Language](#14-design-language)
15. [User Study Plan](#15-user-study-plan)
16. [Out of Scope](#16-out-of-scope)
17. [Milestones](#17-milestones)

---

## 1. Project Overview

**Flect** is a human–AI collaborative writing system for casual writers of personal essays.
The name combines "**re**flect" (the system mirrors the writer's internal states back to them) and "in**flect**" (it bends a fuzzy area into a concrete structure).

### Problem

When non-professional writers use LLMs for personal writing, two failure modes appear:

- **Blank-page paralysis** — the writer has something to say but cannot begin.
- **Voice loss** — the writer hands the task to the LLM and the resulting text feels foreign, not their own.

Existing systems (CoAuthor, ChatGPT-style assistants) primarily intervene at the *Writing* stage. Flect's hypothesis is that the more impactful intervention is *before* writing begins — in the **Ideation** stage, where the writer's fuzzy intentions become a structured outline that they own.

### Solution

A three-phase pipeline grounded in Flower & Hayes' (1981) cognitive writing process model (Planning → Translating → Reviewing). The system supports the writer through each phase while preserving **Content Gatekeeping**: the AI proposes, the writer always decides.

### Course Context

This project is delivered to two undergraduate courses with overlapping but distinct scopes:

- **HAI (Human-AI Interaction)** — primary academic submission. Focus on Ideation Phase as the research contribution.
- **SWAI (SW/AI Business Application Design)** — implementation-and-deployment focused. Requires Google Apps Script + Sheets backend pattern taught in class.

---

## 2. Goals & Research Questions

### Primary Research Question
Does an Ideation-first interaction model (Structured Input → Socratic Q&A → AI-composed Outline) preserve the writer's sense of authorship and voice compared to LLM ghostwriting at the Writing stage?

### Sub-questions
- Does pre-writing reflection resolve the "Fuzzy Area" (the abstract intention before words exist)?
- How does writer perceived **Agency** vary across the three phases?
- Does perceived **Authenticity** of the final text correlate with the depth of Ideation engagement?

---

## 3. Target Users

**Primary persona**: Casual writers who want to write personal essays (book reviews, travelogues, reviews) but feel stuck before starting, or feel that LLM-generated text does not feel like theirs.

**Demographic**: 20s–30s, comfortable with digital tools, occasional but not professional writers.

**Out of target**:
- Professional writers seeking productivity tools (their voice ownership is already secure).
- Diary writers who write without structure ("emotional venting") — Ideation intervention would feel intrusive.
- Academic / technical writers whose work is fact-driven rather than experience-driven.
- 'Reflective Essay', 'Commentary' is removed from the supported writing list for now. Only include reviews, such as book reviews, movie reviews, etc.

---

## 4. System Pipeline

```
┌───────────────────────────────────────────────────────────────────────┐
│                          Flect Pipeline                                │
└───────────────────────────────────────────────────────────────────────┘

  PHASE 1: IDEATION                    "Resolving the Fuzzy Area"
  ─────────────────────                
  Structured Input    →   LLM Q&A      →   Outline Composition
  (5 main + 5 opt.)       (Socratic)        (AI-drafted, user-confirmed)

           ↓

  PHASE 2: WRITING                     "On-demand Contextual Assistance"
  ─────────────────────                
  Tab-trigger next-sentence suggestion (CoAuthor-style)
  Every suggestion → Content Gatekeeping (accept/reject)

           ↓

  PHASE 3: EDITING        ← out of scope for this term

           ↓

  COMMUNITY               ← SWAI scope only
  ─────────────────────
  Anonymous publishing to community feed
```

### Core Design Principles

1. **Sequential, single-direction Ideation flow.** No branching, no skipping ahead. Each step locks in once complete.
2. **Content Gatekeeping is universal.** Every AI output across all phases offers the user an accept/reject moment via a shared `AISuggestionCard` component.
3. **Voice preservation over output quality.** The system tolerates a "worse" sentence if it is unmistakably the writer's.
4. **Calm, reflective tone.** The product is not a productivity tool. Animations are slow, type is generous, color is warm.

---

## 5. Phase 1 — Ideation

The largest and most important phase. Contains three sequential sub-steps.

### 5.1 Structured Input

A one-question-per-screen survey that captures the writer's context for downstream LLM prompting.

#### Main Questions (5, required)

| # | Question | Type | Options |
|---|---|---|---|
| 1 | 어떤 글을 쓰고 싶으신가요? | Single-select | 영화 리뷰, 독후감, 제품 리뷰, 장소 리뷰, 여행기 |
| 2 | 쓰고 싶은 글의 주제나 소재를 한 문장으로 적어주세요. | Open text | — |
| 3 | 쓸 내용이 머릿속에 얼마나 정리되어 있나요? | Single-select (ordinal) | 거의 없음 / 조금 있음 / 꽤 있음 / 거의 다 있음 |
| 4 | 글쓰기에 얼마나 익숙하신가요? | Single-select | 거의 안 씀 / 가끔 / 자주 / 직업·전공으로 |
| 5 | 이 글이 얼마나 잘 써져야 하나요? | Single-select (ordinal) | 가볍게 / 적당히 / 잘 / 아주 잘 |

#### Optional Questions (5, gated by "더 많은 정보를 주실 건가요?" prompt)

| # | Question | Type |
|---|---|---|
| 6 | 이 글을 누가 읽었으면 하나요? | Single-select |
| 7 | 이 글을 다른 사람과 공유할 생각이 있으신가요? | Single-select |
| 8 | 이 글을 어디에 올릴 예정인가요? | Single-select |
| 9 | 어떤 느낌의 글이었으면 하나요? | Single-select |
| 10 | 어느 정도 길이의 글을 생각하고 계신가요? | Single-select |

#### Interaction Spec

- One question per screen.
- 0.5s cross-fade transition between screens (with 8–12px vertical translate).
- Single-select: tap → auto-advance.
- Open text: tap **완료** to advance.
- **뒤로** button preserves prior answers.
- Progress dots at top (5 base + expand to 10 if optional path is taken).

#### Output Schema

```typescript
interface StructuredInput {
  genre: 'critique' | 'book_review' | 'review' | 'travelogue' | 'reflective_journal';
  topicSentence: string;
  ideaClarity: 'none' | 'somewhat' | 'mostly' | 'clear';
  writingExperience: 'novice' | 'occasional' | 'regular' | 'professional';
  importance: 1 | 2 | 3 | 4;
  // Optional
  audience?: string;
  sharingIntent?: string;
  uploadDestination?: string;
  tone?: string;
  expectedLength?: 'short' | 'medium' | 'long';
}
```

---

### 5.2 LLM Q&A Session

Socratic question-and-answer chat. Surfaces the writer's internal states (feelings, motivations, memories) that the Structured Input cannot capture.
Questioning is left to the LLM agent to decide, based on a specific prompt that defines how to generate questions.

#### Question Composition

```
[Pre-defined questions (4)]     ← genre-specific, hardcoded templates
            ↓
[User answers each]
            ↓
[LLM generates additional 'instant specification request' questions (max 1 per pre-defined question)]
            ↓
[User answers each]
            ↓
[LLM analyzes answer set]
            ↓
[LLM follow-up questions (max 4)]   ← dynamically generated based on gaps
            ↓
[Outline Composition]
```

The user does not see this split — it is one continuous conversation.

#### Interaction Spec

- Chat UI in the style of claude.ai (low-contrast message bubbles, generous spacing, streaming text).
- AI message on the left with "F" mark; user message on the right.
- Each AI message uses streaming reveal (~50–80ms per word).
- Bottom-sticky input area with **보내기** buttons.
- Enter = newline; **보내기** button to submit (avoids accidental sends for long answers).
- Thinking indicator: 3 fading dots while LLM generates the next question.

#### Output Schema

```typescript
interface QATurn {
  turn: number;
  role: 'assistant' | 'user';
  content: string;
  type?: 'intro' | 'predefined' | 'llm-generated';
  skipped?: boolean;
  timestamp: string;
}

interface IdeationSession {
  structuredInput: StructuredInput;
  qa: QATurn[];
  outline: Outline | null;
}
```

---

### 5.3 Outline Composition

The LLM produces a one-sentence-per-beat outline of the planned essay's overall flow, based on Structured Input + Q&A.

#### Design Principle

> Not paragraph-by-paragraph instructions. Not intro/body/conclusion templating.
> **Just the overall narrative flow, one sentence per beat.**

Resolves the Fuzzy Area without prescribing how the writing itself must unfold.

#### Interaction

1. After the final Q&A turn, AI displays a "writing the outline" loading state.
2. The outline appears as an editable list of sentences (one per row).
3. User can edit, reorder, add, or delete any beat before proceeding.
4. **다음 단계로 →** advances to Writing Phase.

#### Output Schema

```typescript
interface Outline {
  beats: { id: string; text: string }[];
  generatedAt: string;
  userEdited: boolean;
}
```

---

## 6. Phase 2 — Writing

A rich-text editor with **one** AI assistance feature: Tab-trigger next-sentence suggestion (CoAuthor style).

### 6.1 Editor

- **Tiptap** (ProseMirror) for the editing surface.
- A persistent right-side sidebar shows the Outline beats for reference.
- No formatting toolbar in the MVP (plain prose is the intended output).

### 6.2 Tab-trigger Suggestion

- User presses **Tab**.
- LLM is called with Structured Input + Outline + recent text context.
- Returns a single-sentence continuation, displayed as inline ghost text.
- **Tab again** = cycle to a new suggestion.
- **Enter** = accept (insert into document).
- **Esc** or continue typing = reject.

Every suggestion event (accept/reject/edit) is logged to the `ai_interactions` table.

### 6.3 Out of Scope for HAI

The original proposal included Fix (grammar) and Formalize (style transfer) slash commands. These are deferred to future work to keep the HAI submission focused.

### 6.4 In Scope for SWAI

In addition to Tab-trigger suggestion, SWAI submission includes a **"Publish to community"** button at the end of writing. See Section 8.

---

## 7. Phase 3 — Editing (Out of Scope)

The original proposal included a Critical Review stage with Grammarly-style inline annotations and Cursor-style diff acceptance. This phase is **not implemented this term**.

Rationale:
- Two-month timeline does not allow production-quality implementation of all three phases.
- TA feedback: critical editing on casual personal writing may feel intrusive and reduce UX.
- Removing this phase lets the research focus stay on the novel contribution (Ideation).

Editing Phase implementation is reserved for the post-course paper extension.

---

## 8. Community Feature

**SWAI scope only.** Provides a publishing destination and lightweight social signal.

### Flow
1. After completing a writing session, the user sees a **"Publish anonymously"** button.
2. Clicking it sends a write to Google Sheets `community_posts` table via GAS.
3. A `/community` route shows a feed of recently published posts.
4. Posts display title, body, genre tag, publish date. No comments, no likes, no profiles.

### Anonymity
- No author identity is collected (no login).
- An anonymous `author_hash` is generated client-side from a stable random ID (stored in localStorage) for de-duplication only.

*details to be provided later*

---

## 9. Scope Boundaries (HAI vs SWAI)

| Component | HAI | SWAI |
|---|---|---|
| Structured Input | ✓ | ✓ |
| LLM Q&A Session | ✓ | ✓ |
| Outline Composition | ✓ | ✓ |
| Writing — Tab suggestion | ✓ | ✓ |
| Writing — Fix / Formalize | ✗ | ✗ |
| Editing Phase | ✗ | ✗ |
| Community publishing | ✗ | ✓ |
| GAS + Sheets backend | ✗ (not required) | ✓ (required) |
| Fake Door landing page | ✗ | ✓ (already shipped) |
| User Study (N=3–5) | ✓ | — |

The same Next.js codebase delivers both. Components specific to SWAI (Community page, GAS integration) are present in the build but unused in the HAI evaluation path.

---

## 10. Tech Stack

### Frontend

- **Next.js 15** (App Router) + **TypeScript**
- **Tiptap** (ProseMirror) — Writing Phase editor
- **shadcn/ui** + **TailwindCSS** — Radix-based components; covers sliders, dialogs, popovers needed for the survey UI
- **Framer Motion** (optional) — Ideation onboarding screen transitions
- **Zustand** — Structured Input, Ideation, Writing state stores
- **axios** — GAS calls (consistent with SWAI course pattern)

### LLM Backend

- **Next.js API Routes** — server-side LLM handlers (protects API key)
- **Upstage Solar Pro 3** — primary LLM (chosen for Korean language quality, reasoning capability, and existing $80 credit balance)
- **Vercel AI SDK** (`ai` package) — streaming via `useChat`. Upstage exposes an OpenAI-compatible endpoint, so the SDK's `@ai-sdk/openai` provider connects with only a `baseURL` override.

### SWAI Backend

- **Google Apps Script** — `doGet` + CRUD framework reused from class material.
- **Google Sheets** — entire DB. Tables: `visitors`, `waitlist`, `documents`, `community_posts`, `ai_interactions`.

### Deployment

- **Netlify** — entire system. Netlify's Next.js adapter handles SSR and API routes; SSE streaming verified to work.

### Design / Prototyping

- **Claude Design** — HTML/CSS prototypes for Landing, User Page, Structured Input, Q&A Session.
- **Claude Code** — TSX migration and ongoing implementation.

---

## 11. Repository Structure

```
project-root/
│
├── CLAUDE.md                          # Claude Code working manual
├── specs.md                           # this file
├── .env.local                         # UPSTAGE_API_KEY (not committed)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json
├── tsconfig.json
└── package.json
│
├── app/
│   ├── layout.tsx
│   ├── globals.css                    # design tokens (folded in from Landing's style.css)
│   ├── page.tsx                       # Landing / Main page
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # User Page (notes grid)
│   │   └── write/
│   │       ├── page.tsx               # New session entry
│   │       └── [id]/
│   │           ├── structured-input/page.tsx
│   │           ├── qa/page.tsx
│   │           ├── outline/page.tsx
│   │           └── page.tsx           # Writing Phase editor
│   │
│   ├── community/
│   │   └── page.tsx                   # SWAI scope
│   │
│   └── api/
│       ├── ideation/
│       │   ├── questions/route.ts
│       │   └── outline/route.ts
│       ├── writing/
│       │   └── suggest/route.ts
│       └── gas/
│           └── route.ts               # GAS proxy (avoids CORS)
│
├── components/
│   ├── ui/                            # shadcn/ui — do not hand-edit
│   ├── user/
│   ├── ideation/
│   │   ├── structured-input/
│   │   └── qa/
│   ├── editor/                        # Tiptap + extensions
│   ├── community/
│   └── shared/
│       └── AISuggestionCard.tsx       # universal accept/reject UI
│
├── lib/
│   ├── upstage.ts                     # OpenAI-compatible client config
│   ├── gas.ts                         # GAS call wrappers
│   └── prompts/
│       ├── ideation/
│       │   ├── critique.ts
│       │   ├── book_review.ts
│       │   ├── review.ts
│       │   ├── travelogue.ts
│       │   └── reflective_journal.ts
│       ├── outline.ts
│       └── suggest.ts
│
├── hooks/
│   ├── useStructuredInput.ts
│   ├── useQASession.ts
│   ├── useOutline.ts
│   └── useWritingSession.ts
│
├── store/
│   ├── structuredInputStore.ts
│   ├── ideationStore.ts
│   └── writingStore.ts
│
└── types/
    ├── structured-input.ts
    ├── ideation.ts
    └── writing.ts
```

---

## 12. Data Model

All persistence is via Google Sheets through Google Apps Script.

### `visitors`
| Column | Description |
|---|---|
| id | UV cookie hash |
| landingUrl | URL the visitor first hit |
| ip | from jsonip.com |
| referer | document.referrer |
| time_stamp | YYYY-MM-DD HH:MM:SS |
| utm | channel tag |
| device | mobile / desktop |

### `waitlist`
| Column | Description |
|---|---|
| id | UV hash |
| email | submitted email |
| advice | optional free-text feedback |

### `documents`
| Column | Description |
|---|---|
| id | session UUID |
| author_hash | client-stable anon hash |
| title | first line or user-provided |
| genre | from Structured Input |
| structured_input | JSON blob |
| qa_session | JSON blob |
| outline | JSON blob |
| content | final text |
| created_at | timestamp |
| updated_at | timestamp |

### `community_posts`
| Column | Description |
|---|---|
| id | post UUID |
| document_id | FK → documents.id |
| author_hash | anon hash |
| title | post title |
| content | full essay |
| genre | tag |
| published_at | timestamp |

### `ai_interactions`
| Column | Description |
|---|---|
| id | interaction UUID |
| document_id | FK → documents.id |
| phase | ideation / writing |
| action_type | suggest / qa_response / outline_edit |
| ai_output | text |
| user_decision | accept / reject / edit |
| user_edited_text | if action_type=edit |
| timestamp | timestamp |

This table is the primary quantitative data source for the user study.

---

## 13. API Endpoints

All endpoints are Next.js API Routes. Streaming where applicable.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/ideation/questions` | Generate next Q&A question (template-filled or LLM follow-up) |
| POST | `/api/ideation/outline` | Compose outline from full Ideation context |
| POST | `/api/writing/suggest` | Stream next-sentence suggestion (CoAuthor style) |
| POST | `/api/gas` | Proxy to Google Apps Script (server-side, avoids CORS) |

---

## 14. Design Language

### Tone
- Warm cream / beige background. Amber-to-terracotta accent.
- Humanist serif (Gowun Batang) for headlines; Pretendard for body; JetBrains Mono for metadata.
- Generous whitespace. Slow easing curves (`cubic-bezier(0.22, 0.61, 0.36, 1)`).
- Inspired by claude.ai's editorial calm.

### Tokens (CSS custom properties, defined in `globals.css`)
```
--accent       — terracotta / amber
--accent-deep  — darker accent
--accent-soft  — translucent accent for hover states
--ink          — primary text
--ink-mute     — secondary text
--ink-faint    — metadata
--line         — primary border
--line-soft    — subtle border
--serif, --sans, --mono — font stacks
--ease         — universal easing curve
```

### Pages built
- Landing (Fake Door, deployed)
- User Page (notes grid)
- Structured Input (12-screen sequential flow)
- Q&A Session (chat UI)

### Pages remaining
- Outline Composition
- Writing Phase editor
- Community feed

---

## 15. User Study Plan

### Design
Semi-structured interview + hands-on system evaluation, adapted from Hwang et al. (2025).

### Participants
N = 3–5 casual writers. Recruitment via Yonsei community channels (Everytime, instructor introductions).

### Protocol (≈ 110 minutes per participant)

**Pre-interview (20 min).** Background, prior LLM writing experience, opinions about AI in writing.

**System evaluation (70 min).** Hands-on writing session with screen recording + think-aloud protocol. Participants choose a topic within the supported genres. Researcher observes silently, noting:
- Interaction patterns
- Moments of hesitation or confusion
- Acceptance / rejection of AI suggestions
- Verbal satisfaction / frustration

**Post-interview (20 min).** Semi-structured probe across four dimensions: Perceived Agency, Perceived Authenticity, Resolution of the Fuzzy Area, Intention to Reuse

### Analysis
- **Thematic coding** of interview transcripts (open codes → axial categories aligned to the four dimensions).
- **Behavioral triangulation** from screen recordings + `ai_interactions` table (acceptance rate, phase dwell time, session restarts).

---

## 16. Out of Scope

Explicitly excluded from this term's deliverables:

- Authentication / user accounts (anon hash only)
- Real-time collaboration
- Server-side persistence outside Google Sheets
- Vercel KV / Postgres / any non-Sheets DB
- Editing Phase (any form)
- `/fix` and `/formalize` slash commands
- Mobile-first design (desktop is primary; mobile must not break)
- Dark mode
- i18n (Korean UI only)
- Custom domain
- Analytics beyond what's already in the `visitors` table
- A/B testing infrastructure

---

## 17. Milestones

| Week | Dates | Deliverable |
|---|---|---|
| 7 | Apr 14–20 | Brainstorming, scope definition, related work |
| 8 | Apr 21–27 | Project planning & proposal |
| 9 | Apr 28–May 4 | Re-planning post-feedback; AI interaction design & prompt engineering; Fake Door deployment |
| 10 | May 5–11 | Ideation Phase implementation |
| 11 | May 12–18 | Writing Phase MVP + Community feed |
| 12 | May 19–25 | Internal testing, refinement, **user study starts** |
| 13–14 | May 26–Jun 8 | User study completion, thematic analysis, final report |
| 15 | Jun 9–15 | Final presentation |


**End of specs.md**
