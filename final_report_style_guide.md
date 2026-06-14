# Flect 논문 작성 스타일 가이드

## Part A. 프로젝트 컨텍스트

**논문 종류**: ACM/CHI Short Paper (≤5,500 words body). 1인 프로젝트이지만 학술 관례에 따라 We/Our 사용.

**확정된 섹션**: Introduction, Related Works (2.1–2.5), Design Goals (DG1–DG6), User Scenario. 이후 섹션들도 이 스타일과 일관되게 작성.

**고정 용어 (표기 방식 포함)**:

| 용어 | 표기 |
|---|---|
| fuzzy area (Hwang et al.에서 빌린 개념) | *fuzzy area* (이탤릭, 첫 등장 시) |
| experience-to-articulation gap (우리가 제안하는 개념) | *experience-to-articulation gap* (이탤릭, 첫 등장 시) |
| content gatekeeping | *content gatekeeping* (이탤릭, 첫 등장 시) |
| knowledge telling / transforming | *knowledge telling* / *knowledge transforming* |
| Ideation Phase / Writing Phase | 고유명사처럼 대문자 (Ideation Phase, Writing Phase) |
| LLM Q&A Session | 그대로 유지 |
| material cards | 소문자 |
| 대상 사용자 표현 | "novice writers" 단독 사용. "casual writer"와 혼용하지 말 것. |
| 참가자 지칭 | P1, P2, P3, P4 (실명, 전공 직접 노출 금지) |

**현재까지 확정된 섹션 분량 기준**:

| 섹션 | 목표 단어 |
|---|---|
| Introduction | 500–600 |
| Related Works (전체) | 800–900 |
| Design Goals | 350–450 |
| User Scenario | 200–300 |
| Formative Study | 350–450 |
| System Pipeline | 1,300–1,800 |
| User Study Method | 400–500 |
| User Study Results | 700–900 |
| Discussion | 350–450 |
| Limitations & Future Work | 200–300 |
| Conclusion | 100–150 |

---

## Part B. 학술 논문 작성 규칙

### 1. 인칭과 시제

- **We/Our**: 1인 프로젝트여도 항상 We 사용.
- **현재형**: 논문의 주장, 시스템 동작, 선행연구 묘사.
  - ✅ "Hwang et al. report that…" / "The system generates three suggestions."
- **과거형**: 실제로 수행한 행위 (실험, 인터뷰, 구현).
  - ✅ "We recruited four participants." / "Participants reported feeling in control."
- **현재완료**: 분야에서 지금까지 이루어진 것.
  - ✅ "Prior work has explored AI-assisted writing…"

### 2. 능동태 vs 수동태

- **능동 우선**: 주어가 We나 시스템일 때 항상 능동.
  - ❌ "Four participants were recruited." → ✅ "We recruited four participants."
- **수동 허용**: 행위자가 명백하지 않거나 중요하지 않을 때만.
  - ✅ "Transcripts were anonymized." / "Suggestions are generated based on context."

### 3. 전문 용어 표기

- **이탤릭**: 다른 논문에서 빌린 기술 용어, 또는 우리가 새로 제안하는 개념어를 첫 등장 시 한 번만.
- **큰따옴표**: 참가자 직접 인용 ("it was like talking to a friend"), 일반 용어를 특정 의미로 한정할 때 ("blank-page anxiety").
- **작은 따옴표**: ACM 스타일에서는 사용하지 않음.

### 4. 인용 통합

- **형식**: Author et al. (year) [#] 형태로 본문에 자연스럽게 삽입.
  - ✅ "Hwang et al. (2025) [4] find that…"
  - ✅ "…constituted by the writing process [4]."
  - ❌ "[4] demonstrates that…" (인용 번호로 문장 시작 금지)
- **According to 금지**: "According to Hwang et al." → 그냥 주장을 쓰고 인용 붙이기.
- **Related Work 각 절 끝**: 반드시 Flect와의 차별화 문장 한 개로 마무리.

### 5. 단락 구조

- **Topic sentence 필수**: 단락 첫 문장이 그 단락의 주장.
- **"This" 단독 금지**: "This shows that…" → "This finding suggests that…" / "This pattern indicates that…"
- **짧은 문장 = 강조**: 긴 문장으로 맥락 쌓은 뒤 핵심을 짧게 끊으면 인상 남음.

### 6. 헤징 (주장 강도 조절)

| 강도 | 표현 |
|---|---|
| 강 (데이터가 명확) | "demonstrates," "reveals," "confirms" |
| 중 (qualitative) | "suggests," "indicates," "appears to," "participants tended to" |
| 약 (가능성 제시) | "may suggest," "could reflect," "seems to" |

- ❌ "This proves that Flect resolves the Fuzzy Area."
- ✅ "These findings suggest that structured Socratic questioning may help novice writers articulate experiences they would otherwise leave unarticulated."

### 7. 피해야 할 표현

**Filler words** (삭제해도 의미 동일): "very," "really," "quite," "basically," "essentially," "in order to" (→ "to"), "due to the fact that" (→ "because")

**자기홍보성 표현** (CHI 리뷰어가 싫어함): "directly motivates," "particularly relevant," "this is precisely," "novel and important"

**Never**: "obviously," "clearly," "of course," "it is important to note that," "As mentioned above/below"

**Overused buzzwords**: "leverage" (→ "use"), "utilize" (→ "use"), "state-of-the-art" (근거 없이)

### 8. 문법 주의사항

- **Contraction 절대 금지**: don't → do not, can't → cannot, it's → it is
- **That vs Which**: 수식어 없으면 의미 바뀌는 경우 = "that" / 부가 정보 = ", which"
- **e.g. vs i.e.**: 둘 다 뒤에 쉼표. e.g. = 예시 (여러 개 가능), i.e. = 정확한 설명 (하나)
- **Comprise**: "The system comprises three phases." (O) / "is comprised of" (X)

### 9. Results 섹션 전용 규칙

- **보고 패턴**: [General behavior claim] + [Specific observation or quote]
- **참가자 인용**: 이탤릭 + 큰따옴표. 한국어 원본 번역이면 "(translated from Korean)" 첫 등장 시 각주.
  - ✅ P2 noted, *"ideation by myself usually took hours because I had so much things to write."*
- **빈도 표현**: N=4이므로 "all participants," "three of four," "two participants"로. 통계 불필요.
- **참가자 데이터 수정 금지**: Results 편집 시 실제 참가자 반응(어떤 참가자가 무엇을 했다)은 절대 삭제/수정하지 않음. 연결 문장 추가만 허용.

### 10. Contributions 리스트 형식

- Introduction 끝부분 bullet 형식; 각 항목 동사원형 또는 명사구로 시작 (parallel structure 필수).
- ✅ "(1) we propose… ; (2) we offer… ; and (3) we discuss…"

---

이 가이드를 새 채팅 첫 메시지에 붙여넣고, "이 스타일 가이드에 따라 Flect 논문의 [섹션 이름]을 작성해 줘"라고 하면 돼. project file의 `Final Report Draft.md`도 참조 가능하니 그것도 같이 언급하면 좋아.
