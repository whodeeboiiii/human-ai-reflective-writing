'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './landing.module.css';

export default function LandingPage() {
  const year = new Date().getFullYear();

  // Scroll-reveal via IntersectionObserver
  const revealRefs = useRef<HTMLElement[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.12 }
    );
    revealRefs.current.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  function addRef(el: HTMLElement | null) {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }

  return (
    <>
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <span className="hero-mark">Flect</span>
        <Link href="/app" className={styles.navCta}>
          무료로 시작하기 →
        </Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className="wrap">
          <div className={styles.heroInner}>
            {/* Text */}
            <div>
              <p className={`eyebrow ${styles.heroEyebrow}`}>Human-AI Co-Writing · Ideation to Draft</p>

              <h1 className={`${styles.heroH1} reveal`} ref={addRef}>
                당신의 이야기,<br />
                <span className="emph">당신의 목소리</span>로
              </h1>

              <p className={`${styles.heroSub} reveal`} ref={addRef}>
                백지 앞에서 막막했던 적, 있으신가요?<br />
                Flect은 AI와 함께 생각을 정리하고, 당신만의 목소리로 글을 완성할 수 있도록 도와줍니다.
              </p>

              <div className="reveal" ref={addRef}>
                <Link href="/app" className={styles.heroCta}>
                  여기를 클릭하여 무료로 체험하세요
                  <span className={styles.heroCtaArrow}>→</span>
                </Link>
                <Link href="/community" className={styles.heroSecondary}>
                  커뮤니티 보기
                </Link>
              </div>

              <div className={`${styles.heroMeta} reveal`} ref={addRef}>
                <span>Beta · {year}</span>
                <span><span className={styles.heroDot} />지금 무료로 이용 가능</span>
              </div>
            </div>

            {/* Visual — scattered thoughts → single line */}
            <div className={styles.heroVisual} aria-hidden="true">
              <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="halo" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#E8C468" stopOpacity="0.12" />
                    <stop offset="60%" stopColor="#E8C468" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#E8C468" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="thread" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#E8C468" stopOpacity="0" />
                    <stop offset="22%" stopColor="#E8C468" stopOpacity="0.9" />
                    <stop offset="78%" stopColor="#9A7A1E" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#9A7A1E" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <circle cx="260" cy="260" r="240" fill="url(#halo)" />
                <g stroke="#2D2520" strokeOpacity="0.07" fill="none">
                  <circle cx="260" cy="260" r="200" />
                  <circle cx="260" cy="260" r="150" />
                  <circle cx="260" cy="260" r="100" />
                </g>
                <g fill="#2D2520" fillOpacity="0.45">
                  <circle cx="90" cy="110" r="2.5" />
                  <circle cx="160" cy="70" r="1.8" />
                  <circle cx="230" cy="120" r="2.2" />
                  <circle cx="310" cy="60" r="1.6" />
                  <circle cx="380" cy="110" r="2.4" />
                  <circle cx="430" cy="180" r="1.8" />
                  <circle cx="120" cy="180" r="1.8" />
                  <circle cx="280" cy="180" r="1.6" />
                  <circle cx="200" cy="220" r="2.0" />
                  <circle cx="350" cy="200" r="2.0" />
                </g>
                <g stroke="#2D2520" strokeOpacity="0.22" fill="none" strokeLinecap="round">
                  <path d="M90,110  C140,180 180,220 240,260" strokeWidth="0.8" />
                  <path d="M160,70  C200,160 220,220 250,258" strokeWidth="0.8" />
                  <path d="M230,120 C240,180 250,230 255,258" strokeWidth="0.8" />
                  <path d="M310,60  C290,140 275,220 265,258" strokeWidth="0.8" />
                  <path d="M380,110 C340,180 300,230 275,260" strokeWidth="0.8" />
                  <path d="M430,180 C370,220 320,250 285,260" strokeWidth="0.8" />
                  <path d="M120,180 C180,220 220,240 245,260" strokeWidth="0.8" />
                  <path d="M280,180 C270,220 265,240 262,258" strokeWidth="0.8" />
                  <path d="M200,220 C230,240 240,250 250,260" strokeWidth="0.8" />
                  <path d="M350,200 C320,230 290,250 272,260" strokeWidth="0.8" />
                </g>
                <line x1="50" y1="260" x2="470" y2="260" stroke="url(#thread)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="260" cy="260" r="4.5" fill="#E8C468" />
                <circle cx="260" cy="260" r="10" fill="none" stroke="#E8C468" strokeOpacity="0.35" />
                <g stroke="#2D2520" strokeOpacity="0.18">
                  <line x1="50" y1="300" x2="50" y2="306" />
                  <line x1="155" y1="300" x2="155" y2="306" />
                  <line x1="260" y1="300" x2="260" y2="306" />
                  <line x1="365" y1="300" x2="365" y2="306" />
                  <line x1="470" y1="300" x2="470" y2="306" />
                </g>
                <text x="50" y="324" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8A7A6D" letterSpacing="1.2">idea</text>
                <text x="240" y="324" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8A7A6D" letterSpacing="1.2">draft</text>
                <text x="438" y="324" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#8A7A6D" letterSpacing="1.2">voice</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section className={styles.problem}>
        <div className="wrap">
          <div className={styles.problemGrid}>
            <div className="reveal" ref={addRef}>
              <p className="eyebrow" style={{ marginBottom: 24 }}>The Problem</p>
              <h2 className={styles.problemH2}>글쓰기는 왜<br />이렇게 어려울까요?</h2>
            </div>

            <div className={`${styles.problemBody} reveal`} ref={addRef}>
              <p>머릿속에는 분명 하고 싶은 이야기가 있는데, 막상 쓰려고 하면 흰 화면만 멍하니 바라보게 됩니다.</p>
              <p>
                그렇다고 AI에게 전부 맡기자니, 어딘가{' '}
                <span className={styles.highlight}>내 글 같지 않은 AI의 글</span>이 되어버립니다.
              </p>
              <p>
                Flect은 <span className={styles.highlight}>머릿속의 이야기</span>와 완성된 문장 사이,
                그 <span className={styles.highlight}>균형</span>을 찾아 드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className="wrap">
          <header className={`${styles.featuresHeader} reveal`} ref={addRef}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>How Flect works</p>
            <h2 className={styles.featuresH2}>
              대신 써주지 않습니다.<br />
              더 잘 쓸 수 있게, 옆에서 함께합니다.
            </h2>
          </header>

          {/* Feature 1 — Q&A */}
          <div className={styles.featureGrid}>
            <div className="reveal" ref={addRef}>
              <span className={styles.featureNum}>
                <span className={styles.featureAccent}>01</span> / 02 &nbsp;&nbsp;Q&amp;A Session
              </span>
              <h3 className={styles.featureH3}>생각을 끌어내는 대화</h3>
              <p className={styles.featureDesc}>
                AI가 당신의 경험과 감정을 하나씩 물어봅니다. 답하다 보면 흩어져 있던 생각들이 자연스럽게 정리됩니다.
              </p>
              <div className={styles.featureTags}>
                <span className={styles.featureTag}>Q&amp;A Session</span>
                <span className={styles.featureTag}>Ideation</span>
              </div>
            </div>

            <div className={`${styles.featureVisual} reveal`} ref={addRef} aria-hidden="true">
              <span className={styles.visualCorner}>Fig. 01</span>
              <span className={styles.visualCornerR}>dialogue</span>
              <svg viewBox="0 0 560 300">
                <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A7A6D" letterSpacing="1.4">
                  <text x="60" y="66">Q</text>
                  <text x="60" y="148">A</text>
                  <text x="60" y="230">Q</text>
                </g>
                <g transform="translate(100, 44)">
                  <rect width="340" height="48" rx="6" fill="#FAF7F2" stroke="#2D2520" strokeOpacity="0.12" />
                  <line x1="18" y1="18" x2="300" y2="18" stroke="#2D2520" strokeOpacity="0.35" strokeWidth="1.2" />
                  <line x1="18" y1="30" x2="240" y2="30" stroke="#2D2520" strokeOpacity="0.2" strokeWidth="1.2" />
                </g>
                <g transform="translate(140, 120)">
                  <rect width="360" height="56" rx="6" fill="#E8C468" fillOpacity="0.08" stroke="#E8C468" strokeOpacity="0.4" />
                  <line x1="18" y1="18" x2="320" y2="18" stroke="#9A7A1E" strokeOpacity="0.75" strokeWidth="1.2" />
                  <line x1="18" y1="30" x2="260" y2="30" stroke="#9A7A1E" strokeOpacity="0.55" strokeWidth="1.2" />
                  <line x1="18" y1="42" x2="180" y2="42" stroke="#9A7A1E" strokeOpacity="0.4" strokeWidth="1.2" />
                </g>
                <g transform="translate(100, 204)">
                  <rect width="300" height="48" rx="6" fill="#FAF7F2" stroke="#2D2520" strokeOpacity="0.12" />
                  <line x1="18" y1="18" x2="260" y2="18" stroke="#2D2520" strokeOpacity="0.35" strokeWidth="1.2" />
                  <line x1="18" y1="30" x2="200" y2="30" stroke="#2D2520" strokeOpacity="0.2" strokeWidth="1.2" />
                </g>
                <g transform="translate(100, 268)" fill="#E8C468">
                  <circle cx="0" cy="0" r="3">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" begin="0s" />
                  </circle>
                  <circle cx="12" cy="0" r="3">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
                  </circle>
                  <circle cx="24" cy="0" r="3">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
                  </circle>
                </g>
              </svg>
            </div>
          </div>

          {/* Feature 2 — Writing Phase */}
          <div className={`${styles.featureGrid} ${styles.featureReverse}`}>
            <div className="reveal" ref={addRef}>
              <span className={styles.featureNum}>
                <span className={styles.featureAccent}>02</span> / 02 &nbsp;&nbsp;Writing Phase
              </span>
              <h3 className={styles.featureH3}>AI가 제안, 당신이 결정</h3>
              <p className={styles.featureDesc}>
                정리된 생각을 바탕으로 직접 글을 씁니다. AI는 Fix·Suggest·Formalize 기능으로 조용히 옆에서 도와줄 뿐입니다.
              </p>
              <div className={styles.featureTags}>
                <span className={styles.featureTag}>Writing Phase</span>
                <span className={styles.featureTag}>Author-Driven</span>
              </div>
            </div>

            <div className={`${styles.featureVisual} reveal`} ref={addRef} aria-hidden="true">
              <span className={styles.visualCorner}>Fig. 02</span>
              <span className={styles.visualCornerR}>author-driven</span>
              <svg viewBox="0 0 560 280">
                <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A7A6D" letterSpacing="1.4">
                  <text x="90" y="38">AI · suggests</text>
                  <text x="330" y="38">You · decide</text>
                </g>
                {/* AI column */}
                <g transform="translate(90, 54)" stroke="#2D2520" strokeOpacity="0.25" fill="none">
                  {[0, 34, 68, 102, 136].map((y, i) => (
                    <rect key={i} y={y} width="160" height="22" rx="4" />
                  ))}
                </g>
                <g transform="translate(90, 54)" fill="#2D2520" fillOpacity="0.32">
                  {[8, 42, 76, 110, 144].map((y, i) => (
                    <rect key={i} x="12" y={y} width={[100, 130, 80, 118, 96][i]} height="6" rx="2" />
                  ))}
                </g>
                {/* Arrows */}
                <g stroke="#8A7A6D" strokeOpacity="0.45" fill="none">
                  {[65, 99, 133, 167, 201].map((y, i) => (
                    <path key={i} d={`M258 ${y} L322 ${y}`} strokeWidth="1" strokeDasharray="2 3" />
                  ))}
                </g>
                {/* Decision column */}
                <g transform="translate(330, 54)">
                  {[true, false, true, true, false].map((accepted, i) => (
                    <g key={i} transform={`translate(0, ${i * 34})`}>
                      <rect width="24" height="22" rx="4"
                        fill={accepted ? '#E8C468' : 'none'}
                        stroke={accepted ? 'none' : '#2D2520'}
                        strokeOpacity={accepted ? 0 : 0.28}
                      />
                      <text x={accepted ? 8 : 7} y="16"
                        fontFamily="JetBrains Mono, monospace" fontSize="13"
                        fill={accepted ? '#FAF7F2' : '#8A7A6D'}
                      >
                        {accepted ? '✓' : '×'}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="wrap">
          <h2 className={`${styles.ctaH2} reveal`} ref={addRef}>
            지금 바로 나만의 글을<br />써보세요
          </h2>
          <p className={`${styles.ctaSub} reveal`} ref={addRef}>
            설치나 회원가입 없이, 바로 시작할 수 있습니다.
          </p>
          <div className="reveal" ref={addRef}>
            <Link href="/app" className={styles.heroCta}>
              여기를 클릭하여 무료로 체험하세요
              <span className={styles.heroCtaArrow}>→</span>
            </Link>
          </div>
          <p className={`${styles.ctaFree} reveal`} ref={addRef}>100% Free · No Sign-up Required</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">Flect</div>
            <div className="footer-meta">
              <span>© {year} Flect.</span>
              <Link href="/community">커뮤니티</Link>
              <Link href="/app">글쓰기 시작</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
