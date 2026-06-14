# Project Brainstorming

NOTE: Everything in this ‘brainstorming’ page is not final. Abstract ideas are inside parentheses.

***Flect: Staged Human-AI Co-Writing Partner for Casual Reflective Writing***

***일상적 경험을 글로 잇는 단계별 AI 글쓰기 파트너***

일상적인 경험을 글로 담고 싶어하지만 펜을 잡기 어려워하는 사회인들을 위해, AI의 간접적 도움을 통해 캐주얼한 글쓰기를 어렵지 않고 의미있는 경험으로 만들어 주는 단계별 시스템입니다.

일상적인 경험을 기록하고 싶어 하는 많은 사회인들은 백지 상태에서 글을 시작할 때 느끼는 막막함과 자신의 생각을 논리적으로 구조화하는 과정에서 큰 어려움을 겪습니다. 이에 주체적인 글쓰기를 포기하고, 살아가면서 글쓰기를 “해야 하는” 상황에서도 단지 LLM에게 완전한 대필을 요청하곤 합니다. 이렇게 LLM에게 글쓰기를 맡기는 행위는 개인의 표현 능력을 제한하고, LLM이 생성한 글에서는 작가 개인의 정체성이나 진정성을 찾기 어렵습니다. 본 시스템은 LLM 생성 텍스트와 관련된 이러한 문제를 해결하고 일반인들이 창작의 주도권을 가지고 글을 쉽고 재미있게 쓸 수 있도록 독려하기 위해, 글쓰기의 모든 과정을 단순화 및 세분화하여 각 단계에 최적화된 AI 도움을 제공합니다.
사용자는 글을 시작하기 전 백지 상태에서의 막막함을 해소하기 위해 '아이디어화(Ideation)’ 과정을 AI와 함께 진행하며 자신이 쓰고 싶은 글의 명확한 비전을 설정합니다. AI는 사용자 내면의 감정과 동기를 끌어내는 질문을 던지거나 사용자가 제시한 아이디어를 구조화하면서, 창작의 가장 어려운 단계인 ‘모호한 지점(Fuzzy Area)’을 실체화할 수 있게끔 도와줍니다. 실제 집필 과정(Writing Phase)에서는 사용자가 '콘텐츠 게이트키퍼(Content Gatekeeper)'로서 AI의 문장 제안을 직접 선택하거나 수정하며 글에 대한 통제권을 유지하고 자신의 독자적인 목소리를 보존합니다. AI는 글을 단순 생성하지 않고, 사용자가 제시한 아이디어릍 토대로 선택지를 제안하며 글쓰기의 흐름이 끊기지 않도록 합니다. 마지막으로 시스템의 피드백 과정(Editing Phase)은 단순 오타 교정을 넘어 논리적 흐름과 타겟 독자에 적합한 어조를 점검하는 개인화된 피드백을 제공하여 글의 완성도를 높입니다. 
결과적으로 본 서비스는 사용자가 AI에게 의존하는 대신 AI와의 협업을 통해 창작의 즐거움을 느끼고 표현 능력을 강화할 수 있는 성장적 글쓰기 환경을 구축합니다.

# Project Definition

## Project Name

***Flect: Staged Human-AI Co-Writing Partner for Casual Reflective Writing***

### Why ‘Flect’?

- Re’flect’ (비추다) → Our system aims for reflective essays, The system could ‘reflect’ one’s internal states and extract it into a full writing
- In’flect’ (굴절시키다) → Change one’s fuzzy area into a concrete structure
- ~flect : to bend (e.g. reflect, deflect, flexible) → The writer can flexibly accept or decline AI suggestions

### Logo Design

**A. 'F'를 반사된 형태로 (Reflected F, Mirror Wordmark)**

'F' 글자 옆에 거울에 비친 듯한 반사상이 살짝 보임. 워드마크와 심볼이 자연스럽게 결합되는 방식. 명함이나 favicon에도 적용하기 좋음. 미니멀하고 포근한 톤에 잘 맞음.

**B. 휘어진 선 (Bent Stroke)**

'F' 또는 'l'의 직선 한 부분이 부드럽게 굽어 있는 형태. *flectere(굽히다)* 어원을 시각화. 손글씨처럼 자연스러운 곡선을 사용해 포근함을 강조.

**C. 반으로 접힌 종이 (Folded Paper)**

글쓰기 메타포 + flect의 굽힘 의미. 종이가 살짝 접혀 그림자가 지는 형태의 아이콘. 메모장 UI 컨셉과도 연결됨. 베이지 배경에서 페이퍼 텍스처가 따뜻한 인상을 줌.

**D. 이중 곡선 / 무한 루프 (Double Curve)**

두 개의 곡선이 서로 마주보며 부드럽게 만나는 형태. 인간과 AI의 협업, 양방향 대화(Q&A Session)의 시각화. *re-flect*에서의 'reflexive' 관계를 표현. 미니멀한 라인 아트로 구현 가능.

## Project Scope

### Writing Type

**수필/에세이 (비평/평론, 독후감, 리뷰, 여행기, 성찰 일지)** 

**Creative Nonfiction: Personal Essay, Reflective Writing**

무슨 종류의 글이지?

- 중심 주제가 있음
- 기록용으로도 사용 가능
- 매체/커뮤니티에 포스팅
- Audience 존재, 타인이 글을 평가 (좋아요/싫어요/댓글)
- ‘잘 쓰는 것’이 중요 (논리 구조, 문체, 문법)
- 주관적이면서도 어느 면에서는 객관성 유지해야 함
- 글쓰기에 관심 없는 사람들은 애초에 안 씀
- 진정성은 관점이나 인사이트에서 나옴.
- AI는 구조화에 도움만 주고, 결론(메세지)는 사용자가 스스로 도달해야 함.
- 독자를 의식하기 때문에 "AI가 더 잘 썼다"는 느낌이 들면 수용 유혹이 강해짐.

개인의 외적, 내적 경험을 글로 담을 수 있는 방법

사실에 기반하되, 주관성이 중요한 글

자신의 의견을 표현하는 논리적 구조가 중요한 글

- 1인칭 시점에서 작가의 lived experience를 다룸
- 결과물이 fiction이 아닌 nonfiction
- 주관적 해석과 객관적 사실이 혼재
- Hwang et al.의 *Authenticity* 개념이 동일하게 적용

### Target Audience

Casual Writers

글쓰기 능력이 뛰어나지 않음 (전문 작가, 전문 비평가 제외)

글쓰기 동기가 있는 사람들

### Topic Space

AI-Assisted Writing, Agency in Human-AI Collaboration, Content Gatekeeping, Social Computing

*Out of scope: (too much) personalization, productivity*

## Motivation

### Writing Assistant

인간마다 개인의 경험과, 각자의 지식이 있다. 
하지만 이는 추상적으로 머리에 존재하고, 정리되어 있지 않다.

이를 글로 적으면 추상적이었던 생각들이 정리되고, 휘발되지 않고 영구적으로 보존된다.

하지만 일반인들은 우리는 글을 잘 못 쓴다. 왜냐하면 생각을 글로 표현할 때 그 간극을 메우기가 힘들고 (**fuzzy area**), 아이디어를 주입하고 LLM에게 글쓰기 자체를 맡기는 **AI Ghostwriting**에 익숙하다.  그래서 글을 적는 과정이 너무 오래 걸리고 어려워, 쉽게 포기하곤 한다. 

이렇게 개인의 내적/외적 경험들을 글로 쉽게 구조화할 수 있도록 AI가 도와주면 어떨까?
AI의 도움을 받으면서 글을 쓰다 보면, 장기적으로는 개인의 글쓰기 능력도 덩달아 늘지 않을까? 

## Project Scope for Classes

*이 프로젝트는 장기적으로는 연구용 프로젝트이지만 (CHI/CSCW target), 일단 2달 안에 두 개의 다른 학부 수업에 최종 프로젝트로 제출해야 한다. 따라서 각 수업 제출용으로 프로젝트 범위를 다르게 잡는다. 추후 방학때 프로젝트의 구체적인 부분을 고찰 및 구현한다.*

### 인간인공지능상호작용 (HAI class)

- 커뮤니티 기능 제거
- Ideation Phase에 집중 (main contribution)
    - Ideation Phase → **rich**: structured input 슬라이더, 질문 생성 로직, outline 한 문장씩 composition까지 전부
    - Writing Phase → **thin**: CoAuthor 스타일 탭 기반 next-sentence suggestion **하나만**. slash command 전부는 future work
    - Editing Phase → **skip or 극미니**: 재후님도 "수틀리면 editing phase는 적당히"라고 직접 적어두셨고, 조교님도 casual 글쓰기엔 editing 개입이 오히려 불쾌감 준다고 암시. 완전 생략해도 연구 성립 가능
- User Study: 3~5명 in-depth interview

### SWAI비즈니스응용설계 (SWAI class)

- 시간 남으면, 커뮤니티 기능 추가
    - **극단적으로 축소한 버전 제안**: 회원가입/댓글/좋아요 다 빼고, 글쓰기 완료 후 "공개 발행" 버튼 → 공유 가능한 URL 생성 → 공개된 글들 타임라인으로만 보여주는 미니 피드. 이 정도만 해도 "지식 공유로 내적 동기가 상승하는가"라는 가설 최소 검증은 가능.
- 구현 및 사용자 편의에 초점
    - ~~이 수업 한정해서, target audience 및 writing type 범위를 넓힐수도?~~
- 최종적으로 MVP 제작 후 배포
- 인터페이스에 신경쓰기
    - 메모장 인터페이스 (이 시스템으로 작성한 글들을 보관)
    - 커뮤니티 인터페이스 (이 시스템으로 공유한 글들을 볼 수 있는 포럼)

## Problem (Re)Definition

Novice Writer들이 Writing Ideation에서 겪는 어려움

Fuzzy area의 차이: hwang et al.이 정의한 전문가의 fuzzy area와 casual writer들의 fuzzy area가 다르다

“4요소를 채우면 fuzzy area가 없어진다”라는 논리적 고리가 없음

### 문제 정의

- 백지 상태에서의 공포: 빈 화면을 보면 어디서부터 시작할지 모르겠음 (시작을 못함)
    - 글 내용을 정하는 것도 어렵지만, 글의 톤을 정하는 것이 어려움
    - 첫 문장을 뭐로 어떻게 시작하지?
- 외적인 경험을 말하라는 것은 잘 하지만 (“여행지에서 이날 뭐했어?“, ”책에서 무슨 내용이 인상적이었어?“), 내적 상태에서 모호함을 느낌 (그 내용을 볼 때 느낌이 어땠어?)
- 구조화의 어려움: 무엇을 어떤 순서로 쓸지 모르겠음

### 타겟층

글쓰기 주제는 있으나, 글쓰기 자체가 낯설음

“이거에 대해 써보고 싶은데...“ or “이러한 경험을 기억하기 위해서 남기고 싶은데...”

### 문제 정의에 관한 질문

1. "미숙한 작성자의 아이디어 인출 과정이 숙련자와 어떻게 다른지 **이론적으로 정의**했는가?"
2. "재후님이 설계한 'Socratic ideation'이 실제로 인간의 어떤 **인지적 병목 현상**을 해결했는가?"

# Background

## Related Works

### It was 80% me, 20% AI

https://dl.acm.org/doi/abs/10.1145/3711020

“While writers overall desired control over their writing experiences, we noticed the degree of control needed might also differ from stage to stage.” (Hwang et al., 2025, p. 29)

‘Fuzzy Area’, ‘Content Gatekeeping’의 정의

### CoAuthor

https://dl.acm.org/doi/abs/10.1145/3491102.3502030
Writing Phase 'Suggestion' feature에서 직접적인 참고

### 글쓰기의 과정

Flower & Hayes (1981)의 “인지적 작문 프로세스 모델”

- **계획하기 (Planning):** 목표를 설정하고, 기억 속에서 아이디어를 생성하며, 이를 조직화하는 단계입니다.
- **변환하기 (Translating):** 구상한 아이디어를 실제 언어(문장)로 바꾸는 과정입니다.
- **검토하기 (Reviewing):** 쓴 글을 평가하고 수정(Revision)하는 단계입니다.


### Similar Works

DiaryPlay

John Joon Young Chung ‘s works

### Claude.ai ‘Best Practice’

**For writing assistance**

- Outline requirements, target audience, and key points comprehensively.
- Send entire texts for editing in one message rather than breaking them up.

### Knowledge Telling and Knowledge Transforming in Written Composition (Bereiter & Scardamalia, 1987)

비전문 작가는 *Knowledge Telling*(머릿속 정보를 그대로 나열) 모드에 머무는데, outline은 *Knowledge Transforming*(정보를 재구성) 모드로 전환하는 *비계*입니다. 이 비계를 없애면 시스템이 풀려고 했던 인지적 어려움이 해결되지 않습니다.

#### Knowledge Transforming의 각 공간의 연결성

'**내용 공간**(무엇을 쓸 것인가)'

- 무엇을 쓸지 머리속에 모호하게만 존재하고, 실제 글로 꺼내기 어려움. (Fuzzy Area)
- 그래서 LLM Q&A Session으로 모호한 아이디어들을 구체화

'**수사 공간**(어떻게 쓸 것인가)'

- 무엇을 쓸지 알아도, 글쓰기 자체가 익숙하지 않아서, 글을 어떻게 써야 하는지 감이 안 옴. (Fuzzy Area)
- 그래서 Outline Composition으로 아이디어를 글로 작성하는 방법 제시

두 공간 간의 변증법적 상호작용

#### Cognitive Overload 감소

비전문 작가가 Knowledge Telling에서 Knowledge Transforming으로 가기 힘든 여러 가지 이유들 존재 
(문법, 어휘 선택, 문장 구조를 고민하면서 동시에 글의 전체적인 논리 구조를 짜기 어렵다) 

→ Flect는 대부분의 인지적 과정들을 도와줌

- Writing Phase에서 글쓰기 중에 필요한 역량들 (문법, 어휘 선택, 문장 구조)을 부분적으로 해소
- LLM Q&A Session에서 글에 쓸 내용을 brainstorming하게 해 줌
- Outline Composition에서 실제 글쓰기(텍스트 생성)의 부담이 없는 채로, 구조적 사고를 간접적으로 도와 줌

### System에게 Agency를 뺏겼을 때 인간의 생각?

시스템이 책임지면, insecure한 사람들은 책임을 넘기는 것 같아 오히려 좋아함
시스템이 책임지게 하는 것의 장점은 있으나, 자체적인 성장하기에는 어렵다.

“working through their decision — weighing what they valued, their feelings, and so forth, even when it feels awful — was also imperative to personal growth” (Yin and Xiao, 2026, p. 11) 

“Participants leaned towards the freedom of choice, even when having choice can seem overwhelming. Participants admitted that they needed to sit in this discomfort to grow: P1 mentions that “to avoid feeling awful, I think you have to feel awful first”.” (Yin and Xiao, 2026, p. 11) (pdf)

### Agency

최근 연구는 LLM 환경에서 읽기와 쓰기 활동의 연결이 AI 개인화에 의해 어떻게 자율성을 해치는지 탐구하기 시작했다 (19, Qin et al., 2026).

쓰기 과정을 계획과 번역으로 나누어 AI가 어느 단계에 기여할 때 사용자의 주체성이 유지되는지 분석했다 (6, Wan et al., 2024).

### Socratic Questioning

https://dl.acm.org/doi/10.1145/3757707

https://link.springer.com/chapter/10.1007/978-3-031-93409-4_2

### ‘Fuzzy Area’

Draxler et al. (2024)의 *"AI Ghostwriter Effect"*

Kellogg (1996, 2008)의 *Writing as Cognitive Workload* 모델

Kellogg는 글쓰기를 *Planning, Translating, Reviewing* 세 작업이 *작업 기억을 두고 경쟁*한다고 모델링했고, 비전문 작가의 문제는 *세 작업이 동시에 작업 기억을 점유*하는 데서 발생한다고 보았습니다. Flect의 *단계적 분리*는 이 작업 기억 경쟁을 완화하는 처방으로 정당화됩니다.

https://arxiv.org/abs/2503.11915

# Project Specifications

## Framework


### 관련 연구 조사

**쓸 수 있는 선행 연구:**

- **Labov의 개인 서사 6요소 (Labov, 1972)** 
Abstract/Orientation/Complicating Action/Evaluation/Resolution/Coda
    - **독후감, 리뷰, 여행기**
    - "사건 기반 서술"에 최적화되어 있어, *구체적 사건이 없는 글*(예: 책의 전반적 인상에 대한 독후감, 추상적 논평)에는 적용이 어색할 수 있습니다.
- **Gibbs의 성찰 사이클 (Gibbs, 1988)**
(1) Description, (2) Feelings, (3) Evaluation, (4) Analysis, (5) Conclusion, (6) Action
    - **비평/평론 , 성찰 일지**
    - "학습"이라는 목적 의식을 전제하므로, *학습 의도가 없는 단순한 기록*(예: 여행 기록)에는 Action Plan이 부자연스럽습니다.

**더 찾아봐야 할 것:**

- Socratic Questioning을 AI 대화 시스템에 적용한 HCI 연구.
- 교수님이 추천한 **John Joon Young Chung**의 연구. 창의 협업에서의 질문 설계에 관한 인사이트가 있을 가능성이 높습니다.

### Q&A Session Goals

**Reflective Writing Framework**

- **Orientation**
글이 다루는 외적 사실: 누가, 언제, 어디서, 무엇을. 사용자 경험의 시공간적 닻.
External Anchor (외적 닻) — 글이 다루는 구체적 대상·사건·시공간. 예: "지난 주말 제주 여행"이라는 topic에 대해, *어디에 갔고, 누구와, 무엇을 했는지*. 이게 없으면 글이 추상적 일반론이 됩니다.
키 아이디어 (bullet point로 나열된, ”글을 쓰고 싶다“라는 생각이 든 원인이 된 파편화된 아이디어들)
- **Emotional Response**
외적 사건에 대한 사용자의 감정적 반응. Hwang et al.의 *internal states* 개념과 정확히 부합.
Internal Response (내적 반응) — 그 외적 사건에 대해 사용자가 어떻게 반응했는지. 감정·생각·놀라움·실망 등. 이게 없으면 *진정성*이 사라집니다.
- **Outcome** ****&** ****Evaluation**
경험이 결국 어떻게 끝났는지, 사용자가 도달한 결론. 경험 전체에 분산된 사용자의 *"so what"* 응답. 
경험의 의미 부여, 무엇이 잘되었고 무엇이 안 되었는지의 판단.
- **Take-away**
현재까지 이어지는 의미, 궁극적으로 말하고자 하는 내용
Stance / Disposition ****(관점적 입장) — 글 전체에서 사용자가 취하는 태도. 긍정적인지 비판적인지, 분석적인지 감상적인지. 이게 없으면 글의 어조가 흔들립니다.

*글의 길이가 짧게 설정되거나, 명확한 경험이 없는 글들에서는 Outcome & Evaluation과 Take-away는 통합

#### 가중치 조절

| 요소 | 독후감·리뷰·여행기 | 비평 | 성찰 일지 |
| --- | --- | --- | --- |
| Orientation | ●●● 강함 | ●●○ 중간 | ●●● 강함 |
| Feelings | ●●● 강함 | ●○○ 약함 | ●●● 강함 |
| Resolution + Evaluation | ●●○ 중간 | ●●● 매우 강함 | ●●● 매우 강함 |
| Take-away | ●●○ 중간 | ●●● 강함 | ●●● 매우 강함 |
| **+ 보완 요소** | (없음) | **Criteria, Evidence** | **Action Plan** |

**참고**: 가중치를 조절할 때는 **"최종 글에서의 비중"과 "Q&A 인출에서의 비중"을 분리해서 고려**하는 것을 권장

성찰 일지의 Q&A에서는 Feelings를 *깊게 묻되*, 최종 outline에서는 그것이 직접 표현되지 않고 *Take-away의 깊이를 결정하는 재료로* 활용되는 구조입니다.

## Contributions

비전문가 일반인이 글을 쓸 때, AI와 도움을 어느정도 받아야 개인의 목소리가 보존됨과 동시에 퀄리티가 높은 글을 쓸 수 있는가? (Balance of AI Intervention)

개인의 경험을 자연스럽게 끌어내는 AI의 피드백을 통해 글의 아이디어를 구조화한다.

AI가 도와주는 편리한 글쓰기 경험을 통해, 개인의 장기적 글쓰기 능력 향상과 개인적 글쓰기의 습관화를 도모한다.

# Research Process

**Brainstorming** - topic, scope 정하기

**Literature Review** - 내 시스템은 어떻게 차별화를 할까? 어떠한 논문을 근거로 시스템을 만들까?

**Formative Study** - LLM Probing Study, *Previous Systems Review(안함)*

**System Pipeline Construction** - 어떠한 기능들을 어떠한 기술 스택을 사용하여 포함시킬지

**System Implementation** 

**Evaluative Study** - User Study, 이 시스템 써 보니 어때?

# Formative Design Study

**LLM Probing Study**

specifications in: `LLM Probing Study.md`

# System Pipeline

Structured Input (최소 개인화 수집 + AI 개입 정도 산출)
→ Q&A Session (AI가 4요소 기반 질문을 던지고, 작가가 답하며 아이디어 인출)
→ Outline Composition (수집한 답변을 재료 카드로 구조화 → 드래그로 글쓰기 순서 구성)
→ Writing Phase (Suggest·Fix로 AI 최소 개입, TipTap 에디터)
→ 인간의 최종 선택 거쳐 글 완성

**MVP 범위**: 독후감(book-report) 전용으로 완결 검증. 다른 장르(비평·리뷰·여행기)도 선택은 가능하나 파이프라인 완결성은 독후감만 보장.

## Structured Input (Getting Started)

시작 전 명확한 비전 설정 (Hwang et al.)
AI가 글의 방향성에 크게 개입하지 않음
답변은 구조화하여 이후 단계 LLM 프롬프트의 맥락으로 사용
모든 답변 자동 저장 (zustand persist / localStorage), 뒤로가기(← 키) 지원

### 주요 질문 (5개, 순차 진행)

- **글의 종류** (비평/평론 · 독후감 · 리뷰 · 여행기) — `genre`
- **글의 주제/소재**를 한 문장으로 (자유 입력, 최대 200자) — `topicSentence`
- **쓸 내용이 머릿속에 얼마나 정리되어 있나요?** (5단계: 거의 없음 → 거의 다 있음) — `ideaReadiness`
- **최근 1년간 글 작성 빈도** (거의 매일 → 거의 안 씀) — `writingFrequency`
- **AI 개입 희망도** (매우 낮음 → 매우 높음, 슬라이더) — `userInterventionWant`

### 선택 질문 (5개, ”더 많은 정보를 주실 건가요?” 게이트 이후 활성화)

- **예상 독자** (나 자신 / 가까운 사람 / 같은 관심사 / 대중 / 미정) — `audience`
- **공유 의향** (나 자신 / 가까운 사람 / 공개 / 미정) — `sharing`
- **업로드 위치** (블로그 / 커뮤니티 / 공식 사이트 / 리뷰 사이트 / 전문 매체 / 미정 / 공유 안 함) — `venue`
- **글의 어조** (따뜻함 / 성찰적 / 비판적 / 유머러스 / 미정) — `tone`
- **예상 길이** (짧게 / 보통 / 길게) — `expectedLength`

### Intervention Calibration (AI 개입 수준 산출)

- Q3 준비도(`ideaReadiness`) + Q4 빈도(`writingFrequency`) → `baseline_need` 계산 (도움이 더 필요할수록 높음)
- Q5 희망도(`userInterventionWant`) → calibration 보정값(-2 ~ +2)
- 둘을 합쳐 `final_intervention` (1~5단계) 산출, 1~5 범위로 clamp
- 순수 함수로 Q&A 마운트 시 1회 계산 (`lib/intervention.ts`), 세션 내 고정. 입력 누락 시 fallback 2단계.
- 산출된 단계가 Q&A의 즉각 구체화 발동 기준(followupThreshold)과 4요소 종료 임계값(completionThreshold)을 결정

### Structured Input Goals

- 사용자에 대한 기본 지식을 얻어 맞춤형 writing assistance 제공 (personalization)
- 글에 적용되는 배경적 맥락 확보 → AI가 어떤 방식으로 도울지 결정
- 개입 수준을 정량화해 이후 단계의 질문 깊이·종료 시점에 반영

## Q&A Session

Ideation Scaffolding: 아이디어를 구조화하는 것을 AI가 도움
Socratic Questions: 외적 사실(언제·어디서·무엇)뿐 아니라 내적 상태(느낌·생각·동기)를 끄집어냄
4요소 프레임워크(외적 사실 → 감정·반응 → 평가 → 깨달음·여운)를 고정 순서로 순차 진행
친구와 대화하듯 대화형, 정답 없음을 강조
(인지적 부담 방지: AI-Framed Questioning과 Causal Explanation의 밸런스 — Danry et al., 2023)

### 주요 기능

- **4요소 상태머신 (클라이언트 소유)**: orientation → feelings → evaluation → takeaway 순서를 클라이언트가 관리해 LLM에 매 턴 주입. LLM이 이전 요소로 회귀하거나 순서를 흐트러뜨리지 못하게 고정. 사용자가 명시적으로 건너뛰면 다음 미완료 요소로 이동.
- **개입 수준 주입**: `final_intervention`에 따라 즉각 구체화 발동 빈도·요소별 종료 임계값을 system prompt에 주입.
- **책 컨텍스트 주입 (독후감 한정)**: 주제 문장으로 네이버 책 검색 API 조회 → 제목·저자·출판사·소개를 LLM 맥락으로 1회 주입. 검색 실패 시 맥락 없이 정상 진행(graceful degradation). 책 줄거리를 사용자에게 직접 설명하지는 않음.

### 부속 기능

- **초안 사이드 패널 (오른쪽 누적)**: 4요소 완성도 게이지 + 지금까지의 답변을 누적 표시 → 백지 공포 완화 + 자기 답변 객관화.
- **4요소 완성도 게이지**: LLM이 매 턴 각 요소를 0–100으로 평가. 클라이언트에서 *최댓값 이하로 떨어지지 않게 보정*(역행 방지), completionThreshold 기준 정규화. AI의 "충분함" 판단을 사용자에게 투명하게 공개.
- **현재 질문 요소 하이라이트**: 이번 질문이 겨냥하는 요소를 한글 라벨로 표시 (영어 4요소 용어는 비노출).
- **답변 한 줄 요약**: 사이드 패널 표시용으로 답변을 별도 LLM 호출로 압축 (실패 시 원문 그대로). main/followup 답변만 요약 대상.
- **스킵 유도 Tip**: 25초간 입력 활동이 없으면 "'잘 모르겠어'라고 답해도 돼요" 안내 노출 (질문당 1회, 하드코딩). 막막한 질문에 갇히는 것 방지. "잘 모르겠어" 답변은 기존 skip 로직으로 처리.
- **Ctrl+Z 복원**: controlled textarea라 깨진 기본 undo 대신 입력 히스토리 스택으로 직전 텍스트 복원 (입력창 한정).
- **세션 로그 / 임포트**: 매 턴 JSON 로그 저장, 로그 파일 업로드로 세션 복구.
- thinking indicator, 텍스트 스트리밍 reveal, 뒤로가기 확인 모달

## Outline Composition

각 문단을 정해주기보다, Q&A 답변을 **재료 카드**로 구조화하고 사용자가 **글쓰기 순서를 직접 구성**하게 함
Fuzzy area(수사 공간) 해결: 텍스트 생성 부담 없이 구조적 사고를 간접 지원

### 편향 최소화 설계

- outline을 직접 짜 주면 강한 편향이 생김 → 순서 없는 재료 카드 풀로 제시
- 카드의 순서가 없는 것이 포인트 (순서가 있으면 과도한 편향)
- Outline의 양면성: *제약*으로 작용해 편향을 만들지만, *해방*으로 작용해 빈 페이지에서 시작할 자신감을 줌
- 사용자가 드래그앤드롭으로 직접 순서를 만드는 구조 (해방 쪽으로 설계)

### 재료 카드

- Q&A 답변을 정리·통합해 카드 생성 (4~16개). 4요소 각각 최소 1개씩(`sourceElement`), 요소 이름은 직접 노출하지 않음.
- "정리"는 *군더더기 제거*, "통합"은 *같은 주제 묶기*에 한정. 자체 재해석 금지 (prompt).
- 두 칼럼 레이아웃: **재료 카드 풀**(순서 없는 모음) ↔ **글쓰기 순서**(위에서부터 쓸 순서)
- 카드 편집(click & type), 삭제, 추가 가능
- 드래그앤드롭(dnd-kit)으로 풀 ↔ 순서 이동, 순서 내 재배열
- 순서에서 뺀 카드는 삭제가 아니라 풀로 복귀
- 완성한 순서를 outline으로 저장 → Writing Phase로 전달

## Writing Phase

글쓰기 단계. 글쓰기 스타일을 보존하되 AI는 최소 개입.
TipTap 에디터(StarterKit) 기반, draft 자동 저장 (writingStore persist)
(주 contribution 아님)

### Suggest (다음 문장 제안)

글의 흐름이 끊길 즈음 AI suggestion으로 흐름 유지 (CoAuthor 스타일)
“AI suggestions might point to novel directions or ideas that writers would not have conceived of by themselves … offer ‘jumping points’ that allow writers to transition from one idea to another” (Hwang et al.)

- **Tab 키** 또는 우클릭 → 다음에 이어질 문장 3개 제안
- 맥락: 장르 · 주제 · 아웃라인 요약 · 최근 500자
- 3개는 서로 다른 방향, 사용자 문체 유지, 이미 다룬 내용 반복 금지
- 선택 시 커서 위치에 삽입, 타이핑하면 패널 닫힘

### Fix (문법·표현 교정)

- 텍스트 선택 후 우클릭 → 선택 영역의 문법·맞춤법·어색한 표현 교정
- diff 미리보기(원문 ↔ 교정본) → 적용 / 취소
- 내용(사실·의견·감정·논지)은 절대 불변, 문체·어조 유지
- 표현만 다듬기 (단어/어순 재구성은 하지 않음)

### 부속 기능

- **왼쪽 사이드바**: 아웃라인 카드를 글쓰기 순서대로 표시 (접기/펼치기)
- **오른쪽 사이드바 (Q&A 답변 복사)**: Q&A 질문-답변 페어를 표시하고 답변별 복사 버튼 제공 → 사용자가 '같은 말을 또 반복해서 적어야 하는' 부담 제거 (사용자 편의성 고려)
- **AI 상호작용 로깅**: suggest/fix의 수락·거절·선택 인덱스 기록 (연구용 데이터)
- 우클릭 컨텍스트 메뉴: 선택 영역 유무에 따라 Fix / Suggest 자동 분기

# User Study

## Study Design

The user study employs an in-depth semi-structured interview with a hands-on system evaluation session, adapted from the methodology used by Hwang et al. [1]

The format is designed to capture both situated user behavior during system use and reflective insights elicited through targeted questioning before and after the writing experience. Following recommendations from the course instructor, the study prioritizes depth of inquiry over participant volume, recruiting a small number of participants (N = 3–5) for in-depth qualitative analysis rather than a large-scale quantitative comparison.

## Participants

- 3-5 participants
- Korean university undergraduate students
- Instagram open-recruitment 
Online community for university students (Everytime)
- Participants will be screened to ensure they meet the following criteria:
    1. self-identified as a non-expert writer
    2. whether they do not have a writing background (to exclude experts)
    3. prior interest in writing reflective content (e.g., reviews, travelogues, retrospectives)
    4. at least minimal prior experience using LLM-based tools for any form of writing

specifications are at `User Study.md`. 

## Check

- Prototype Scope
    - MVP!
    - 여건이 안 되면, Editing Phase 빼자
    - UX 고려한 설계 한 상태로 User study 들어가기
- User Study 관련
    - analysis 오래 걸릴 것이기 때문에 + user study가 project 성적에 꽤나 많이 들어갈 것이기 때문에, 미리 하기!!
        - 최소 5/23 아카라카 전후로는 시작
        - 마지노선 5/30 인종설 발표 직후
    - 3~5명 조사, 인당 1시간30분

## Milestones

- **Week 7 (14–20 Apr)**: Project brainstorming, scope definition, related works research
- **Week 8 (21–27 Apr)**: Project planning & proposal, re-planning based on feedback
- **Week 9 (28 Apr–4 May)**: AI interaction design & prompt engineering
- **Week 10 (5–11 May)**: Ideation Phase construction
- **Week 11 (12–18 May)**: Simple prototype creation
- **Week 12 (19–25 May)**: Internal testing & final prototype refinement, User Study
- **Week 13–14 (26 May–8 Jun)**: User study, analysis, and final report writing
- **Week 15 (9–15 Jun)**: Final presentation

## Key Changes (for Claude.ai)

- ‘논평’ 제거 (경험과 감정보다는 객관적 사실관계가 중요한 글이라 우리 프로젝트 범위에서 벗어남)