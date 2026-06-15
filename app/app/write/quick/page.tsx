'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logEvent } from '@/lib/events';
import { markQuickSession } from '@/lib/quickMode';

// Quick Mode (SWAI 배포) 진입점. full pipeline의 /app/write 진입점과 같은 패턴이되,
// 세션을 quick으로 표시하고 quick_start 이벤트를 적재한다. (CLAUDE_QuickMode.md §1, §8.3)
export default function QuickWritePage() {
  const router = useRouter();

  useEffect(() => {
    const id = crypto.randomUUID();
    markQuickSession(id);
    sessionStorage.setItem('flect-session-id', id);
    logEvent('quick_start'); // H1 분모
    router.replace(`/app/write/${id}/structured-input`);
  }, [router]);

  return null;
}
