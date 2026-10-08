// 밸런스 시뮬레이터: 봇이 처음부터 엔딩까지 플레이하고 시대별 도달 시간을 출력한다.
//   npm run sim                 # 30분마다 로그
//   LOG_EVERY=300 npm run sim   # 5분마다 로그
//   npm run sim -- --quiet      # 요약만 (엔딩을 못 보면 exit 1)
import { ERAS } from "../src/data";
import { fmtTime, runSim } from "./bot";

const quiet = process.argv.includes("--quiet");
const res = runSim({
  maxHours: Number(process.env.HOURS ?? 30),
  tapsPerSec: Number(process.env.TAPS ?? 1),
  logEvery: quiet ? 0 : Number(process.env.LOG_EVERY ?? 1800),
});
for (const line of res.log) console.log(line);

const s = res.game.state;
console.log("\n시대 도달 시간:");
res.eraReached.forEach((t, i) => {
  const prev = i > 0 ? res.eraReached[i - 1] : 0;
  console.log(`  Era ${String(i).padStart(2)} ${ERAS[i].name.padEnd(14)} ${fmtTime(t)}  (+${Math.round((t - prev) / 60)}분)`);
});
console.log(`엔딩: ${s.ended ? fmtTime(s.stats.playSeconds) : "도달 못 함"} · 출시 ${s.releases}회 · 체크포인트 ${s.checkpoints}`);
if (!s.ended && quiet) process.exit(1);
