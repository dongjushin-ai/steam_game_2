// 시대별 밸런스 배수 자동 보정 (시대 순서대로 한 단계씩).
// 시대 e를 보정할 때는 그 시대 보스를 이길 수 없게 만든 채 봇을 돌려서
//   (1) 첫 유닛 비용 ≈ 진입 30초 후 수익 × FIRST_UNIT_SECONDS
//   (2) 첫 연구 비용 ≈ 진입 30초 후 RP × FIRST_RESEARCH_SECONDS
//   (3) 보스 체력 ≈ 목표 시간 시점 DPS × 제한시간 × 0.9
// 가 되도록 맞춘다. 앞 시대가 고정된 뒤 다음 시대를 맞추므로 수렴한다.
//   npm run calibrate   → src/data/balance.ts 갱신 후 전체 시뮬레이션 결과 출력
import { writeFileSync } from "node:fs";
import { BUILDINGS, ERAS, UPGRADES, applyBalance } from "../src/data";
import { BALANCE, type Balance } from "../src/data/balance";
import { fmtTime, runSim } from "./bot";

/** 시대별 목표 체류 시간(분) — 봇 기준. 사람은 대략 두 배 걸린다. */
const TARGET_MIN = [3, 4, 6, 9, 11, 13, 15, 17, 19, 21, 24];
const FIRST_UNIT_SECONDS = 20;
const FIRST_RESEARCH_SECONDS = 30;
const INNER = 4;

const b: Balance = { cost: [...BALANCE.cost], rp: [...BALANCE.rp], bossHp: [...BALANCE.bossHp] };

for (let e = 0; e < ERAS.length; e++) {
  for (let i = 0; i < INNER; i++) {
    const saved = b.bossHp[e];
    b.bossHp[e] = Infinity;
    applyBalance(b);
    b.bossHp[e] = saved;
    const res = runSim({ maxHours: 12, release: false, stopAfter: { era: e, seconds: TARGET_MIN[e] * 60 } });
    const entry = res.eraReached[e];
    if (entry === undefined) {
      console.log(`Era ${e}: 도달 실패 (이전 시대에서 막힘)`);
      break;
    }
    const at = (arr: number[], t: number) => arr[Math.min(t, arr.length) - 1];
    const st = res.game.stats;
    if (st.intel < ERAS[e].boss.intelReq || st.ctx < ERAS[e].boss.ctxReq) {
      console.log(`  ⚠ Era ${e}: 목표 시간에 지능/컨텍스트 미달 (지능 ${st.intel.toExponential(2)} / 필요 ${ERAS[e].boss.intelReq})`);
    }
    b.bossHp[e] = at(res.dps, entry + TARGET_MIN[e] * 60) * ERAS[e].boss.time * 0.9;

    if (e > 0) {
      const net = at(res.net, entry + 30);
      const firstUnit = BUILDINGS.filter((x) => x.era === e && x.kind === "compute").sort((x, y) => x.baseCost - y.baseCost)[0];
      if (net > 0) b.cost[e] *= (net * FIRST_UNIT_SECONDS) / firstUnit.baseCost;
      const rpRate = res.game.stats.rpRate;
      const firstResearch = UPGRADES.filter((u) => u.era === e && u.currency === "rp").sort((x, y) => x.cost - y.cost)[0];
      if (rpRate > 0) b.rp[e] *= (rpRate * FIRST_RESEARCH_SECONDS) / firstResearch.cost;
    }
  }
  console.log(`Era ${e} cost×${b.cost[e].toPrecision(2)} rp×${b.rp[e].toPrecision(2)} hp=${b.bossHp[e].toExponential(1)}`);
}

const r2 = (x: number) => Number(x.toPrecision(2));
const fmt = (xs: number[]) => `[${xs.map(r2).join(", ")}]`;
writeFileSync(
  new URL("../src/data/balance.ts", import.meta.url),
  `// 시대별 밸런스 배수. scripts/calibrate.ts가 시뮬레이션으로 계산해서 덮어쓴다.
// cost: 해당 시대 건물·상품 크레딧 비용 배수 / rp: 연구 비용 배수 / bossHp: 보스 체력
export interface Balance {
  cost: number[];
  rp: number[];
  bossHp: number[];
}

export const BALANCE: Balance = {
  cost: ${fmt(b.cost)},
  rp: ${fmt(b.rp)},
  bossHp: ${fmt(b.bossHp)},
};
`,
);

applyBalance({ cost: b.cost.map(r2), rp: b.rp.map(r2), bossHp: b.bossHp.map(r2) });
for (const release of [false, true]) {
  const res = runSim({ maxHours: 12, release });
  const s = res.game.state;
  console.log(`\n${release ? "출시 사용" : "출시 없이"}: 엔딩 ${s.ended ? fmtTime(s.stats.playSeconds) : "실패"} · 시대 진입(분) ${res.eraReached.map((t) => Math.round(t / 60)).join(", ")}`);
}
