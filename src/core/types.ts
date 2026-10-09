// 게임 데이터(콘텐츠)와 세이브 상태의 타입 정의.

/** 업그레이드·이벤트가 건드릴 수 있는 배수형 스탯. */
export type MultStat =
  | "tps" // 처리량(토큰/초)
  | "intel" // 지능
  | "hall" // 할루시네이션 확률 배수 (낮을수록 좋음)
  | "price" // 토큰 단가 배수 (낮을수록 좋음)
  | "reward" // 답변 보상 배수
  | "demand" // 질문 유입량 배수
  | "rp" // 연구 포인트 생산 배수
  | "power" // 전력 공급 배수
  | "powerUse" // 전력 사용 배수 (낮을수록 좋음)
  | "cost" // 건물 구매 비용 배수 (낮을수록 좋음)
  | "tap" // 탭 보상 배수
  | "offline" // 오프라인 보상 배수
  | "think"; // 생각 모드 토큰 배수 (낮을수록 좋음)

export interface Effect {
  stat: MultStat;
  /** 곱해지는 값. 1.5 = +50%, 0.7 = −30% */
  mul: number;
}

export type Tab = "service" | "infra" | "research";

export type BuildingKind = "compute" | "power" | "demand" | "rp" | "param";

/** 여러 번 구매하는 건물/유닛. 비용은 baseCost × growth^level. */
export interface Building {
  id: string;
  kind: BuildingKind;
  name: string;
  emoji: string;
  era: number;
  baseCost: number;
  growth: number;
  /** compute: 토큰/초 */
  tps?: number;
  /** compute: 유닛당 전력 사용 */
  powerUse?: number;
  /** power: 유닛당 전력 공급 */
  power?: number;
  /** demand: 질문/초 */
  demand?: number;
  /** rp: 연구 포인트/초 */
  rp?: number;
  /** param: 레벨당 지능 배수 */
  intelPerLevel?: number;
  desc: string;
}

export type UpgradeCategory =
  | "arch"
  | "training"
  | "data"
  | "efficiency"
  | "memory"
  | "safety"
  | "hardware"
  | "tool"
  | "connector"
  | "dev"
  | "service";

/** 한 번만 구매하는 업그레이드. research 탭은 RP, service 탭은 크레딧으로 산다. */
export interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  era: number;
  year: string;
  currency: "credits" | "rp";
  cost: number;
  category: UpgradeCategory;
  effects: Effect[];
  /** 컨텍스트 창을 이 값으로 올림 */
  ctx?: number;
  /** 생각 모드 해금 */
  unlockThinking?: boolean;
  /** 초당 자동 답변(자동 탭) 횟수 */
  autoTap?: number;
  requires?: string[];
  desc: string;
}

export interface Tier {
  id: number;
  name: string;
  emoji: string;
  tokens: number;
  reward: number;
  intelReq: number;
  ctxReq: number;
  examples: string[];
}

export interface Boss {
  name: string;
  emoji: string;
  year: string;
  desc: string;
  intelReq: number;
  ctxReq: number;
  /** 정답 토큰 기준 체력 */
  hp: number;
  /** 제한 시간(초) */
  time: number;
  winText: string;
}

export interface Era {
  id: number;
  name: string;
  years: string;
  avatar: string;
  color: string;
  intro: string;
  aiLines: string[];
  /** 이 시대에 들어올 때 발동하는 AI 겨울 */
  winter?: string;
  boss: Boss;
}

export interface EventChoice {
  label: string;
  desc: string;
  effects: Effect[];
  duration: number;
  /** 즉시 보상: 현재 초당 수익 × N초 */
  incomeSeconds?: number;
  /** 즉시 보상: 연구 포인트 생산 × N초 */
  rpSeconds?: number;
}

export interface GameEvent {
  id: string;
  name: string;
  emoji: string;
  minEra: number;
  maxEra?: number;
  weight: number;
  year: string;
  desc: string;
  effects: Effect[];
  duration: number;
  incomeSeconds?: number;
  rpSeconds?: number;
  choices?: EventChoice[];
  /** 랜덤 풀에서 제외하고 스크립트로만 발동 */
  scripted?: boolean;
}

export interface CodexEntry {
  id: string;
  era: number;
  year: string;
  emoji: string;
  title: string;
  text: string;
}

export interface ActiveEffect {
  id: string;
  name: string;
  emoji: string;
  effects: Effect[];
  remaining: number;
}

export interface BossFight {
  era: number;
  dealt: number;
  remaining: number;
}

export type NumberFormat = "short" | "korean" | "sci";

export type GoldenKind = "investor" | "viral" | "reviewer" | "hackathon" | "eureka" | "jackpot";

/** 화면에 잠깐 나타나는 ⭐VIP 질문 */
export interface Golden {
  kind: GoldenKind;
  remaining: number;
  /** 화면상 세로 위치 (0~1) */
  y: number;
}

export type QuestKind = "answer" | "earn" | "buy" | "research" | "taps" | "think" | "golden" | "combo";

export interface Quest {
  id: number;
  kind: QuestKind;
  /** 시작 시점 카운터 값 */
  base: number;
  target: number;
  /** 보상: 수익 N초분 */
  incomeSeconds: number;
  /** 보상: RP N초분 */
  rpSeconds: number;
}

export interface QuizQuestion {
  id: string;
  era: number;
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface NewsItem {
  era: number;
  text: string;
}

export interface GameState {
  version: number;
  aiName: string;
  era: number;
  credits: number;
  rp: number;
  /** 이번 회차(모델 버전)에서 번 크레딧 */
  runEarned: number;
  /** 전체 누적 크레딧 */
  totalEarned: number;
  checkpoints: number;
  releases: number;
  buildings: Record<string, number>;
  upgrades: string[];
  thinking: boolean;
  active: ActiveEffect[];
  nextEventIn: number;
  pendingChoice: string | null;
  /** 진행 중인 퀴즈 id */
  pendingQuiz: string | null;
  golden: Golden | null;
  nextGoldenIn: number;
  quests: Quest[];
  questSeq: number;
  /** 연속 탭 콤보 */
  combo: number;
  lastTapAt: number;
  /** 맞힌 퀴즈 id */
  quizSolved: string[];
  /** 현재 시대에 들어온 시각(플레이 초) */
  eraStartedAt: number;
  /** 각 시대에 처음 들어온 시각(플레이 초) */
  eraTimes: number[];
  boss: BossFight | null;
  bossesBeaten: number[];
  achievements: string[];
  stats: {
    answered: number;
    hallucinations: number;
    taps: number;
    playSeconds: number;
    eventsSeen: number;
    goldens: number;
    quizCorrect: number;
    quizAsked: number;
    questsDone: number;
    maxCombo: number;
    bought: number;
    researched: number;
    thinkSeconds: number;
    /** 임무·퀴즈·VIP·이벤트로 한 번에 받은 보상 합계 ('크레딧 벌기' 임무에서 제외) */
    bonusEarned: number;
  };
  ended: boolean;
  settings: { format: NumberFormat; sound: boolean; vibrate: boolean; effects: boolean; hints: boolean; lang: "ko" | "en" };
  lastSaved: number;
}
