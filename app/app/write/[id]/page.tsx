import WritingGate from '@/components/writing/WritingGate';

export default async function WritingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Quick 세션이면 WritingView에 quick prop 전달 (Suggest만, Fix/Formalize 제외 + 로깅).
  return <WritingGate sessionId={id} />;
}
