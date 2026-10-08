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
  boss: BossFight | null;
  bossesBeaten: number[];
  achievements: string[];
  stats: {
    answered: number;
    hallucinations: number;
    taps: number;
    playSeconds: number;
    eventsSeen: number;
  };
  ended: boolean;
  settings: { format: NumberFormat };
  lastSaved: number;
}
