'use client';

import { useSyncExternalStore } from 'react';
import { isQuickSession } from '@/lib/quickMode';
import SurveyFlow from './SurveyFlow';
import QuickStructuredInput from '@/components/quick/QuickStructuredInput';

// 공유 structured-input 라우트가 세션 종류에 따라 분기한다.
// isQuickSession은 sessionStorage(클라이언트 전용)를 읽으므로, useSyncExternalStore로
// 서버 스냅샷(null → 한 프레임 null 렌더)과 클라이언트 스냅샷(boolean)을 분리해
// hydration mismatch와 setState-in-effect를 모두 피한다. (full pipeline 컴포넌트는 불변)
const noopSubscribe = () => () => {};

export default function StructuredInputSwitch({ sessionId }: { sessionId: string }) {
  const quick = useSyncExternalStore<boolean | null>(
    noopSubscribe,
    () => isQuickSession(sessionId),
    () => null,
  );

  if (quick === null) return null; // 결정 전 한 프레임 (플래시 방지)
  return quick ? (
    <QuickStructuredInput sessionId={sessionId} />
  ) : (
    <SurveyFlow sessionId={sessionId} />
  );
}
