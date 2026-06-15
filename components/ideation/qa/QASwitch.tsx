'use client';

import { useSyncExternalStore } from 'react';
import { isQuickSession } from '@/lib/quickMode';
import ChatContainer from './ChatContainer';
import QuickQASession from '@/components/quick/QuickQASession';

// 공유 qa 라우트가 세션 종류에 따라 분기 (StructuredInputSwitch와 동일 패턴).
const noopSubscribe = () => () => {};

export default function QASwitch({ sessionId }: { sessionId: string }) {
  const quick = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => isQuickSession(sessionId),
    () => null,
  );

  if (quick === null) return null;
  return quick ? (
    <QuickQASession sessionId={sessionId} />
  ) : (
    <ChatContainer sessionId={sessionId} />
  );
}
