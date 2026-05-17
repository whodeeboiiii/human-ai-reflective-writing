# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

---

## 1. Project Overview

**Flect** is a human–AI collaborative writing system for *casual writers* of personal essays
(commentary, critique, book review, review, travelogue, reflective journal).

The system is grounded in Flower & Hayes' (1981) cognitive writing process model
and is structured into three phases. Its core design principle is **Content Gatekeeping**:
the AI proposes, the writer always decides.

This repository contains the implementation submitted to two undergraduate courses
(HAI and SWAI). It will later be extended for a CHI / CSCW research paper, but the
near-term priority is the course deliverables.

### System Pipeline

```
Phase 1: Ideation                Phase 2: Writing             Phase 3: Editing
─────────────────                ────────────────             ────────────────
Structured Input                 Tab-trigger next-sentence    (out of scope this term)
       ↓                         suggestion (CoAuthor-style)
LLM Q&A Session                  Content Gatekeeping on
       ↓                         every AI suggestion
Outline Composition
```

**Scope for this term (HAI focus):**
- Ideation Phase → **rich** (main contribution)
- Writing Phase → **thin** (Tab-trigger suggestion only; no `/fix`, no `/formalize`)
- Editing Phase → **skipped**
- Community / auth / persistence / external DB → **out of scope** (HAI scope only)

### Core Design Principles

1. **Sequential, single-direction onboarding flow.** The Ideation Phase is one continuous
   forward path. No branching, no skipping ahead.
2. **Content Gatekeeping.** Every AI suggestion across phases uses a single shared
   accept/reject UI pattern, so the writer's authority is consistently visible.
3. **Voice preservation over output quality.** The system is willing to produce a "worse"
   sentence if that sentence is more clearly the writer's own.
4. **Calm, reflective tone.** Visually warm; not a productivity tool.

---

## 2. Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: TailwindCSS + shadcn/ui (Radix-based)
- **State**: Zustand (one store per pipeline stage)
- **Editor (later)**: Tiptap (ProseMirror) — Writing Phase only
- **Animation**: Framer Motion — Ideation onboarding transitions
- **LLM (later)**: Anthropic SDK + Vercel AI SDK (`ai` package) for streaming
- **Hosting**: Netlify

Out of scope for the HAI deliverable: Google Apps Script, Google Sheets, axios proxying,
authentication, server-side persistence. (These belong to a separate SWAI deliverable
already shipped as `flect-landing`.)

---

## 3. Repository Structure

```
project-root/
│
├── CLAUDE.md                          # this file
├── .env.local                         # ANTHROPIC_API_KEY, never committed
├── .env.example                       # safe template
├── next.config.ts
├── tailwind.config.ts
├── components.json                    # shadcn/ui CLI config
├── tsconfig.json
└── package.json
│
├── app/                               # Next.js App Router root
│   │
│   ├── layout.tsx                     # root layout (fonts, globals.css)
│   ├── globals.css                    # ★ Landing's style.css folded in here
│   ├── page.tsx                       # Main / Landing page (placeholder for now)
│   │
│   ├── app/                           # "logged-in" user surface
│   │   ├── layout.tsx                 # app layout
│   │   ├── page.tsx                   # ★ User Page (notes grid)
│   │   └── write/
│   │       ├── page.tsx               # New session entry → redirects to [id]
│   │       └── [id]/
│   │           ├── page.tsx           # Writing Phase (Tiptap editor) — later
│   │           ├── structured-input/
│   │           │   └── page.tsx       # ★ Ideation Step 1
│   │           ├── qa/
│   │           │   └── page.tsx       # ★ Ideation Step 2
│   │           └── outline/
│   │               └── page.tsx       # Ideation Step 3 — later
│   │
│   ├── api/                           # server-side handlers
│   │   ├── ideation/
│   │   │   ├── questions/route.ts     # Socratic Q&A generation — later
│   │   │   └── outline/route.ts       # Outline composition — later
│   │   └── writing/
│   │       └── suggest/route.ts       # CoAuthor-style suggestion — later
│   │
│   ├── _legacy/                       # static HTML/CSS/JS source for migration
│   │   ├── user.html / user.css / user.js
│   │   ├── ideation-input.html / .css / .js
│   │   └── ideation-qa.html / .css / .js
│   │
│   └── _legacy/style.css              # Landing's shared stylesheet (source for globals.css)
│
├── components/
│   ├── ui/                            # shadcn/ui — do not hand-edit
│   ├── user/                          # User Page note cards
│   ├── ideation/                      # Structured Input + Q&A components
│   │   ├── structured-input/
│   │   │   ├── SurveyFlow.tsx
│   │   │   ├── QuestionScreen.tsx
│   │   │   ├── ChoiceCard.tsx
│   │   │   ├── OpenQuestionInput.tsx
│   │   │   └── ProgressDots.tsx
│   │   └── qa/
│   │       ├── ChatContainer.tsx
│   │       ├── AIMessage.tsx
│   │       ├── UserMessage.tsx
│   │       ├── ChatInput.tsx
│   │       └── ThinkingIndicator.tsx
│   └── shared/
│       ├── AISuggestionCard.tsx       # shared accept/reject — Content Gatekeeping
│       └── PhaseProgressBar.tsx
│
├── lib/
│   ├── anthropic.ts                   # SDK singleton — later
│   └── prompts/                       # prompt builders — later
│       ├── ideation.ts
│       ├── outline.ts
│       └── suggest.ts
│
├── hooks/
│   ├── useIdeationSession.ts
│   └── useWritingSession.ts
│
├── store/                             # Zustand stores
│   ├── structuredInputStore.ts
│   ├── ideationStore.ts
│   └── writingStore.ts
│
└── types/                             # TS type definitions
    ├── structured-input.ts
    ├── ideation.ts
    └── writing.ts
```

---

## 4. Migration Task — Static HTML → TSX

### What exists

Three static page bundles (HTML + CSS + JS), each currently sitting under `app/_legacy/`:

1. **`user.html / user.css / user.js`** — User Page (notes grid hub)
2. **`ideation-input.html / .css / .js`** — Ideation Step 1 (Structured Input survey)
3. **`ideation-qa.html / .css / .js`** — Ideation Step 2 (LLM Q&A chat)

A shared `style.css` (Landing's stylesheet) lives in `_legacy/` and defines the design
tokens (`--accent`, `--ink`, `--line`, fonts, easing). All three pages reference it.

### Migration target

| From                            | To                                                              |
| ------------------------------- | --------------------------------------------------------------- |
| `_legacy/style.css`             | `app/globals.css`                                               |
| `user.html / .css / .js`        | `app/app/page.tsx` + `components/user/*`                        |
| `ideation-input.html / .css / .js` | `app/app/write/[id]/structured-input/page.tsx` + `components/ideation/structured-input/*` |
| `ideation-qa.html / .css / .js` | `app/app/write/[id]/qa/page.tsx` + `components/ideation/qa/*`   |

### Migration rules (apply to every file)

1. **CSS unification.** Fold `_legacy/style.css` into `app/globals.css` first.
   Then bring each page's overlay CSS (`user.css`, `ideation-input.css`, `ideation-qa.css`)
   in as scoped styles. Keep CSS variables (`--accent`, `--ink`, `--serif`, `--mono`,
   `--ease`, etc.) intact — they are the design tokens.
2. **HTML → JSX conversion.**
   - `class=` → `className=`
   - `<a href="/...">` → `<Link href="/...">` (Next.js)
   - `<a href="...external...">` → keep `<a>`
   - Inline `<script>` → remove; logic moves into the React component.
3. **Imperative DOM logic → declarative React.**
   - `document.getElementById(...).textContent = ...` → state + JSX.
   - Hardcoded data arrays (`NOTES`, `QUESTIONS`, `MOCK_QA`) → typed constants in
     `lib/data/*.ts`, imported by the page.
4. **Types first.** Before writing JSX, declare the data interfaces in `types/*.ts`.
   Use them everywhere downstream — no `any`.
5. **State boundaries.**
   - Per-component ephemeral state → `useState`.
   - Cross-page state that the next phase will read → Zustand store.
   - Structured Input answers must land in `structuredInputStore`.
   - Q&A turns must land in `ideationStore`.
6. **Animation.** The static JS uses `requestAnimationFrame` and CSS transitions for
   stagger and fade. In React, replace with Framer Motion `<motion.div>` where the
   animation is conditional or sequenced. Pure hover transitions can stay as CSS.
7. **Routing.** Hardcoded `href="/app/write"` etc. in the static HTML must resolve to
   real Next.js routes per the structure above. Use dynamic `[id]` segments where the
   spec implies a per-session URL.

### Migration order (do not skip ahead)

1. Set up `app/globals.css` from `_legacy/style.css`. Verify Landing-equivalent visual
   tokens render in a stub `app/page.tsx`.
2. Migrate **User Page** (`app/app/page.tsx`). Lowest risk; mostly static markup +
   hardcoded note array.
3. Migrate **Structured Input** (`app/app/write/[id]/structured-input/page.tsx`).
   Introduces: sequential screen flow, Framer Motion transitions, Zustand store.
4. Migrate **Q&A Session** (`app/app/write/[id]/qa/page.tsx`).
   Introduces: chat UI, streaming-style text reveal, message array state.
   LLM calls are NOT wired yet — use the placeholder script in `ideation-qa.js` as the
   mock data source.

After each step, the page must render and behave identically (or better) than the
static version before moving on.

---

## 5. What Is Out of Scope (Do Not Implement)

- Authentication, session persistence, real user accounts.
- Real LLM API calls. Q&A uses hardcoded mock turns; structured input is local-only.
- Google Apps Script / Sheets integration.
- Editing Phase UI of any kind.
- `/fix` and `/formalize` slash commands in Writing Phase.
- Community / publishing / sharing features.
- Mobile-first design. Desktop is primary; mobile must merely not break.
- Dark mode.
- i18n. Korean UI only.

If a task seems to require any of the above, stop and ask.

---

## 6. Working Conventions

- **TypeScript everywhere.** No `.js` files in `app/`, `components/`, `lib/`, `hooks/`,
  `store/`, `types/`.
- **No `any`.** If a type is genuinely unknown, use `unknown` and narrow.
- **One concern per component.** A `QuestionScreen` renders one question; a
  `SurveyFlow` orchestrates the sequence.
- **Stores stay thin.** Stores hold data and dumb setters. Side effects (API calls,
  routing) live in hooks or page components.
- **Korean UI text** is the source of truth — preserve exact wording from the static
  HTML during migration. Do not "improve" copy unless explicitly asked.
- **Design tokens are sacred.** Do not introduce new colors, fonts, or easing curves
  outside the existing `--accent / --ink / --line / --serif / --mono / --ease` system.
- **Comments in English.** UI strings in Korean.
- **No `localStorage` writes during SSR.** Guard with `typeof window !== "undefined"`
  or do it inside `useEffect`.

---

## 7. Verification After Each Migration Step

Before declaring a step done, verify:

1. `pnpm dev` (or `npm run dev`) starts without TypeScript or lint errors.
2. The migrated page renders at the expected route.
3. Visual parity: side-by-side comparison with the static HTML version shows no
   regressions in spacing, typography, or color.
4. All interactive behaviors from the static JS are preserved (hover, fade-in,
   sequential progression, etc.).
5. Data captured by the page is reachable from the relevant Zustand store
   (e.g. after completing Structured Input, `useStructuredInputStore.getState()`
   returns the full survey object).

---

## 8. Reference Documents (in `/Project Files`)

- `Project_Brainstorming.md` — full design rationale, scope decisions, related work.
- `Implementation_Plan.md` — pipeline spec, question banks, technical decisions.
- `HAI_Project_Proposal__Team_JCI.pdf` — the proposal as submitted; binding for HAI scope.
- `HAI_Class_Feedback.md` — instructor / TA / peer feedback. Treat as constraints,
  not suggestions.
- `Lee_et_al_2022__CoAuthor*.pdf` — prior work; basis for the Tab-suggest interaction.
- `Hwang_et_al_2025__It_was_80_me_20_AI*.pdf` — prior work; basis for the
  authenticity / voice-ownership framing.