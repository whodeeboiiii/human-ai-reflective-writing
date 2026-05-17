/* ==========================================================================
   Flect — Ideation Q&A Session (Step 2 of 3)
   - Turn-based Q&A, single AI question at a time.
   - Streaming text effect for AI messages (designed so a future fetch
     stream can be piped into the same addAIMessage() function).
   - Persists the qaSession array to localStorage under 'flect.qaSession'.
   ========================================================================== */

(() => {
  'use strict';

  // -------------------- Mock scenario context --------------------
  // In production this would come from localStorage('flect.structuredInput')
  const CONTEXT = {
    genre: '여행기',
    topicSentence: '교토에서의 사흘',
    ideaClarity: 'mostly',
    importance: '3'
  };

  // -------------------- Predefined script --------------------
  // Intro messages (two consecutive AI messages from same speaker)
  const INTRO = [
    {
      type: 'intro',
      content: '안녕하세요. 함께 이야기를 풀어볼 시간이에요.'
    },
    {
      type: 'intro',
      content: `${CONTEXT.genre}에 관한 글, 그리고 "${CONTEXT.topicSentence}"라는 주제로 함께 출발해볼게요. 질문에 정답은 없어요. 떠오르는 대로 편하게 답해주시면 돼요.`
    }
  ];

  // Pre-defined questions + one LLM-style follow-up (visually identical)
  const QUESTIONS = [
    { type: 'predefined', content: '이 여행이 당신에게 어떤 의미였나요?' },
    { type: 'predefined', content: '여행 중 가장 인상 깊게 남은 한 장면을 떠올려본다면요?' },
    { type: 'predefined', content: '그 장면 속에서 어떤 감정이 가장 컸나요?' },
    { type: 'llm-generated', content: '방금 말씀하신 "혼자만의 시간"이라는 표현이 마음에 남아요. 그 시간이 평소의 일상과 어떻게 달랐나요?' },
    { type: 'predefined', content: '여행을 떠나기 전과 다녀온 후, 당신 안에서 무엇이 달라졌나요?' },
    { type: 'predefined', content: '이 글을 통해 독자에게 가장 전하고 싶은 한 가지가 있다면요?' }
  ];

  const CLOSING = {
    type: 'closing',
    content: '좋아요. 충분히 나눴어요. 이제 당신의 이야기를 하나의 흐름으로 엮어볼 차례예요.'
  };

  // -------------------- State --------------------
  const state = {
    qaSession: [],
    qIndex: 0,           // index into QUESTIONS
    awaitingUser: false,
    isStreaming: false,
    lastSpeaker: null    // 'assistant' | 'user' | null
  };

  // -------------------- DOM --------------------
  const $ = (sel) => document.querySelector(sel);
  const thread = $('#qa-thread');
  const input = $('#qa-input');
  const sendBtn = $('#qa-send');
  const skipBtn = $('#qa-skip');
  const backBtn = $('#qa-back');
  const modal = $('#qa-modal');
  const modalCancel = $('#qa-modal-cancel');
  const modalConfirm = $('#qa-modal-confirm');

  // -------------------- Utilities --------------------
  const nowStamp = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const persist = () => {
    try {
      localStorage.setItem('flect.qaSession', JSON.stringify(state.qaSession));
    } catch (e) { /* ignore */ }
  };

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    });
  };

  // Tokenize Korean/English text into "word-ish" units for streaming.
  // We split on whitespace AND keep punctuation attached. Korean has no
  // spaces between syllables within a word, so each whitespace-split token
  // behaves like a word — natural enough for the streaming feel.
  const tokenize = (text) => {
    // Preserve newlines as their own tokens.
    const parts = text.split(/(\n)/);
    const out = [];
    parts.forEach((part) => {
      if (part === '\n') { out.push('\n'); return; }
      part.split(/(\s+)/).forEach((tok) => {
        if (tok.length) out.push(tok);
      });
    });
    return out;
  };

  // -------------------- Message rendering --------------------
  const buildMsgEl = (role, { name, time, isCont }) => {
    const wrap = document.createElement('div');
    wrap.className = `qa-msg qa-msg--${role === 'assistant' ? 'ai' : 'user'}` +
      (isCont ? ' qa-msg--cont' : '');

    const avatar = document.createElement('div');
    avatar.className = 'qa-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'assistant' ? 'F' : 'U';
    wrap.appendChild(avatar);

    const body = document.createElement('div');
    body.className = 'qa-body';

    if (!isCont) {
      const meta = document.createElement('div');
      meta.className = 'qa-meta';
      const nameEl = document.createElement('span');
      nameEl.className = 'qa-name';
      nameEl.textContent = name;
      const sep = document.createElement('span');
      sep.className = 'qa-meta-sep';
      const timeEl = document.createElement('span');
      timeEl.className = 'qa-time';
      timeEl.textContent = time;
      meta.appendChild(nameEl);
      meta.appendChild(sep);
      meta.appendChild(timeEl);
      body.appendChild(meta);
    }

    const text = document.createElement('div');
    text.className = 'qa-text';
    body.appendChild(text);

    wrap.appendChild(body);
    return { wrap, textEl: text };
  };

  // -------------------- AI message (streaming) --------------------
  // Designed so a future fetch-stream can call this with successive
  // chunks. Today we fully tokenize a known string and animate the reveal.
  const addAIMessage = (text, { type = 'predefined' } = {}) => {
    return new Promise((resolve) => {
      const isCont = state.lastSpeaker === 'assistant';
      const { wrap, textEl } = buildMsgEl('assistant', {
        name: 'Flect',
        time: nowStamp(),
        isCont
      });
      thread.appendChild(wrap);
      state.lastSpeaker = 'assistant';

      // Caret while streaming
      const caret = document.createElement('span');
      caret.className = 'qa-caret';

      const tokens = tokenize(text);
      const PER_TOKEN = 55; // ms between word reveals
      let i = 0;
      state.isStreaming = true;
      textEl.appendChild(caret);
      scrollToBottom();

      const tick = () => {
        if (i >= tokens.length) {
          state.isStreaming = false;
          if (caret.parentNode) caret.parentNode.removeChild(caret);
          // record turn
          state.qaSession.push({
            turn: state.qaSession.length + 1,
            role: 'assistant',
            content: text,
            type,
            timestamp: new Date().toISOString()
          });
          persist();
          resolve();
          return;
        }
        const tok = tokens[i++];
        const span = document.createElement('span');
        span.className = 'qa-word';
        if (tok === '\n') {
          span.appendChild(document.createElement('br'));
        } else {
          span.textContent = tok;
        }
        textEl.insertBefore(span, caret);
        scrollToBottom();
        setTimeout(tick, PER_TOKEN);
      };
      // Slight pre-roll so caret blinks before words land
      setTimeout(tick, 220);
    });
  };

  const addUserMessage = (text, { skipped = false } = {}) => {
    const isCont = state.lastSpeaker === 'user';
    const { wrap, textEl } = buildMsgEl('user', {
      name: '당신',
      time: nowStamp(),
      isCont
    });
    if (skipped) wrap.classList.add('qa-msg--skipped');

    textEl.textContent = skipped
      ? '(이 질문은 건너뛰었어요)'
      : text;

    thread.appendChild(wrap);
    state.lastSpeaker = 'user';

    state.qaSession.push({
      turn: state.qaSession.length + 1,
      role: 'user',
      content: skipped ? '' : text,
      skipped,
      timestamp: new Date().toISOString()
    });
    persist();
    scrollToBottom();
  };

  // -------------------- Thinking indicator --------------------
  const showThinking = () => {
    const isCont = state.lastSpeaker === 'assistant';
    const { wrap, textEl } = buildMsgEl('assistant', {
      name: 'Flect',
      time: nowStamp(),
      isCont
    });
    wrap.classList.add('qa-msg--thinking');
    const dots = document.createElement('div');
    dots.className = 'qa-thinking';
    dots.innerHTML = '<span></span><span></span><span></span>';
    textEl.replaceWith(dots);
    thread.appendChild(wrap);
    scrollToBottom();
    return wrap;
  };

  const hideThinking = (el) => {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  };

  // -------------------- Final CTA --------------------
  const showFinalCTA = () => {
    const card = document.createElement('div');
    card.className = 'qa-final';
    card.innerHTML = `
      <div class="qa-final-text">Step 2 · <strong>Complete</strong></div>
      <button class="qa-btn qa-btn--primary qa-btn--lg" type="button" id="qa-finish">
        <span>다음 단계로</span>
        <span class="qa-arrow" aria-hidden="true">→</span>
      </button>
    `;
    thread.appendChild(card);
    scrollToBottom();
    card.querySelector('#qa-finish').addEventListener('click', () => {
      // Future: navigate to outline composition
      // location.href = 'ideation-outline.html';
      alert('다음 단계: Outline Composition (구현 예정)');
    });

    // Lock the composer
    input.disabled = true;
    sendBtn.disabled = true;
    skipBtn.disabled = true;
    input.placeholder = '세션이 마무리되었어요.';
  };

  // -------------------- Flow --------------------
  const askNext = async () => {
    if (state.qIndex >= QUESTIONS.length) {
      // Final closing message + CTA
      await new Promise((r) => setTimeout(r, 320));
      const t = showThinking();
      await new Promise((r) => setTimeout(r, 900));
      hideThinking(t);
      await addAIMessage(CLOSING.content, { type: 'closing' });
      showFinalCTA();
      return;
    }

    const q = QUESTIONS[state.qIndex++];
    // brief thinking pause before each question
    const t = showThinking();
    await new Promise((r) => setTimeout(r, 850));
    hideThinking(t);
    await addAIMessage(q.content, { type: q.type });
    enableComposer();
  };

  const enableComposer = () => {
    state.awaitingUser = true;
    input.disabled = false;
    skipBtn.disabled = false;
    sendBtn.disabled = input.value.trim().length === 0;
    input.focus();
  };

  const disableComposer = () => {
    state.awaitingUser = false;
    input.disabled = true;
    sendBtn.disabled = true;
    skipBtn.disabled = true;
  };

  const onSend = async () => {
    if (!state.awaitingUser) return;
    const val = input.value.trim();
    if (!val) return;
    addUserMessage(val);
    input.value = '';
    autosize();
    disableComposer();
    await askNext();
  };

  const onSkip = async () => {
    if (!state.awaitingUser) return;
    addUserMessage('', { skipped: true });
    input.value = '';
    autosize();
    disableComposer();
    await askNext();
  };

  // Auto-grow textarea
  const autosize = () => {
    input.style.height = 'auto';
    const max = 280;
    input.style.height = Math.min(input.scrollHeight, max) + 'px';
  };

  // -------------------- Wiring --------------------
  input.addEventListener('input', () => {
    sendBtn.disabled = input.value.trim().length === 0 || !state.awaitingUser;
    autosize();
  });

  // Enter = newline (default). Cmd/Ctrl+Enter = send.
  input.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSend();
    }
  });

  sendBtn.addEventListener('click', onSend);
  skipBtn.addEventListener('click', onSkip);

  // Back button → modal
  backBtn.addEventListener('click', () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  });
  modalCancel.addEventListener('click', () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  });
  modalConfirm.addEventListener('click', () => {
    location.href = 'ideation-input.html';
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  // -------------------- Boot --------------------
  const boot = async () => {
    disableComposer();

    // Intro: two AI messages from same speaker (second is "continuation")
    for (const msg of INTRO) {
      await addAIMessage(msg.content, { type: msg.type });
      await new Promise((r) => setTimeout(r, 380));
    }

    // First question
    await askNext();
  };

  // Kick off after a brief beat so the page settles
  window.addEventListener('load', () => {
    setTimeout(boot, 320);
  });
})();
