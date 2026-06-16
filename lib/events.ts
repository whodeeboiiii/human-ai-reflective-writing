import { getDeviceId } from './deviceId';

// XYZ 가설 검정용 이벤트 stage. 각 분기점에서 logEvent로 events 시트에 1줄 적재한다.
// 매핑은 CLAUDE_QuickMode.md §8.3 / §8.4 참조.
//   H1 활성화 = outline_reached / quick_start
//   H2 공유   = published / publish_opened
//   H3 참여   = like / community_visit
export type Stage =
  | 'quick_start'           // Quick Mode 진입 (/app/write/quick 마운트)
  | 'structured_first_input' // 첫 구조화 입력(첫 질문 답변) — 실제 참여 시작 (H1 보조 분모)
  | 'structured_done'       // Structured Input 완료
  | 'qa_skipped'       // Q&A 통째 스킵 클릭
  | 'qa_done'          // Q&A 세션 정상 종료 (또는 floor 경고 후 진행)
  | 'outline_reached'     // Outline Composition 화면 도달
  | 'outline_skipped'     // Outline 통째 스킵 클릭
  | 'ideation_finished'   // Quick Mode: 개요 완성 후 복사 모달 노출 = Ideation Phase 완료 (H1 분자)
  | 'writing_reached'     // Writing Phase 도달
  | 'publish_opened'   // 발행 모달 오픈 = "발행 화면 도달" (H2 분모)
  | 'published'        // 커뮤니티 발행 완료 (H2 분자)
  | 'community_visit'  // 커뮤니티 피드 방문
  | 'like';            // 좋아요 클릭

/**
 * 이벤트 1건을 events 시트에 적재한다.
 *
 * Fire-and-forget: 절대 사용자 흐름을 막지 않는다(await 하지 말 것). 실패는 콘솔 경고만 남긴다.
 * device_id는 getDeviceId()(localStorage)에서 오므로 **클라이언트에서만** 호출한다.
 * keepalive: 페이지 이탈 중(예: community_visit 직후 네비게이션)에도 전송이 끊기지 않게 한다.
 */
/**
 * 랜딩 페이지 방문을 visitors 시트에 기록한다. (fire-and-forget)
 * 시트 헤더: device_id | timestamp | referrer
 */
export function logVisitor(): void {
  if (typeof window === 'undefined') return;
  try {
    const device_id = getDeviceId();
    void fetch('/api/gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'insert',
        table: 'visitors',
        data: {
          device_id,
          timestamp: new Date().toISOString(),
          referrer: document.referrer || 'direct',
        },
      }),
      keepalive: true,
    }).catch((err) => console.warn('[logVisitor] send failed', err));
  } catch (err) {
    console.warn('[logVisitor] failed', err);
  }
}

export function logEvent(stage: Stage): void {
  if (typeof window === 'undefined') return; // SSR 가드 (localStorage 없음)
  try {
    const device_id = getDeviceId();
    void fetch('/api/gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'insert',
        table: 'events',
        data: { device_id, stage, timestamp: new Date().toISOString() },
      }),
      keepalive: true,
    }).catch((err) => console.warn('[logEvent] send failed', stage, err));
  } catch (err) {
    console.warn('[logEvent] failed', stage, err);
  }
}
