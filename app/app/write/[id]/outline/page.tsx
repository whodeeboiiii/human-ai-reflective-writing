import OutlineView from '@/components/ideation/outline/OutlineView';

export default async function OutlinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OutlineView sessionId={id} />;
}
