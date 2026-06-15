'use client';

/**
 * 커뮤니티 백엔드 디버그 패널
 * 위치: app/debug/community/page.tsx
 * 접속: http://localhost:3000/debug/community
 *
 * 글쓰기 파이프라인 없이 백엔드(GAS / Community API)를 직접 테스트.
 * Level 1(Raw GAS) → Level 2(Community API) 순으로 아래에서 위로 검증.
 *
 * ⚠️ 최종 제출 전 이 파일을 삭제하거나, 하단의 NODE_ENV 가드를 사용하세요.
 */

import { useEffect, useState } from 'react';

const TABLE = 'community_posts';

// ── 더미 데이터 생성 ──────────────────────────────────────────
function sampleData(deviceId: string) {
  const n = Math.floor(Math.random() * 1000);
  // outline_json은 실제 Outline 타입({ cards, userArrangedOrder, ... })과 일치시킴
  const outline = {
    cards: [
      { id: `dbg-card-1-${n}`, content: '책을 읽게 된 계기', sourceElement: 'orientation', isEdited: false },
      { id: `dbg-card-2-${n}`, content: '가장 인상 깊었던 장면', sourceElement: 'feelings', isEdited: false },
    ],
    userArrangedOrder: null,
    flowSuggestions: null,
    selectedFlowId: null,
    generatedAt: new Date().toISOString(),
    userEdited: false,
  };
  return {
    author_nickname: `디버그유저${n}`,
    author_device: deviceId,
    genre: '독후감',
    title: `테스트 글 #${n}`,
    content: `<p>이것은 디버그용 테스트 본문입니다. 난수 ${n}.</p><p>두 번째 문단입니다.</p>`,
    outline_json: JSON.stringify(outline),
    tags: '디버그,테스트',
  };
}

// ── 기기 UUID (lib/deviceId.ts가 이미 있으면 그걸 쓰세요) ──────
function getDeviceId(): string {
  let id = localStorage.getItem('flect_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('flect_device_id', id);
  }
  return id;
}

interface LogEntry {
  ts: string;
  label: string;
  ms: number;
  ok: boolean;
  status: number | string;
  request: unknown;
  response: unknown;
}

export default function CommunityDebugPage() {
  const [deviceId, setDeviceId] = useState('');
  const [log, setLog] = useState<LogEntry[]>([]);
  const [idInput, setIdInput] = useState('');

  useEffect(() => {
    setDeviceId(getDeviceId());
  }, []);

  // 공통 호출 헬퍼: 시간 측정 + 에러 캐치 + 로그 적재
  async function call(label: string, url: string, init?: RequestInit, requestBody?: unknown) {
    const start = performance.now();
    let entry: LogEntry;
    try {
      const res = await fetch(url, init);
      const ms = Math.round(performance.now() - start);
      let body: unknown;
      const text = await res.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = text; // JSON이 아니면 원문 그대로 (GAS 에러 페이지 등)
      }
      entry = {
        ts: new Date().toLocaleTimeString(),
        label,
        ms,
        ok: res.ok,
        status: res.status,
        request: requestBody ?? url,
        response: body,
      };
    } catch (err) {
      entry = {
        ts: new Date().toLocaleTimeString(),
        label,
        ms: Math.round(performance.now() - start),
        ok: false,
        status: 'NETWORK_ERROR',
        request: requestBody ?? url,
        response: String(err),
      };
    }
    setLog((prev) => [entry, ...prev]);

    // 응답에서 id를 자동으로 idInput에 채워줌 (다음 read/like 테스트 편의)
    const r = entry.response as { id?: string; data?: { id?: string } };
    const newId = r?.id ?? r?.data?.id;
    if (newId) setIdInput(newId);
  }

  // ── Level 1: Raw GAS (/api/gas 직접) ───────────────────────
  const gasInsert = () =>
    call(
      'GAS insert',
      '/api/gas',
      jsonPost({ action: 'insert', table: TABLE, data: { ...sampleData(deviceId), author_ip: 'debug' } }),
      { action: 'insert', table: TABLE },
    );

  const gasReadAll = () =>
    call('GAS read all', '/api/gas', jsonPost({ action: 'read', table: TABLE }), { action: 'read', table: TABLE });

  const gasReadOne = () =>
    call('GAS read by id', '/api/gas', jsonPost({ action: 'read', table: TABLE, id: idInput }), {
      action: 'read',
      table: TABLE,
      id: idInput,
    });

  const gasLike = () =>
    call('GAS like', '/api/gas', jsonPost({ action: 'like', table: TABLE, id: idInput }), {
      action: 'like',
      table: TABLE,
      id: idInput,
    });

  // ── Level 2: Community API (/api/community/*) ───────────────
  const apiPublish = () => {
    const data = sampleData(deviceId);
    return call('API publish', '/api/community/publish', jsonPost({ ...data, device_id: deviceId }), data);
  };

  const apiGetAll = () => call('API posts (all)', '/api/community/posts?scope=all');

  const apiGetMine = () =>
    call('API posts (mine)', `/api/community/posts?scope=mine&device_id=${encodeURIComponent(deviceId)}`);

  const apiGetOne = () => call('API post by id', `/api/community/posts?id=${encodeURIComponent(idInput)}`);

  const apiLike = () => call('API like', '/api/community/like', jsonPost({ id: idInput }), { id: idInput });

  return (
    <div style={S.page}>
      <h1 style={S.h1}>🛠 커뮤니티 백엔드 디버그 패널</h1>
      <div style={S.meta}>
        device_id: <code style={S.code}>{deviceId || '...'}</code>
      </div>

      {/* id 입력 (read/like 테스트용) */}
      <div style={S.idRow}>
        <label style={{ fontSize: 13 }}>테스트할 글 id:</label>
        <input
          style={S.input}
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          placeholder="insert/publish 하면 자동으로 채워짐"
        />
      </div>

      {/* Level 1 */}
      <section style={{ ...S.section, borderColor: '#16a34a' }}>
        <h2 style={{ ...S.h2, color: '#16a34a' }}>Level 1 · Raw GAS (/api/gas)</h2>
        <p style={S.desc}>GAS 배포 + 시트 연결 + CRUD가 동작하는지 가장 먼저 확인</p>
        <div style={S.btnRow}>
          <button style={S.btn} onClick={gasInsert}>insert (더미 1줄)</button>
          <button style={S.btn} onClick={gasReadAll}>read all</button>
          <button style={S.btn} onClick={gasReadOne}>read by id</button>
          <button style={S.btn} onClick={gasLike}>like by id</button>
        </div>
      </section>

      {/* Level 2 */}
      <section style={{ ...S.section, borderColor: '#7c3aed' }}>
        <h2 style={{ ...S.h2, color: '#7c3aed' }}>Level 2 · Community API (/api/community/*)</h2>
        <p style={S.desc}>IP 주입 · scope 필터 · author_ip 제거 · 좋아요 로직 확인</p>
        <div style={S.btnRow}>
          <button style={S.btn} onClick={apiPublish}>publish (더미)</button>
          <button style={S.btn} onClick={apiGetAll}>posts (all)</button>
          <button style={S.btn} onClick={apiGetMine}>posts (mine)</button>
          <button style={S.btn} onClick={apiGetOne}>post by id</button>
          <button style={S.btn} onClick={apiLike}>like</button>
        </div>
      </section>

      {/* 로그 */}
      <div style={S.logHeader}>
        <h2 style={S.h2}>응답 로그</h2>
        <button style={S.btnGhost} onClick={() => setLog([])}>지우기</button>
      </div>
      {log.length === 0 && <p style={S.desc}>아직 호출 없음. 위 버튼을 눌러보세요.</p>}
      {log.map((e, i) => (
        <div key={i} style={{ ...S.entry, borderLeftColor: e.ok ? '#16a34a' : '#dc2626' }}>
          <div style={S.entryHead}>
            <strong>{e.ok ? '✅' : '❌'} {e.label}</strong>
            <span style={S.entryMeta}>{e.status} · {e.ms}ms · {e.ts}</span>
          </div>
          <details>
            <summary style={S.summary}>요청</summary>
            <pre style={S.pre}>{JSON.stringify(e.request, null, 2)}</pre>
          </details>
          <details open>
            <summary style={S.summary}>응답</summary>
            <pre style={S.pre}>{JSON.stringify(e.response, null, 2)}</pre>
          </details>
        </div>
      ))}
    </div>
  );
}

// ── 헬퍼 ──────────────────────────────────────────────────────
function jsonPost(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// ── 스타일 (디버그용이라 인라인으로 자체 완결) ────────────────
const S: Record<string, React.CSSProperties> = {
  page: { maxWidth: 760, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' },
  h1: { fontSize: 20, marginBottom: 8 },
  h2: { fontSize: 15, margin: '0 0 4px' },
  meta: { fontSize: 13, color: '#666', marginBottom: 16 },
  code: { background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  idRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 13 },
  section: { border: '2px solid', borderRadius: 10, padding: 16, marginBottom: 16 },
  desc: { fontSize: 12, color: '#888', margin: '0 0 10px' },
  btnRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btn: { padding: '8px 14px', border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnGhost: { padding: '4px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#888' },
  logHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 },
  entry: { borderLeft: '4px solid', background: '#f8fafc', borderRadius: 6, padding: '10px 12px', marginBottom: 10 },
  entryHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 },
  entryMeta: { fontSize: 11, color: '#999' },
  summary: { fontSize: 12, color: '#555', cursor: 'pointer', marginTop: 4 },
  pre: { background: '#0f172a', color: '#e2e8f0', padding: 10, borderRadius: 6, fontSize: 11, overflow: 'auto', maxHeight: 280 },
};
