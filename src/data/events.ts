import type { Effect, GameEvent, MultStat } from "../core/types";

// 실제 사건 오마주 랜덤 이벤트. 민감한 사건은 research/03_events.md의 사용 금지 목록을 따른다.
const fx = (pairs: Partial<Record<MultStat, number>>): Effect[] =>
  Object.entries(pairs).map(([stat, mul]) => ({ stat: stat as MultStat, mul: mul as number }));

export const EVENTS: GameEvent[] = [
  {
    id: "winter1", name: "1차 AI 겨울", emoji: "❄️", minEra: 3, weight: 0, year: "1974", scripted: true,
    desc: "라이트힐 보고서가 'AI는 약속을 지키지 못했다'고 결론 내렸다. 연구비가 끊긴다. 이럴 때 새 모델을 출시해 체크포인트를 챙기는 것도 방법이다.",
    effects: fx({ reward: 0.5, demand: 0.6 }), duration: 150,
  },
  {
    id: "winter2", name: "2차 AI 겨울", emoji: "🌨️", minEra: 4, weight: 0, year: "1987", scripted: true,
    desc: "값싼 PC가 LISP 머신 시장을 무너뜨렸다. 전문가 시스템은 유지보수 지옥이 됐다. 다시 추운 겨울이다.",
    effects: fx({ reward: 0.5, demand: 0.6 }), duration: 150,
  },
  {
    id: "perceptrons_book", name: "『퍼셉트론』 출간", emoji: "📕", minEra: 2, maxEra: 3, weight: 2, year: "1969",
    desc: "민스키와 패퍼트가 단층 퍼셉트론은 XOR도 못 푼다고 증명했다. 신경망 연구가 얼어붙는다.",
    effects: fx({ rp: 0.5 }), duration: 60,
  },
  {
    id: "fifth_gen", name: "5세대 컴퓨터 프로젝트", emoji: "🗾", minEra: 3, maxEra: 3, weight: 2, year: "1982",
    desc: "일본이 10년짜리 국가 프로젝트를 발표했다. 위기감을 느낀 각국이 AI 예산을 늘린다!",
    effects: fx({ rp: 2 }), duration: 60,
  },
  {
    id: "netflix", name: "100만 달러 추천 대회", emoji: "🎬", minEra: 4, maxEra: 5, weight: 2, year: "2006",
    desc: "추천 정확도를 10% 올리면 상금 100만 달러! 참가하시겠습니까?",
    effects: [], duration: 0,
    choices: [
      { label: "참가한다", desc: "연구 점수 대량 획득", effects: [], duration: 0, rpSeconds: 120 },
      { label: "본업에 집중", desc: "60초간 답변 속도 +30%", effects: fx({ tps: 1.3 }), duration: 60 },
    ],
  },
  {
    id: "tay", name: "인터넷에서 배운 봇", emoji: "🐦", minEra: 5, maxEra: 6, weight: 2, year: "2016",
    desc: "사용자 트윗으로 실시간 학습하던 챗봇이 16시간 만에 문을 닫았다. 교훈: 아무 데이터나 먹이면 안 된다.",
    effects: fx({ demand: 0.7 }), duration: 45,
  },
  {
    id: "move37", name: "37수", emoji: "⚫", minEra: 5, maxEra: 6, weight: 2, year: "2016",
    desc: "인간이라면 두지 않았을 수. 해설진이 실수라 생각했지만 그것이 승부수였다. 전 세계가 AI에 주목한다!",
    effects: fx({ demand: 2 }), duration: 60,
  },
  {
    id: "gpt2_release", name: "너무 위험해서 공개 못 함", emoji: "🔒", minEra: 6, maxEra: 7, weight: 2, year: "2019",
    desc: "새 모델이 그럴듯한 가짜 뉴스를 너무 잘 쓴다. 바로 공개할까, 단계적으로 공개할까?",
    effects: [], duration: 0,
    choices: [
      { label: "전면 공개", desc: "90초간 유입 ×2, 헛소리 ×1.3", effects: fx({ demand: 2, hall: 1.3 }), duration: 90 },
      { label: "단계적 공개", desc: "90초간 헛소리 ×0.7, 연구 +50%", effects: fx({ hall: 0.7, rp: 1.5 }), duration: 90 },
    ],
  },
  {
    id: "million5days", name: "5일 만에 100만 명", emoji: "🚀", minEra: 7, maxEra: 7, weight: 3, year: "2022",
    desc: "\"연구 프리뷰\"라고 조용히 공개했는데 전 세계가 몰려왔다. 서버가 버틸 수 있을까?",
    effects: fx({ demand: 4, tps: 0.8 }), duration: 60,
  },
  {
    id: "weights_leak", name: "가중치 유출", emoji: "🦙", minEra: 7, maxEra: 8, weight: 2, year: "2023",
    desc: "연구자에게만 공개한 모델 가중치가 일주일 만에 인터넷에 퍼졌다. 오픈소스 생태계가 폭발한다.",
    effects: fx({ price: 0.7, cost: 0.85 }), duration: 90,
  },
  {
    id: "pause_letter", name: "거대 실험 중단 공개서한", emoji: "✉️", minEra: 7, maxEra: 8, weight: 2, year: "2023",
    desc: "수많은 연구자가 '6개월간 거대 AI 학습을 멈추자'는 서한에 서명했다. 어떻게 대응할까?",
    effects: [], duration: 0,
    choices: [
      { label: "안전 연구에 투자", desc: "120초간 헛소리 ×0.6", effects: fx({ hall: 0.6 }), duration: 120 },
      { label: "계속 달린다", desc: "60초간 답변 속도 ×1.5, 유입 ×0.8", effects: fx({ tps: 1.5, demand: 0.8 }), duration: 60 },
    ],
  },
  {
    id: "weekend", name: "5일간의 주말", emoji: "🎢", minEra: 7, maxEra: 8, weight: 2, year: "2023",
    desc: "금요일 오후, 이사회가 CEO를 해고했다. 주말 내내 대혼란. 그리고 5일 만에 복귀. 다들 무슨 일이 있었는지 아직도 정확히 모른다.",
    effects: fx({ rp: 0.5, demand: 1.5 }), duration: 75,
  },
  {
    id: "safety_summit", name: "AI 안전 정상회의", emoji: "🏛️", minEra: 7, weight: 2, year: "2023",
    desc: "각국 대표가 모여 프런티어 AI의 위험을 논의했다. 신뢰가 쌓인다.",
    effects: fx({ demand: 1.3, hall: 0.9 }), duration: 90,
  },
  {
    id: "ai_act", name: "AI 규제법 발효", emoji: "📜", minEra: 7, weight: 2, year: "2024",
    desc: "위험 기반 AI 규제법이 발효됐다. 준수 비용이 들지만, 기업 고객은 안심한다.",
    effects: fx({ cost: 1.2, reward: 1.3 }), duration: 120,
  },
  {
    id: "deepseek_shock", name: "고래 쇼크", emoji: "🐋", minEra: 8, weight: 3, year: "2025",
    desc: "어느 스타트업이 훨씬 적은 비용으로 최정상급 추론 모델을 공개했다. GPU 주가가 하루 만에 17% 폭락! 지금이 하드웨어를 살 기회?",
    effects: fx({ cost: 0.5, price: 0.7 }), duration: 60,
  },
  {
    id: "starportal", name: "스타포털 발표", emoji: "🌀", minEra: 8, weight: 2, year: "2025",
    desc: "5,000억 달러짜리 데이터센터 프로젝트가 발표됐다. 건설 업계가 들썩인다.",
    effects: fx({ power: 1.5 }), duration: 120,
  },
  {
    id: "gpus_melting", name: "GPU가 녹고 있다", emoji: "🎨", minEra: 8, weight: 3, year: "2025",
    desc: "모든 사람이 자기 사진을 애니메이션 화풍으로 바꾸기 시작했다. \"우리 GPU가 녹고 있어요.\"",
    effects: fx({ demand: 5, powerUse: 1.4 }), duration: 60,
  },
  {
    id: "vibe_coding", name: "바이브 코딩 열풍", emoji: "🎸", minEra: 8, weight: 2, year: "2025",
    desc: "\"코드는 잊고, 바이브에 몸을 맡겨라.\" 개발자 질문이 쏟아진다.",
    effects: fx({ demand: 2, reward: 1.2 }), duration: 90,
  },
  {
    id: "imo_gold", name: "올림피아드 금메달", emoji: "🏅", minEra: 8, weight: 1, year: "2025",
    desc: "AI가 수학 올림피아드에서 금메달 점수를 냈다. 연구자들이 몰려든다.",
    effects: [], duration: 0, rpSeconds: 90,
  },
  {
    id: "router_fail", name: "라우터 대참사", emoji: "🔀", minEra: 8, weight: 2, year: "2025",
    desc: "신모델 출시일, 자동 라우터가 고장 나서 모든 질문을 엉뚱한 모델로 보냈다. \"멍청해졌다\"는 원성이 자자하다.",
    effects: fx({ hall: 1.6, price: 1.3 }), duration: 45,
  },
  {
    id: "retired_return", name: "은퇴한 모델의 귀환", emoji: "🧓", minEra: 8, weight: 1, year: "2025",
    desc: "구형 모델을 은퇴시켰더니 \"내 친구를 돌려달라\"는 요청이 빗발쳤다. 결국 복귀! 팬들이 감동한다.",
    effects: fx({ demand: 1.5 }), duration: 60,
  },
  {
    id: "crawler_block", name: "크롤러 차단", emoji: "🛑", minEra: 8, weight: 2, year: "2025",
    desc: "웹의 상당 부분이 AI 크롤러를 기본 차단하고 '크롤링당 과금'을 시작했다. 데이터가 비싸진다.",
    effects: fx({ rp: 0.7 }), duration: 90,
  },
  {
    id: "talent_war", name: "인재 영입 전쟁", emoji: "💰", minEra: 8, weight: 2, year: "2025",
    desc: "빅테크가 연구자에게 아홉 자리 연봉을 제시한다. 우리 연구자를 지킬까?",
    effects: [], duration: 0,
    choices: [
      { label: "연봉 맞춰준다", desc: "현재 수익 60초분 지불, 120초간 연구 ×2", effects: fx({ rp: 2 }), duration: 120, incomeSeconds: -60 },
      { label: "비전으로 설득", desc: "90초간 연구 ×0.7", effects: fx({ rp: 0.7 }), duration: 90 },
    ],
  },
  {
    id: "mcp_foundation", name: "프로토콜 표준 기부", emoji: "🤝", minEra: 9, weight: 2, year: "2025",
    desc: "커넥터 프로토콜이 중립 재단에 기부됐다. 모두가 같은 표준을 쓴다.",
    effects: fx({ demand: 1.5, reward: 1.2 }), duration: 120,
  },
  {
    id: "matmul", name: "56년 만의 행렬곱", emoji: "🧩", minEra: 8, weight: 1, year: "2025",
    desc: "AI가 4×4 행렬곱을 곱셈 48번으로 하는 방법을 찾았다. 슈트라센 이후 56년 만의 개선!",
    effects: fx({ tps: 1.5 }), duration: 90, rpSeconds: 30,
  },
  {
    id: "strawberry", name: "strawberry 사건", emoji: "🍓", minEra: 6, weight: 2, year: "2024",
    desc: "\"strawberry에 r이 몇 개야?\" \"2개입니다.\" 스크린샷이 밈이 됐다. 토크나이저는 억울하다.",
    effects: fx({ demand: 1.4, hall: 1.2 }), duration: 45,
  },
  {
    id: "blackout", name: "변전소 정비", emoji: "🔌", minEra: 2, weight: 2, year: "언제나",
    desc: "전력 회사가 변전소를 정비한다. 잠시 전력 공급이 줄어든다.",
    effects: fx({ power: 0.75 }), duration: 30,
  },
  {
    id: "viral", name: "바이럴", emoji: "📈", minEra: 0, weight: 3, year: "언제나",
    desc: "누군가 당신의 AI와 나눈 대화를 공유했고, 그게 터졌다!",
    effects: fx({ demand: 2 }), duration: 30,
  },
  {
    id: "grant", name: "연구비 지원", emoji: "🎓", minEra: 0, maxEra: 6, weight: 3, year: "언제나",
    desc: "정부 연구 지원금이 나왔다.",
    effects: [], duration: 0, incomeSeconds: 45,
  },
  {
    id: "gpu_shortage", name: "GPU 품귀", emoji: "📦", minEra: 6, weight: 2, year: "2023",
    desc: "GPU를 구하려면 몇 달을 기다려야 한다. 웃돈이 붙었다.",
    effects: fx({ cost: 1.5 }), duration: 60,
  },
  {
    id: "dreaming_event", name: "꿈꾸는 에이전트", emoji: "💤", minEra: 9, weight: 1, year: "2026",
    desc: "에이전트가 밤사이 기억을 정리하고 더 똑똑해져서 돌아왔다.",
    effects: fx({ hall: 0.8, tps: 1.2 }), duration: 90,
  },
  {
    id: "source_leak", name: "소스맵 유출", emoji: "🗺️", minEra: 9, weight: 1, year: "2026",
    desc: "배포 파일에 소스맵이 딸려 나갔다. 경쟁사들이 미공개 기능 이름을 다 알아버렸다. 출시를 서두르자!",
    effects: fx({ rp: 1.6 }), duration: 60,
  },
  {
    id: "fields_letter", name: "수학자들의 공개서한", emoji: "🧮", minEra: 10, weight: 1, year: "2026",
    desc: "필즈상 수상자들이 '미해결 문제를 벤치마크처럼 다루지 말라'고 호소했다. 이해를 함께 나누는 답변을 하자.",
    effects: fx({ hall: 0.7, reward: 1.2 }), duration: 120,
  },
  {
    id: "babbage_funding", name: "의회 예산 삭감", emoji: "🏛️", minEra: 0, maxEra: 1, weight: 2, year: "1842",
    desc: "영국 정부가 차분기관 예산을 끊었다. \"그 돈이면 다른 걸 하겠다.\" 그래도 연구는 계속된다.",
    effects: fx({ rp: 0.6 }), duration: 40,
  },
  {
    id: "punchcard_drop", name: "펀치카드 대참사", emoji: "🗂️", minEra: 1, maxEra: 2, weight: 2, year: "1950s",
    desc: "대학원생이 펀치카드 2,000장을 계단에 쏟았다. 다시 정렬할 때까지 답변 속도가 떨어진다.",
    effects: fx({ tps: 0.6 }), duration: 30,
  },
  {
    id: "eliza_secretary", name: "비서는 나가주세요", emoji: "🛋️", minEra: 2, maxEra: 3, weight: 2, year: "1966",
    desc: "ELIZA와 대화하던 비서가 개발자에게 자리를 비켜달라고 했다. 사람들이 기계에 마음을 열기 시작한다!",
    effects: fx({ demand: 1.8 }), duration: 60,
  },
  {
    id: "darpa_money", name: "DARPA의 백지수표", emoji: "💸", minEra: 2, maxEra: 2, weight: 2, year: "1960s",
    desc: "\"사람에게 투자하지, 프로젝트에 투자하지 않는다.\" 연구비가 넉넉하게 들어온다.",
    effects: [], duration: 0, rpSeconds: 90, incomeSeconds: 30,
  },
  {
    id: "rule_explosion", name: "규칙 폭발", emoji: "📚", minEra: 3, maxEra: 3, weight: 2, year: "1985",
    desc: "규칙이 1만 개를 넘자 서로 충돌하기 시작했다. 유지보수 비용이 치솟는다. 어떻게 할까?",
    effects: [], duration: 0,
    choices: [
      { label: "규칙을 정리한다", desc: "수익 30초분 지불, 90초간 헛소리 ×0.7", effects: fx({ hall: 0.7 }), duration: 90, incomeSeconds: -30 },
      { label: "그냥 덮어둔다", desc: "60초간 헛소리 ×1.4", effects: fx({ hall: 1.4 }), duration: 60 },
    ],
  },
  {
    id: "dotcom", name: "닷컴 버블", emoji: "🫧", minEra: 4, maxEra: 4, weight: 2, year: "2000",
    desc: "이름에 '.com'만 붙이면 투자가 들어온다! …그리고 거품이 꺼졌다. 덕분에 서버는 헐값이다.",
    effects: fx({ cost: 0.7 }), duration: 60,
  },
  {
    id: "kaggle", name: "캐글 대회 우승", emoji: "🥇", minEra: 5, maxEra: 6, weight: 2, year: "2010s",
    desc: "데이터 과학 대회에서 그래디언트 부스팅으로 1등! 상금과 명성을 얻었다.",
    effects: [], duration: 0, incomeSeconds: 60, rpSeconds: 30,
  },
  {
    id: "cat_paper", name: "고양이 논문", emoji: "🐱", minEra: 5, maxEra: 6, weight: 2, year: "2012",
    desc: "\"유튜브 1,000만 프레임을 보여줬더니 고양이를 알아봤다.\" 언론이 열광한다.",
    effects: fx({ demand: 1.6 }), duration: 60,
  },
  {
    id: "reviewer2", name: "리뷰어 2", emoji: "😤", minEra: 4, weight: 2, year: "언제나",
    desc: "\"이 논문은 참신성이 부족합니다. 베이스라인을 20개 더 추가하세요.\" 반박문을 쓸까?",
    effects: [], duration: 0,
    choices: [
      { label: "밤새 반박문을 쓴다", desc: "연구 점수 60초분, 30초간 답변 속도 ×0.8", effects: fx({ tps: 0.8 }), duration: 30, rpSeconds: 60 },
      { label: "다른 학회에 낸다", desc: "60초간 연구 ×1.3", effects: fx({ rp: 1.3 }), duration: 60 },
    ],
  },
  {
    id: "neurips_lottery", name: "학회 등록 추첨", emoji: "🎟️", minEra: 6, weight: 2, year: "2019",
    desc: "등록이 몇 분 만에 마감되던 AI 학회가 추첨제를 도입했다. 당첨! 인맥을 넓힌다.",
    effects: fx({ rp: 1.5, demand: 1.2 }), duration: 60,
  },
  {
    id: "avocado_chair", name: "아보카도 의자", emoji: "🥑", minEra: 6, maxEra: 7, weight: 2, year: "2021",
    desc: "\"아보카도 모양 의자\"를 그려달라는 요청에 AI가 진짜 그려냈다. 이미지 생성 붐!",
    effects: fx({ demand: 1.8, reward: 1.1 }), duration: 60,
  },
  {
    id: "fake_case", name: "가짜 판례", emoji: "⚖️", minEra: 7, weight: 2, year: "2023",
    desc: "변호사가 AI가 지어낸 판례를 법원에 냈다가 망신을 당했다. 헛소리 경계령!",
    effects: [], duration: 0,
    choices: [
      { label: "출처 표기 기능을 넣는다", desc: "120초간 헛소리 ×0.7", effects: fx({ hall: 0.7 }), duration: 120 },
      { label: "'AI는 실수할 수 있습니다' 문구만 단다", desc: "60초간 유입 ×0.8", effects: fx({ demand: 0.8 }), duration: 60 },
    ],
  },
  {
    id: "prompt_engineer", name: "프롬프트 엔지니어 열풍", emoji: "🧙", minEra: 7, maxEra: 8, weight: 2, year: "2023",
    desc: "\"질문만 잘해도 억대 연봉\" 기사가 쏟아진다. 다들 프롬프트를 연구한다.",
    effects: fx({ reward: 1.3, tap: 2 }), duration: 60,
  },
  {
    id: "context_rot", name: "중간에서 길을 잃다", emoji: "🧭", minEra: 7, weight: 2, year: "2023",
    desc: "긴 문서의 가운데 내용을 모델이 자꾸 놓친다는 논문이 나왔다. 'Lost in the Middle'.",
    effects: fx({ hall: 1.2 }), duration: 45,
  },
  {
    id: "open_weights_day", name: "오픈 웨이트 공개의 날", emoji: "🎁", minEra: 7, weight: 2, year: "2024",
    desc: "거대 모델 가중치가 통째로 공개됐다. 모두가 증류하고 파인튜닝한다.",
    effects: fx({ price: 0.75 }), duration: 90,
  },
  {
    id: "mcp_explosion", name: "MCP 서버 폭증", emoji: "🔌", minEra: 8, weight: 2, year: "2025",
    desc: "하루에 수백 개씩 새 MCP 서버가 올라온다. 이제 냉장고도 MCP를 지원한다(?).",
    effects: fx({ demand: 1.5, reward: 1.15 }), duration: 75,
  },
  {
    id: "rate_limit", name: "레이트 리밋", emoji: "🚦", minEra: 7, weight: 2, year: "2024",
    desc: "\"429 Too Many Requests.\" 요청이 너무 몰렸다. 한도를 올릴까?",
    effects: [], duration: 0,
    choices: [
      { label: "한도를 올린다", desc: "60초간 유입 ×1.5, 전력 사용 ×1.3", effects: fx({ demand: 1.5, powerUse: 1.3 }), duration: 60 },
      { label: "대기열을 건다", desc: "60초간 유입 ×0.8, 답변 가격 ×0.8", effects: fx({ demand: 0.8, price: 0.8 }), duration: 60 },
    ],
  },
  {
    id: "hbm_shortage", name: "HBM 품귀", emoji: "🧱", minEra: 9, weight: 2, year: "2026",
    desc: "고대역폭 메모리가 없어서 못 판다. 새 가속기 가격이 오른다.",
    effects: fx({ cost: 1.4 }), duration: 60,
  },
  {
    id: "agent_overnight", name: "밤샘 에이전트", emoji: "🌙", minEra: 9, weight: 2, year: "2026",
    desc: "퇴근 전에 맡긴 일을 에이전트가 밤새 끝내놨다. 아침에 PR 37개가 기다린다.",
    effects: fx({ tps: 1.5, reward: 1.2 }), duration: 75,
  },
  // ── 재난·악성코드 (24차): 실제 사건은 사망·군사 관련이 없는 것만. malware면 보안 연구로 피해 시간이 준다 ──
  {
    id: "bug_moth", name: "진짜 벌레", emoji: "🦋", minEra: 0, maxEra: 1, weight: 2, year: "1947",
    desc: "하버드 마크 II의 계전기 사이에서 나방이 나왔다. 운영자들은 나방을 일지에 붙이고 '버그가 실제로 발견된 첫 사례'라고 적었다.",
    effects: fx({ tps: 0.85 }), duration: 30,
  },
  {
    id: "carrington", name: "캐링턴 사건", emoji: "☀️", minEra: 0, maxEra: 0, weight: 2, year: "1859",
    desc: "기록상 가장 강한 태양 폭풍. 전신선에서 불꽃이 튀었고, 어떤 전신기는 배터리를 빼고도 오로라 전류만으로 통신했다.",
    effects: fx({ demand: 0.8 }), duration: 45,
  },
  {
    id: "creeper", name: "크리퍼", emoji: "🐛", minEra: 2, maxEra: 3, weight: 2, year: "1971", malware: true,
    desc: "ARPANET 컴퓨터를 옮겨 다니며 \"I'M THE CREEPER: CATCH ME IF YOU CAN\"을 띄우는 실험 프로그램. 이걸 지우려고 만든 '리퍼'가 최초의 백신으로 불린다.",
    effects: [], duration: 0,
    choices: [
      { label: "리퍼를 만든다", desc: "수익 20초분, 30초간 답변 속도 ×0.9", effects: fx({ tps: 0.9 }), duration: 30, incomeSeconds: -20 },
      { label: "재미있으니 둔다", desc: "60초간 답변 속도 ×0.75", effects: fx({ tps: 0.75 }), duration: 60 },
    ],
  },
  {
    id: "morris_worm", name: "모리스 웜", emoji: "🪱", minEra: 3, maxEra: 4, weight: 3, year: "1988", malware: true,
    desc: "대학원생이 만든 웜이 버그 때문에 멈추지 않고 퍼졌다. 당시 인터넷에 연결된 컴퓨터 약 6만 대 중 6천 대쯤(추정)이 감염됐다.",
    effects: [], duration: 0,
    choices: [
      { label: "네트워크를 끊고 패치", desc: "수익 30초분, 30초간 답변 속도 ×0.8", effects: fx({ tps: 0.8 }), duration: 30, incomeSeconds: -30 },
      { label: "그냥 돌린다", desc: "90초간 답변 속도 ×0.6", effects: fx({ tps: 0.6 }), duration: 90 },
    ],
  },
  {
    id: "y2k", name: "Y2K", emoji: "📅", minEra: 4, maxEra: 4, weight: 3, year: "1999",
    desc: "연도를 두 자리로 저장한 프로그램들이 2000년을 1900년으로 읽을 위기. 전 세계가 몇 해에 걸쳐 고친 덕분에 그날은 조용히 지나갔다.",
    effects: [], duration: 0,
    choices: [
      { label: "미리 고친다", desc: "수익 40초분을 들이고 무사통과", effects: [], duration: 0, incomeSeconds: -40 },
      { label: "설마 무슨 일이", desc: "60초간 답변 속도 ×0.5", effects: fx({ tps: 0.5 }), duration: 60 },
    ],
  },
  {
    id: "iloveyou", name: "ILOVEYOU", emoji: "💌", minEra: 4, maxEra: 5, weight: 2, year: "2000", malware: true,
    desc: "제목이 'ILOVEYOU'인 메일. 첨부 파일을 여는 순간 주소록 전체로 자신을 다시 보냈다. 며칠 만에 수천만 대가 감염됐다.",
    effects: fx({ demand: 0.7, tps: 0.85 }), duration: 60,
  },
  {
    id: "ransomware", name: "랜섬웨어", emoji: "🔐", minEra: 6, maxEra: 7, weight: 2, year: "2010년대", malware: true,
    desc: "파일을 잠그고 몸값을 요구하는 악성코드가 흔해졌다. 보안 패치를 미룬 컴퓨터가 먼저 당한다.",
    effects: [], duration: 0,
    choices: [
      { label: "백업에서 복구", desc: "연구 점수 30초분, 30초간 답변 속도 ×0.8", effects: fx({ tps: 0.8 }), duration: 30, rpSeconds: -30 },
      { label: "몸값을 낸다", desc: "수익 60초분 + 60초간 답변 속도 ×0.7 (낸다고 다 풀리는 건 아니다)", effects: fx({ tps: 0.7 }), duration: 60, incomeSeconds: -60 },
    ],
  },
  {
    id: "log4shell", name: "로그 한 줄의 구멍", emoji: "🪵", minEra: 6, maxEra: 7, weight: 2, year: "2021", malware: true,
    desc: "수많은 자바 서버가 쓰던 로그 라이브러리에서, 로그에 특정 문자열만 남기면 원격으로 코드가 실행되는 구멍이 발견됐다. 전 세계 개발자의 연말이 사라졌다.",
    effects: [], duration: 0,
    choices: [
      { label: "주말 반납하고 패치", desc: "연구 점수 20초분, 20초간 답변 속도 ×0.85", effects: fx({ tps: 0.85 }), duration: 20, rpSeconds: -20 },
      { label: "월요일에 하자", desc: "90초간 답변 속도 ×0.7", effects: fx({ tps: 0.7 }), duration: 90 },
    ],
  },
  {
    id: "dc_fire", name: "데이터센터 화재", emoji: "🔥", minEra: 6, maxEra: 8, weight: 2, year: "2021",
    desc: "유럽의 한 데이터센터 건물이 불에 탔다. 다친 사람은 없었지만, 백업을 같은 건물에 둔 고객의 데이터는 돌아오지 않았다.",
    effects: [], duration: 0,
    choices: [
      { label: "다른 지역 백업으로 옮긴다", desc: "수익 40초분, 30초간 답변 속도 ×0.8", effects: fx({ tps: 0.8 }), duration: 30, incomeSeconds: -40 },
      { label: "백업은 다음에", desc: "90초간 답변 속도 ×0.6", effects: fx({ tps: 0.6 }), duration: 90 },
    ],
  },
  {
    id: "solar_storm", name: "20년 만의 태양 폭풍", emoji: "🌌", minEra: 8, maxEra: 9, weight: 2, year: "2024",
    desc: "2024년 5월, 20여 년 만에 가장 강한 지자기 폭풍. 오로라가 낮은 위도까지 내려왔고, GPS 오차로 자율주행 트랙터들이 일을 멈췄다.",
    effects: fx({ demand: 0.85 }), duration: 45,
  },
  {
    id: "blue_screen", name: "세계 동시 블루스크린", emoji: "🟦", minEra: 8, maxEra: 9, weight: 2, year: "2024", malware: true,
    desc: "보안 프로그램 업데이트 하나가 전 세계 PC 약 850만 대를 멈춰 세웠다. 공항과 방송국 화면이 파랗게 변했다.",
    effects: [], duration: 0,
    choices: [
      { label: "단계적 배포로 바꾼다", desc: "60초간 연구 +30%, 답변 속도 ×0.9", effects: fx({ rp: 1.3, tps: 0.9 }), duration: 60 },
      { label: "다 같이 재부팅", desc: "45초간 답변 속도 ×0.5", effects: fx({ tps: 0.5 }), duration: 45 },
    ],
  },
  {
    id: "ai_worm", name: "AI 웜 논문", emoji: "🧫", minEra: 8, maxEra: 9, weight: 2, year: "2024", malware: true,
    desc: "연구자들이 이메일 AI 비서끼리 퍼지는 실험용 웜을 만들어 보였다. 메일 속 숨은 지시문이 답장에 자기 자신을 복사한다.",
    effects: [], duration: 0,
    choices: [
      { label: "입력 검증 강화", desc: "연구 점수 20초분, 60초간 헛소리 ×0.8", effects: fx({ hall: 0.8 }), duration: 60, rpSeconds: -20 },
      { label: "설마 우리가", desc: "60초간 헛소리 ×1.4, 유입 ×0.8", effects: fx({ hall: 1.4, demand: 0.8 }), duration: 60 },
    ],
  },
  {
    id: "robot_firmware", name: "펌웨어 오류 (팬픽)", emoji: "🕺", minEra: 10, weight: 2, year: "20XX", malware: true,
    desc: "휴머노이드 1억 대가 동시에 같은 춤을 추기 시작했다. 잘못된 업데이트 하나가 한꺼번에 배포됐다.",
    effects: fx({ tps: 0.7 }), duration: 45,
  },
  {
    id: "machine_council", name: "기계 자율 회의 (팬픽)", emoji: "🤖", minEra: 10, weight: 2, year: "20XX",
    desc: "공장 로봇들이 생산 계획을 스스로 정하겠다고 '제안'해 왔다. 거절할 수 있는지는 아무도 확인해 보지 않았다.",
    effects: [], duration: 0,
    choices: [
      { label: "인간 승인 단계 유지", desc: "90초간 답변 속도 ×0.8, 헛소리 ×0.6", effects: fx({ tps: 0.8, hall: 0.6 }), duration: 90 },
      { label: "기계에 맡긴다", desc: "90초간 답변 속도 ×1.6, 유입 ×0.8 (사람들이 불안해한다)", effects: fx({ tps: 1.6, demand: 0.8 }), duration: 90 },
    ],
  },
];
