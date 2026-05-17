import SurveyFlow from '@/components/ideation/structured-input/SurveyFlow';

export default async function StructuredInputPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SurveyFlow sessionId={id} />;
}
