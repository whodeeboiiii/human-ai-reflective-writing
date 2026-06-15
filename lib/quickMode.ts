// Quick Mode는 여러 라우트(structured-input → qa → outline → write)에 걸쳐 진행되므로,
// "이 세션이 Quick Mode인가"를 라우트 간에 공유해야 한다. 세션 id로 스코프해 저장하므로,
// 같은 탭에서 이후 full 파이프라인 글(다른 id)을 시작해도 quick 플래그가 누수되지 않는다.
// → full pipeline 코드를 건드리지 않고 분기 가능.
const KEY = 'flect_quick_session';

/** Quick 진입점(/app/write/quick)에서 세션 id를 quick으로 표시. */
export function markQuickSession(id: string): void {
  if (typeof window !== 'undefined') sessionStorage.setItem(KEY, id);
}

/** 해당 세션 id가 Quick Mode 세션인지 여부. */
export function isQuickSession(id: string): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(KEY) === id;
}
