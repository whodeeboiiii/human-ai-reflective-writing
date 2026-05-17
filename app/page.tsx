export default function Home() {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "48px",
        padding: "64px 32px",
      }}
    >
      {/* Wordmark */}
      <a href="/" className="hero-mark" style={{ fontSize: "16px" }}>
        Flect
      </a>

      {/* Token smoke-test grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          maxWidth: "720px",
          width: "100%",
        }}
      >
        {[
          { label: "--accent", bg: "var(--accent)" },
          { label: "--accent-soft", bg: "var(--accent-soft)" },
          { label: "--accent-deep", bg: "var(--accent-deep)" },
          { label: "--ink", bg: "var(--ink)" },
          { label: "--ink-soft", bg: "var(--ink-soft)" },
          { label: "--ink-faint", bg: "var(--ink-faint)" },
          { label: "--bg", bg: "var(--bg)" },
          { label: "--bg-deep", bg: "var(--bg-deep)" },
          { label: "--bg-warm", bg: "var(--bg-warm)" },
        ].map(({ label, bg }) => (
          <div
            key={label}
            style={{
              background: bg,
              border: "1px solid var(--line)",
              borderRadius: "6px",
              padding: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "10px",
                letterSpacing: "0.14em",
                color: "var(--ink-mute)",
                textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Typography specimens */}
      <div style={{ maxWidth: "560px", width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
        <p
          style={{
            fontFamily: "var(--serif)",
            fontSize: "2rem",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          오늘은 어떤 이야기를{" "}
          <span className="emph">담아볼까요?</span>
        </p>
        <p
          style={{
            fontFamily: "var(--sans)",
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "var(--ink-soft)",
          }}
        >
          Pretendard · 산세리프 본문 서체. 글의 결이 읽히는 조용한 읽기 경험을 위해.
        </p>
        <p
          style={{
            fontFamily: "var(--mono)",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
          }}
        >
          JetBrains Mono · Eyebrow / Label
        </p>
      </div>

      <p className="eyebrow">Step 1 — globals.css ✓</p>
    </main>
  );
}
