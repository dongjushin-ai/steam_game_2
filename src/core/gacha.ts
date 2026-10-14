// 시드 뽑기: 플레이로만 버는 '시드'로 뽑기 전용 꾸미기를 뽑는다. 현금 결제는 없다.
// 확률은 화면에 그대로 공개한다. 40번 안에 전설 확정(천장), 10연차는 영웅 이상 1개 확정.
// 겹치면 조각이 되고, 조각으로 원하는 것을 바로 고를 수 있다 (운이 나빠도 언젠가는 다 모인다).
import { LOOKS, weekIndex, type LookItem, type Rarity } from "../data";

export const PULL_COST = 5;
/** 등급별 확률: 일반 · 희귀 · 영웅 · 전설 */
export const RATES = [0.6, 0.28, 0.1, 0.02] as const;
/** 이 횟수째 뽑기는 전설 확정 */
export const PITY = 40;
/** 겹쳤을 때 받는 조각 / 조각으로 바로 고를 때 값 */
export const SHARD_DUP = [1, 3, 8, 20] as const;
export const SHARD_PRICE = [5, 15, 40, 100] as const;
/** 픽업: 그 등급이 나왔을 때 이번 주 픽업이 나올 확률 */
export const PICKUP_SHARE = 0.5;

/** 시드 버는 곳 */
export const SEEDS = { quest: 1, golden: 1, bench: 3, boss: 5, firstBoss: 10, daily: 2 } as const;

/** 천장까지 넣은 실제 전설 확률 = 1 / (전설이 나올 때까지 평균 횟수) */
export function effectiveLegendary(): number {
  const q = 1 - RATES[3];
  return RATES[3] / (1 - q ** (PITY - 1));
}

export interface GachaState {
  seeds: number;
  shards: number;
  /** 마지막 전설 이후 뽑은 횟수 */
  pity: number;
  pulls: number;
  owned: string[];
}

export function newGacha(): GachaState {
  return { seeds: 0, shards: 0, pity: 0, pulls: 0, owned: [] };
}

export const POOL: LookItem[] = LOOKS.filter((x) => x.gacha);

/** 이번 주 픽업: 영웅·전설 중 하나가 주마다 돌아간다 */
export function pickupFor(date: Date): LookItem {
  const top = POOL.filter((x) => x.rarity >= 2);
  return top[weekIndex(date) % top.length];
}

export interface PullResult {
  item: LookItem;
  /** 이미 있던 것 → 조각으로 */
  dup: boolean;
  shards: number;
  pickup: boolean;
}

function rollRarity(rng: () => number, minRarity: Rarity = 0): Rarity {
  const w: number[] = RATES.map((r, i) => (i >= minRarity ? r : 0));
  let x = rng() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) {
    x -= w[i];
    if (x < 0) return i as Rarity;
  }
  return (w.length - 1) as Rarity;
}

function rollOne(g: GachaState, rng: () => number, pickup: LookItem, minRarity: Rarity = 0): PullResult {
  g.pity += 1;
  g.pulls += 1;
  const rarity: Rarity = g.pity >= PITY ? 3 : rollRarity(rng, minRarity);
  if (rarity === 3) g.pity = 0;
  const same = POOL.filter((x) => x.rarity === rarity);
  let item: LookItem;
  let isPickup = false;
  if (pickup.rarity === rarity && rng() < PICKUP_SHARE) {
    item = pickup;
    isPickup = true;
  } else {
    const rest = same.filter((x) => x.id !== pickup.id || pickup.rarity !== rarity);
    item = rest[Math.floor(rng() * rest.length)] ?? same[0];
  }
  const dup = g.owned.includes(item.id);
  const shards = dup ? SHARD_DUP[rarity] : 0;
  if (dup) g.shards += shards;
  else g.owned.push(item.id);
  return { item, dup, shards, pickup: isPickup };
}

/** n번 뽑는다 (시드가 모자라면 빈 배열). 10연차는 영웅 이상 1개 확정. */
export function pull(g: GachaState, n: 1 | 10, rng: () => number, date: Date): PullResult[] {
  const cost = PULL_COST * n;
  if (g.seeds < cost) return [];
  g.seeds -= cost;
  const pickup = pickupFor(date);
  const out: PullResult[] = [];
  for (let i = 0; i < n; i++) {
    const last = n === 10 && i === 9 && !out.some((r) => r.item.rarity >= 2);
    out.push(rollOne(g, rng, pickup, last ? 2 : 0));
  }
  return out;
}

/** 조각으로 원하는 뽑기 아이템을 바로 갖는다 */
export function exchange(g: GachaState, id: string): boolean {
  const item = POOL.find((x) => x.id === id);
  if (!item || g.owned.includes(id) || g.shards < SHARD_PRICE[item.rarity]) return false;
  g.shards -= SHARD_PRICE[item.rarity];
  g.owned.push(id);
  return true;
}

export function sanitizeGacha(raw: unknown): GachaState {
  const r = (raw ?? {}) as Partial<GachaState>;
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
  const ids = new Set(POOL.map((x) => x.id));
  return {
    seeds: n(r.seeds), shards: n(r.shards), pity: Math.min(PITY - 1, n(r.pity)), pulls: n(r.pulls),
    owned: Array.isArray(r.owned) ? [...new Set(r.owned.filter((x): x is string => typeof x === "string" && ids.has(x)))] : [],
  };
}
