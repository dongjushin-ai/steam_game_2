import { BUILDINGS, TIERS, UPGRADES } from "../data";
import type { Building, GameState, MultStat, Tier, Upgrade } from "./types";

/** 티어 보상(tiers.ts)에 곱하는 전역 배율. */
export const REWARD_SCALE = 100;
/**
 * 토큰 하나의 추론 비용 = (질문 보상 ÷ 질문 토큰 수) × PRICE_FRACTION × 단가 배수.
 * 그래서 순이익률 = (1 − 할루시네이션) − PRICE_FRACTION × 단가 배수 × 생각 토큰 배수.
 * 💸효율 연구와 생각 모드의 손익이 게임 끝까지 의미를 갖는다.
 */
export const PRICE_FRACTION = 0.35;
export const BASE_HALL = 0.3;
export const HALL_PER_TIER = 0.1;
export const THINK_TOKENS = 3;
export const THINK_HALL = 0.35;
export const CP_BONUS = 0.01;
export const OFFLINE_BASE = 0.5;
export const OFFLINE_CAP_SEC = 8 * 3600;

export const BUILDING_MAP: Record<string, Building> = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
export const UPGRADE_MAP: Record<string, Upgrade> = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export type Bottleneck = "demand" | "compute" | "power";

export interface Stats {
  mult: Record<MultStat, number>;
  cpMult: number;
  intel: number;
  ctx: number;
  tier: Tier;
  nextTier: Tier | null;
  powerCap: number;
  powerUse: number;
  powerEff: number;
  tps: number;
  demand: number;
  tokensPerQ: number;
  capacityQ: number;
  answered: number;
  hall: number;
  price: number;
  rewardPerQ: number;
  gross: number;
  cost: number;
  net: number;
  rpRate: number;
  bottleneck: Bottleneck;
}

const ALL_STATS: MultStat[] = [
  "tps", "intel", "hall", "price", "reward", "demand", "rp", "power", "powerUse", "cost", "tap", "offline", "think",
];

export function multipliers(state: GameState): Record<MultStat, number> {
  const m = Object.fromEntries(ALL_STATS.map((s) => [s, 1])) as Record<MultStat, number>;
  for (const id of state.upgrades) {
    const u = UPGRADE_MAP[id];
    if (u) for (const e of u.effects) m[e.stat] *= e.mul;
  }
  for (const a of state.active) for (const e of a.effects) m[e.stat] *= e.mul;
  return m;
}

/** 누적 수익에 따른 체크포인트 총량. 로그 곡선이라 인플레이션이 폭주하지 않는다. */
export function checkpointsFor(totalEarned: number): number {
  const mag = Math.log10(Math.max(1, totalEarned)) - 5;
  return mag > 0 ? Math.floor(10 * Math.pow(mag, 1.5)) : 0;
}

export function contextWindow(state: GameState): number {
  let ctx = 0;
  for (const id of state.upgrades) ctx = Math.max(ctx, UPGRADE_MAP[id]?.ctx ?? 0);
  return ctx;
}

export function computeStats(state: GameState): Stats {
  const mult = multipliers(state);
  const cpMult = 1 + CP_BONUS * state.checkpoints;

  let tpsRaw = 0, powerUseRaw = 0, powerRaw = 0, demandRaw = 0, rpRaw = 0, intel = 1;
  for (const [id, n] of Object.entries(state.buildings)) {
    const b = BUILDING_MAP[id];
    if (!b || n <= 0) continue;
    tpsRaw += (b.tps ?? 0) * n;
    powerUseRaw += (b.powerUse ?? 0) * n;
    powerRaw += (b.power ?? 0) * n;
    demandRaw += (b.demand ?? 0) * n;
    rpRaw += (b.rp ?? 0) * n;
    if (b.intelPerLevel) intel *= Math.pow(b.intelPerLevel, n);
  }
  intel *= mult.intel;

  const ctx = contextWindow(state);
  let tier = TIERS[0];
  for (const t of TIERS) if (intel >= t.intelReq && ctx >= t.ctxReq) tier = t;
  const nextTier = TIERS.find((t) => t.id === tier.id + 1) ?? null;

  const powerCap = powerRaw * mult.power;
  const powerUse = powerUseRaw * mult.powerUse;
  const powerEff = powerUse > 0 ? Math.min(1, powerCap / powerUse) : 1;
  const tps = tpsRaw * mult.tps * powerEff;

  const thinking = state.thinking;
  const tokensPerQ = tier.tokens * (thinking ? THINK_TOKENS * mult.think : 1);
  const demand = demandRaw * mult.demand;
  const capacityQ = tps / tokensPerQ;
  const answered = Math.min(demand, capacityQ);

  const hallBase = BASE_HALL * (1 + HALL_PER_TIER * (tier.id - 1));
  const hall = clamp(hallBase * mult.hall * (thinking ? THINK_HALL : 1), 0.005, 0.95);
  const rewardPerQ = tier.reward * REWARD_SCALE * mult.reward * cpMult;
  const price = (rewardPerQ / tier.tokens) * PRICE_FRACTION * mult.price;

  const gross = answered * (1 - hall) * rewardPerQ;
  const cost = answered * tokensPerQ * price;
  const net = gross - cost;

  let bottleneck: Bottleneck = demand < capacityQ ? "demand" : "compute";
  if (powerEff < 0.999 && bottleneck === "compute") bottleneck = "power";

  return {
    mult, cpMult, intel, ctx, tier, nextTier, powerCap, powerUse, powerEff, tps, demand, tokensPerQ,
    capacityQ, answered, hall, price, rewardPerQ, gross, cost, net,
    rpRate: rpRaw * mult.rp * cpMult, bottleneck,
  };
}

/** n개를 한 번에 살 때의 총 비용. */
export function buildingCost(state: GameState, b: Building, n = 1, costMult = multipliers(state).cost): number {
  const owned = state.buildings[b.id] ?? 0;
  const first = b.baseCost * Math.pow(b.growth, owned);
  return (first * (Math.pow(b.growth, n) - 1)) / (b.growth - 1) * costMult;
}

/** 지금 크레딧으로 살 수 있는 최대 개수. */
export function maxAffordable(state: GameState, b: Building, costMult = multipliers(state).cost): number {
  const owned = state.buildings[b.id] ?? 0;
  const first = b.baseCost * Math.pow(b.growth, owned) * costMult;
  if (state.credits < first) return 0;
  return Math.floor(Math.log((state.credits * (b.growth - 1)) / first + 1) / Math.log(b.growth));
}

export function bossDps(stats: Stats): number {
  return stats.tps * (1 - stats.hall);
}

export function tapValue(stats: Stats): number {
  return Math.max(stats.rewardPerQ, stats.net * 0.15) * stats.mult.tap;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
