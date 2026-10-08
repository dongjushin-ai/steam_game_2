import type { Effect, MultStat, Upgrade, UpgradeCategory } from "../core/types";

const fx = (pairs: Partial<Record<MultStat, number>>): Effect[] =>
  Object.entries(pairs).map(([stat, mul]) => ({ stat: stat as MultStat, mul: mul as number }));

type Extra = Pick<Upgrade, "ctx" | "unlockThinking" | "requires" | "autoTap">;

const research = (
  id: string, era: number, year: string, emoji: string, name: string, cost: number,
  category: UpgradeCategory, effects: Partial<Record<MultStat, number>>, desc: string, extra: Extra = {},
): Upgrade => ({ id, era, year, emoji, name, cost, category, currency: "rp", effects: fx(effects), desc, ...extra });

const product = (
  id: string, era: number, year: string, emoji: string, name: string, cost: number,
  category: UpgradeCategory, effects: Partial<Record<MultStat, number>>, desc: string, extra: Extra = {},
): Upgrade => ({ id, era, year, emoji, name, cost, category, currency: "credits", effects: fx(effects), desc, ...extra });

// 🧠 연구 탭: 연구 포인트(RP)로 구매
const RESEARCH: Upgrade[] = [
  research("u_algorithm", 0, "9세기", "📜", "알고리즘", 3, "arch", { intel: 2 }, "알콰리즈미의 단계별 계산법. '알고리즘'이라는 단어가 그의 이름에서 나왔다."),
  research("u_lovelace", 0, "1843", "🪶", "최초의 프로그램", 12, "arch", { tps: 1.5 }, "에이다 러브레이스가 해석기관용 베르누이 수 계산 프로그램을 썼다."),
  research("u_neuron", 0, "1943", "🔌", "인공 뉴런", 30, "arch", { intel: 1.5, tps: 1.3 }, "매컬럭과 피츠가 뉴런을 논리 회로로 모델링했다. 모든 신경망의 조상."),

  research("u_logic", 1, "1956", "📐", "Logic Theorist", 120, "arch", { intel: 2 }, "뉴얼과 사이먼의 '최초의 AI 프로그램'. 수학 정리를 스스로 증명했다."),
  research("u_lisp", 1, "1958", "🧷", "LISP", 220, "dev", { rp: 1.5 }, "매카시가 만든 AI의 언어. 괄호(((가))) 많다."),
  research("u_dartmouth", 1, "1956", "🏷️", "'인공지능' 명명", 400, "service", { demand: 1.5 }, "다트머스 워크숍 제안서에서 'Artificial Intelligence'라는 말이 처음 쓰였다."),

  research("u_perceptron", 2, "1958", "➕", "퍼셉트론", 1000, "arch", { intel: 2 }, "로젠블랫의 학습하는 기계. 뉴욕타임스는 '걷고 말하고 스스로를 인식할 것'이라 보도했다."),
  research("u_eliza", 2, "1966", "🛋️", "패턴 매칭 대화", 1500, "service", { demand: 1.8 }, "ELIZA는 단순한 규칙으로 상담사를 흉내냈다. 사람들은 진짜 이해한다고 믿었다."),
  research("u_semantic", 2, "1968", "🕸️", "의미망", 2500, "memory", { intel: 1.3 }, "개념을 노드와 링크로 표현한다. 컨텍스트 512 토큰 확보.", { ctx: 512 }),
  research("u_astar", 2, "1968", "🗺️", "A* 탐색", 4000, "efficiency", { tps: 1.6 }, "셰이키 로봇을 위해 만든 경로 탐색 알고리즘. 지금도 게임 길찾기에 쓰인다."),

  research("u_knowledge", 3, "1976", "📚", "지식 베이스", 1.2e4, "safety", { hall: 0.8 }, "MYCIN은 약 600개 규칙으로 혈액 감염을 진단했다. 근거를 설명할 줄도 알았다."),
  research("u_backprop", 3, "1986", "🔁", "역전파", 2.5e4, "training", { intel: 3 }, "러멜하트·힌튼·윌리엄스가 다층 신경망 학습법을 대중화했다. XOR 문제 해결!"),
  research("u_hopfield", 3, "1982", "🧲", "홉필드 네트워크", 4e4, "memory", { rp: 1.5 }, "에너지 함수로 기억을 저장하는 신경망. 42년 뒤 노벨 물리학상을 받는다."),
  research("u_cyc", 3, "1984", "🧾", "상식 DB", 6e4, "data", { reward: 1.4 }, "Cyc 프로젝트는 인간의 상식을 규칙으로 전부 입력하려 했다. 40년째 진행 중."),

  research("u_lstm", 4, "1997", "🔗", "LSTM", 1.5e5, "memory", { intel: 1.5 }, "호크라이터와 슈미트후버의 장단기 기억 신경망. 컨텍스트 2K 확보.", { ctx: 2048 }),
  research("u_svm", 4, "1995", "📏", "서포트 벡터 머신", 2.5e5, "safety", { hall: 0.8 }, "마진을 최대화하는 분류기. 2000년대 머신러닝의 왕좌."),
  research("u_td", 4, "1992", "🎲", "시간차 강화학습", 4e5, "training", { intel: 2 }, "TD-Gammon은 혼자 백개먼을 두며 세계 정상급이 됐다. 서튼과 바르토는 2024 튜링상을 받는다."),
  research("u_crawl", 4, "1998", "🕷️", "웹 크롤러", 6e5, "data", { demand: 1.5, reward: 1.3 }, "웹 전체를 긁어 모은다. 데이터가 곧 경쟁력이 되는 시대의 시작."),

  research("u_cuda", 5, "2007", "🟢", "CUDA", 1.5e6, "hardware", { tps: 2 }, "GPU로 범용 계산을 한다. 게임 그래픽 칩이 과학 계산기가 됐다."),
  research("u_imagenet", 5, "2009", "🖼️", "ImageNet", 2.5e6, "data", { intel: 2 }, "페이페이 리의 1,400만 장 이미지 데이터셋. 딥러닝 혁명의 연료."),
  research("u_relu", 5, "2012", "📈", "ReLU + 드롭아웃", 4e6, "training", { intel: 2 }, "AlexNet의 비밀 무기. 단순한 활성화 함수가 학습을 빠르게 만들었다."),
  research("u_w2v", 5, "2013", "🧭", "word2vec", 6e6, "arch", { reward: 1.5 }, "단어를 벡터로. 왕 − 남자 + 여자 = 여왕."),
  research("u_attention", 5, "2014", "👀", "어텐션 메커니즘", 9e6, "arch", { intel: 1.5 }, "번역할 때 원문의 어디를 볼지 스스로 정한다. 컨텍스트 8K 확보.", { ctx: 8192 }),
  research("u_dqn", 5, "2013", "👾", "심층 강화학습", 1.3e7, "training", { intel: 1.5, tps: 1.3 }, "화면 픽셀만 보고 아타리 게임을 사람보다 잘하게 됐다."),

  research("u_transformer", 6, "2017", "⚡", "트랜스포머", 4e7, "arch", { tps: 3, intel: 2 }, "\"Attention Is All You Need.\" 순환 없이 어텐션만으로. 병렬화로 학습 속도가 폭증했다."),
  research("u_pretrain", 6, "2018", "📖", "사전학습 + 파인튜닝", 6e7, "training", { intel: 2 }, "GPT-1과 BERT. 먼저 인터넷을 읽고, 나중에 과제를 배운다."),
  research("u_scaling", 6, "2020", "📊", "스케일링 법칙", 1e8, "training", { intel: 2 }, "파라미터·데이터·컴퓨트를 키우면 손실이 멱법칙으로 줄어든다."),
  research("u_fewshot", 6, "2020", "🎯", "퓨샷 학습", 1.4e8, "training", { reward: 1.6 }, "GPT-3는 예시 몇 개만 보여줘도 새 과제를 해냈다."),
  research("u_chinchilla", 6, "2022", "🐭", "친칠라 최적화", 2e8, "efficiency", { price: 0.65 }, "모델만 키우지 말고 데이터도 같이 키워라. 같은 예산으로 더 좋은 모델."),
  research("u_cot", 6, "2022", "🪜", "생각의 사슬", 2.8e8, "safety", { hall: 0.7 }, "\"단계별로 생각해보자.\" 한 줄로 수학 정답률이 뛰었다."),
  research("u_alphafold", 6, "2020", "🧬", "AlphaFold", 4e8, "data", { reward: 1.5 }, "단백질 구조 예측 문제를 사실상 해결. 2024 노벨 화학상."),

  research("u_rlhf", 7, "2022", "👍", "RLHF", 1.5e9, "training", { hall: 0.6, demand: 1.6 }, "사람의 선호로 보상 모델을 만들어 강화학습. 말 잘 듣는 챗봇의 비결."),
  research("u_ctx32k", 7, "2023", "📜", "32K 컨텍스트", 2e9, "memory", { intel: 1.3 }, "책 한 챕터를 통째로 읽는다. 컨텍스트 32K 확보.", { ctx: 32768 }),
  research("u_lora", 7, "2021", "🎛️", "LoRA", 2.6e9, "efficiency", { price: 0.7 }, "가중치 전체 대신 작은 저랭크 행렬만 학습. 파인튜닝이 싸졌다."),
  research("u_quant", 7, "2023", "🗜️", "4비트 양자화", 3.4e9, "efficiency", { price: 0.6, tps: 1.3 }, "가중치를 4비트로 압축. 노트북에서도 LLM이 돌아간다."),
  research("u_rag", 7, "2023", "🔎", "RAG + 벡터 DB", 4.5e9, "safety", { hall: 0.7 }, "모르면 찾아보고 답한다. 검색 증강 생성."),
  research("u_flash", 7, "2022", "💨", "FlashAttention", 6e9, "efficiency", { tps: 1.6 }, "GPU 메모리 계층을 고려한 어텐션 구현. 같은 계산을 훨씬 빠르게."),
  research("u_moe", 7, "2023", "🧩", "전문가 혼합 (MoE)", 8e9, "arch", { tps: 2, price: 0.7 }, "토큰마다 일부 전문가만 깨운다. 파라미터는 크게, 계산은 작게."),
  research("u_cai", 7, "2022", "📘", "헌법적 AI", 1e10, "safety", { hall: 0.8, demand: 1.3 }, "원칙 목록으로 AI가 스스로를 비판하고 고친다."),
  research("u_ctx200k", 7, "2023", "📚", "200K 컨텍스트", 1.3e10, "memory", { intel: 1.3 }, "소설 한 권, 코드베이스 하나를 한 번에. 컨텍스트 200K 확보.", { ctx: 200000 }),
  research("u_multimodal", 7, "2024", "🎙️", "네이티브 멀티모달", 1.7e10, "arch", { reward: 2 }, "텍스트·이미지·음성을 한 모델이 직접 다룬다."),

  research("u_reasoning", 8, "2024", "🤔", "테스트 타임 컴퓨트", 6e10, "arch", { intel: 2 }, "답하기 전에 오래 생각한다. '생각 모드' 해금: 토큰을 더 쓰는 대신 할루시네이션이 크게 준다.", { unlockThinking: true }),
  research("u_mcp", 8, "2024", "🔌", "Model Context Protocol", 7e10, "tool", { reward: 1.3 }, "AI와 도구를 잇는 표준 프로토콜. 커넥터 상품을 해금한다."),
  research("u_caching", 8, "2024", "💾", "프롬프트 캐싱", 9e10, "efficiency", { price: 0.5 }, "반복되는 프롬프트 앞부분을 캐시한다. 캐시 읽기는 입력 단가의 10분의 1."),
  research("u_distill", 8, "2025", "⚗️", "증류", 1.2e11, "efficiency", { price: 0.6 }, "큰 모델의 추론을 작은 모델에 가르친다. 싸고 빠른 추론 모델."),
  research("u_computeruse", 8, "2024", "🖱️", "컴퓨터 사용", 1.6e11, "tool", { demand: 1.8 }, "화면을 보고 마우스와 키보드를 직접 조작한다."),
  research("u_synthetic", 8, "2025", "🧪", "합성 데이터", 2.2e11, "data", { intel: 2 }, "인터넷 데이터가 바닥나자, 모델이 만든 데이터로 모델을 가르친다."),
  research("u_specdec", 8, "2023", "🏎️", "투기적 디코딩", 3e11, "efficiency", { tps: 2 }, "작은 모델이 초안을 쓰고 큰 모델이 검증한다. 결과는 같고 속도는 두 배."),
  research("u_router", 8, "2025", "🔀", "모델 라우터", 4e11, "efficiency", { price: 0.7 }, "쉬운 질문은 작은 모델로, 어려운 질문은 큰 모델로. (고장만 안 나면)"),

  research("u_ctx1m", 9, "2026", "🌊", "1M 컨텍스트 표준화", 1.5e12, "memory", { intel: 1.5 }, "모든 모델이 100만 토큰을 기본으로 읽는다. 컨텍스트 1M 확보.", { ctx: 1e6 }),
  research("u_adaptive", 9, "2026", "🎚️", "적응형 사고", 2e12, "efficiency", { think: 0.6, price: 0.8 }, "질문 난이도에 맞춰 생각 깊이(effort)를 스스로 조절한다."),
  research("u_dreaming", 9, "2026", "💤", "드리밍", 2.6e12, "memory", { offline: 2 }, "세션 사이에 에이전트 메모리를 정리한다. 중복은 합치고 낡은 기억은 지운다."),
  research("u_agentteam", 9, "2026", "👥", "에이전트 팀", 3.5e12, "tool", { tps: 2 }, "오케스트레이터가 서브에이전트들에게 일을 나눠준다."),
  research("u_interp", 9, "2026", "🔬", "해석가능성", 4.5e12, "safety", { hall: 0.5 }, "모델 내부의 특징(feature)을 읽어낸다. 블랙박스에 창문을 낸다."),
  research("u_hbm4", 9, "2025", "🧱", "HBM4", 6e12, "hardware", { tps: 1.6 }, "2,048비트 인터페이스의 고대역폭 메모리. 추론은 결국 메모리 대역폭 싸움."),
  research("u_autoresearch", 9, "2026", "🔁", "AI 연구 자동화", 8e12, "training", { rp: 3 }, "AI가 실험을 설계하고 돌리고 분석한다."),

  research("u_ctx10m", 10, "20XX", "🌌", "10M 컨텍스트", 5e13, "memory", { intel: 1.5 }, "평생의 대화를 전부 기억한다. 컨텍스트 10M 확보.", { ctx: 1e7 }),
  research("u_worldmodel", 10, "20XX", "🌍", "월드 모델", 1e14, "arch", { intel: 4 }, "다음 토큰이 아니라 세상의 다음 상태를 예측한다. (JEPA 오마주)"),
  research("u_fusion", 10, "20XX", "☢️", "핵융합 전력", 2e14, "hardware", { power: 3 }, "30년 뒤에 된다던 그 핵융합. 드디어 됐다."),
  research("u_recursive", 10, "20XX", "♻️", "재귀적 자기개선", 5e14, "training", { intel: 5, tps: 3 }, "AI가 다음 AI를 설계한다. 그 AI가 또 다음 AI를…"),
];

// 💬 서비스 탭: 크레딧으로 구매하는 제품 기능·플러그인·커넥터
const PRODUCTS: Upgrade[] = [
  product("s_oil", 0, "1800s", "🛢️", "톱니 기름칠", 40, "hardware", { tap: 2, tps: 1.2 }, "삐걱거림 감소. 탭 보상 ×2."),
  product("s_punchcard", 1, "1950s", "🎫", "펀치카드 자동 투입기", 1500, "hardware", { tps: 1.5 }, "카드 한 벌이 프로그램 하나. 떨어뜨리면 처음부터 다시."),
  product("s_terminal", 2, "1960s", "⌨️", "대화형 터미널", 2.5e4, "service", { demand: 1.5, tap: 2 }, "타자기 대신 화면에 대화가 뜬다."),
  product("a_autoreply", 2, "1966", "📟", "자동 응답 스크립트", 4e4, "service", {}, "ELIZA처럼 정해진 패턴으로 알아서 대답한다. 초당 0.5회 자동 답변(탭).", { autoTap: 0.5 }),
  product("s_maintenance", 3, "1980s", "🔧", "유지보수 계약", 4e5, "service", { reward: 1.5 }, "규칙이 1만 개를 넘자 유지보수비가 개발비를 넘어섰다. 그래도 돈은 된다."),
  product("s_aircool", 3, "1980s", "🌬️", "공랭식 냉각", 6e5, "hardware", { power: 1.3 }, "큰 선풍기. 아주 큰 선풍기."),
  product("s_search", 4, "1998", "🔍", "검색 엔진 연동", 8e6, "service", { demand: 1.5 }, "질문하기 전에 검색부터. 페이지랭크가 웹을 정리했다."),
  product("s_clippy", 4, "1997", "📎", "도우미 캐릭터", 1.2e7, "service", { tap: 3 }, "\"편지를 쓰시는 것 같네요! 도와드릴까요?\" 탭 보상 ×3."),
  product("s_autoscale", 5, "2006", "📦", "클라우드 오토스케일링", 2e8, "hardware", { tps: 1.5 }, "트래픽이 몰리면 서버가 알아서 늘어난다."),
  product("s_watercool", 5, "2010s", "💧", "수랭식 냉각", 3e8, "hardware", { power: 1.5 }, "GPU에 물을 흘린다. 누수는 생각하지 말자."),
  product("a_macro", 5, "2011", "🤖", "답변 매크로", 2.5e8, "service", {}, "자주 오는 질문은 매크로가 처리한다. 초당 1회 자동 답변(탭).", { autoTap: 1 }),
  product("s_autocomplete", 6, "2021", "⌨️", "코드 자동완성", 5e9, "dev", { reward: 1.5 }, "에디터에서 다음 줄을 제안한다. 개발자들이 Tab 키를 사랑하게 됐다."),
  product("s_hub", 6, "2019", "🤗", "모델 허브", 8e9, "service", { demand: 1.5 }, "모델과 데이터셋을 공유하는 플랫폼. 오픈소스 AI의 광장."),
  product("p_websearch", 7, "2023", "🌐", "플러그인: 웹 검색", 1.2e11, "tool", { hall: 0.85, demand: 1.2 }, "최신 정보를 검색해서 답한다. 지식 컷오프 탈출."),
  product("p_interpreter", 7, "2023", "🐍", "플러그인: 코드 인터프리터", 1.6e11, "tool", { reward: 1.4 }, "직접 코드를 실행해서 계산한다. strawberry의 r도 이제 정확히 센다."),
  product("p_functions", 7, "2023", "🛠️", "함수 호출", 2.2e11, "tool", { tps: 1.3, reward: 1.2 }, "JSON으로 외부 함수를 부른다. 도구 사용의 시작."),
  product("p_artifacts", 7, "2024", "🪟", "아티팩트", 3e11, "tool", { demand: 1.4 }, "대화 옆 창에서 코드와 문서가 살아 움직인다."),
  product("s_immersion", 7, "2023", "🛁", "액침 냉각", 2.6e11, "hardware", { powerUse: 0.7 }, "서버를 통째로 냉각유에 담근다."),
  product("k_github", 8, "2024", "🐙", "커넥터: GitHub", 2e12, "connector", { reward: 1.3 }, "레포를 읽고 PR을 올린다.", { requires: ["u_mcp"] }),
  product("k_slack", 8, "2024", "💬", "커넥터: Slack", 2.6e12, "connector", { demand: 1.3 }, "팀 채널에서 바로 질문을 받는다.", { requires: ["u_mcp"] }),
  product("k_drive", 8, "2024", "📁", "커넥터: Drive", 3.2e12, "connector", { reward: 1.25 }, "회사 문서를 찾아 읽는다.", { requires: ["u_mcp"] }),
  product("k_notion", 8, "2025", "🗒️", "커넥터: Notion", 4e12, "connector", { hall: 0.9, reward: 1.1 }, "팀 위키를 근거로 답한다.", { requires: ["u_mcp"] }),
  product("k_figma", 8, "2025", "🎨", "커넥터: Figma", 5e12, "connector", { reward: 1.25 }, "디자인 파일을 읽고 코드로 옮긴다.", { requires: ["u_mcp"] }),
  product("k_db", 8, "2025", "🗄️", "커넥터: 데이터베이스", 6e12, "connector", { reward: 1.3 }, "SQL을 직접 실행해서 답한다.", { requires: ["u_mcp"] }),
  product("v_cli", 8, "2025", "🧑‍💻", "CLI 코딩 에이전트", 7e12, "dev", { reward: 1.5 }, "터미널에서 자연어로 일을 맡긴다. 코드를 읽고, 고치고, 테스트하고, 커밋한다."),
  product("v_vibe", 8, "2025", "🎸", "바이브 코딩 모드", 9e12, "dev", { demand: 1.6 }, "코드는 안 보고 느낌으로 만든다. 2025 콜린스 올해의 단어."),
  product("s_nuclear", 8, "2024", "☢️", "원전 재가동 계약", 8e12, "hardware", { power: 1.5 }, "멈춘 원자력 발전소를 AI 전력용으로 다시 켠다."),
  product("a_autopilot", 8, "2025", "🛫", "에이전트 오토파일럿", 1.1e13, "dev", {}, "에이전트가 스스로 질문을 골라 처리한다. 초당 3회 자동 답변(탭).", { autoTap: 3 }),
  product("v_skills", 9, "2025", "🧰", "스킬", 3e13, "dev", { reward: 1.3 }, "업무 노하우를 패키지로 묶어 필요할 때 불러온다."),
  product("v_subagents", 9, "2025", "🪆", "서브에이전트", 4e13, "dev", { tps: 1.5 }, "큰 일을 쪼개 작은 에이전트들에게 맡긴다."),
  product("v_hooks", 9, "2025", "🪝", "훅", 5e13, "dev", { hall: 0.85 }, "도구 실행 전후에 검사를 끼워 넣는다."),
  product("v_sandbox", 9, "2025", "🏖️", "클라우드 샌드박스", 6.5e13, "dev", { demand: 1.5 }, "격리된 컨테이너에서 에이전트가 안전하게 일한다."),
  product("v_browser", 9, "2026", "🧭", "브라우저 에이전트", 8e13, "tool", { demand: 1.5 }, "브라우저에서 클릭하고 입력하며 웹 업무를 대신한다."),
  product("s_smr", 9, "2026", "⚛️", "소형 모듈 원자로", 1e14, "hardware", { power: 2 }, "데이터센터 옆에 작은 원자로를 둔다."),
  product("a_background", 9, "2025", "☁️", "백그라운드 에이전트", 1.2e14, "dev", {}, "클라우드에서 24시간 돌아가는 에이전트. 초당 5회 자동 답변(탭).", { autoTap: 5 }),
  product("a_autonomy", 10, "20XX", "🌐", "완전 자율 운영 (팬픽)", 4e15, "service", {}, "회사 전체가 스스로 돌아간다. 초당 10회 자동 답변(탭).", { autoTap: 10 }),
  product("s_lunar", 10, "20XX", "🌙", "달 기지 미러 서버", 2e15, "service", { demand: 2 }, "지연 시간 1.3초. 달 토끼들도 질문한다."),
  product("s_galactic", 10, "20XX", "🌌", "은하 API", 6e15, "service", { reward: 2 }, "요금 단위: 1 크레딧 / 광년."),
];

export const UPGRADES: Upgrade[] = [...RESEARCH, ...PRODUCTS];
