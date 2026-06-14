'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useStructuredInputStore } from '@/store/structuredInputStore';
import { useIdeationStore } from '@/store/ideationStore';
import { useWritingStore } from '@/store/writingStore';
import type { MaterialCard } from '@/types/ideation';
import { OutlineSidebar } from './OutlineSidebar';
import { AnswersSidebar } from './AnswersSidebar';
import { EditorArea } from './EditorArea';
import { AIContextMenu, type ContextMenuMode } from './AIContextMenu';
import { SuggestionPanel } from './SuggestionPanel';
import { DiffPreview } from './DiffPreview';
import styles from './writing.module.css';

const GENRE_LABELS: Record<string, string> = {
  critique: '비평/평론',
  'book-report': '독후감',
  review: '리뷰',
  travelogue: '여행기',
};

const AUDIENCE_LABELS: Record<string, string> = {
  self: '나 자신',
  'close-circle': '가까운 사람들',
  'interest-circle': '같은 관심사를 가진 사람들',
  public: '더 넓은 대중',
  undecided: '일반 독자',
};

interface ContextMenuState {
  x: number;
  y: number;
  mode: ContextMenuMode;
}
interface PanelPos {
  x: number;
  y: number;
}
interface DiffState extends PanelPos {
  from: number;
  to: number;
}

export default function WritingView({ sessionId }: { sessionId: string }) {
  const answers = useStructuredInputStore((s) => s.answers);
  const outline = useIdeationStore((s) => s.outline);
  const qaTurns = useIdeationStore((s) => s.turns);
  const setDraft = useWritingStore((s) => s.setDraft);
  const addInteraction = useWritingStore((s) => s.addInteraction);

  const genreLabel = answers.genre ? (GENRE_LABELS[answers.genre] ?? '글') : '글';
  const topicSentence = answers.topicSentence ?? '';
  const audienceLabel = answers.audience ? (AUDIENCE_LABELS[answers.audience] ?? '일반 독자') : '일반 독자';

  // Ordered outline cards (userArrangedOrder wins, fall back to array order)
  const orderedCards = useMemo<MaterialCard[] | null>(() => {
    if (!outline) return null;
    const { cards, userArrangedOrder } = outline;
    if (!userArrangedOrder) return cards;
    const byId = new Map(cards.map((c) => [c.id, c]));
    const ordered = userArrangedOrder
      .map((id) => byId.get(id))
      .filter((c): c is MaterialCard => Boolean(c));
    const remaining = cards.filter((c) => !userArrangedOrder.includes(c.id));
    return [...ordered, ...remaining];
  }, [outline]);

  const outlineSummary = useMemo(() => {
    if (!orderedCards) return '';
    return orderedCards
      .map((c) => c.content)
      .filter(Boolean)
      .join('\n')
      .slice(0, 300);
  }, [orderedCards]);

  // ── Layout ──
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Right-hand Q&A answers sidebar — collapsed by default.
  const [answersOpen, setAnswersOpen] = useState(false);

  // ── Context menu ──
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // ── Suggest flow ──
  const [suggestPos, setSuggestPos] = useState<PanelPos | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const suggestCtxRef = useRef('');

  // ── Fix flow ──
  const [diff, setDiff] = useState<DiffState | null>(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixError, setFixError] = useState(false);
  const [correctedText, setCorrectedText] = useState<string | null>(null);
  const [originalSel, setOriginalSel] = useState('');

  const triggerSuggestRef = useRef<() => void>(() => {});

  const editor = useEditor({
    extensions: [StarterKit],
    content: typeof window !== 'undefined' ? useWritingStore.getState().draft : '',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: styles.prose },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          triggerSuggestRef.current();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      setDraft(editor.getHTML());
    },
  });

  const closeSuggest = useCallback(() => {
    setSuggestPos(null);
    setSuggestions(null);
    setSuggestError(false);
    setSuggestLoading(false);
  }, []);

  const closeDiff = useCallback(() => {
    setDiff(null);
    setCorrectedText(null);
    setFixError(false);
    setFixLoading(false);
  }, []);

  // ── Suggest: next sentence ──
  const triggerSuggest = useCallback(async () => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const recentText = editor.state.doc.textBetween(Math.max(0, from - 500), from, '\n', ' ');
    suggestCtxRef.current = recentText;

    setDiff(null); // mutually exclusive with fix
    setSuggestPos({ x: coords.left, y: coords.bottom });
    setSuggestions(null);
    setSuggestError(false);
    setSuggestLoading(true);

    try {
      const res = await fetch('/api/writing/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genreLabel, topicSentence, outlineSummary, recentText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { suggestions: string[] };
      setSuggestions(data.suggestions);
    } catch {
      setSuggestError(true);
    } finally {
      setSuggestLoading(false);
    }
  }, [editor, genreLabel, topicSentence, outlineSummary]);

  useEffect(() => {
    triggerSuggestRef.current = triggerSuggest;
  }, [triggerSuggest]);

  const handleSelectSuggestion = useCallback(
    (index: number) => {
      if (!editor || !suggestions) return;
      const text = suggestions[index];
      editor.chain().focus().insertContent(text).run();
      addInteraction({
        id: crypto.randomUUID(),
        type: 'suggest',
        triggeredAt: Date.now(),
        inputContext: suggestCtxRef.current,
        suggestions,
        decision: 'accepted',
        acceptedIndex: index,
      });
      closeSuggest();
    },
    [editor, suggestions, addInteraction, closeSuggest]
  );

  // Typing closes the suggestion panel (but does not block input)
  useEffect(() => {
    if (!editor || !suggestPos) return;
    const onUpdate = () => closeSuggest();
    editor.on('update', onUpdate);
    return () => {
      editor.off('update', onUpdate);
    };
  }, [editor, suggestPos, closeSuggest]);

  // ── Fix: grammar correction ──
  const triggerFix = useCallback(async () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    if (from === to) return;
    const selectedText = editor.state.doc.textBetween(from, to, '\n', ' ');
    const surroundingContext = editor.state.doc.textBetween(
      Math.max(0, from - 200),
      Math.min(editor.state.doc.content.size, to + 200),
      '\n',
      ' '
    );
    const coords = editor.view.coordsAtPos(from);

    setSuggestPos(null); // mutually exclusive with suggest
    setDiff({ x: coords.left, y: coords.bottom, from, to });
    setOriginalSel(selectedText);
    setCorrectedText(null);
    setFixError(false);
    setFixLoading(true);

    try {
      const res = await fetch('/api/writing/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genreLabel, audienceLabel, selectedText, surroundingContext }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { correctedText: string };
      setCorrectedText(data.correctedText);
    } catch {
      setFixError(true);
    } finally {
      setFixLoading(false);
    }
  }, [editor, genreLabel, audienceLabel]);

  const handleApplyFix = useCallback(() => {
    if (!editor || !diff || correctedText === null) return;
    editor
      .chain()
      .focus()
      .setTextSelection({ from: diff.from, to: diff.to })
      .insertContent(correctedText)
      .run();
    addInteraction({
      id: crypto.randomUUID(),
      type: 'fix',
      triggeredAt: Date.now(),
      inputContext: originalSel,
      suggestions: [correctedText],
      decision: 'accepted',
      finalText: correctedText,
    });
    closeDiff();
  }, [editor, diff, correctedText, originalSel, addInteraction, closeDiff]);

  const handleCancelFix = useCallback(() => {
    if (correctedText !== null) {
      addInteraction({
        id: crypto.randomUUID(),
        type: 'fix',
        triggeredAt: Date.now(),
        inputContext: originalSel,
        suggestions: [correctedText],
        decision: 'rejected',
      });
    }
    closeDiff();
  }, [correctedText, originalSel, addInteraction, closeDiff]);

  // ── Context menu ──
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!editor) return;
      e.preventDefault();
      const hasSelection = !editor.state.selection.empty;
      setContextMenu({ x: e.clientX, y: e.clientY, mode: hasSelection ? 'fix' : 'suggest' });
    },
    [editor]
  );

  const handleContextAction = useCallback(() => {
    if (!contextMenu) return;
    if (contextMenu.mode === 'suggest') triggerSuggest();
    else triggerFix();
  }, [contextMenu, triggerSuggest, triggerFix]);

  return (
    <div className={styles.page}>
      {/* Top bar — visual continuity with Ideation, but a distinct phase badge */}
      <header className={styles.top}>
        <Link
          href={`/app/write/${sessionId}/outline`}
          className={styles.back}
          aria-label="아웃라인으로"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11 18 5 12 11 6" />
          </svg>
          <span>아웃라인</span>
        </Link>

        <div className={styles.phaseBadge} aria-label="Writing Phase">
          <span className={styles.phaseDot} aria-hidden="true" />
          <span className={styles.phaseName}>Writing</span>
        </div>

        <Link href="/app" className={styles.mark} aria-label="Flect 홈">
          <span className={styles.markGlyph} aria-hidden="true" />
          <span>Flect</span>
        </Link>
      </header>

      {/* Three-column layout: outline (left) · editor · answers (right) */}
      <div
        className={`${styles.layout} ${sidebarOpen ? '' : styles.layoutCollapsed} ${
          answersOpen ? '' : styles.layoutRightCollapsed
        }`}
      >
        <OutlineSidebar
          cards={orderedCards}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
          sessionId={sessionId}
        />

        <main className={styles.main}>
          {/* Continuity header — what the user decided to write about */}
          <div className={styles.contextHeader}>
            <p className={styles.contextEyebrow}>이제, 글을 써볼 시간이에요</p>
            {topicSentence && (
              <h1 className={styles.contextTitle}>
                <span className={styles.contextGenre}>{genreLabel}</span>
                <span className={styles.contextTopic}>{topicSentence}</span>
              </h1>
            )}
            <p className={styles.contextHint}>
              Tab 또는 우클릭으로 AI의 도움을 받을 수 있어요.
            </p>
            <p className={styles.contextHint}>
              오른쪽 사이드바를 열어서 아까 Flect와 대화할 때 작성하신 내용을 구체적으로 확인하세요.
            </p>
          </div>

          <EditorArea editor={editor} onContextMenu={handleContextMenu} />
        </main>

        <AnswersSidebar
          turns={qaTurns}
          open={answersOpen}
          onToggle={() => setAnswersOpen((v) => !v)}
        />
      </div>

      {/* AI overlays */}
      {contextMenu && (
        <AIContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          mode={contextMenu.mode}
          onAction={handleContextAction}
          onClose={() => setContextMenu(null)}
        />
      )}

      {suggestPos && (
        <SuggestionPanel
          x={suggestPos.x}
          y={suggestPos.y}
          loading={suggestLoading}
          error={suggestError}
          suggestions={suggestions}
          onSelect={handleSelectSuggestion}
          onClose={closeSuggest}
          onRetry={triggerSuggest}
        />
      )}

      {diff && (
        <DiffPreview
          x={diff.x}
          y={diff.y}
          originalText={originalSel}
          correctedText={correctedText}
          loading={fixLoading}
          error={fixError}
          onApply={handleApplyFix}
          onCancel={handleCancelFix}
          onRetry={triggerFix}
        />
      )}
    </div>
  );
}
