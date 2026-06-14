'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WritePage() {
  const router = useRouter();

  useEffect(() => {
    const id = crypto.randomUUID();
    sessionStorage.setItem('flect-session-id', id);
    router.replace(`/app/write/${id}/structured-input`);
  }, [router]);

  return null;
}
