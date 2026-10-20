// 콘텐츠 데이터의 진입점. 원본 수치에 시대별 밸런스 배수(balance.ts)를 적용해서 내보낸다.
import { BALANCE, type Balance } from "./balance";
import { BUILDINGS } from "./buildings";
import { ERAS } from "./eras";
import { UPGRADES } from "./upgrades";

export { BUILDINGS, ERAS, UPGRADES };
export { TIERS } from "./tiers";
export { EVENTS } from "./events";
export { CODEX } from "./codex";
export { LOST, LOST_MAP } from "./lost";

const rawBuildingCost = new Map(BUILDINGS.map((b) => [b.id, b.baseCost]));
const rawUpgradeCost = new Map(UPGRADES.map((u) => [u.id, u.cost]));

export function applyBalance(b: Balance): void {
  for (const x of BUILDINGS) x.baseCost = rawBuildingCost.get(x.id)! * b.cost[x.era];
  for (const u of UPGRADES) u.cost = rawUpgradeCost.get(u.id)! * (u.currency === "rp" ? b.rp[u.era] : b.cost[u.era]);
  for (const e of ERAS) e.boss.hp = b.bossHp[e.id];
}

applyBalance(BALANCE);
export { GOLDENS } from "./golden";
export { QUIZ } from "./quiz";
export { NEWS } from "./news";
export { RIVALS } from "./rivals";
export { SIDE_BENCHES } from "./benchmarks";
export { MISSIONS, THREATS, baseMissionSlots } from "./missions";
export { WEEKLIES, weekIndex, weeklyFor, type Weekly } from "./weekly";
export { LOOKS, LOOK_MAP, type LookItem, type LookSlot, type Rarity } from "./looks";
export { BOARDS, SPANS, type Board, type BoardKind, type Span } from "./leaderboards";
