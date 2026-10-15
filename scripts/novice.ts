// 초보 봇: 화면 안내('다음 할 일' 칩 + 추천 줄)만 따라 한다. 가설 H3 측정용 (docs/PRODUCT.md).
//   npm run novice               # 3시간까지, 시대 도달 시각과 가장 긴 멈춤
//   npm run novice -- --quiet    # 요약만 (시대 3을 15분 안에 못 가면 exit 1)
// 브라우저 초보 봇(5초마다 칩을 누르고 추천 줄만 산다)과 같은 규칙을 코어에서 빠르게 돌린다.
import { BUILDINGS, ERAS, UPGRADES } from "../src/data";
import { Game, newState } from "../src/core/game";
import { buildingCost, computeStats } from "../src/core/formulas";
import { nextHint } from "../src/core/guide";
import type { GameState } from "../src/core/types";
import { fmtTime } from "./bot";

const quiet = process.argv.includes("--quiet");
const HOURS = Number(process.env.HOURS ?? 3);
let seed = 7;
const rng = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const game: Game = new Game(newState("novice"), rng, () => game.state.stats.playSeconds * 1000);
game.onNotice((n) => {
  if (n.kind === "choice") game.choose(0);
  if (n.kind === "quiz") game.answerQuiz(rng() < 0.5 ? n.quiz.answer : (n.quiz.answer + 1) % n.quiz.options.length);
});

const TAB_KINDS: Record<string, string[]> = { service: ["demand"], infra: ["compute", "power"], research: [], bench: [] };
const clone = (s: GameState): GameState => ({ ...s, buildings: { ...s.buildings }, upgrades: [...s.upgrades] });

/** 화면의 '추천' 줄: 안내가 가리키는 줄, 없으면 그 탭에서 비용 대비 순이익이 가장 큰 건물 (panels.ts recommended와 같은 규칙) */
function recoOnTab(tab: string, target?: string): string | null {
  if (target) return target;
  const s = game.state;
  let best: string | null = null, bestRatio = 0;
  for (const b of BUILDINGS) {
    if (!TAB_KINDS[tab]?.includes(b.kind) || !game.isBuildingUnlocked(b.id)) continue;
    const next = clone(s);
    next.buildings[b.id] = (next.buildings[b.id] ?? 0) + 1;
    const ratio = (computeStats(next).net - game.stats.net) / buildingCost(s, b);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = b.id;
    }
  }
  return best;
}

const eraAt: number[] = [0];
let lastProgress = 0, longest = { secs: 0, at: 0, hint: "" }, stalled = 0;
const hintTime = new Map<string, number>();
for (let t = 1; t <= HOURS * 3600; t++) {
  const s = game.state;
  // 평소엔 1초에 2번, 보스전엔 '쉬지 말고 탭하세요'라서 6번
  const taps = s.boss ? 6 : 2;
  for (let i = 0; i < taps; i++) game.tap();
  game.tick(1);
  if (s.era >= eraAt.length) {
    eraAt.push(t);
    lastProgress = t;
  }
  if (s.ended) break;
  if (t % 5) continue;
  const hint = nextHint(game);
  const key = hint ? hint.text.replace(/[\d.,]+[KMBTe+]*/g, "#") : "(없음)";
  hintTime.set(key, (hintTime.get(key) ?? 0) + 5);
  let acted = false;
  if (hint?.tab === "bench" && game.startBoss()) acted = true;
  // 연구 탭의 '연구 가능' 타일
  if (!acted && hint?.tab === "research") {
    const u = UPGRADES.filter((x) => x.currency === "rp" && game.canBuyUpgrade(x.id)).sort((a, b) => a.cost - b.cost)[0];
    if (u && game.buyUpgrade(u.id)) acted = true;
  }
  // 서비스 탭의 표시된 제품 칸
  if (!acted && hint?.upgrade && game.buyUpgrade(hint.upgrade)) acted = true;
  if (!acted && hint) {
    const id = recoOnTab(hint.tab, hint.target);
    if (id && game.buyBuilding(id, 1)) {
      acted = true;
      for (let k = 0; k < 4 && game.buyBuilding(id, 1); k++);
    }
  }
  if (!s.settings.tutorialDone && s.stats.bought > 0) s.settings.tutorialDone = true;
  if (acted) {
    if (t - lastProgress > longest.secs) longest = { secs: t - lastProgress, at: lastProgress, hint: key };
    lastProgress = t;
  } else stalled += 5;
}
const end = Math.min(game.state.stats.playSeconds, HOURS * 3600);
if (end - lastProgress > longest.secs) longest = { secs: end - lastProgress, at: lastProgress, hint: "(끝까지)" };

const era3 = eraAt[3];
if (!quiet) {
  console.log("초보 봇 (안내만 따라 함) 시대 도달:");
  eraAt.forEach((t, i) => console.log(`  Era ${String(i).padStart(2)} ${ERAS[i].name.padEnd(14)} ${fmtTime(t)}`));
  console.log("가장 오래 본 안내:");
  for (const [k, v] of [...hintTime].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${String(Math.round(v / 60)).padStart(4)}분  ${k}`);
}
console.log(`초보 봇: 엔딩 ${game.state.ended ? fmtTime(game.state.stats.playSeconds) : "못 봄"} · 시대 ${game.state.era} · 시대 3 ${era3 ? fmtTime(era3) : "못 감"} · 아무것도 못 한 시간 ${Math.round((stalled / Math.max(1, end)) * 100)}% · 가장 긴 멈춤 ${Math.round(longest.secs / 60)}분 (${fmtTime(longest.at)}, ${longest.hint})`);
if (quiet && (!era3 || era3 > 15 * 60)) process.exit(1);
if (process.env.DEBUG_END) {
  const st = game.stats, s = game.state, boss = ERAS[s.era].boss;
  console.log({ credits: s.credits.toExponential(2), net: st.net.toExponential(2), powerCap: st.powerCap.toExponential(2), powerUse: st.powerUse.toExponential(2), eff: st.powerEff, intel: st.intel, intelReq: boss.intelReq, ctx: st.ctx, ctxReq: boss.ctxReq, bn: st.bottleneck, releaseGain: game.releaseGain(),
    power: BUILDINGS.filter((b) => b.kind === "power" && game.isBuildingUnlocked(b.id)).map((b) => `${b.id}:${s.buildings[b.id] ?? 0}@${buildingCost(s, b).toExponential(1)}`),
    compute: BUILDINGS.filter((b) => b.kind === "compute" && game.isBuildingUnlocked(b.id)).map((b) => `${b.id}:${s.buildings[b.id] ?? 0}@${buildingCost(s, b).toExponential(1)}`) });
}
