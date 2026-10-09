import type { QuizQuestion } from "../core/types";

// AI 역사 퀴즈. 이벤트 대신 가끔 나오며, 맞히면 보상. 출처: research/raw/wiki
export const QUIZ: QuizQuestion[] = [
  { id: "q_algorithm", era: 0, q: "'알고리즘'이라는 단어는 누구의 이름에서 왔을까?", options: ["알콰리즈미", "아리스토텔레스", "유클리드", "피타고라스"], answer: 0, explain: "9세기 페르시아 수학자 알콰리즈미의 라틴어 표기 'Algoritmi'에서 유래했다." },
  { id: "q_lovelace", era: 0, q: "최초의 컴퓨터 프로그램을 쓴 것으로 알려진 사람은?", options: ["찰스 배비지", "에이다 러브레이스", "앨런 튜링", "존 폰 노이만"], answer: 1, explain: "1843년 해석기관으로 베르누이 수를 계산하는 절차를 썼다." },
  { id: "q_turing_year", era: 0, q: "튜링이 '이미테이션 게임'을 제안한 논문은 몇 년에 나왔을까?", options: ["1936", "1943", "1950", "1956"], answer: 2, explain: "1950년 「Computing Machinery and Intelligence」." },
  { id: "q_neuron", era: 0, q: "1943년 인공 뉴런 모델을 제안한 두 사람은?", options: ["민스키와 패퍼트", "매컬럭과 피츠", "뉴얼과 사이먼", "힌튼과 르쿤"], answer: 1, explain: "워런 매컬럭과 월터 피츠가 뉴런을 논리 회로로 모델링했다." },

  { id: "q_dartmouth", era: 1, q: "'인공지능(AI)'이라는 용어가 처음 쓰인 행사는?", options: ["다트머스 워크숍", "메이시 회의", "NeurIPS", "튜링상 시상식"], answer: 0, explain: "1956년 다트머스 여름 워크숍 제안서에서 처음 쓰였다." },
  { id: "q_logic_theorist", era: 1, q: "'최초의 AI 프로그램'으로 불리는 것은?", options: ["ELIZA", "Logic Theorist", "SHRDLU", "MYCIN"], answer: 1, explain: "뉴얼·사이먼·쇼의 Logic Theorist는 『수학 원리』의 정리를 증명했다." },
  { id: "q_lisp", era: 1, q: "존 매카시가 만든 AI 언어는?", options: ["Prolog", "Fortran", "LISP", "Smalltalk"], answer: 2, explain: "1958년 LISP. 괄호가 아주 많다." },
  { id: "q_ml_term", era: 1, q: "체커 프로그램을 만들며 '머신러닝'이란 말을 쓴 사람은?", options: ["아서 사무엘", "클로드 섀넌", "노버트 위너", "마빈 민스키"], answer: 0, explain: "1959년 아서 사무엘." },

  { id: "q_eliza", era: 2, q: "ELIZA가 흉내 낸 직업은?", options: ["변호사", "심리 상담사", "기자", "교사"], answer: 1, explain: "로저스식 심리 상담사 흉내를 내는 DOCTOR 스크립트가 유명하다." },
  { id: "q_perceptron_xor", era: 2, q: "1969년 『퍼셉트론』이 지적한, 단층 퍼셉트론이 풀 수 없는 문제는?", options: ["AND", "OR", "XOR", "NOT"], answer: 2, explain: "XOR은 선형으로 분리할 수 없다. 이 지적이 신경망 연구를 얼렸다." },
  { id: "q_shakey", era: 2, q: "A* 탐색 알고리즘은 원래 무엇을 위해 만들어졌을까?", options: ["체스 엔진", "셰이키 로봇의 경로 계획", "검색 엔진", "자동 번역"], answer: 1, explain: "SRI의 셰이키 로봇 프로젝트에서 1968년에 나왔다." },
  { id: "q_lighthill", era: 2, q: "1차 AI 겨울의 계기가 된 영국 보고서는?", options: ["라이트힐 보고서", "앨비 보고서", "ALPAC 보고서", "튜링 보고서"], answer: 0, explain: "1973년 라이트힐 보고서가 AI의 성과를 혹평했다." },

  { id: "q_mycin", era: 3, q: "MYCIN이 진단한 분야는?", options: ["암", "혈액 감염", "골절", "심장병"], answer: 1, explain: "혈액 감염과 수막염 진단 및 항생제 추천." },
  { id: "q_xcon", era: 3, q: "XCON은 어느 회사의 주문 구성을 자동화했을까?", options: ["IBM", "DEC", "Apple", "Xerox"], answer: 1, explain: "디지털 이큅먼트 코퍼레이션(DEC)의 VAX 주문 구성." },
  { id: "q_backprop", era: 3, q: "1986년 역전파를 대중화한 논문의 저자가 아닌 사람은?", options: ["러멜하트", "힌튼", "윌리엄스", "르쿤"], answer: 3, explain: "러멜하트·힌튼·윌리엄스의 Nature 논문." },
  { id: "q_fifthgen", era: 3, q: "1982년 '5세대 컴퓨터' 국가 프로젝트를 시작한 나라는?", options: ["미국", "영국", "일본", "소련"], answer: 2, explain: "일본 통상산업성 주도 10년 프로젝트." },

  { id: "q_deepblue", era: 4, q: "딥블루가 체스 세계 챔피언을 이긴 해는?", options: ["1989", "1997", "2001", "2006"], answer: 1, explain: "1997년 재대결에서 3.5 대 2.5." },
  { id: "q_lstm", era: 4, q: "LSTM을 제안한 사람들은?", options: ["호크라이터와 슈미트후버", "벤지오와 굿펠로", "수츠케버와 비냘스", "바나우와 조경현"], answer: 0, explain: "1997년 제프 호크라이터와 위르겐 슈미트후버." },
  { id: "q_lenet", era: 4, q: "LeNet이 실제로 읽었던 것은?", options: ["번호판", "수표의 손글씨 숫자", "얼굴", "바코드"], answer: 1, explain: "미국 은행 수표의 손글씨 숫자를 인식했다." },
  { id: "q_tdgammon", era: 4, q: "TD-Gammon이 스스로 학습한 게임은?", options: ["바둑", "체커", "백개먼", "포커"], answer: 2, explain: "자가 대국 강화학습으로 세계 정상급 백개먼 실력에 도달했다." },

  { id: "q_alexnet_gpu", era: 5, q: "AlexNet은 GPU 몇 장으로 학습했을까?", options: ["1장", "2장", "8장", "1,000장"], answer: 1, explain: "GTX 580 두 장." },
  { id: "q_imagenet", era: 5, q: "ImageNet 프로젝트를 이끈 사람은?", options: ["페이페이 리", "앤드루 응", "얀 르쿤", "데미스 허사비스"], answer: 0, explain: "페이페이 리가 1,400만 장 규모 데이터셋을 만들었다." },
  { id: "q_alphago", era: 5, q: "알파고와 이세돌의 대국 최종 스코어는?", options: ["5:0", "4:1", "3:2", "1:4"], answer: 1, explain: "알파고 4승, 이세돌 1승(4국 78수)." },
  { id: "q_word2vec", era: 5, q: "word2vec의 유명한 예시: 왕 − 남자 + 여자 = ?", options: ["공주", "여왕", "왕비", "여자"], answer: 1, explain: "단어 벡터의 산술로 의미 관계를 표현한다." },
  { id: "q_gan", era: 5, q: "GAN을 처음 제안한 사람은?", options: ["이언 굿펠로", "얀 르쿤", "앤드레이 카파시", "일리야 수츠케버"], answer: 0, explain: "2014년 이언 굿펠로 등." },

  { id: "q_attention", era: 6, q: "트랜스포머를 발표한 논문 제목은?", options: ["Deep Residual Learning", "Attention Is All You Need", "Language Models are Few-Shot Learners", "BERT"], answer: 1, explain: "2017년 구글 연구진." },
  { id: "q_gpt3", era: 6, q: "GPT-3의 파라미터 수는?", options: ["15억", "175억", "1,750억", "1조"], answer: 2, explain: "1,750억(175B)." },
  { id: "q_gpt2", era: 6, q: "GPT-2가 처음에 전면 공개되지 않은 이유는?", options: ["너무 커서", "오용 우려", "버그", "저작권"], answer: 1, explain: "가짜 뉴스 등 오용 우려로 단계적으로 공개했다." },
  { id: "q_chinchilla", era: 6, q: "친칠라 연구의 핵심 결론은?", options: ["모델만 키워라", "데이터도 모델만큼 키워라", "작은 모델이 최고다", "학습을 일찍 멈춰라"], answer: 1, explain: "같은 컴퓨트라면 파라미터와 학습 토큰을 비슷한 비율로 늘리는 게 최적." },
  { id: "q_alphafold", era: 6, q: "AlphaFold 연구로 2024년 노벨 화학상을 받은 사람은?", options: ["힌튼", "허사비스와 점퍼", "르쿤", "수츠케버"], answer: 1, explain: "데미스 허사비스, 존 점퍼(그리고 단백질 설계의 데이비드 베이커)." },

  { id: "q_chatgpt_users", era: 7, q: "ChatGPT가 사용자 100만 명을 모으는 데 걸린 시간은?", options: ["5일", "1개월", "6개월", "1년"], answer: 0, explain: "공개 5일 만에 100만 명." },
  { id: "q_claude1", era: 7, q: "첫 Claude가 출시된 해는?", options: ["2021", "2022", "2023", "2024"], answer: 2, explain: "2023년 3월." },
  { id: "q_rlhf", era: 7, q: "RLHF의 'HF'는 무엇의 약자일까?", options: ["High Frequency", "Human Feedback", "Hugging Face", "Hidden Features"], answer: 1, explain: "Reinforcement Learning from Human Feedback." },
  { id: "q_lora", era: 7, q: "LoRA가 파인튜닝을 싸게 만드는 방법은?", options: ["가중치를 지운다", "저랭크 행렬만 학습한다", "데이터를 줄인다", "GPU를 끈다"], answer: 1, explain: "기존 가중치는 얼리고 작은 저랭크 어댑터만 학습한다." },
  { id: "q_moe", era: 7, q: "MoE(전문가 혼합)의 장점은?", options: ["모든 파라미터를 항상 쓴다", "토큰마다 일부 전문가만 계산한다", "학습이 필요 없다", "메모리를 안 쓴다"], answer: 1, explain: "파라미터 총량은 크지만 토큰당 계산은 일부만." },
  { id: "q_weekend", era: 7, q: "2023년 11월 OpenAI CEO 해임 사태는 며칠 만에 복귀로 끝났을까?", options: ["하루", "5일", "한 달", "1년"], answer: 1, explain: "약 5일 만에 복귀했다." },

  { id: "q_mcp", era: 8, q: "MCP는 무엇의 약자일까?", options: ["Multi Compute Protocol", "Model Context Protocol", "Machine Control Program", "Memory Cache Pool"], answer: 1, explain: "2024년 11월 Anthropic이 공개한 Model Context Protocol." },
  { id: "q_vibe", era: 8, q: "'바이브 코딩'이라는 말을 만든 사람은?", options: ["샘 올트먼", "앤드레이 카파시", "다리오 아모데이", "젠슨 황"], answer: 1, explain: "2025년 2월 카파시의 트윗. 그해 콜린스 올해의 단어." },
  { id: "q_r1", era: 8, q: "DeepSeek-R1 공개 후 하루 만에 시가총액이 크게 빠진 회사는?", options: ["애플", "엔비디아", "구글", "테슬라"], answer: 1, explain: "엔비디아가 하루 17% 가까이 떨어졌다." },
  { id: "q_claude_code", era: 8, q: "Claude Code는 어디서 쓰는 도구로 처음 나왔을까?", options: ["엑셀", "터미널", "포토샵", "스마트워치"], answer: 1, explain: "2025년 2월 공개된 터미널용 에이전트형 코딩 도구." },
  { id: "q_imo", era: 8, q: "2025년 AI가 IMO에서 받은 점수 수준은?", options: ["동메달", "은메달", "금메달", "참가상"], answer: 2, explain: "6문제 중 5문제를 풀어 금메달 수준." },

  { id: "q_ctx2026", era: 9, q: "2026년 Claude 5 패밀리의 기본 컨텍스트 창 크기는?", options: ["128K", "200K", "1M", "10M"], answer: 2, explain: "Fable·Opus·Sonnet·Haiku 모두 100만 토큰." },
  { id: "q_dreaming", era: 9, q: "2026년 'Dreaming' 기능이 하는 일은?", options: ["이미지 생성", "세션 사이 에이전트 메모리 정리", "음성 합성", "수면 측정"], answer: 1, explain: "중복된 기억은 합치고 낡은 기억은 지운다." },
  { id: "q_hbm", era: 9, q: "HBM은 무엇의 약자일까?", options: ["High Bandwidth Memory", "Hyper Binary Machine", "Hybrid Bus Module", "Heavy Batch Mode"], answer: 0, explain: "GPU 옆에 쌓아 올린 고대역폭 메모리." },

  { id: "q_last_question", era: 10, q: "아시모프 「마지막 질문」에서 반복되는 질문은?", options: ["신은 존재하는가?", "엔트로피를 되돌릴 수 있는가?", "의식이란 무엇인가?", "P는 NP인가?"], answer: 1, explain: "\"의미 있는 답을 하기엔 데이터가 부족합니다.\"" },
  { id: "q_bitter", era: 10, q: "리치 서튼의 '쓰라린 교훈'의 요지는?", options: ["사람의 지식이 최고다", "계산량을 쓰는 범용 방법이 결국 이긴다", "AI는 불가능하다", "데이터는 필요 없다"], answer: 1, explain: "검색과 학습처럼 컴퓨트에 따라 확장되는 방법이 이긴다." },
  { id: "q_mnist", era: 4, q: "MNIST 데이터셋에 들어 있는 것은?", options: ["손글씨 숫자", "고양이 사진", "영화 리뷰", "체스 기보"], answer: 0, explain: "학습용 6만 장 + 테스트용 1만 장, 28×28 흑백 이미지." },
  { id: "q_winograd", era: 6, q: "위노그라드 스키마가 시험하는 능력은?", options: ["상식으로 대명사가 가리키는 대상 맞히기", "번역 속도", "이미지 분류", "음성 인식"], answer: 0, explain: "\"트로피가 가방에 안 들어간다. 그것이 너무 커서.\" 그것은 트로피." },
  { id: "q_mmlu", era: 7, q: "MMLU가 다루는 과목 수는?", options: ["9", "57", "100", "1,000"], answer: 1, explain: "수학·법·의학·역사 등 57개 과목 객관식." },
  { id: "q_humaneval", era: 7, q: "HumanEval에 들어 있는 파이썬 문제 수는?", options: ["12", "57", "164", "2,294"], answer: 2, explain: "2021년 Codex 논문과 함께 공개됐다. 2,294는 SWE-bench의 문제 수." },
  { id: "q_injection", era: 8, q: "문서 속에 숨긴 지시로 AI 에이전트를 조종하는 공격은?", options: ["SQL 인젝션", "프롬프트 인젝션", "그래디언트 소실", "과적합"], answer: 1, explain: "이름은 SQL 인젝션에서 따왔다." },
];
