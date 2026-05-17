import ChatContainer from '@/components/ideation/qa/ChatContainer';

export default async function QAPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatContainer sessionId={id} />;
}
