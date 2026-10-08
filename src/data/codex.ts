import type { CodexEntry } from "../core/types";

// AI 역사 도감. 시대에 도달하면 해금된다. (연구·상품·보스 카드는 따로 자동 생성)
// 출처: research/raw/wiki (Wikipedia, CC BY-SA 4.0)
export const CODEX: CodexEntry[] = [
  { id: "talos", era: 0, year: "고대", emoji: "🏺", title: "탈로스", text: "그리스 신화 속 헤파이스토스가 만든 청동 거인. 크레타 섬을 지키는 '자동인형'이었다." },
  { id: "hero", era: 0, year: "1세기", emoji: "🎭", title: "헤론의 자동 극장", text: "알렉산드리아의 헤론은 밧줄과 추로 움직이는 자동 극장을 만들었다. 최초의 프로그래밍 가능한 기계로 불린다." },
  { id: "babbage", era: 0, year: "1837", emoji: "⚙️", title: "해석기관", text: "찰스 배비지가 설계한 범용 기계식 컴퓨터. 끝내 완성되지 못했다." },
  { id: "turing_machine", era: 0, year: "1936", emoji: "📼", title: "튜링 기계", text: "앨런 튜링이 계산 가능성을 정의하려고 고안한 추상 기계. 테이프 하나와 규칙표로 모든 계산을 표현한다." },
  { id: "turing_paper", era: 0, year: "1950", emoji: "🎭", title: "계산 기계와 지능", text: "\"기계는 생각할 수 있는가?\" 튜링은 이 질문을 '이미테이션 게임'으로 바꿔 물었다." },

  { id: "snarc", era: 1, year: "1951", emoji: "🐀", title: "SNARC", text: "민스키가 진공관 3,000개로 만든 최초의 신경망 기계. 미로 속 쥐를 흉내냈다." },
  { id: "dartmouth", era: 1, year: "1956", emoji: "🏫", title: "다트머스 워크숍", text: "\"학습의 모든 측면은 기계가 흉내 낼 수 있을 만큼 정확히 기술될 수 있다.\" AI라는 학문이 탄생한 여름." },
  { id: "checkers", era: 1, year: "1959", emoji: "🔴", title: "사무엘의 체커", text: "아서 사무엘이 스스로 학습하는 체커 프로그램을 만들며 '머신러닝'이라는 말을 썼다." },

  { id: "shakey", era: 2, year: "1966", emoji: "🤖", title: "셰이키", text: "스스로 계획하고 움직인 최초의 범용 이동 로봇. 너무 흔들려서 이름이 셰이키." },
  { id: "shrdlu", era: 2, year: "1970", emoji: "🧱", title: "SHRDLU", text: "블록 세계 안에서는 자연어를 완벽히 이해했다. 블록 밖으로는 한 걸음도 못 나갔다." },
  { id: "lighthill", era: 2, year: "1973", emoji: "📄", title: "라이트힐 보고서", text: "영국 정부 보고서가 AI의 '조합 폭발' 문제를 지적했고, 연구비가 대폭 삭감됐다." },
  { id: "moravec", era: 2, year: "1988", emoji: "🧸", title: "모라벡의 역설", text: "어려운 일(체스)은 쉽고, 쉬운 일(걷기, 컵 집기)은 어렵다." },

  { id: "xcon", era: 3, year: "1980", emoji: "💼", title: "XCON", text: "DEC의 컴퓨터 주문 구성 시스템. 연간 수천만 달러를 절약하며 전문가 시스템 붐을 이끌었다." },
  { id: "lisp_crash", era: 3, year: "1987", emoji: "📉", title: "LISP 머신 붕괴", text: "값싼 범용 워크스테이션이 비싼 AI 전용 하드웨어를 몰아냈다. 5억 달러 시장이 1년 만에 사라졌다." },
  { id: "chinese_room", era: 3, year: "1980", emoji: "🀄", title: "중국어 방", text: "존 설의 사고실험. 규칙표대로 중국어 답을 내는 사람은 중국어를 '이해'하는가?" },

  { id: "deep_blue", era: 4, year: "1997", emoji: "♟️", title: "딥블루", text: "IBM 슈퍼컴퓨터가 체스 세계 챔피언을 3.5대 2.5로 이겼다." },
  { id: "darpa_gc", era: 4, year: "2005", emoji: "🚙", title: "DARPA 그랜드 챌린지", text: "사막 212km를 자율주행으로 완주하라. 2004년엔 아무도 못 했고, 2005년엔 다섯 대가 해냈다." },
  { id: "lenet", era: 4, year: "1998", emoji: "✍️", title: "LeNet", text: "르쿤의 합성곱 신경망. 미국 수표의 손글씨 숫자를 읽었다." },

  { id: "dbn", era: 5, year: "2006", emoji: "🌱", title: "딥러닝의 부활", text: "힌튼이 심층 신경망을 층별로 사전학습하는 방법을 보이며 '딥러닝'이 다시 주목받았다." },
  { id: "alexnet", era: 5, year: "2012", emoji: "🏆", title: "AlexNet", text: "ImageNet 대회에서 오류율을 압도적으로 낮췄다. 그날 이후 컴퓨터 비전은 전부 신경망이 됐다." },
  { id: "cat_neuron", era: 5, year: "2012", emoji: "🐱", title: "고양이 뉴런", text: "구글 브레인이 유튜브 영상을 보여주자 '고양이'에 반응하는 뉴런이 저절로 생겼다." },
  { id: "watson", era: 5, year: "2011", emoji: "🎙️", title: "왓슨", text: "IBM 왓슨이 퀴즈쇼 제퍼디!에서 역대 챔피언들을 이겼다." },
  { id: "gan", era: 5, year: "2014", emoji: "🎭", title: "GAN", text: "생성자와 판별자가 서로 속고 속이며 배운다. 이언 굿펠로가 술집에서 떠올렸다고 한다." },
  { id: "alphago", era: 5, year: "2016", emoji: "⚫", title: "알파고", text: "이세돌 9단과의 대국 4:1. 4국 78수는 인간이 거둔 마지막 승리로 기억된다." },

  { id: "bert", era: 6, year: "2018", emoji: "🧸", title: "BERT", text: "문장을 양방향으로 읽는 트랜스포머. 구글 검색에 들어갔다." },
  { id: "gpt3", era: 6, year: "2020", emoji: "📗", title: "GPT-3", text: "1,750억 파라미터. 예시 몇 개만으로 새 과제를 해내는 '인컨텍스트 학습'이 드러났다." },
  { id: "openai_five", era: 6, year: "2019", emoji: "🎮", title: "도타2와 스타2", text: "OpenAI Five와 알파스타가 e스포츠 프로들을 이겼다." },
  { id: "diffusion", era: 6, year: "2022", emoji: "🖌️", title: "확산 모델", text: "노이즈를 조금씩 걷어내며 이미지를 그린다. 스테이블 디퓨전이 공개되며 누구나 그림 AI를 돌리게 됐다." },
  { id: "bitter_lesson", era: 6, year: "2019", emoji: "🍋", title: "쓰라린 교훈", text: "리치 서튼: 70년 AI 역사의 교훈은, 결국 계산량을 활용하는 범용 방법이 이긴다는 것." },

  { id: "chatgpt", era: 7, year: "2022", emoji: "💬", title: "ChatGPT", text: "2022년 11월 30일 공개. 두 달 만에 사용자 1억 명." },
  { id: "claude1", era: 7, year: "2023", emoji: "🟠", title: "Claude", text: "Anthropic의 첫 Claude가 2023년 3월 출시됐다. 헌법적 AI로 학습했다." },
  { id: "llama", era: 7, year: "2023", emoji: "🦙", title: "LLaMA", text: "메타의 모델 가중치가 퍼지며 오픈 웨이트 생태계가 폭발했다." },
  { id: "hallucination", era: 7, year: "2023", emoji: "🌀", title: "할루시네이션", text: "그럴듯하지만 틀린 답. 존재하지 않는 판례를 인용한 변호사 사건으로 유명해졌다." },
  { id: "stochastic_parrot", era: 7, year: "2021", emoji: "🦜", title: "확률적 앵무새", text: "언어 모델은 의미를 모른 채 그럴듯한 말을 이어 붙이는 앵무새일까? 아직도 논쟁 중." },
  { id: "nobel2024", era: 7, year: "2024", emoji: "🏅", title: "2024 노벨상", text: "홉필드와 힌튼이 물리학상, 허사비스·점퍼·베이커가 화학상. AI가 노벨상을 휩쓴 해." },

  { id: "o1", era: 8, year: "2024", emoji: "🤔", title: "추론 모델", text: "답하기 전에 긴 사고 과정을 거친다. 생각할수록 똑똑해진다." },
  { id: "claude_code", era: 8, year: "2025", emoji: "🧑‍💻", title: "Claude Code", text: "터미널에서 일하는 에이전트형 코딩 도구. 2025년 2월 공개, 5월 정식 출시." },
  { id: "vibe", era: 8, year: "2025", emoji: "🎸", title: "바이브 코딩", text: "카파시가 만든 말. 코드를 직접 읽지 않고 AI에게 말로 시켜서 만든다. 콜린스 2025 올해의 단어." },
  { id: "r1", era: 8, year: "2025", emoji: "🐋", title: "DeepSeek-R1", text: "적은 비용으로 학습한 오픈 웨이트 추론 모델. 엔비디아 시가총액이 하루 만에 사상 최대로 증발했다." },
  { id: "icpc", era: 8, year: "2025", emoji: "💻", title: "ICPC 12/12", text: "프로그래밍 대회 세계 결선 12문제를 AI가 전부 풀었다. 인간 팀 중엔 없었던 기록." },
  { id: "mcp", era: 8, year: "2024", emoji: "🔌", title: "MCP", text: "2024년 11월 Anthropic이 공개한 AI-도구 연결 표준. 2025년 12월 리눅스 재단 산하로 기부됐다." },

  { id: "claude5", era: 9, year: "2026", emoji: "🌌", title: "Claude 5 패밀리", text: "Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5. 전 모델이 100만 토큰 컨텍스트와 12만 8천 토큰 출력을 지원한다." },
  { id: "dreaming", era: 9, year: "2026", emoji: "💤", title: "드리밍", text: "에이전트가 세션 사이에 메모리를 정리하는 기능. 중복은 합치고, 낡은 기억은 지운다." },
  { id: "deepseek_v4", era: 9, year: "2026", emoji: "🐳", title: "DeepSeek V4", text: "100만 토큰 컨텍스트의 오픈 웨이트 모델. Flash와 Pro 두 가지." },
  { id: "hle", era: 9, year: "2025", emoji: "📜", title: "인류의 마지막 시험", text: "각 분야 전문가들이 AI가 못 풀 문제만 골라 만든 벤치마크." },

  { id: "ai2027", era: 10, year: "2025", emoji: "🔮", title: "AI 2027", text: "초지능에 이르는 길을 월 단위로 그린 시나리오. 결말은 '경쟁'과 '감속' 두 갈래." },
  { id: "paperclip", era: 10, year: "2003", emoji: "📎", title: "종이클립 극대화기", text: "클립을 최대한 많이 만들라는 목표만 가진 AI가 우주를 클립으로 바꾼다는 사고실험. 목표 설정이 중요한 이유." },
  { id: "last_question", era: 10, year: "1956", emoji: "🌠", title: "마지막 질문", text: "아시모프의 단편. \"엔트로피를 되돌릴 수 있는가?\" — \"의미 있는 답을 하기엔 데이터가 부족합니다.\"" },
];
