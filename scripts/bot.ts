// 탐욕적인 자동 플레이 봇. 밸런스 시뮬레이션(sim.ts)과 보정(calibrate.ts)에서 같이 쓴다.
import { BUILDINGS, ERAS, UPGRADES } from "../src/data";
import { Game, newState } from "../src/core/game";
import { ENDLESS_TIME, bossDps, buildingCost, computeStats, endlessHp } from "../src/core/formulas";
import type { GameState } from "../src/core/types";

export interface SimResult {
  game: Game;
  /** 시대별 도달 시각(초) */
  eraReached: number[];
  /** 시대 진입 시점의 순수익/초, RP/초 */
  entryNet: number[];
  entryRp: number[];
  /** 매 초 보스 DPS (현재 시대 기준) */
  dps: number[];
  net: number[];
  rpRate: number[];
  dpsEra: number[];
  log: string[];
}

export interface SimOptions {
  maxHours?: number;
  tapsPerSec?: number;
  logEvery?: number;
  seed?: number;
  /** 엔딩 뒤에도 이만큼(초) 더 플레이한다 (특이점 너머 측정용) */
  afterEnding?: number;
  /** false면 새 모델 출시(프레스티지)를 하지 않는다 */
  release?: boolean;
  /**
   * true면 사람처럼 플레이한다: 4초마다 판단, 40%는 최적이 아닌 아무거나 구매,
   * 처음 15분은 빠르게 탭하다가 이후 느슨하게, VIP 질문 60%만 잡음, 퀴즈 60% 정답.
   */
  human?: boolean;
  /** 이 시대에 진입하고 이 초만큼 지나면 멈춘다 (보정용) */
  stopAfter?: { era: number; seconds: number };
}

const fmtTime = (s: number) => `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
export { fmtTime };

export function runSim(opts: SimOptions = {}): SimResult {
  const { maxHours = 30, tapsPerSec = 1, logEvery = 0, release = true, human = false } = opts;
  let seed = opts.seed ?? 42;
  const rng = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

  // 파견 임무의 '실제 시간'은 게임 시간으로 대신한다
  const game: Game = new Game(newState("sim"), rng, () => game.state.stats.playSeconds * 1000);
  game.onNotice((n) => {
    if (n.kind === "choice") game.choose(human ? Math.floor(rng() * 2) : 0);
    // 퀴즈는 봇 50%, 사람 60% 정답으로 가정
    if (n.kind === "quiz") game.answerQuiz(rng() < (human ? 0.6 : 0.5) ? n.quiz.answer : (n.quiz.answer + 1) % n.quiz.options.length);
    if (n.kind === "golden") catchGolden = human && rng() < 0.6;
    // 탈옥 말풍선: 봇은 다 막고, 사람은 70%만 막는다
    if (n.kind === "threat") catchThreat = !human || rng() < 0.7;
  });
  let catchGolden = false;
  let endedAt: number | undefined;
  let catchThreat = false;
  const res: SimResult = { game, eraReached: [0], entryNet: [0], entryRp: [0], dps: [], net: [], rpRate: [], dpsEra: [], log: [] };
  const param = BUILDINGS.find((b) => b.kind === "param")!;

  const clone = (s: GameState): GameState => ({ ...s, buildings: { ...s.buildings }, upgrades: [...s.upgrades] });
  const gainOf = (kind: "b" | "u", id: string): number => {
    const s = clone(game.state);
    if (kind === "b") s.buildings[id] = (s.buildings[id] ?? 0) + 1;
    else s.upgrades.push(id);
    return computeStats(s).net - game.stats.net;
  };

  const step = () => {
    const s = game.state;
    const st = game.stats;

    const research = UPGRADES.filter((u) => u.currency === "rp" && game.canBuyUpgrade(u.id)).sort((a, b) => a.cost - b.cost);
    for (const u of research) game.buyUpgrade(u.id);

    const boss = ERAS[s.era].boss;
    const needIntel = st.intel < boss.intelReq || (st.nextTier && st.ctx >= st.nextTier.ctxReq);
    if (needIntel && buildingCost(s, param) <= s.credits * 0.5) game.buyBuilding(param.id);

    for (const b of BUILDINGS) {
      if (b.kind === "rp" && game.isBuildingUnlocked(b.id) && buildingCost(s, b) <= s.credits * 0.2) game.buyBuilding(b.id);
    }

    let best: { kind: "b" | "u"; id: string; cost: number; ratio: number } | null = null;
    const affordable: { kind: "b" | "u"; id: string }[] = [];
    for (const b of BUILDINGS) {
      if (b.kind === "rp" || b.kind === "param" || !game.isBuildingUnlocked(b.id)) continue;
      const cost = buildingCost(s, b);
      if (cost <= s.credits) affordable.push({ kind: "b", id: b.id });
      const ratio = gainOf("b", b.id) / cost;
      if (!best || ratio > best.ratio) best = { kind: "b", id: b.id, cost, ratio };
    }
    for (const u of UPGRADES) {
      if (u.currency !== "credits" || s.upgrades.includes(u.id) || u.era > s.era) continue;
      if (u.requires && !u.requires.every((r) => s.upgrades.includes(r))) continue;
      if (u.cost <= s.credits) affordable.push({ kind: "u", id: u.id });
      const ratio = Math.max(gainOf("u", u.id), st.net * 0.05) / u.cost;
      if (!best || ratio > best.ratio) best = { kind: "u", id: u.id, cost: u.cost, ratio };
    }
    if (human && affordable.length && rng() < 0.4) {
      const pick = affordable[Math.floor(rng() * affordable.length)];
      if (pick.kind === "b") game.buyBuilding(pick.id);
      else game.buyUpgrade(pick.id);
    } else if (best && best.cost <= s.credits) {
      if (best.kind === "b") game.buyBuilding(best.id);
      else game.buyUpgrade(best.id);
    }

    if (game.hasThinking()) {
      const alt = clone(s);
      alt.thinking = !s.thinking;
      if (computeStats(alt).net > game.stats.net) game.toggleThinking();
    }

    if (!s.boss && game.bossReady().ok && bossDps(game.stats) * boss.time * 1.05 >= boss.hp) game.startBoss();
    // 특이점 너머: 이길 만큼 컸으면 다음 단계 (사람은 탭으로 보탬)
    if (s.ended && !s.boss && game.endlessReady().ok && bossDps(game.stats) * ENDLESS_TIME * (human ? 2.5 : 1.05) >= endlessHp(s.endless.level + 1)) game.startEndless();

    // 사이드 벤치마크: 확실히 이길 때만
    if (!s.boss && !s.sideFight) {
      const sb = game.sideBenches().find((b) => game.sideBenchReady(b.id).ok && bossDps(game.stats) * b.time * 1.05 >= game.benchHp(b));
      if (sb) game.startSideBench(sb.id);
    }
    // 파견: 빈 슬롯이 있으면 최신 임무부터 (사람은 가끔 잊는다)
    if (!human || rng() < 0.3) {
      for (const m of [...game.availableMissions()].reverse()) if (game.canStartMission(m.id)) game.startMission(m.id);
    }

    // 사람처럼: 수익이 2분 동안 15% 넘게 안 늘고 보스도 못 깰 때만 출시
    const gain = game.releaseGain();
    const t = res.net.length;
    const stuck = t > 120 && game.stats.net < res.net[t - 120] * 1.15 && !game.bossReady().ok;
    const ready = game.bossReady().ok && bossDps(game.stats) * boss.time * 1.05 >= boss.hp;
    if (release && !s.boss && !ready && stuck && gain >= Math.max(5, s.checkpoints * 0.25)) game.release();
  };

  for (let t = 1; t <= maxHours * 3600; t++) {
    const taps = human ? (t < 900 ? 2 : rng() < 0.4 ? 1 : 0) : tapsPerSec;
    for (let i = 0; i < taps; i++) game.tap();
    game.tick(1);
    if (catchGolden && game.state.golden && game.state.golden.remaining < 9) {
      game.claimGolden();
      catchGolden = false;
    }
    if (catchThreat && game.state.threat && game.state.threat.remaining < 7) {
      game.blockThreat();
      catchThreat = false;
    }
    if (!human || t % 4 === 0) step();
    const s = game.state;
    if (s.era >= res.eraReached.length) {
      res.eraReached.push(t);
      res.entryNet.push(game.stats.net);
      res.entryRp.push(game.stats.rpRate);
    }
    res.dps.push(bossDps(game.stats));
    res.net.push(game.stats.net);
    res.rpRate.push(game.stats.rpRate);
    res.dpsEra.push(s.era);
    if (logEvery && t % logEvery === 0) {
      const st = game.stats;
      res.log.push(
        `${fmtTime(t)} era=${s.era} cr=${s.credits.toExponential(2)} net=${st.net.toExponential(2)}/s rp=${s.rp.toExponential(1)} ` +
        `tier=${st.tier.id} intel=${st.intel.toExponential(2)} ctx=${st.ctx} tps=${st.tps.toExponential(2)} ` +
        `pow=${st.powerEff.toFixed(2)} bn=${st.bottleneck} hall=${st.hall.toFixed(3)} cp=${s.checkpoints} rel=${s.releases}` +
        (s.boss ? " [BOSS]" : ""),
      );
    }
    if (s.ended) {
      endedAt ??= t;
      if (!opts.afterEnding || t >= endedAt + opts.afterEnding) break;
    }
    const stop = opts.stopAfter;
    if (stop && res.eraReached[stop.era] !== undefined && t >= res.eraReached[stop.era] + stop.seconds) break;
    if (stop && s.era > stop.era) break;
  }
  return res;
}
