/* ==========================================================================
   Flect — user.js
   - Hardcoded placeholder note data (3 notes per spec)
   - Footer year + today label
   - Reveal class is already-on in markup; nothing further to animate beyond
     CSS transitions on hover.
   ========================================================================== */

(function () {
  'use strict';

  // Placeholder note data — same shape we'd hydrate from the backend later.
  var NOTES = [
    {
      id: 'a',
      title: '비 오는 날의 도서관',
      preview: '오랜만에 도서관에 들렀다. 빗소리와 책장 넘기는 소리가 묘하게 잘 어울려서, 한참을 가만히 앉아 있었다…',
      modified: '오늘',
      tag: '성찰 일지'
    },
    {
      id: 'b',
      title: '「작별인사」를 읽고',
      preview: '김영하의 신작을 마침내 읽었다. AI와 인간의 경계에 대한 질문이 생각보다 오래 남았다…',
      modified: '어제',
      tag: '독후감'
    },
    {
      id: 'c',
      title: '교토에서의 사흘',
      preview: '여름 끝자락의 교토는 생각보다 한적했다. 기온의 골목길을 걷다가 우연히 들어간 작은 다실에서…',
      modified: '5일 전',
      tag: '여행기'
    }
  ];

  function setNoteCount() {
    var el = document.getElementById('note-count');
    if (el) el.textContent = NOTES.length;
  }

  function setTodayLabel() {
    var el = document.getElementById('today-label');
    if (!el) return;
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    el.textContent = d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate());
  }

  function setYear() {
    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  // Subtle entry: stagger card appearance.
  function staggerCards() {
    var cards = document.querySelectorAll('.note-card');
    cards.forEach(function (card, i) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(14px)';
      card.style.transition = 'opacity 700ms cubic-bezier(0.22, 0.61, 0.36, 1), transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1)';
      card.style.transitionDelay = (320 + i * 90) + 'ms';
      // Force reflow then trigger
      // eslint-disable-next-line no-unused-expressions
      card.offsetHeight;
      requestAnimationFrame(function () {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  }

  function init() {
    setNoteCount();
    setTodayLabel();
    setYear();
    staggerCards();
  }

  // Expose for future hydration step
  window.flectNotes = NOTES;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
