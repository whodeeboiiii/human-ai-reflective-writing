import { getDeviceId } from './deviceId';
import type { CommunityPost, PublishInput } from '@/types/community';

export async function publishPost(
  input: Omit<PublishInput, 'device_id'>
): Promise<{ id: string }> {
  const res = await fetch('/api/community/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, device_id: getDeviceId() }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? '발행 실패');
  return { id: json.id };
}

export async function fetchPosts(scope: 'all' | 'mine'): Promise<CommunityPost[]> {
  const params = new URLSearchParams({ scope });
  if (scope === 'mine') params.set('device_id', getDeviceId());

  const res = await fetch(`/api/community/posts?${params}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? '목록 조회 실패');
  return json.data as CommunityPost[];
}

export async function fetchPost(id: string): Promise<CommunityPost> {
  const res = await fetch(`/api/community/posts?id=${encodeURIComponent(id)}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? '글 조회 실패');
  return json.data as CommunityPost;
}

export async function likePost(id: string): Promise<number> {
  const res = await fetch('/api/community/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? '좋아요 실패');
  return json.data.likes as number;
}
