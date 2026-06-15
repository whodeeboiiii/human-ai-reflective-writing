import QASwitch from '@/components/ideation/qa/QASwitch';

export default async function QAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Quick 세션이면 QuickQASession, 아니면 기존 ChatContainer (스위치 내부에서 분기).
  return <QASwitch sessionId={id} />;
}
