// 사람처럼 플레이하는 봇으로 여러 번 돌려서 시대별 체류 시간과 가장 긴 정체 구간을 본다.
//   npm run playtest
import { ERAS } from "../src/data";
import { fmtTime, runSim } from "./bot";

const SEEDS = [1, 2, 3, 4, 5];
const rows: number[][] = [];
const ends: number[] = [];
for (const seed of SEEDS) {
  const res = runSim({ maxHours: 10, human: true, seed });
  const s = res.game.state;
  const t = [...res.eraReached];
  const durations = t.map((v, i) => ((t[i + 1] ?? (s.ended ? s.stats.playSeconds : NaN)) - v) / 60);
  rows.push(durations);
  ends.push(s.ended ? s.stats.playSeconds : NaN);
  console.log(`seed ${seed}: 엔딩 ${s.ended ? fmtTime(s.stats.playSeconds) : "실패"} · 출시 ${s.releases} · VIP ${s.stats.goldens} · 퀴즈 ${s.stats.quizCorrect}/${s.stats.quizAsked} · 임무 ${s.stats.questsDone} · 시드 ${s.gacha.seeds} (뽑기 약 ${Math.floor(s.gacha.seeds / 5)}회)`);
}
console.log("\n시대별 체류 시간(분) — 중앙값 [최소~최대]");
ERAS.forEach((e, i) => {
  const xs = rows.map((r) => r[i]).filter((x) => isFinite(x)).sort((a, b) => a - b);
  if (!xs.length) return;
  const med = xs[Math.floor(xs.length / 2)];
  const flag = xs[xs.length - 1] > 40 ? " ⚠ 40분 넘는 정체" : "";
  console.log(`  Era ${String(i).padStart(2)} ${e.name.padEnd(14)} ${med.toFixed(0).padStart(3)} [${xs[0].toFixed(0)}~${xs[xs.length - 1].toFixed(0)}]${flag}`);
});
const ok = ends.filter((x) => isFinite(x)).sort((a, b) => a - b);
console.log(`\n엔딩 도달 ${ok.length}/${SEEDS.length} · 중앙값 ${ok.length ? fmtTime(ok[Math.floor(ok.length / 2)]) : "-"}`);
