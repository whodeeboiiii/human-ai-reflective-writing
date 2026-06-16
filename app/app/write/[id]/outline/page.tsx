import OutlineGate from '@/components/ideation/outline/OutlineGate';

export default async function OutlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Quick 세션이면 빈 카드 허용 + 통째 스킵 + outline_reached 로깅 (게이트 내부 분기).
  return <OutlineGate sessionId={id} />;
}
