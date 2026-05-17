/* ==========================================================================
   Flect — Ideation Input (Step 1 of 3)
   Screen state machine + fade transitions + progress + localStorage
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'flect.ideation.draft';

  // ---- DOM ---------------------------------------------------------------
  const stage      = document.getElementById('ix-stage');
  const screens    = Array.from(stage.querySelectorAll('.ix-screen'));
  const progressEl = document.getElementById('ix-progress');
  const backBtn    = document.getElementById('ix-back');
  const topicArea  = document.getElementById('ix-topic');
  const topicCount = document.getElementById('ix-topic-count');
  const topicSubmit= document.getElementById('ix-topic-submit');

  // ---- Screen sequence ---------------------------------------------------
  // Index map: each entry is the data-screen attr.
  const SEQUENCE = [
    'intro',
    'genre', 'topic', 'clarity', 'experience', 'importance',  // Main 1–5
    'optional-gate',
    'audience', 'sharing', 'venue', 'tone', 'length',          // Optional 1–5
    'complete'
  ];
  const idxOf = (name) => SEQUENCE.indexOf(name);
  const screenByName = (name) => screens.find(s => s.dataset.screen === name);

  // Quick lookup for which "main" / "optional" question index a screen is
  const MAIN_SCREENS     = ['genre','topic','clarity','experience','importance'];
  const OPTIONAL_SCREENS = ['audience','sharing','venue','tone','length'];

  // ---- State -------------------------------------------------------------
  let current = 'intro';
  let history = []; // names previously visited (so back can pop)
  let answers = loadAnswers();
  let optionalActivated = false; // whether optional dot group has been revealed

  function loadAnswers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch (e) {}
  }

  // ---- Progress dots -----------------------------------------------------
  function buildProgress() {
    const main = document.createElement('div');
    main.className = 'ix-dot-group ix-dot-group--main';
    MAIN_SCREENS.forEach((name) => {
      const d = document.createElement('span');
      d.className = 'ix-dot';
      d.dataset.target = name;
      main.appendChild(d);
    });

    const opt = document.createElement('div');
    opt.className = 'ix-dot-group ix-dot-group--optional';
    OPTIONAL_SCREENS.forEach((name) => {
      const d = document.createElement('span');
      d.className = 'ix-dot';
      d.dataset.target = name;
      opt.appendChild(d);
    });

    progressEl.appendChild(main);
    progressEl.appendChild(opt);
  }

  function updateProgress() {
    const isMain     = MAIN_SCREENS.includes(current);
    const isOptional = OPTIONAL_SCREENS.includes(current);
    const showProgress = isMain || isOptional || current === 'optional-gate';

    progressEl.style.opacity = showProgress ? '1' : '0';
    progressEl.style.pointerEvents = showProgress ? 'auto' : 'none';

    // Reveal optional group once user enters optional flow (or hovers gate)
    const optGroup = progressEl.querySelector('.ix-dot-group--optional');
    if (isOptional || (current === 'optional-gate' && optionalActivated)) {
      optGroup.classList.add('is-shown');
    }
    if (isOptional) {
      optionalActivated = true;
      optGroup.classList.add('is-shown');
    }

    // Mark each dot
    progressEl.querySelectorAll('.ix-dot').forEach((dot) => {
      const target = dot.dataset.target;
      dot.classList.remove('is-current', 'is-past');
      if (target === current) {
        dot.classList.add('is-current');
      } else {
        // "past" if its index in its own group is < current's index in same group
        const group = MAIN_SCREENS.includes(target) ? MAIN_SCREENS : OPTIONAL_SCREENS;
        const targetIdx = group.indexOf(target);
        const currentIdx = group.indexOf(current);
        if (currentIdx > -1 && group === (MAIN_SCREENS.includes(current) ? MAIN_SCREENS : OPTIONAL_SCREENS)) {
          if (targetIdx < currentIdx) dot.classList.add('is-past');
        } else if (group === MAIN_SCREENS && (isOptional || current === 'optional-gate' || current === 'complete')) {
          dot.classList.add('is-past');
        } else if (group === OPTIONAL_SCREENS && current === 'complete' && optionalActivated) {
          dot.classList.add('is-past');
        }
      }
    });
  }

  // ---- Back button visibility -------------------------------------------
  function updateBack() {
    // Hidden on intro / complete; disabled on Screen 1 (genre — first question)
    const hide = current === 'intro' || current === 'complete';
    backBtn.hidden = hide;
    backBtn.classList.toggle('is-disabled', current === 'genre');
  }

  // ---- Screen transition -------------------------------------------------
  let transitioning = false;
  function go(name, opts = {}) {
    if (transitioning || name === current) return;
    const target = screenByName(name);
    if (!target) return;

    transitioning = true;
    const outgoing = screenByName(current);

    // Fade out
    outgoing.classList.add('is-leaving');
    outgoing.classList.remove('is-active');

    // Push to history unless this is a back-pop
    if (!opts.popping) history.push(current);

    setTimeout(() => {
      outgoing.classList.remove('is-leaving');
      current = name;
      restoreSelectionFor(name);
      target.classList.add('is-active');
      updateProgress();
      updateBack();

      // Auto-focus where it makes sense
      if (name === 'topic') {
        setTimeout(() => topicArea.focus(), 180);
      }

      transitioning = false;
    }, 260); // matches CSS transition (250ms) + small buffer
  }

  function back() {
    if (current === 'genre' || current === 'intro' || current === 'complete') return;
    const prev = history.pop();
    if (!prev) return;
    go(prev, { popping: true });
  }

  // ---- Restore selected state when re-entering a screen -----------------
  function restoreSelectionFor(name) {
    const screen = screenByName(name);
    if (!screen) return;
    const choiceList = screen.querySelector('.ix-choices');
    if (choiceList) {
      const key = choiceList.dataset.key;
      const stored = answers[key];
      choiceList.querySelectorAll('.ix-choice').forEach((c) => {
        c.classList.toggle('is-selected', stored != null && c.dataset.value === String(stored));
        c.classList.remove('is-firing');
      });
    }
    if (name === 'topic') {
      const v = answers.topicSentence || '';
      topicArea.value = v;
      updateTopicState();
    }
  }

  // ---- Choice click ------------------------------------------------------
  function handleChoiceClick(e) {
    const btn = e.target.closest('.ix-choice');
    if (!btn) return;
    const list = btn.closest('.ix-choices');
    const key = list.dataset.key;
    const value = btn.dataset.value;

    // Save answer (cast importance to number)
    if (key === 'importance') answers[key] = Number(value);
    else answers[key] = value;
    persist();

    // Visual fire feedback
    list.querySelectorAll('.ix-choice').forEach(c => c.classList.remove('is-selected'));
    btn.classList.add('is-firing');

    // Auto-advance after a brief beat so the click feels real
    setTimeout(() => advance(), 180);
  }

  // ---- Topic textarea ----------------------------------------------------
  function updateTopicState() {
    const len = topicArea.value.trim().length;
    topicCount.textContent = topicArea.value.length;
    topicSubmit.disabled = len === 0;
  }
  topicArea.addEventListener('input', () => {
    answers.topicSentence = topicArea.value.trim();
    persist();
    updateTopicState();
  });
  topicArea.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!topicSubmit.disabled) advance();
    }
  });

  // ---- Advance to the next logical screen --------------------------------
  function advance() {
    const i = idxOf(current);
    if (i < 0) return;
    if (current === 'importance') return go('optional-gate');
    if (current === 'length')     return go('complete');
    if (i + 1 < SEQUENCE.length)  return go(SEQUENCE[i + 1]);
  }

  // ---- Click delegation --------------------------------------------------
  stage.addEventListener('click', (e) => {
    // Choice buttons
    if (e.target.closest('.ix-choice')) return handleChoiceClick(e);

    // [data-go="..."] buttons
    const goBtn = e.target.closest('[data-go]');
    if (goBtn) {
      const action = goBtn.dataset.go;
      if (action === 'next')           return advance();
      if (action === 'skip-optional')  return go('complete');
      if (action === 'finish')         return finish();
    }
  });

  backBtn.addEventListener('click', back);

  // Keyboard: ← for back (when not typing)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowLeft' && !backBtn.hidden && !backBtn.classList.contains('is-disabled')) {
      e.preventDefault();
      back();
    }
  });

  // ---- Finish ------------------------------------------------------------
  function finish() {
    persist();
    // In real app this routes to the Q&A Session.
    // For now: gentle no-op, but keep the click feel.
    const btn = stage.querySelector('[data-go="finish"]');
    if (btn) {
      btn.disabled = true;
      btn.querySelector('span').textContent = '준비 중…';
    }
    // window.location.href = '/app/write/[id]/qa';
  }

  // ---- Init --------------------------------------------------------------
  buildProgress();
  updateProgress();
  updateBack();
  // Pre-populate topic if previously saved
  if (answers.topicSentence) topicArea.value = answers.topicSentence;
  updateTopicState();
})();
