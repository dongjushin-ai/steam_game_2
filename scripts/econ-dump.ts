// 경제 보고서용 데이터: 사람형 봇 여러 판의 시대 도달 시각·분당 수입·처음 사는 건물 시각
//   npx tsx scripts/econ-dump.ts out.json
import { writeFileSync } from "fs";
import { ERAS } from "../src/data";
import { runSim } from "./bot";

process.env.HANDS_OFF ??= "0";
const runs = [1, 2, 3, 4, 5, 6, 7].map((seed) => {
  const ups: number[] = [];
  let lastUps = 0;
  const r = runSim({ maxHours: 3, human: true, seed, onSecond: (t, g) => { if (g.state.upgrades.length > lastUps) { ups.push(t); lastUps = g.state.upgrades.length; } } });
  const perMin = r.net.filter((_, i) => i % 60 === 0);
  return { seed, ended: r.game.state.ended, end: r.game.state.stats.playSeconds, eraReached: r.eraReached, netPerMin: perMin, upgradeTimes: ups };
});
writeFileSync(process.argv[2], JSON.stringify({ eras: ERAS.map((e) => e.name), runs }));
console.log(runs.map((r) => `seed ${r.seed}: ${r.ended ? Math.round(r.end / 60) + "분 엔딩" : "미완"}`).join(" · "));
