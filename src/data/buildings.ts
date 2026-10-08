import type { Building } from "../core/types";

// 여러 번 구매하는 유닛들. 비용 = baseCost × growth^보유수.

const COMPUTE: Building[] = [
  { id: "c_diff", kind: "compute", name: "차분기관", emoji: "⚙️", era: 0, baseCost: 10, growth: 1.15, tps: 1, powerUse: 1, desc: "배비지가 설계한 톱니바퀴 계산기. 1843년 에이다 러브레이스가 최초의 프로그램을 썼다." },
  { id: "c_eniac", kind: "compute", name: "진공관 컴퓨터", emoji: "📻", era: 1, baseCost: 150, growth: 1.15, tps: 8, powerUse: 5, desc: "ENIAC은 진공관 17,468개, 무게 27톤, 전력 150kW. 진공관이 툭하면 나갔다." },
  { id: "c_mainframe", kind: "compute", name: "트랜지스터 메인프레임", emoji: "🗃️", era: 2, baseCost: 2500, growth: 1.15, tps: 60, powerUse: 25, desc: "IBM 704. 퍼셉트론이 처음 돌아간 기계이자 LISP가 태어난 곳." },
  { id: "c_lisp", kind: "compute", name: "LISP 머신", emoji: "🖥️", era: 3, baseCost: 4e4, growth: 1.15, tps: 450, powerUse: 120, desc: "AI 전용 워크스테이션. 1987년 값싼 범용 PC에 밀려 시장이 통째로 사라졌다." },
  { id: "c_workstation", kind: "compute", name: "워크스테이션 클러스터", emoji: "🧰", era: 4, baseCost: 7e5, growth: 1.15, tps: 3500, powerUse: 600, desc: "리눅스 서버를 줄줄이 묶었다. 구글은 값싼 PC 수천 대로 웹 전체를 색인했다." },
  { id: "c_gtx", kind: "compute", name: "게이밍 GPU", emoji: "🎮", era: 5, baseCost: 1.4e7, growth: 1.15, tps: 3e4, powerUse: 3000, desc: "AlexNet은 GTX 580 두 장으로 학습했다. 게이머의 장난감이 AI의 엔진이 됐다." },
  { id: "c_v100", kind: "compute", name: "V100", emoji: "🟩", era: 6, baseCost: 3e8, growth: 1.15, tps: 2.6e5, powerUse: 1.5e4, desc: "텐서 코어를 처음 단 데이터센터 GPU. GPT-3가 이 칩 수천 장 위에서 학습됐다." },
  { id: "c_a100", kind: "compute", name: "A100", emoji: "💚", era: 7, baseCost: 7e9, growth: 1.15, tps: 2.4e6, powerUse: 7.5e4, desc: "ChatGPT를 탄생시킨 그 GPU. 한때 웃돈을 줘도 구하기 힘들었다." },
  { id: "c_h100", kind: "compute", name: "H100", emoji: "🔥", era: 8, baseCost: 1.8e11, growth: 1.15, tps: 2.2e7, powerUse: 4e5, desc: "HBM3 80GB, 대역폭 3TB/s. 2020년대 중반 AI 경쟁의 기축통화." },
  { id: "c_b200", kind: "compute", name: "B200 NVL72 랙", emoji: "🗄️", era: 9, baseCost: 5e12, growth: 1.15, tps: 2e8, powerUse: 2e6, desc: "다이 두 개를 10TB/s로 이어 붙인 블랙웰. GPU 72개가 랙 하나에서 한 몸처럼 움직인다." },
  { id: "c_rubin", kind: "compute", name: "루빈 슈퍼칩", emoji: "🌠", era: 9, baseCost: 1.5e14, growth: 1.15, tps: 1.8e9, powerUse: 1e7, desc: "HBM4를 단 차세대 가속기. 메모리 대역폭이 곧 지능이다." },
  { id: "c_photonic", kind: "compute", name: "광자 칩 (팬픽)", emoji: "💡", era: 10, baseCost: 5e15, growth: 1.15, tps: 1.6e10, powerUse: 5e7, desc: "전자 대신 빛으로 행렬을 곱한다. 발열이 거의 없다(고 한다)." },
  { id: "c_quantum", kind: "compute", name: "양자 가속기 (팬픽)", emoji: "⚛️", era: 10, baseCost: 2e17, growth: 1.15, tps: 1.5e11, powerUse: 2.5e8, desc: "큐비트로 어텐션을 계산한다. 관측하기 전까지는 정답이자 오답이다." },
];

const POWER: Building[] = [
  { id: "p_dorm", kind: "power", name: "기숙사 방", emoji: "🛏️", era: 0, baseCost: 12, growth: 1.15, power: 6, desc: "멀티탭 하나로 시작하는 위대한 여정. 룸메이트가 싫어한다." },
  { id: "p_lab", kind: "power", name: "대학 전산실", emoji: "🏫", era: 1, baseCost: 300, growth: 1.15, power: 40, desc: "에어컨이 빵빵한 전산실. 사용 시간은 예약제다." },
  { id: "p_institute", kind: "power", name: "연구소 서버룸", emoji: "🏢", era: 2, baseCost: 5000, growth: 1.15, power: 220, desc: "DARPA 지원금으로 차린 연구소. 돈이 넘치던 시절이다." },
  { id: "p_corp", kind: "power", name: "기업 전산센터", emoji: "🏬", era: 3, baseCost: 9e4, growth: 1.15, power: 1200, desc: "포춘 500 기업의 지하 전산센터. 전문가 시스템이 24시간 돌아간다." },
  { id: "p_rackfarm", kind: "power", name: "서버 랙 팜", emoji: "🗄️", era: 4, baseCost: 1.6e6, growth: 1.15, power: 6500, desc: "닷컴 붐이 남긴 랙 수천 개. 버블이 꺼진 뒤 헐값에 나왔다." },
  { id: "p_colo", kind: "power", name: "코로케이션 센터", emoji: "🏭", era: 5, baseCost: 3.2e7, growth: 1.15, power: 3.5e4, desc: "남의 데이터센터에 랙을 빌린다. GPU 열기에 냉방이 버거워한다." },
  { id: "p_region", kind: "power", name: "클라우드 리전", emoji: "☁️", era: 6, baseCost: 7e8, growth: 1.15, power: 1.8e5, desc: "가용 영역 셋, 전력 수십 MW. 이제 '서버'는 API 호출 한 번이다." },
  { id: "p_hyperscale", kind: "power", name: "하이퍼스케일 캠퍼스", emoji: "🌆", era: 7, baseCost: 1.6e10, growth: 1.15, power: 9e5, desc: "축구장 수십 개 크기. 변전소를 직접 짓는다." },
  { id: "p_colossus", kind: "power", name: "122일 클러스터", emoji: "⚡", era: 8, baseCost: 4e11, growth: 1.15, power: 5e6, desc: "GPU 10만 장을 122일 만에 세웠다. 전력망이 모자라 가스터빈과 배터리를 끌어왔다." },
  { id: "p_starportal", kind: "power", name: "스타포털", emoji: "🌀", era: 9, baseCost: 1.1e13, growth: 1.15, power: 2.5e7, desc: "5,000억 달러, 10기가와트짜리 메가 프로젝트. 이름은… 비슷한 게 있었던 것 같다." },
  { id: "p_orbital", kind: "power", name: "궤도 데이터센터 (팬픽)", emoji: "🛰️", era: 10, baseCost: 3.5e14, growth: 1.15, power: 1.3e8, desc: "우주에선 태양광이 24시간이고 냉각은 공짜다(라고 우긴다)." },
  { id: "p_dyson", kind: "power", name: "다이슨 스웜 (팬픽)", emoji: "☀️", era: 10, baseCost: 1.2e16, growth: 1.15, power: 7e8, desc: "태양을 감싸는 위성 군단. 마지막 전기요금 고지서." },
];

const DEMAND: Building[] = [
  { id: "d_neighbors", kind: "demand", name: "동네 사람들", emoji: "🏘️", era: 0, baseCost: 15, growth: 1.15, demand: 0.15, desc: "\"그 기계한테 물어보면 답해준대!\" 입소문의 시작." },
  { id: "d_conference", kind: "demand", name: "학회 데모", emoji: "🎤", era: 1, baseCost: 400, growth: 1.15, demand: 1.2, desc: "학회에서 시연하면 질문이 쏟아진다. 데모는 언제나 리허설보다 잘 안 된다." },
  { id: "d_bbs", kind: "demand", name: "대학 터미널", emoji: "📠", era: 2, baseCost: 7000, growth: 1.15, demand: 7, desc: "타임셰어링 터미널로 캠퍼스 전체가 접속한다. ELIZA에 빠진 비서가 자리를 비켜달라고 했다." },
  { id: "d_b2b", kind: "demand", name: "기업 계약", emoji: "💼", era: 3, baseCost: 1.3e5, growth: 1.15, demand: 40, desc: "XCON처럼 기업 업무에 투입된다. 정장 입은 고객들이 질문을 들고 온다." },
  { id: "d_portal", kind: "demand", name: "웹 포털", emoji: "🌍", era: 4, baseCost: 2.4e6, growth: 1.15, demand: 250, desc: "검색창에 질문을 치는 시대. 하루 수억 건의 질의." },
  { id: "d_app", kind: "demand", name: "스마트폰 비서", emoji: "📱", era: 5, baseCost: 5e7, growth: 1.15, demand: 1600, desc: "주머니 속 AI 비서. \"죄송해요, 잘 이해하지 못했어요.\"" },
  { id: "d_api", kind: "demand", name: "개발자 API", emoji: "🔑", era: 6, baseCost: 1.1e9, growth: 1.15, demand: 9000, desc: "API 키 하나면 누구나 AI를 앱에 붙인다. 플레이그라운드가 북적인다." },
  { id: "d_chatapp", kind: "demand", name: "채팅 앱", emoji: "💬", era: 7, baseCost: 2.5e10, growth: 1.15, demand: 5e4, desc: "5일 만에 100만 명. 당시 역사상 가장 빨리 성장한 소비자 앱." },
  { id: "d_agents", kind: "demand", name: "에이전트 마켓", emoji: "🛒", era: 8, baseCost: 6e11, growth: 1.15, demand: 2.8e5, desc: "사람 대신 에이전트가 질문한다. 에이전트가 에이전트에게 묻기도 한다." },
  { id: "d_os", kind: "demand", name: "OS 통합", emoji: "🪟", era: 9, baseCost: 1.6e13, growth: 1.15, demand: 1.5e6, desc: "모든 기기, 모든 앱에 AI가 기본 탑재된다." },
  { id: "d_planet", kind: "demand", name: "행성 네트워크 (팬픽)", emoji: "🪐", era: 10, baseCost: 5e14, growth: 1.15, demand: 8e6, desc: "화성 기지에서도 질문이 온다. 왕복 지연 40분." },
];

const RESEARCHERS: Building[] = [
  { id: "r_student", kind: "rp", name: "대학원생", emoji: "🧑‍🎓", era: 0, baseCost: 25, growth: 1.15, rp: 0.2, desc: "라면과 커피로 움직이는 연구 엔진. 졸업은 언제일까." },
  { id: "r_postdoc", kind: "rp", name: "박사후연구원", emoji: "🧑‍🔬", era: 2, baseCost: 6000, growth: 1.15, rp: 4, desc: "논문 마감에 쫓기는 연구자. 리뷰어 2가 또 반려했다." },
  { id: "r_engineer", kind: "rp", name: "ML 엔지니어", emoji: "👩‍💻", era: 4, baseCost: 2e6, growth: 1.15, rp: 80, desc: "실험을 돌리고, 버그를 잡고, GPU 대기열을 지킨다." },
  { id: "r_scientist", kind: "rp", name: "수석 과학자", emoji: "🧙", era: 6, baseCost: 6e8, growth: 1.15, rp: 1500, desc: "모두가 탐내는 인재. 영입 전쟁에서 연봉이 아홉 자리까지 치솟았다." },
  { id: "r_laureate", kind: "rp", name: "노벨상급 연구자", emoji: "🏅", era: 7, baseCost: 2e10, growth: 1.15, rp: 2.5e4, desc: "2024년 AI 연구자들이 노벨 물리학상·화학상을 휩쓸었다." },
  { id: "r_agent", kind: "rp", name: "AI 연구 에이전트", emoji: "🤖", era: 8, baseCost: 5e11, growth: 1.15, rp: 4e5, desc: "AI가 AI를 연구한다. 밤새 실험을 돌리고 아침에 보고서를 올린다." },
  { id: "r_autolab", kind: "rp", name: "자동화 연구소 (팬픽)", emoji: "🏛️", era: 10, baseCost: 3e14, growth: 1.15, rp: 1e8, desc: "가설부터 실험, 논문까지 전부 자동. 인간은 커피만 마신다." },
];

const PARAMS: Building[] = [
  { id: "x_params", kind: "param", name: "파라미터 확장", emoji: "🧠", era: 0, baseCost: 20, growth: 1.6, intelPerLevel: 1.2, desc: "모델을 키운다. 스케일링 법칙: 크게 만들면 똑똑해진다. 레벨당 지능 ×1.2." },
];

export const BUILDINGS: Building[] = [...COMPUTE, ...POWER, ...DEMAND, ...RESEARCHERS, ...PARAMS];
