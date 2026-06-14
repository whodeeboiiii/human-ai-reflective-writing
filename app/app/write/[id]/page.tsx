import WritingView from '@/components/writing/WritingView';

export default async function WritingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WritingView sessionId={id} />;
}
