import { ERAS, EVENTS } from "../data";
import { ACHIEVEMENTS } from "./achievements";
import {
  BUILDING_MAP, OFFLINE_BASE, OFFLINE_CAP_SEC, UPGRADE_MAP, bossDps, buildingCost, checkpointsFor,
  computeStats, maxAffordable, tapValue, type Stats,
} from "./formulas";
import type { EventChoice, GameEvent, GameState } from "./types";

export const SAVE_VERSION = 1;
const START_KIT: Record<string, number> = { c_diff: 1, p_dorm: 1, d_neighbors: 1 };

export type GameNotice =
  | { kind: "event"; event: GameEvent }
  | { kind: "choice"; event: GameEvent }
  | { kind: "era"; era: number }
  | { kind: "bossWin"; era: number }
  | { kind: "bossLose"; era: number }
  | { kind: "achievement"; id: string }
  | { kind: "ending" };

export function newState(aiName = "나의 AI"): GameState {
  return {
    version: SAVE_VERSION,
    aiName,
    era: 0,
    credits: 0,
    rp: 0,
    runEarned: 0,
    totalEarned: 0,
    checkpoints: 0,
    releases: 0,
    buildings: { ...START_KIT },
    upgrades: [],
    thinking: false,
    active: [],
    nextEventIn: 90,
    pendingChoice: null,
    boss: null,
    bossesBeaten: [],
    achievements: [],
    stats: { answered: 0, hallucinations: 0, taps: 0, playSeconds: 0, eventsSeen: 0 },
    ended: false,
    settings: { format: "short" },
    lastSaved: Date.now(),
  };
}

export class Game {
  state: GameState;
  stats: Stats;
  private listeners: ((n: GameNotice) => void)[] = [];
  /** 테스트·시뮬레이션용 난수 */
  rng: () => number;

  constructor(state: GameState = newState(), rng: () => number = Math.random) {
    this.state = state;
    this.rng = rng;
    this.stats = computeStats(state);
  }

  onNotice(fn: (n: GameNotice) => void): void {
    this.listeners.push(fn);
  }

  private emit(n: GameNotice): void {
    for (const fn of this.listeners) fn(n);
  }

  refresh(): Stats {
    this.stats = computeStats(this.state);
    return this.stats;
  }

  tick(dt: number): void {
    const s = this.state;
    const st = this.stats;
    this.earn(st.net * dt);
    s.rp += st.rpRate * dt;
    s.stats.answered += st.answered * dt;
    s.stats.hallucinations += st.answered * st.hall * dt;
    s.stats.playSeconds += dt;

    let changed = false;
    for (const a of s.active) a.remaining -= dt;
    const before = s.active.length;
    s.active = s.active.filter((a) => a.remaining > 0);
    if (s.active.length !== before) changed = true;

    if (s.boss) {
      s.boss.dealt += bossDps(st) * dt;
      s.boss.remaining -= dt;
      this.resolveBoss();
    }

    if (!s.pendingChoice) {
      s.nextEventIn -= dt;
      if (s.nextEventIn <= 0) {
        this.triggerRandomEvent();
        changed = true;
      }
    }

    if (changed) this.refresh();
    this.checkAchievements();
  }

  private earn(amount: number): void {
    const s = this.state;
    s.credits = Math.max(0, s.credits + amount);
    if (amount > 0) {
      s.runEarned += amount;
      s.totalEarned += amount;
    }
  }

  // ── 구매 ──────────────────────────────────────────────

  isBuildingUnlocked(id: string): boolean {
    const b = BUILDING_MAP[id];
    return !!b && b.era <= this.state.era;
  }

  buyBuilding(id: string, count: number | "max" = 1): number {
    const b = BUILDING_MAP[id];
    if (!b || !this.isBuildingUnlocked(id)) return 0;
    const n = count === "max" ? maxAffordable(this.state, b, this.stats.mult.cost) : count;
    if (n <= 0) return 0;
    const cost = buildingCost(this.state, b, n, this.stats.mult.cost);
    if (cost > this.state.credits) return 0;
    this.state.credits -= cost;
    this.state.buildings[id] = (this.state.buildings[id] ?? 0) + n;
    this.refresh();
    return n;
  }

  canBuyUpgrade(id: string): boolean {
    const u = UPGRADE_MAP[id];
    const s = this.state;
    if (!u || s.upgrades.includes(id) || u.era > s.era) return false;
    if (u.requires && !u.requires.every((r) => s.upgrades.includes(r))) return false;
    return (u.currency === "rp" ? s.rp : s.credits) >= u.cost;
  }

  buyUpgrade(id: string): boolean {
    if (!this.canBuyUpgrade(id)) return false;
    const u = UPGRADE_MAP[id];
    if (u.currency === "rp") this.state.rp -= u.cost;
    else this.state.credits -= u.cost;
    this.state.upgrades.push(id);
    this.refresh();
    return true;
  }

  hasThinking(): boolean {
    return this.state.upgrades.some((id) => UPGRADE_MAP[id]?.unlockThinking);
  }

  toggleThinking(): void {
    if (!this.hasThinking()) return;
    this.state.thinking = !this.state.thinking;
    this.refresh();
  }

  tap(): number {
    const s = this.state;
    s.stats.taps += 1;
    if (s.boss) s.boss.dealt += bossDps(this.stats) * 0.5;
    const v = tapValue(this.stats);
    this.earn(v);
    s.stats.answered += 1;
    return v;
  }

  // ── 보스(벤치마크) ────────────────────────────────────

  bossReady(): { ok: boolean; reason?: string } {
    const s = this.state;
    if (s.ended && s.era >= ERAS.length - 1 && s.bossesBeaten.includes(s.era)) return { ok: false, reason: "이미 모든 벤치마크를 정복했습니다" };
    const boss = ERAS[s.era].boss;
    if (s.boss) return { ok: false, reason: "도전 중" };
    if (this.stats.intel < boss.intelReq) return { ok: false, reason: `지능 ${boss.intelReq} 필요` };
    if (this.stats.ctx < boss.ctxReq) return { ok: false, reason: `컨텍스트 ${boss.ctxReq} 필요` };
    return { ok: true };
  }

  startBoss(): boolean {
    if (!this.bossReady().ok) return false;
    this.state.boss = { era: this.state.era, dealt: 0, remaining: ERAS[this.state.era].boss.time };
    return true;
  }

  private resolveBoss(): void {
    const s = this.state;
    const fight = s.boss;
    if (!fight) return;
    const boss = ERAS[fight.era].boss;
    if (fight.dealt >= boss.hp) {
      s.boss = null;
      if (!s.bossesBeaten.includes(fight.era)) s.bossesBeaten.push(fight.era);
      this.emit({ kind: "bossWin", era: fight.era });
      if (fight.era === ERAS.length - 1) {
        s.ended = true;
        this.emit({ kind: "ending" });
      } else {
        this.advanceEra();
      }
    } else if (fight.remaining <= 0) {
      s.boss = null;
      this.emit({ kind: "bossLose", era: fight.era });
    }
  }

  private advanceEra(): void {
    const s = this.state;
    s.era += 1;
    this.emit({ kind: "era", era: s.era });
    const winter = ERAS[s.era].winter;
    if (winter) {
      const ev = EVENTS.find((e) => e.id === winter);
      if (ev) this.applyEvent(ev);
    }
    this.refresh();
  }

  // ── 이벤트 ────────────────────────────────────────────

  eligibleEvents(): GameEvent[] {
    const era = this.state.era;
    return EVENTS.filter(
      (e) => !e.scripted && e.weight > 0 && e.minEra <= era && (e.maxEra ?? 99) >= era
        && !this.state.active.some((a) => a.id === e.id),
    );
  }

  triggerRandomEvent(): void {
    const s = this.state;
    s.nextEventIn = 90 + this.rng() * 90;
    const pool = this.eligibleEvents();
    const total = pool.reduce((t, e) => t + e.weight, 0);
    if (total <= 0) return;
    let r = this.rng() * total;
    const ev = pool.find((e) => (r -= e.weight) < 0) ?? pool[pool.length - 1];
    if (ev.choices) {
      s.pendingChoice = ev.id;
      s.stats.eventsSeen += 1;
      this.emit({ kind: "choice", event: ev });
    } else {
      this.applyEvent(ev);
    }
  }

  applyEvent(ev: GameEvent | (EventChoice & { id: string; name: string; emoji: string })): void {
    const s = this.state;
    if ("desc" in ev && "minEra" in ev) {
      s.stats.eventsSeen += 1;
      this.emit({ kind: "event", event: ev });
    }
    if (ev.duration > 0 && ev.effects.length) {
      s.active = s.active.filter((a) => a.id !== ev.id);
      s.active.push({ id: ev.id, name: ev.name, emoji: ev.emoji, effects: ev.effects, remaining: ev.duration });
    }
    this.refresh();
    if (ev.incomeSeconds) {
      const amount = Math.max(this.stats.net, 0) * ev.incomeSeconds;
      if (amount >= 0) this.earn(amount);
      else s.credits = Math.max(0, s.credits + amount);
    }
    if (ev.rpSeconds) s.rp += this.stats.rpRate * ev.rpSeconds;
  }

  choose(index: number): void {
    const s = this.state;
    const ev = EVENTS.find((e) => e.id === s.pendingChoice);
    s.pendingChoice = null;
    const choice = ev?.choices?.[index];
    if (!ev || !choice) return;
    this.applyEvent({ ...choice, id: ev.id, name: `${ev.name}: ${choice.label}`, emoji: ev.emoji });
  }

  // ── 새 모델 출시(프레스티지) ──────────────────────────

  releaseGain(): number {
    return Math.max(0, checkpointsFor(this.state.totalEarned) - this.state.checkpoints);
  }

  release(): boolean {
    const gain = this.releaseGain();
    if (gain < 1) return false;
    const s = this.state;
    s.checkpoints += gain;
    s.releases += 1;
    s.credits = 0;
    s.rp = 0;
    s.runEarned = 0;
    // 재학습: 인프라(컴퓨트·전력·유저)는 남기고 모델 파라미터와 연구팀은 처음부터
    for (const id of Object.keys(s.buildings)) {
      const kind = BUILDING_MAP[id]?.kind;
      if (kind === "param" || kind === "rp") s.buildings[id] = START_KIT[id] ?? 0;
    }
    s.thinking = false;
    s.boss = null;
    s.active = s.active.filter((a) => a.id.startsWith("winter"));
    this.refresh();
    return true;
  }

  // ── 업적 ──────────────────────────────────────────────

  checkAchievements(): void {
    const s = this.state;
    for (const a of ACHIEVEMENTS) {
      if (!s.achievements.includes(a.id) && a.check(s, this.stats)) {
        s.achievements.push(a.id);
        this.emit({ kind: "achievement", id: a.id });
      }
    }
  }

  // ── 오프라인 ──────────────────────────────────────────

  /** 마지막 저장 이후 흐른 시간만큼 보상을 준다. 반환값: [초, 크레딧, RP] */
  applyOffline(now = Date.now()): [number, number, number] {
    const s = this.state;
    const capMult = this.stats.mult.offline >= 2 ? 2 : 1;
    const secs = Math.min(Math.max(0, (now - s.lastSaved) / 1000), OFFLINE_CAP_SEC * capMult);
    if (secs < 30) return [0, 0, 0];
    s.boss = null;
    for (const a of s.active) a.remaining -= secs;
    s.active = s.active.filter((a) => a.remaining > 0);
    const st = this.refresh();
    const eff = Math.min(1, OFFLINE_BASE * st.mult.offline);
    const credits = Math.max(0, st.net) * secs * eff;
    const rp = st.rpRate * secs * eff;
    this.earn(credits);
    s.rp += rp;
    s.stats.answered += st.answered * secs * eff;
    return [secs, credits, rp];
  }
}
