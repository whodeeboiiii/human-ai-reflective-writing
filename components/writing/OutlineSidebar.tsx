'use client';

import Link from 'next/link';
import type { MaterialCard } from '@/types/ideation';
import styles from './writing.module.css';

interface OutlineSidebarProps {
  cards: MaterialCard[] | null; // null = no outline committed
  open: boolean;
  onToggle: () => void;
  sessionId: string;
}

export function OutlineSidebar({ cards, open, onToggle, sessionId }: OutlineSidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${open ? '' : styles.sidebarCollapsed}`}>
      <div className={styles.sidebarHeader}>
        {open && <span className={styles.sidebarTitle}>아웃라인</span>}
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={onToggle}
          aria-label={open ? '사이드바 접기' : '사이드바 펼치기'}
          title={open ? '접기' : '펼치기'}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: open ? 'none' : 'rotate(180deg)' }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className={styles.sidebarBody}>
          {!cards || cards.length === 0 ? (
            <div className={styles.sidebarEmpty}>
              <p className={styles.sidebarEmptyText}>
                아웃라인이 없어요. 이전 단계로 돌아가 아웃라인을 만들어 주세요.
              </p>
              <Link
                href={`/app/write/${sessionId}/outline`}
                className={styles.sidebarEmptyLink}
              >
                아웃라인으로 돌아가기
              </Link>
            </div>
          ) : (
            <ol className={styles.outlineList}>
              {cards.map((card, idx) => (
                <li key={card.id} className={styles.outlineCard}>
                  <span className={styles.outlineCardNum}>{String(idx + 1).padStart(2, '0')}</span>
                  <p className={styles.outlineCardText}>{card.content || '(빈 카드)'}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </aside>
  );
}
