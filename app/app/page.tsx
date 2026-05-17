import Link from 'next/link';
import { NOTES } from '@/lib/data/notes';
import { NoteGrid } from '@/components/user/NoteGrid';
import styles from '@/components/user/user.module.css';

function getTodayLabel(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

export default function UserPage() {
  const todayLabel = getTodayLabel();
  const year = new Date().getFullYear();

  return (
    <>
      {/* ── Header ───────────────────────────────── */}
      <header className={styles.userHeader}>
        <Link href="/app" className="hero-mark" aria-label="Flect 홈">
          Flect
        </Link>
        <div className={styles.userGreet}>
          <span className={styles.userGreetText}>Hi, friend</span>
          <span className={styles.userAvatar} aria-hidden="true">f</span>
        </div>
      </header>

      {/* ── Greeting ─────────────────────────────── */}
      <section className={styles.userGreeting}>
        <div className="wrap">
          <div className="eyebrow">
            Your Notes &nbsp;·&nbsp; {todayLabel}
          </div>
          <h1>
            오늘은 어떤 이야기를<br />
            <span className="emph">담아볼까요?</span>
          </h1>
          <p className={styles.userGreetingSub}>
            당신의 글 <span className={styles.count}>{NOTES.length}</span>개
          </p>
        </div>
      </section>

      {/* ── Note grid ────────────────────────────── */}
      <section className={styles.userGridSection}>
        <div className="wrap">
          <NoteGrid notes={NOTES} />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────── */}
      <footer className="footer">
        <div className="wrap">
          <div className="footer-inner">
            <div className="footer-brand">Flect</div>
            <div className="footer-meta">
              <span>© {year} Flect.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
