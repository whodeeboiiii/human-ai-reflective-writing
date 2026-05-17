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
- 엄청 긴 글 (수필)과, 짧은 글 (댓글리뷰) 존재
- 글쓰기에 관심 없는 사람들은 애초에 안 씀
- 진정성은 관점이나 인사이트에서 나옴.
- AI는 구조화에 도움만 주고, 결론(메세지)는 사용자가 스스로 도달해야 함.
- 독자를 의식하기 때문에 "AI가 더 잘 썼다"는 느낌이 들면 수용 유혹이 강해짐.

개인의 외적, 내적 경험을 글로 담을 수 있는 방법

사실에 기반하되, 주관성이 중요한 글

자신의 의견을 표현하는 논리적 구조가 중요한 글

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

### Community 기능

에타에서 “잘 적은 개인의 생각에 대한 글”을 보면 기분이 좋아진다. 생각을 많이 하게 된다 (food for thought).

완전 익명으로, 개인의 지식을 공유할 수 있는 플랫폼이 있다면 얼마나 좋을까? 

내가 쓴 좋은 글이 타인에게 긍정적인 영향을 준다면 어떨까? 내적 동기가 올라가고, 글 쓰기가 재밌어지는 이유 중 하나가 될 수 있다.

*구현할 시간 없다면 future work에*

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

# Background

## Previous Systems

### Writing Assistant

Apple Intelligence Writing Tool

Google Gemini Writing Assistant

Grammarly

## Related Works

### It was 80% me, 20% AI

https://dl.acm.org/doi/abs/10.1145/3711020

“While writers overall desired control over their writing experiences, we noticed the degree of control needed might also differ from stage to stage.” (Hwang et al., 2025, p. 29)

‘Fuzzy Area’, ‘Content Gatekeeping’의 정의

### CoAuthor

https://dl.acm.org/doi/abs/10.1145/3491102.3502030

### 글쓰기의 과정

Flower & Hayes (1981)의 “인지적 작문 프로세스 모델”

- **계획하기 (Planning):** 목표를 설정하고, 기억 속에서 아이디어를 생성하며, 이를 조직화하는 단계입니다.
- **변환하기 (Translating):** 구상한 아이디어를 실제 언어(문장)로 바꾸는 과정입니다.
- **검토하기 (Reviewing):** 쓴 글을 평가하고 수정(Revision)하는 단계입니다.

### “Narrative Arc”

이거 논문 찾아보기! 

narrative arc가 다양한 글쓰기의 종류에 어떻게 적용되는지?

이거 AI 생성과도 관련이 있다는데? 

### Similar Works

DiaryPlay

John Joon Young Chung ‘s works

### Claude ‘Best Practice’

**For writing assistance**

- Outline requirements, target audience, and key points comprehensively.
- Send entire texts for editing in one message rather than breaking them up.

# Project Specifications

## Framework

### 창의적 글쓰기의 5요소 (사용 미확정)

주체

맥락

핵심 사건

내적 반응

메시지

- **5요소 프레임워크에 대한 비판적 검토**
    
    Gemini의 추론은 출처 연계가 깔끔합니다. 하지만 3가지 문제를 발견했습니다:
    
    문제 1 — 용어 불일치: 주제(Topic) vs 주체(Persona/Self)
    아웃라인 예시(라이트하우스, 4월 16일 일기)는 **“주제”**로 기록되어 있습니다. 그러나 Gemini 추론은 Lee et al.의 character 개념을 근거로 **“주체(Self)”**로 번역했습니다. 이 둘은 개념적으로 다릅니다:
    •	“주제”는 글이 ‘무엇에 관한 것인가’
    •	“주체”는 ‘누가 경험하는가 / 누구의 시점인가’
    개인적 기록에서는 암묵적으로 주체 = 작가 본인이지만, 독후감·평론·여행기에서는 주체(시점의 주인)와 주제(글이 다루는 대상)가 분리될 수 있습니다. 이 구분을 명시화할지, 아니면 ‘주체’로 통일할지 결정이 필요합니다.
    
    문제 2 — 서사 구조의 과도한 강제
    Lee et al.의 character/plot 프레임은 fiction에서 개발된 것입니다. 재후님 스코프의 글(특히 리뷰, 독후감, TIL식 회고)은 뚜렷한 사건(Trigger)이 없는 경우가 흔합니다. “오늘 하루 전반에 대한 잔잔한 소회”나 “책에 대한 점진적 감상의 축적”에는 단일 Key Event가 없을 수도 있습니다. 5요소를 모든 글에 필수로 요구하면 일부 장르에서 프레임이 어색해집니다.
    
    문제 3 — 병렬 프레임워크와의 관계 미검토
    유사 구조를 가진 기존 프레임워크들이 있습니다:
    •	저널리즘의 5W1H (Who/What/When/Where/Why/How)
    •	Kenneth Burke의 Dramatistic Pentad (Agent/Act/Scene/Agency/Purpose)
    •	Labov의 개인 서사 6요소 (Abstract/Orientation/Complicating Action/Evaluation/Resolution/Coda) — 개인 일화(personal narrative) 분석에 쓰이는 사회언어학 프레임
    
    이 중 Labov의 서사 구조가 재후님 스코프와 상당히 잘 맞습니다(특히 Evaluation이 ‘내적 반응’에, Coda가 ‘메시지’에 대응). Gemini의 5요소가 Labov를 독립적으로 재발견한 측면이 있으므로, 학술적 근거 보강을 위해 Labov를 레퍼런스로 삼는 것을 검토해 볼 가치가 있습니다.
    
    제 잠정 권고(수용 여부는 재후님 판단): 5요소를 “모든 글에 적용되는 고정 체크리스트”가 아니라, Structured Input에서 수집한 글 종류에 따라 요소의 가중치가 달라지는 모듈형 프레임으로 재개념화. 예컨대 일기는 5요소 모두 활성화, 리뷰는 Trigger 약화 + Message 강화, 여행기는 Context 강화 등. 이는 “Ideation을 얼마나 진행할지”를 Structured Input이 결정한다는 재후님의 기존 설계와도 구조적으로 정합적입니다.
    

## Contributions

비전문가 일반인이 글을 쓸 때, AI와 도움을 어느정도 받아야 개인의 목소리가 보존됨과 동시에 퀄리티가 높은 글을 쓸 수 있는가? (Balance of AI Intervention)

개인의 경험을 자연스럽게 끌어내는 AI의 피드백을 통해 글의 아이디어를 구조화한다.

AI가 도와주는 편리한 글쓰기 경험을 통해, 개인의 장기적 글쓰기 능력 향상과 개인적 글쓰기의 습관화를 도모한다.

+) 커뮤니티 공유를 통해 개인의 지식을 상대에게 보여준다는 행위가 내적 동기를 어떻게 부여하는지 살펴본다.

## Stuff to Consider

- 이거 2달만에 끝내야 한다 → 진짜 최소한의 기능만 넣어 보자!
    - 특히 ideation phase가 너무 복잡해지면 프로젝트가 산으로 갈 수도 있다
    - writing phase는 우리 연구의 주요 contribution 아니니까, 현존하는 시스템 사용
    - 수틀리면 editing phase는 적당히…
- 다른 시스템과의 차별점이 있어야 되긴 하는데, 솔직히 기능이 겹쳐도 큰 상관 없음 (스코프만 잘 정하면!!)
    - 기능이 겹치면 limitations & future work로 넘겨서 적어놓기
- 생각하는 기술이 구현 가능한지 확실하게 확인!! (brainstorming 단계부터 계속 생각해보기)

## Challenges

- Personalization
    - 얼마나, 어떻게 효과적으로 할 것인가?
        - 글을 in-context learning → 애초에 글을 많이 안 쓰는 사람들에게는 비효율적
        - 아마 안하지 않을까 (이번 프로젝트의 scope 아님)
    - 최소한의 ‘personalization’을 위해 Structured Input 제안
- 인터페이스?
    - 문서 편집기 프로그램(메모장 앱)과 같이 글 작성/보관 인터페이스 (notebooklm 인터페이스 참고)
    - 커뮤니티
- Ideation Phase Design
    - 아이디어를 추출하는 ‘적절한’ 질문?
        - open-ended question: 너무 많은 인지적 부담 될수도
        - direct question: 사용자가 AI의 질문에 끌려다닐수도 (bias 생기고, agency 감소)
    - 경험을 어떻게 글로 변환할 것인가?
        - ‘경험 나열’과 ‘느낀점’의 적절한 합의점
    - 글쓰기를 장려하는 방법?
        - 사람들은 생각보다 자신의 경험을 글로 담고 싶은 욕망이 클 것이다. 이 모호한 부분을 어떻게 해소하지?
- ‘Appropriate’ AI intervention
    - AI-assisted writing에서 AI가 얼마나 적절히 개입해야 할지 관련 연구가 있을까? 찾아보자
    - 없다면 실험으로 찾아내야 할까?
    - 아니면 휴리스틱으로 정할까?
    - 실험을 하고 싶다면, Future work 지점으로 잡을 수 있음 (2달안에는 못해)

### For Ideation Phase

- Ideation 단계에 AI가 어떻게 (글쓰기 아이디어를 내는 데에 미숙한) 일반인 사용자에게 아이디어 구조를 위한 질문을 할 수 있을지. 
'Fuzzy Area'에 대해서, 일반인 사용자가 이것을 어떻게 구체화시키지?
- 창의적인 글을 쓸 때 아이디어를 구조화하는 정석적인 방법이 있는지
    - 단순히 서론-본론-결론 말고, 글쓰기 아이디어에서 완전한 글을 쓰기 위해 필수적으로 생각해야 하는 요소들이 있는지
    - '글쓰기 아이디어의 n요소' 이런 논문 없나?
    - e-asTTle 작문 루브릭
        - **아이디어(Ideas):** 주제에 대한 생각의 질, 정교함, 복잡성 및 독창성.
        - **구조 및 언어(Structure and Language):** 글의 목적에 부합하는 장르적 특징과 언어적 장치 사용.
        - **조직(Organisation):** 문단 구성 및 아이디어 간의 논리적 연결.
        - **어휘(Vocabulary):** 단어 선택의 정확성과 다양성.
        - **문장 구조(Sentence Structure):** 문장의 유연성과 문법적 정확성.
        - **구두점(Punctuation):** 문장 부호의 적절한 사용.
        - **철자(Spelling):** 단어 철자의 정확도.
- 아이디어를 구조화하는 것 자체가 일반인 사용자에게는 너무 부담스럽지 않을까? ideation을 AI가 어느 단계까지 진행해야 할까? 
(ideation 진행 정도는 structured input 단계에서 "사용자의 전문성" 및 "글의 중요성(얼마나 잘 써야 하는 글인지, 아니면 대충 써도 되는지)"에서 알아볼 예정)

# Research Process

**Brainstorming** - topic, scope 정하기

**Previous** **Works 조사** - 내 시스템은 어떻게 차별화를 할까? 어떠한 논문을 근거로 시스템을 만들까?

***~~Pilot Study** - 타겟층 (novice writer들) 조사 → 안함~~*

**System Pipeline 구체화** - 어떠한 기능들을 어떠한 기술 스택을 사용하여 포함시킬지

**System 구현** 

**User Study** - 내 꺼 써보니 글을 쓰고 싶어?

# System Pipeline

Structured Input (minimal personalization 진행, AI 개입 정도 조사)
→ Q&A Session (AI가 아이디어를 위한 질문 던지고, 작가가 답변하며 아이디어 키워가기) 
→ Outline Composition (작성한 아이디어를 AI가 자동으로 구조화해서 전반적인 글 진행 흐름 한문장씩 짜 주기) 
→ Writing Phase 
→ Editing Phase (AI가 문법&문체 고치고, 피드백/태클 걸기)
→ 인간의 최종 선택 거쳐 글 완성

## Structured Input (Getting Started)

시작 전 명확한 비전 설정 (Hwang et al.)
AI가 글의 방향성에 크게 개입하지 않음

### Structured Input Questions

- **글의 종류**는 무엇인가요? (비평/평론, 독후감, 리뷰, 여행기, 성찰 일지)
- **글의 주제나 소재**를 한 문장으로 적어 주세요. (OPEN QUESTION)
- **머릿속에 생각해 놓은 내용**이 얼마나 되나요? (없음 / 조금 있음 / 꽤 있음 / 거의 다 있고 정리만 필요)
- 글의 예상 독자는 누구인가요? (나/친구/대중/학계/…)
    - 공유하고 싶은 글인가요, 아니면 나 자신에게 쓰는 글인가요?
    - 이 글을 어디에 업로드할 예정인가요? (개인 블로그 / 커뮤니티 / 공식적 웹사이트 / 리뷰 사이트 / 전문 매체 / 아직 모름 / 공유 안 함)
- 원하는 글의 어조는 무엇인가요? (따뜻하고 개인적 / 성찰적이고 진지 / 날카롭고 비판적 / 유머러스 / 잘 모르겠음)
- **작가의 글쓰기 경험/전문성**은 얼마나 되나요?
    - 당신은 누구인가요? (미성년자/학생/친구/전문가/…)
- **글의 중요성**은 얼마나 되나요? (얼마나 잘 써야 하는 글인지, 아니면 대충 써도 되는지)
→ Ideation을 얼마나 진행해야 하는지 체크
    - (작가는 AI 피드백이 얼마나 강했으면 좋겠나요? (비판적/미온적/…))
- 글의 예상 길이는 어떻게 되나요? (짧게 (300자 이내, 댓글 형식) / 보통 (300자~1000자, 몇 문단) / 길게 (1000자 이상, 에세이))

시각화 (슬라이더, 그래프)

이 단계가 minimum ‘personalization’이 될 수도

‘더 자세히 설정하기’ (볼드체 안 되어 있는 카테고리들 설정하기)

### Structured Input Goals

- 사용자에 대한 기본 지식을 얻어 맞춤형 writing assistance를 제공 (personalization)
- 해당 글에 적용되는 배경적 맥락을 확보하여 글쓰기를 어떠한 방식으로 도와줄지 확인
- 해당 글에 적용되는 구체적인 사용자 요청을 받아들여 세밀한 조언 가능

## Q&A Session

Ideation Scaffolding: 아이디어를 구조화하는 것을 AI가 도움 

**Structured Input에서 얻은 결과에 따른 구조화된 질문 + (필요시) LLM 보완 질문** 

Structured Input → 정해진 Q&A 템플릿 (장르별 고정) → LLM이 답변 분석 → 부족한 부분이 있으면 추가 질문 1~2개 생성 → Outline Composition

사용자가 겪은 외적 사실(언제, 어디서, 무엇을)뿐만 아니라, 내적 상태(느낌, 생각, 동기)를 끄집어낼 수 있도록 질문을 던집니다.

Socratic Questions?

아이디어의 n요소 충족시키도록 사용자 답변 추출 → 이런 연구 있나? 

### 장점

- 질문 품질 & 일관성 보장, 기본적인 정보는 얻으므로 리스크 낮음
- 재현성 (User Study에서 같은 장르의 사용자들을 비교할 수 있는 baseline 생김)
- LLM에 끌려다닐 리스크 (contamination) 낮음

### 고려사항

- 고정 질문과 사용자 맥락이 맞아야 한다!
- LLM 보완 질문용 Prompt Engineering

### 관련 조사 연구

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

#### Previous Goals (Deprecated)

- 글의 목적
- 키 아이디어 (bullet point로 나열된, ”글을 쓰고 싶다“라는 생각이 든 원인이 된 파편화된 아이디어들)
- 글 전체의 논리 흐름, 궁극적으로 말하고자 하는 내용 or (독후감, 여행기, 리뷰에서는 적용 안될 수도)
- **External Anchor (외적 닻)** — 글이 다루는 구체적 대상·사건·시공간. 예: "지난 주말 제주 여행"이라는 topic에 대해, *어디에 갔고, 누구와, 무엇을 했는지*. 이게 없으면 글이 추상적 일반론이 됩니다.
- **Internal Response (내적 반응)** — 그 외적 사건에 대해 사용자가 어떻게 반응했는지. 감정·생각·놀라움·실망 등. 이게 없으면 *진정성*이 사라집니다.
- **Salient Details (인상에 남은 디테일들)** — 사용자가 기억하는 구체적 장면·문장·순간. 최소 2~3개. 이게 없으면 글이 추상적이 되어 독자가 공감할 단서가 없어집니다.
- **Stance / Disposition** (관점적 입장) — 글 전체에서 사용자가 취하는 태도. 긍정적인지 비판적인지, 분석적인지 감상적인지. 이게 없으면 글의 어조가 흔들립니다.
- **Orientation** *(Labov의 Orientation = Gibbs의 Description)*
- **Feelings / Emotional Response** *(Gibbs의 Feelings)*
- **Resolution / Outcome** *(Labov의 Resolution) &* **Evaluation** *(Labov와 Gibbs 모두에서 핵심)*
- **Take-away / Coda**

## Outline Composition

각 문단마다 뭘 쓸지 알려주기 or 서론 본론 결론 뭘 쓸지 알려주기 보다는…
**전반적인 글 진행 흐름만 한문장씩 짜 주기**

Fuzzy area 해결 

## Writing Phase

글쓰기 단계

글쓰기 스타일을 보존하되, 서체 교정 정도만

(주 contribution 아님 - 이미 있는 시스템 쓸까?)

### Suggest

글의 흐름 끊길 때 즈음에 AI suggestion으로 흐름 유지시키기

“AI suggestions might point to novel directions or ideas that writers would not have conceived of by themselves, and the tool might also offer “jumping points” that allow writers to transition from one idea to another” (Hwang et al.)

Text Suggestion

Next-sentence Suggestion

CoAuthor (탭 누르면 LLM이 context 보고 다음 문장 추천)

### Fix

Grammar Fix

문장이 담는 내용은 대부분 유지

강도 선택 가능 (단어 구조는 유지하고 어색한 표현만 바꾸냐, 아니면 단어 구조/어순/단어선택을 바꾸냐)

### Formalize (synonym)

target audience에 따라 달라지는 ‘딱딱함’의 정도

전문성의 정도

Style Transformation

## Editing Phase

AI의 도움을 받아 수정하되, 피드백을 받아들일지 말지는 인간의 의견에 따름 (Content Scaffolding)

‘비판적인 AI’가, 글의 내용에 집중하여 태클을 걺, 인간은 이를 수정할지 말지 정함

- 문법, 어색한 문장 수정 제안 (내용 보존하면서)
- Ideation Phase의 idea와, 실제 적힌 내용 사이의 간극 찾기
- 논리 흐름 살펴보고, 흐름에 벗어나는 내용 태클 걸기
- 논리 흐름을 보강할 수 있는 추가 내용 제안 (”이런 내용은 어떨까요?” 라고 아이디어만 제시하고, 직접 적는 것은 작가 담당)

글을 실시간으로 봐 주는 친구처럼 사용

AI assistance need not be narrowly focused on the writing process and output per se. Instead, designers and developers of these tools could target the growth of writers as their ultimate design goal. (Hwang et al.)

#### 주목해야 할 점

- 너무 비판적이면 사용자가 짜증낸다! (UX 해침)
    - 피드백의 강도는 ‘structured input’을 통해 결정
- 매우 캐주얼한 글쓰기 (나 혼자 보는, 일기와 같은 글)에서는 아예 생략 가능할수도?

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

### Actual Participants

- 권나경 (건축공학과, 5학년, 글쓰기 관심도 ↑)
- 오현근 (국어국문학과, 4학년, 글쓰기 관심도 ↑)
- ??? (컴퓨터과학과, 4학년, 글쓰기 관심도 ↓)
- 김영서 (컴퓨터과학과, 4학년, 글쓰기 관심도 ↑)
- 하주혜 (정보대학원 UX트랙, 박사 3학년, 글쓰기 관심도 ?) (가능?)

### Compensation

1. 카카오페이 10000원 송금
2. 안재후와의 식사권 1장

## Procedure

Each session will follow a three-phase structure conducted in a single sitting of approximately 60–75 minutes.

### Phase 1: Pre-interview (15 minutes)

The pre-interview establishes baseline context regarding… 

- the participant's writing skill background
- prior experience with AI-assisted writing (& tools they used)
- current perception of authenticity and agency in human-AI co-writing

Participants will be asked to describe a recent reflective writing attempt (successful or abandoned) to surface their existing pain points. Key questions include:

- What types of personal or reflective writing do you typically engage in, and how often?
- What barriers, if any, prevent you from writing more frequently?
- What is your prior experience using AI tools for writing tasks?
- How would you describe authenticity in your own writing?

### Phase 2: System Evaluation Session (30–40 minutes)

Participants will be introduced to the **Flect** prototype and asked to complete a full writing session using the entire system. The session will be screen-recorded with participant consent.

Participants will be encouraged to write about a topic of their own choosing within the supported genres (commentary, critique, book review, review, travelogue, or reflective journal) to ensure ecological validity.

A **think-aloud protocol** will be employed throughout the session: participants will be asked to verbalize their thoughts, decisions, and reactions as they interact with the system. 

The researcher will observe without intervention, taking notes on… 

- interaction patterns
- moments of hesitation or confusion
- instances of accepting or rejecting AI suggestions
- verbal expressions of satisfaction or frustration

### Phase 3: Post-interview (20 minutes)

Immediately following the system evaluation session, a semi-structured interview will be conducted to elicit reflective accounts of the experience.

The interview will probe the participant's perception of the system across four primary dimensions, adapted from prior literature:

- **Perceived Agency**: To what extent did the participant feel they retained control over the writing process and creative decisions?
- **Perceived Authenticity**: Does the participant view the resulting text as genuinely their own work, and why?
- **Resolution of the Fuzzy Area**: Did the Ideation Phase meaningfully assist the participant in transforming abstract intentions into a concrete textual structure?
- **Intention to Reuse**: Would the participant use the system again for future reflective writing tasks, and under what conditions?

The post-interview will also surface design feedback regarding individual phases (Ideation, Writing, Editing) and identify specific moments where the system either succeeded or failed to support the participant's needs.

## Data Analysis

Interview transcripts will be analyzed through **thematic coding**, following the qualitative analysis approach commonly employed in HCI research. 

The first pass will produce open codes capturing emergent themes; 
the second pass will consolidate these into axial categories aligned with the four primary dimensions defined above. 

Behavioral data from the screen recordings (e.g., frequency of AI suggestion acceptance, time spent in each phase, points of system reset or restart) will be triangulated with interview findings to provide a richer account of the user experience.

## Limitations

- Small sample size (N = 2–3) limits the generalizability of findings
    - This study is therefore positioned as a **formative evaluation** intended to surface qualitative insights and identify areas for further investigation, rather than as a confirmatory user study.
    - A larger-scale evaluation with controlled comparison conditions (e.g., varying levels of AI intervention intensity, as suggested during the proposal feedback session) is reserved for future work.

# To Do

## To Do List

**System Implementation**

- 일단 뼈대부터 만들어 보기 w/ Claude Design
- 백엔드 구축 w/ Claude Code

**Ideation Stage**

- baseline 수립 위해서 직접 LLM에다가 글쓰기 아이디어 요청해 보기 써보기
- Q&A 방식 관련 프레임워크 수립
- 장르별 질문 구체화
- Outline 잡는 AI prompt engineering

**Writing Stage**

- 각 태스크 구현 방법
- 안되면 기존 시스템 중 사용할 것 조사

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