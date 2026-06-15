# CLAUDE.md — Flect Community Feature

이 문서는 Flect에 **커뮤니티 기능(공유 및 타인의 글 열람)**을 추가하기 위한 작업 지침입니다.
아래 Task를 **T1부터 순서대로** 구현하세요. 각 Task의 "완료 조건"을 충족하면 다음으로 넘어갑니다.

---

## 0. Reference Documents

Before writing any code, read:

- `docs/specs.md` §14 — Design tokens
Follow the design guidelines on this code.

---

## 1. 프로젝트 컨텍스트

Flect는 비전문 필자의 진정성 있는 글쓰기를 돕는 2단계 Human-AI 협업 글쓰기 시스템입니다.
- **Ideation Phase**: 소크라테스식 Q&A로 생각을 끌어내고 → outline(material cards) 구성
- **Writing Phase**: 사용자가 직접 집필, AI는 Fix/Suggest/Formalize 보조만 수행
- 본 작업은 글을 완성한 뒤 **공개 발행(publish)** 하고, 타인의 글을 열람하는 커뮤니티 레이어를 추가합니다.

### 비목표 (구현하지 않음)
- 로그인 / 회원가입 / 인증
- 댓글, 유저 팔로우
- 사용자 신원은 **발행할 때마다 새로 입력하는 닉네임 + IP + 기기 UUID**로 식별합니다.

---

## 2. 기술 스택 (기존)

- Next.js 15 (App Router) + TypeScript
- Tiptap (에디터), shadcn/ui + TailwindCSS, Framer Motion (애니메이션)
- 상태관리: Zustand (`store/`)
- 백엔드 1: Next.js API Routes → Claude API (LLM 로직)
- 백엔드 2: Google Apps Script + Google Sheets (커뮤니티 DB)
- 배포: Netlify

신규 의존성을 추가하지 말고 위 스택 내에서 구현하세요. 애니메이션은 Framer Motion을 사용합니다.

---

## 3. 백엔드 계약 (GAS API)

GAS 웹앱이 `community_posts` 시트를 CRUD합니다. 호출은 **항상 Next.js 프록시 `/api/gas`를 경유**합니다 (CORS 회피, IP는 서버에서 주입).

### 3.1 `community_posts` 시트 스키마

> **⚠️ 선행 작업(수동):** Google Sheet에 `community_posts` 탭을 만들고 1행 헤더를 아래 순서 그대로 입력합니다.
> 기존 스키마 대비 **`author_ip`, `author_device` 두 컬럼이 추가**되었습니다.

```
id | author_nickname | author_ip | author_device | genre | title | content | outline_json | tags | publish_date | likes
```

| 컬럼 | 설명 | 생성 주체 |
|---|---|---|
| `id` | 6자리 랜덤 문자열 | 서버(GAS) 자동 |
| `author_nickname` | 발행 시 입력한 닉네임 | 클라이언트 |
| `author_ip` | 작성자 식별용 IP | **서버(`/api/community/publish`)가 헤더에서 주입** |
| `author_device` | 기기 고유 UUID (localStorage) | 클라이언트가 전송, 서버가 그대로 저장 |
| `genre` | 장르 (아래 GENRES 중 하나) | 클라이언트 (structuredInputStore에서 가져옴) |
| `title` | 글 제목 | 클라이언트 |
| `content` | 본문 (HTML 또는 마크다운) | 클라이언트 |
| `outline_json` | outline 객체를 `JSON.stringify`한 문자열 | 클라이언트 |
| `tags` | 콤마 구분 문자열 (예: `"성장,회고"`) | 클라이언트 |
| `publish_date` | ISO 문자열 | 서버(GAS) 자동 |
| `likes` | 정수, 기본 0 | 서버(GAS) 자동 |

### 3.2 GAS 액션

GAS는 다음 action을 지원합니다 (구현 완료된 백엔드 기준):
- `insert` — 새 글 발행. `id`/`publish_date`/`likes`는 서버가 채움.
- `read` — 전체 목록(`?action=read&table=community_posts`) 또는 단건(`&id=XXXXXX`).
- `like` — 좋아요 +1 (원자적). `?action=like&table=community_posts&id=XXXXXX`.
- `update`, `delete` — (현재 기능에선 미사용)

---

## 4. 디렉토리 규칙

신규 파일은 아래 위치에 만듭니다. 기존 패턴(컴포넌트는 `components/`, 순수 로직은 `lib/`, 전역 상태는 `store/`, 타입은 `types/`)을 따르세요.

```
app/
├── app/
│   ├── page.tsx                    # [수정] User Page — dummy 제거, IP+UUID 기반 내 글 표시
│   └── write/[id]/page.tsx         # [수정] Writing Phase에 Publish 버튼 추가
├── community/
│   ├── page.tsx                    # [신규] Community 피드
│   └── [id]/page.tsx               # [신규] 글 상세 열람
└── api/
    ├── gas/route.ts                # [기존] GAS 프록시
    └── community/
        ├── publish/route.ts        # [신규] 발행 (IP 서버 주입, device_id 클라이언트 수신)
        ├── posts/route.ts          # [신규] 목록 조회 (전체 / ?scope=mine)
        └── like/route.ts           # [신규] 좋아요

components/community/
├── PublishModal.tsx                # 닉네임·태그 입력 모달 + 링크 복사 (성공 후)
├── PublishSuccess.tsx              # 발행 완료 화면 + Framer Motion 애니메이션
├── PostCard.tsx                    # 피드/유저페이지 공통 글 카드 (읽기 시간 뱃지 포함)
├── GenreTabs.tsx                   # 장르 필터 탭
├── SearchBar.tsx                   # 제목/닉네임/태그 검색
└── LikeButton.tsx                  # 좋아요 버튼 (낙관적 업데이트)

lib/community.ts                    # [신규] 커뮤니티 API 래퍼 함수
lib/deviceId.ts                     # [신규] 기기 UUID 발급/조회
lib/readingTime.ts                  # [신규] 예상 읽기 시간 계산
types/community.ts                  # [신규] CommunityPost 타입
store/communityStore.ts             # [신규] 피드 캐시/필터/정렬/숨김 상태
```

---

## 5. 타입 및 상수 (먼저 정의)

`types/community.ts`:
```ts
export interface CommunityPost {
  id: string;
  author_nickname: string;
  // author_ip, author_device: API 응답에서 제거됨 (서버에서 strip)
  genre: Genre;
  title: string;
  content: string;
  outline_json: string;       // JSON.parse 해서 사용
  tags: string;               // "a,b,c" → split(',')
  publish_date: string;
  likes: number;
}

export type SortOrder = 'latest' | 'popular';

export type Genre =
  | '논평'
  | '비평/평론'
  | '독후감'
  | '장소 리뷰'
  | '영화·공연 리뷰'
  | '제품 리뷰'
  | '여행기'
  | '성찰 일지';

export const GENRES: Genre[] = [
  '논평', '비평/평론', '독후감', '장소 리뷰', '영화·공연 리뷰', '제품 리뷰', '여행기', '성찰 일지',
];
```
> 실제 장르 값은 structuredInputStore에서 사용하는 장르 라벨과 일치하되, structuredInputStore에서 genre = 'review'일 때, 배포 시 '장소 리뷰', '영화·공연 리뷰', '제품 리뷰', '여행기' 중 하나를 선택할 수 있도록 제작.

---

## 6. 구현 Task (순차 진행)

### T1 — 데이터 레이어 + 기기 UUID

#### 1-A. 기기 UUID 발급 (`lib/deviceId.ts`)
```ts
export function getDeviceId(): string {
  let id = localStorage.getItem('flect_device_id');
  if (!id) {
    id = crypto.randomUUID(); // 모든 모던 브라우저 지원, 외부 라이브러리 불필요
    localStorage.setItem('flect_device_id', id);
  }
  return id;
}
```
최초 방문 시 UUID 생성 후 영구 저장. 이후 재방문 시 동일 UUID 반환.

#### 1-B. 타입 및 API 래퍼
- `types/community.ts` 작성 (위 §5).
- `lib/community.ts`에 래퍼 함수 작성. 모든 호출은 `fetch('/api/community/...')` 사용.
  - `publishPost(input)` → `POST /api/community/publish`
    - body에 `device_id: getDeviceId()` 포함
  - `fetchPosts(scope: 'all' | 'mine')` → `GET /api/community/posts?scope=...`
    - `scope=mine`일 때 `&device_id=<UUID>` 쿼리 파라미터 추가
  - `fetchPost(id)` → `GET /api/community/posts?id=...`
  - `likePost(id)` → `POST /api/community/like`

#### 1-C. 예상 읽기 시간 (`lib/readingTime.ts`)
```ts
// 한국어 기준 분당 약 500자
export function getReadingTime(content: string): string {
  const chars = content.replace(/<[^>]+>/g, '').length; // HTML 태그 제거
  const minutes = Math.max(1, Math.round(chars / 500));
  return `${minutes}분`;
}
```

**완료 조건:** 타입 컴파일 통과, 함수 시그니처 확정. (UI 연결은 이후 Task)

---

### T2 — API Routes

#### 2-A. `/api/community/publish/route.ts`
- body에서 `author_nickname, genre, title, content, outline_json, tags, device_id` 수신.
- **IP는 서버에서 직접 읽음**: `x-nf-client-connection-ip` → `x-forwarded-for`의 첫 IP → `'unknown'` 순으로 fallback.
- `author_ip`(서버 주입) + `author_device`(body의 device_id 그대로) 를 데이터에 추가해 `/api/gas`로 `action=insert` 전달.
- 발행된 글의 `id`를 응답으로 반환 (성공 화면의 `/community/[id]` 링크 생성용).

브라우저가 보내는 것:
  { author_nickname, genre, title, content,
    outline_json, tags, device_id }

이 서버가 하는 일:
  1. body에서 위 항목들 꺼내기
  2. 요청 헤더에서 IP 읽기
       x-nf-client-connection-ip (Netlify가 넣어줌)
       없으면 x-forwarded-for 첫 번째 값
       그것도 없으면 'unknown'
  3. { ...위 항목들, author_ip: 읽은IP, author_device: device_id } 조합
  4. /api/gas로 전달 (action=insert, table=community_posts)
  5. GAS가 돌려준 글 id를 브라우저에 반환

브라우저가 받는 것:
  { success: true, id: "AB1234" }

#### 2-B. `/api/community/posts/route.ts`
- `?id=` 있으면 단건, 없으면 전체 read.
- `?scope=mine`이면:
  - 서버에서 현재 IP 읽기
  - `?device_id=` 쿼리 파라미터 수신
  - `author_ip === currentIp || author_device === deviceId` **OR 합집합**으로 필터
  - → NAT 공유 환경(학교 와이파이 등)에서 IP가 같아도, 기기 UUID가 달라 타인 글이 섞이지 않음
  - → 모바일에서 IP가 바뀌어도 UUID가 유지되어 내 글을 찾을 수 있음
- **응답에서 `author_ip`, `author_device` 모두 제거**하고 반환.

#### 2-C. `/api/community/like/route.ts`
- body의 `id`로 `/api/gas` `action=like` 전달, 새 likes 수 반환.

**완료 조건:** 각 라우트가 GAS와 정상 통신.

---

### T3 — Publish 플로우 (Writing Phase)

- `app/app/write/[id]/page.tsx`에 **"발행(Publish)" 버튼** 추가. 글이 비어있지 않을 때만 활성화.
- 클릭 시 `PublishModal` 오픈:
  - 닉네임 입력 (필수), 태그 입력 (콤마 구분, 선택).
  - genre는 structuredInputStore에서 자동으로 가져와 표시. 
  - structuredInputStore에서 genre = 'review'일 때, 배포 시 '장소 리뷰', '영화·공연 리뷰', '제품 리뷰', '여행기' 중 하나를 선택할 수 있도록 제작.
  - "발행" 확정 시 `publishPost()` 호출. content/outline은 writingStore·ideationStore에서 수집, outline은 `JSON.stringify`. `device_id`는 `getDeviceId()`로 가져옴.
- 발행 성공 시 `PublishSuccess` 화면 전환 + **Framer Motion 애니메이션** (체크마크 페이드인 등). 
  - "내 글 보기" (→ `/app`) 버튼
  - "커뮤니티에서 보기" (→ `/community/[id]`) 버튼
  - **"링크 복사" 버튼**: `navigator.clipboard.writeText(window.location.origin + '/community/' + id)` 호출. 복사 성공 시 버튼 텍스트를 "복사됨 ✓"로 일시 변경.

**완료 조건:** 발행 → community_posts에 행 추가 + 성공 애니메이션 + 링크 복사 동작.

---

### T4 — User Page (IP + UUID 기반 내 글 목록)

- `app/app/page.tsx`에서 **기존 dummy 글 예시 하드코딩을 완전히 제거**.
- `fetchPosts('mine')`으로 글 목록 불러오기. (내부적으로 `device_id` 쿼리 파라미터 자동 포함)
- `PostCard` 리스트로 렌더.
- 로딩 스켈레톤 / 빈 상태("아직 발행한 글이 없어요. 첫 글을 써볼까요?") 처리. '새 글' 버튼 누르면 새로운 글이 생성되고 세션 `uuid`가 부여되며 writing 파이프라인 시작.
- 상단에 **"커뮤니티" 버튼** 추가 → `/community`로 이동.

**완료 조건:** 발행한 글이 User Page에 즉시 보이고, dummy가 사라짐.

---

### T5 — Seed Data (커뮤니티 초기 글 10개)

- 다양한 장르/닉네임/태그/좋아요 수를 가진 **seed data 10건**을 `community_posts`에 삽입.
- 방법: `scripts/seedCommunity.ts` 일회성 스크립트.
- `author_ip`는 `"seed"`, `author_device`는 `"seed-device"` 고정값으로 채워 User Page에 섞이지 않게 함.
- 본문은 Flect의 타깃 장르(독후감/여행기/리뷰/성찰)에 맞는 현실적인 한국어 예시로 작성. 좋아요 수는 `likes` 컬럼에 직접 입력.

**완료 조건:** 커뮤니티 피드에 10개 글이 보임. (T6 테스트용 데이터)

---

### T6 — Community Page (피드)

`app/community/page.tsx`:

#### 6-A. 데이터 로드
- `fetchPosts('all')`로 전체 글 로드. 로딩 스켈레톤 처리.

#### 6-B. 장르 필터 (`GenreTabs`)
- "전체" + 각 GENRES 탭. **클라이언트 측 필터링**.

#### 6-C. 검색 (`SearchBar`)
- 제목 / 닉네임 / 태그에 대해 부분 문자열 검색 (대소문자·공백 무시). 클라이언트 측.

#### 6-D. 정렬 토글
- **"최신순" / "인기순(좋아요)"** 버튼 토글.
  - 최신순: `publish_date` 내림차순
  - 인기순: `likes` 내림차순
- 기본값: 최신순.

#### 6-E. PostCard 렌더
- 제목, 닉네임, 장르 뱃지, 태그, 좋아요 수, 발행일.
- **예상 읽기 시간 뱃지**: `getReadingTime(content)`로 계산해 카드 우상단에 표시. (예: "3분")
- 카드 클릭 시 `/community/[id]`로 이동.

**완료 조건:** 장르 필터 + 검색 + 정렬 토글 + 읽기 시간 뱃지가 모두 동작.

---

### T7 — Post Detail + Like + 숨김

`app/community/[id]/page.tsx`:

#### 7-A. 글 열람
- `fetchPost(id)`로 단건 로드.
- `content` read-only 렌더 (Tiptap content면 read-only 렌더러 사용).
- 사이드/하단에 outline 표시 (`JSON.parse(outline_json)`).
- 상단에 장르 뱃지, 태그, 닉네임, 발행일, **예상 읽기 시간** 표시.

#### 7-B. 좋아요 (`LikeButton`)
- 클릭 시 `likePost(id)` 호출.
- **낙관적 업데이트(optimistic update)**: 클릭 즉시 +1 표시, 서버 응답으로 실제값 보정.
- **localStorage로 중복 방지 (소프트 가드)**:
  ```ts
  const LIKED_KEY = 'flect_liked_posts';
  function getLikedIds(): string[] {
    return JSON.parse(localStorage.getItem(LIKED_KEY) ?? '[]');
  }
  function addLikedId(id: string): void {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...getLikedIds(), id]));
  }
  ```
  이미 좋아요한 글이면 버튼 비활성화 + 색상 변경.

#### 7-C. 글 숨김 (소프트 가드)
- 상세 페이지와 피드 카드에 **"이 글 숨기기"** 메뉴 추가 (shadcn DropdownMenu 활용).
- 숨긴 id를 localStorage에 저장:
  ```ts
  const HIDDEN_KEY = 'flect_hidden_posts';
  ```
- 피드 로드 시 숨긴 id를 클라이언트에서 필터링해 제외. DB나 서버 요청 없음.
- **"숨김 해제"** 옵션도 제공 (같은 메뉴 또는 설정 페이지).

#### 7-D. 공유 링크
- 상세 페이지 상단에 **"링크 복사" 버튼** 추가.
- `navigator.clipboard.writeText(window.location.href)` 호출.

**완료 조건:** 글 열람 + 좋아요 DB 반영 + 새로고침 후 좋아요 상태 유지 + 숨김 동작.

---

## 7. 코드 컨벤션

- TypeScript strict. `any` 지양, 위 타입 재사용.
- 서버 응답은 `{ success, data }` 형태(GAS 계약)를 그대로 신뢰하지 말고 항상 `success` 확인 후 사용.
- 네트워크 호출은 로딩/에러 상태를 UI에 반영 (shadcn 컴포넌트 활용).
- 컴포넌트는 작게 분리, 비즈니스 로직은 `lib/`·`hooks/`로.
- 한국어 UI 문구 사용, 디자인 톤은 기존 Flect와 일관되게.
- localStorage 키는 모두 `flect_` 접두사로 통일 (`flect_device_id`, `flect_liked_posts`, `flect_hidden_posts`).

---

## 8. 작업 시 주의

- `author_ip`는 절대 클라이언트에서 받지 말고 서버에서만 주입.
- `author_device`는 클라이언트가 전송하지만, User Page 필터는 서버에서 IP와 OR로 검증하므로 위조해도 타인 글 탈취 불가.
- 피드/상세 API 응답에서 `author_ip`, `author_device` 모두 제거해 반환.
- GAS 코드 수정 없이 **시트 헤더에 `author_device` 컬럼 추가만** 하면 됨 (GAS CRUD는 헤더 기반 범용 처리).
- GAS 코드를 수정했다면 **재배포 필요** (코드 변경만으론 라이브 미반영).
- 긴 본문은 GET URL 길이 제한을 넘기므로 발행은 반드시 POST 경로 사용.
- `getDeviceId()`는 localStorage에 접근하므로 반드시 클라이언트 컴포넌트(`'use client'`) 또는 `useEffect` 내에서 호출.
