import StructuredInputSwitch from '@/components/ideation/structured-input/StructuredInputSwitch';

export default async function StructuredInputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Quick 세션이면 QuickStructuredInput, 아니면 기존 SurveyFlow를 렌더 (스위치 내부에서 분기).
  return <StructuredInputSwitch sessionId={id} />;
}
