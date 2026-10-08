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
      { label: "참가한다", desc: "연구 포인트 대량 획득", effects: [], duration: 0, rpSeconds: 120 },
      { label: "본업에 집중", desc: "60초간 처리량 +30%", effects: fx({ tps: 1.3 }), duration: 60 },
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
      { label: "전면 공개", desc: "90초간 유입 ×2, 할루시네이션 ×1.3", effects: fx({ demand: 2, hall: 1.3 }), duration: 90 },
      { label: "단계적 공개", desc: "90초간 할루시네이션 ×0.7, 연구 +50%", effects: fx({ hall: 0.7, rp: 1.5 }), duration: 90 },
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
      { label: "안전 연구에 투자", desc: "120초간 할루시네이션 ×0.6", effects: fx({ hall: 0.6 }), duration: 120 },
      { label: "계속 달린다", desc: "60초간 처리량 ×1.5, 유입 ×0.8", effects: fx({ tps: 1.5, demand: 0.8 }), duration: 60 },
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
    desc: "대학원생이 펀치카드 2,000장을 계단에 쏟았다. 다시 정렬할 때까지 처리량이 떨어진다.",
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
      { label: "규칙을 정리한다", desc: "수익 30초분 지불, 90초간 할루시네이션 ×0.7", effects: fx({ hall: 0.7 }), duration: 90, incomeSeconds: -30 },
      { label: "그냥 덮어둔다", desc: "60초간 할루시네이션 ×1.4", effects: fx({ hall: 1.4 }), duration: 60 },
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
      { label: "밤새 반박문을 쓴다", desc: "연구 포인트 60초분, 30초간 처리량 ×0.8", effects: fx({ tps: 0.8 }), duration: 30, rpSeconds: 60 },
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
    desc: "변호사가 AI가 지어낸 판례를 법원에 냈다가 망신을 당했다. 할루시네이션 경계령!",
    effects: [], duration: 0,
    choices: [
      { label: "출처 표기 기능을 넣는다", desc: "120초간 할루시네이션 ×0.7", effects: fx({ hall: 0.7 }), duration: 120 },
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
      { label: "대기열을 건다", desc: "60초간 유입 ×0.8, 토큰 단가 ×0.8", effects: fx({ demand: 0.8, price: 0.8 }), duration: 60 },
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
];
