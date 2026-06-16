'use client';

import { useSyncExternalStore } from 'react';
import { isQuickSession } from '@/lib/quickMode';
import WritingView from './WritingView';

// 공유 writing 라우트가 quick 여부를 WritingView에 prop으로 전달 (full pipeline 컴포넌트 불변).
const noopSubscribe = () => () => {};

export default function WritingGate({ sessionId }: { sessionId: string }) {
  const quick = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => isQuickSession(sessionId),
    () => null,
  );
  if (quick === null) return null;
  return <WritingView sessionId={sessionId} quick={quick} />;
}
