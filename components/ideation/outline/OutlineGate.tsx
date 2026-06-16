'use client';

import { useSyncExternalStore } from 'react';
import { isQuickSession } from '@/lib/quickMode';
import OutlineView from './OutlineView';

// 공유 outline 라우트가 quick 여부를 OutlineView에 prop으로 전달 (full pipeline 컴포넌트 불변).
const noopSubscribe = () => () => {};

export default function OutlineGate({ sessionId }: { sessionId: string }) {
  const quick = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => isQuickSession(sessionId),
    () => null,
  );
  if (quick === null) return null; // 결정 전 한 프레임 (boot가 올바른 모드로 한 번만 돌게)
  return <OutlineView sessionId={sessionId} quick={quick} />;
}
