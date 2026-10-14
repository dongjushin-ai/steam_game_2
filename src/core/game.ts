import { newRanking } from "./ranking";
import { SEEDS, newGacha, pull, type PullResult } from "./gacha";
import { ERAS, EVENTS, GOLDENS, MISSIONS, QUIZ, THREATS, UPGRADES, baseMissionSlots } from "../data";
import type { GoldenDef } from "../data/golden";
import { ACHIEVEMENTS } from "./achievements";
import {
  BENCH_MAP, BUILDING_MAP, COMBO_WINDOW, autoBlockChance, extraMissionSlots, OFFLINE_BASE, OFFLINE_CAP_SEC, UPGRADE_MAP, autoTapValue, bossDps, bossOutlook, BOSS_MIN_OUTLOOK, buildingCost,
  checkpointsFor, comboMult, computeStats, maxAffordable, tapValue, type Stats,
} from "./formulas";
import { QUEST_SLOTS, makeQuest, questProgress } from "./quests";
import type { EventChoice, GameEvent, GameState, MissionDef, Quest, QuizQuestion, SideBench } from "./types";
import { L } from "../i18n/lang";

export const SAVE_VERSION = 2;
const START_KIT: Record<string, number> = { c_diff: 1, p_dorm: 1, d_neighbors: 1 };
/** VIP 질문이 화면에 머무는 시간(초) */
export const GOLDEN_LIFETIME = 12;
/** 이벤트 대신 퀴즈가 나올 확률 */
const QUIZ_CHANCE = 0.3;
/** 탈옥 프롬프트가 나오기 시작하는 시대 (ChatGPT 이후) */
export const THREAT_ERA = 6;
/** 탈옥 말풍선이 머무는 시간(초). 놓치면 뚫린다. */
export const THREAT_LIFETIME = 10;
/** 뚫렸을 때: 신뢰 하락으로 수요 −30%, 30초 */
const BREACH = { demand: 0.7, duration: 30 };
/** 모델 연대기 최대 기록 수 */
const MODEL_LOG_MAX = 60;

export type GameNotice =
  | { kind: "event"; event: GameEvent }
  | { kind: "choice"; event: GameEvent }
  | { kind: "quiz"; quiz: QuizQuestion }
  | { kind: "golden" }
  | { kind: "goldenClaim"; def: GoldenDef; amount: number }
  | { kind: "quest"; quest: Quest; credits: number; rp: number }
  | { kind: "era"; era: number }
  | { kind: "bossWin"; era: number }
  | { kind: "bossLose"; era: number; pct: number }
  | { kind: "achievement"; id: string }
  | { kind: "benchWin"; bench: SideBench }
  | { kind: "benchLose"; bench: SideBench }
  | { kind: "threat" }
  | { kind: "threatBlocked"; auto: boolean; amount: number }
  | { kind: "breach" }
  | { kind: "missionDone"; mission: MissionDef; credits: number; rp: number }
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
    gacha: newGacha(),
    ranking: newRanking(),
    buildings: { ...START_KIT },
    upgrades: [],
    thinking: false,
    active: [],
    nextEventIn: 90,
    pendingChoice: null,
    pendingQuiz: null,
    golden: null,
    nextGoldenIn: 40,
    quests: [],
    questSeq: 0,
    combo: 0,
    lastTapAt: -10,
    quizSolved: [],
    eraStartedAt: 0,
    eraTimes: [0],
    benchDone: [],
    sideFight: null,
    threat: null,
    nextThreatIn: 120,
    missions: [],
    models: [],
    daily: { last: "", streak: 0 },
    weekly: null,
    boss: null,
    bossesBeaten: [],
    achievements: [],
    stats: {
      answered: 0, hallucinations: 0, taps: 0, playSeconds: 0, eventsSeen: 0, goldens: 0, quizCorrect: 0,
      quizAsked: 0, questsDone: 0, maxCombo: 0, bought: 0, researched: 0, thinkSeconds: 0, bonusEarned: 0,
      blocked: 0, breaches: 0, missionsDone: 0, benchWins: 0,
    },
    ended: false,
    settings: { format: "short", sound: true, vibrate: true, effects: true, hints: true, lang: "ko", music: true, tutorialDone: false, look: { avatar: null, room: null, hat: null, color: null, fx: null, ui: null, pet: null } },
    lastSaved: Date.now(),
  };
}

export class Game {
  state: GameState;
  stats: Stats;
  private listeners: ((n: GameNotice) => void)[] = [];
  private autoAcc = 0;
  private questAcc = 0;
  /** 테스트·시뮬레이션용 난수 */
  rng: () => number;
  /** 실제 시각(ms). 파견 임무가 쓴다. 시뮬레이션에서는 게임 시간으로 바꿔 넣는다. */
  clock: () => number;

  constructor(state: GameState = newState(), rng: () => number = Math.random, clock: () => number = Date.now) {
    this.state = state;
    this.rng = rng;
    this.clock = clock;
    this.stats = computeStats(state);
    this.fillQuests();
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
    if (s.thinking) s.stats.thinkSeconds += dt;

    // 자동 답변
    if (st.autoTap > 0) {
      this.autoAcc += st.autoTap * dt;
      if (this.autoAcc >= 1) {
        const n = Math.floor(this.autoAcc);
        this.autoAcc -= n;
        this.earn(autoTapValue(st) * n);
        s.stats.answered += n;
        if (s.boss) s.boss.dealt += bossDps(st) * 0.25 * n;
        if (s.sideFight) s.sideFight.dealt += bossDps(st) * 0.25 * n;
      }
    }

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
    if (s.sideFight) {
      s.sideFight.dealt += bossDps(st) * dt;
      s.sideFight.remaining -= dt;
      this.resolveSideBench();
    }

    // 보스전 중에는 이벤트·퀴즈를 띄우지 않는다 (창을 닫는 동안 보스 시간이 흐르므로)
    if (!s.pendingChoice && !s.pendingQuiz && !s.boss && !s.sideFight) {
      s.nextEventIn -= dt;
      if (s.nextEventIn <= 0) {
        this.triggerRandomEvent();
        changed = true;
      }
    }

    // VIP 질문
    if (s.golden) {
      s.golden.remaining -= dt;
      if (s.golden.remaining <= 0) s.golden = null;
    } else {
      s.nextGoldenIn -= dt;
      if (s.nextGoldenIn <= 0) this.spawnGolden();
    }

    // 탈옥 프롬프트
    if (s.threat) {
      s.threat.remaining -= dt;
      if (s.threat.remaining <= 0) this.breach();
    } else if (s.era >= THREAT_ERA) {
      s.nextThreatIn -= dt;
      if (s.nextThreatIn <= 0) this.spawnThreat();
    }

    // 임무·파견은 1초마다 확인
    this.questAcc += dt;
    if (this.questAcc >= 1) {
      this.questAcc = 0;
      this.checkQuests();
      this.checkMissions();
    }

    if (changed) this.refresh();
    this.checkAchievements();
  }

  /** 한 번에 받는 보상: '크레딧 벌기' 임무 진행에는 넣지 않는다 (보상이 다른 임무를 연달아 깨는 것 방지) */
  private earnBonus(amount: number): void {
    this.earn(amount);
    if (amount > 0) this.state.stats.bonusEarned += amount;
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
    this.state.stats.bought += n;
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
    if (u.currency === "rp") {
      this.state.rp -= u.cost;
      this.state.stats.researched += 1;
    } else {
      this.state.credits -= u.cost;
    }
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

  /** 직접 답변(탭). 빠르게 연속으로 탭하면 콤보가 쌓인다. */
  tap(): number {
    const s = this.state;
    const now = s.stats.playSeconds;
    s.combo = now - s.lastTapAt <= COMBO_WINDOW ? s.combo + 1 : 1;
    s.lastTapAt = now;
    s.stats.maxCombo = Math.max(s.stats.maxCombo, s.combo);
    s.stats.taps += 1;
    if (s.boss) s.boss.dealt += bossDps(this.stats) * 0.5;
    if (s.sideFight) s.sideFight.dealt += bossDps(this.stats) * 0.5;
    const v = tapValue(this.stats) * comboMult(s.combo);
    this.earn(v);
    s.stats.answered += 1;
    return v;
  }

  // ── VIP 질문 ──────────────────────────────────────────

  private spawnGolden(): void {
    const s = this.state;
    s.nextGoldenIn = 70 + this.rng() * 80;
    const total = GOLDENS.reduce((t, g) => t + g.weight, 0);
    let r = this.rng() * total;
    const def = GOLDENS.find((g) => (r -= g.weight) < 0) ?? GOLDENS[0];
    // 하단 상태 칩을 가리지 않도록 장면 위쪽 절반 안에서만
    s.golden = { kind: def.kind, remaining: GOLDEN_LIFETIME, y: 0.12 + this.rng() * 0.33 };
    this.emit({ kind: "golden" });
  }

  claimGolden(): GoldenDef | null {
    const s = this.state;
    if (!s.golden) return null;
    const def = GOLDENS.find((g) => g.kind === s.golden!.kind)!;
    s.golden = null;
    s.stats.goldens += 1;
    s.gacha.seeds += SEEDS.golden;
    let amount = 0;
    if (def.effects && def.duration) {
      s.active = s.active.filter((a) => a.id !== `golden_${def.kind}`);
      s.active.push({ id: `golden_${def.kind}`, name: def.name, emoji: def.emoji, effects: def.effects, remaining: def.duration });
      this.refresh();
    }
    if (def.incomeSeconds) {
      amount = Math.max(this.stats.net, this.stats.rewardPerQ) * def.incomeSeconds;
      this.earnBonus(amount);
    }
    if (def.rpSeconds) {
      amount = Math.max(this.stats.rpRate, 1) * def.rpSeconds;
      s.rp += amount;
    }
    this.emit({ kind: "goldenClaim", def, amount });
    return def;
  }

  // ── 임무 ──────────────────────────────────────────────

  private researchLeft(): number {
    const s = this.state;
    return UPGRADES.filter((u) => u.currency === "rp" && u.era <= s.era && !s.upgrades.includes(u.id)).length;
  }

  private fillQuests(): void {
    const s = this.state;
    while (s.quests.length < QUEST_SLOTS) {
      s.questSeq += 1;
      s.quests.push(makeQuest(s, this.stats, s.questSeq, this.rng, this.hasThinking(), this.researchLeft()));
    }
  }

  checkQuests(): void {
    const s = this.state;
    // 먼저 달성한 임무를 모두 고른 뒤 보상을 준다 (보상이 다른 임무 판정에 끼어들지 않게)
    const done = s.quests.filter((q) => questProgress(s, q) >= 1);
    for (const q of done) {
      s.quests = s.quests.filter((x) => x !== q);
      const credits = Math.max(this.stats.net, this.stats.rewardPerQ) * q.incomeSeconds;
      const rp = Math.max(this.stats.rpRate, 0.5) * q.rpSeconds;
      this.earnBonus(credits);
      s.rp += rp;
      s.stats.questsDone += 1;
      s.gacha.seeds += SEEDS.quest;
      this.emit({ kind: "quest", quest: q, credits, rp });
    }
    // 조건이 사라진 임무(예: 남은 연구 없음)는 교체
    s.quests = s.quests.filter((q) => q.kind !== "research" || this.researchLeft() > 0 || questProgress(s, q) >= 1);
    this.fillQuests();
  }

  /** 임무 하나를 새로 뽑는다 (UI의 '바꾸기') */
  rerollQuest(id: number): void {
    const s = this.state;
    s.quests = s.quests.filter((q) => q.id !== id);
    this.fillQuests();
  }

  // ── 보스(벤치마크) ────────────────────────────────────

  bossReady(): { ok: boolean; reason?: string } {
    const s = this.state;
    if (s.ended && s.era >= ERAS.length - 1 && s.bossesBeaten.includes(s.era)) return { ok: false, reason: L("이미 모든 벤치마크를 정복했습니다", "Every benchmark conquered") };
    const boss = ERAS[s.era].boss;
    if (s.boss || s.sideFight) return { ok: false, reason: L("도전 중", "In progress") };
    if (this.stats.intel < boss.intelReq) return { ok: false, reason: L(`지능 ${boss.intelReq} 필요`, `Needs intelligence ${boss.intelReq}`) };
    if (this.stats.ctx < boss.ctxReq) return { ok: false, reason: L(`컨텍스트 ${boss.ctxReq} 필요`, `Needs context ${boss.ctxReq}`) };
    const look = bossOutlook(this.stats, boss.hp, boss.time);
    if (look < BOSS_MIN_OUTLOOK) return { ok: false, reason: L(`아직 일러요 · 예상 ${Math.floor(look * 100)}%`, `Too early · ${Math.floor(look * 100)}% expected`) };
    return { ok: true };
  }

  startBoss(): boolean {
    if (!this.bossReady().ok || this.state.sideFight) return false;
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
      // 첫 보스는 뽑기를 처음 열어 주는 선물 (두 번 뽑을 만큼)
      s.gacha.seeds += fight.era === 0 && s.gacha.pulls === 0 ? SEEDS.firstBoss : SEEDS.boss;
      this.emit({ kind: "bossWin", era: fight.era });
      if (fight.era === ERAS.length - 1) {
        if (s.ranking.endAt === null) s.ranking.endAt = s.stats.playSeconds;
        s.ended = true;
        this.emit({ kind: "ending" });
      } else {
        this.advanceEra();
      }
    } else if (fight.remaining <= 0) {
      s.boss = null;
      this.emit({ kind: "bossLose", era: fight.era, pct: fight.dealt / boss.hp });
    }
  }

  private advanceEra(): void {
    const s = this.state;
    s.era += 1;
    s.eraStartedAt = s.stats.playSeconds;
    if (s.eraTimes[s.era] === undefined) s.eraTimes[s.era] = s.stats.playSeconds;
    this.emit({ kind: "era", era: s.era });
    const winter = ERAS[s.era].winter;
    if (winter) {
      const ev = EVENTS.find((e) => e.id === winter);
      if (ev) this.applyEvent(ev);
    }
    this.refresh();
  }

  // ── 사이드 벤치마크 ───────────────────────────────────

  benchHp(b: SideBench): number {
    return ERAS[b.era].boss.hp * b.hpFactor;
  }

  /** 지금 시대까지 열린 사이드 벤치마크 */
  sideBenches(): SideBench[] {
    return Object.values(BENCH_MAP).filter((b) => b.era <= this.state.era);
  }

  sideBenchReady(id: string): { ok: boolean; reason?: string } {
    const s = this.state;
    const b = BENCH_MAP[id];
    if (!b || b.era > s.era) return { ok: false, reason: L("잠김", "Locked") };
    if (s.benchDone.includes(id)) return { ok: false, reason: L("정복", "Cleared") };
    if (s.boss || s.sideFight) return { ok: false, reason: L("다른 도전 중", "Another run in progress") };
    if (this.stats.intel < b.intelReq) return { ok: false, reason: L(`지능 ${b.intelReq} 필요`, `Needs intelligence ${b.intelReq}`) };
    if (this.stats.ctx < b.ctxReq) return { ok: false, reason: L(`컨텍스트 ${b.ctxReq} 필요`, `Needs context ${b.ctxReq}`) };
    return { ok: true };
  }

  startSideBench(id: string): boolean {
    if (!this.sideBenchReady(id).ok) return false;
    this.state.sideFight = { id, dealt: 0, remaining: BENCH_MAP[id].time };
    return true;
  }

  private resolveSideBench(): void {
    const s = this.state;
    const fight = s.sideFight;
    if (!fight) return;
    const b = BENCH_MAP[fight.id];
    if (!b) {
      s.sideFight = null;
      return;
    }
    if (fight.dealt >= this.benchHp(b)) {
      s.sideFight = null;
      if (!s.benchDone.includes(b.id)) s.benchDone.push(b.id);
      s.stats.benchWins += 1;
      s.gacha.seeds += SEEDS.bench;
      this.refresh();
      this.emit({ kind: "benchWin", bench: b });
    } else if (fight.remaining <= 0) {
      s.sideFight = null;
      this.emit({ kind: "benchLose", bench: b });
    }
  }

  // ── 탈옥 프롬프트 ─────────────────────────────────────

  private spawnThreat(): void {
    const s = this.state;
    s.nextThreatIn = 100 + this.rng() * 80;
    if (this.rng() < autoBlockChance(s)) {
      // 안전 연구가 알아서 막았다
      s.stats.blocked += 1;
      this.emit({ kind: "threatBlocked", auto: true, amount: 0 });
      return;
    }
    s.threat = { text: Math.floor(this.rng() * THREATS.length), remaining: THREAT_LIFETIME, y: 0.15 + this.rng() * 0.3 };
    this.emit({ kind: "threat" });
  }

  /** 탈옥 말풍선을 눌러 막는다. 보상: 수익 15초분. */
  blockThreat(): number {
    const s = this.state;
    if (!s.threat) return 0;
    s.threat = null;
    s.stats.blocked += 1;
    const amount = Math.max(this.stats.net, this.stats.rewardPerQ) * 15;
    this.earnBonus(amount);
    this.emit({ kind: "threatBlocked", auto: false, amount });
    return amount;
  }

  private breach(): void {
    const s = this.state;
    s.threat = null;
    s.stats.breaches += 1;
    s.active = s.active.filter((a) => a.id !== "breach");
    s.active.push({ id: "breach", name: L("탈옥 사고", "Jailbreak breach"), emoji: "🔓", effects: [{ stat: "demand", mul: BREACH.demand }], remaining: BREACH.duration });
    this.refresh();
    this.emit({ kind: "breach" });
  }

  // ── 에이전트 파견 ─────────────────────────────────────

  missionSlots(): number {
    const base = baseMissionSlots(this.state.era);
    return base > 0 ? base + extraMissionSlots(this.state) : 0;
  }

  availableMissions(): MissionDef[] {
    return MISSIONS.filter((m) => m.era <= this.state.era);
  }

  canStartMission(id: string): boolean {
    const s = this.state;
    const m = MISSIONS.find((x) => x.id === id);
    return !!m && m.era <= s.era && !s.missions.some((x) => x.id === id) && s.missions.length < this.missionSlots();
  }

  startMission(id: string): boolean {
    if (!this.canStartMission(id)) return false;
    const m = MISSIONS.find((x) => x.id === id)!;
    this.state.missions.push({ id, endsAt: this.clock() + m.duration * 1000 });
    return true;
  }

  /** 남은 시간(초) */
  missionLeft(id: string): number {
    const m = this.state.missions.find((x) => x.id === id);
    return m ? Math.max(0, (m.endsAt - this.clock()) / 1000) : 0;
  }

  /** 끝난 파견의 보상을 받는다 (자동) */
  checkMissions(): void {
    const s = this.state;
    if (!s.missions.length) return;
    const now = this.clock();
    const done = s.missions.filter((m) => m.endsAt <= now);
    if (!done.length) return;
    s.missions = s.missions.filter((m) => m.endsAt > now);
    for (const run of done) {
      const def = MISSIONS.find((m) => m.id === run.id);
      if (!def) continue;
      const credits = def.incomeSeconds ? Math.max(this.stats.net, this.stats.rewardPerQ) * def.incomeSeconds : 0;
      const rp = def.rpSeconds ? Math.max(this.stats.rpRate, 1) * def.rpSeconds : 0;
      if (credits) this.earnBonus(credits);
      s.rp += rp;
      if (def.effects && def.effectDuration) {
        const id = `mission_${def.id}`;
        s.active = s.active.filter((a) => a.id !== id);
        s.active.push({ id, name: def.name, emoji: def.emoji, effects: def.effects, remaining: def.effectDuration });
        this.refresh();
      }
      s.stats.missionsDone += 1;
      this.emit({ kind: "missionDone", mission: def, credits, rp });
    }
  }

  // ── 출석 ──────────────────────────────────────────────

  /**
   * 하루 첫 접속 보상. today/yesterday는 'YYYY-MM-DD'.
   * 연속 접속 일수(최대 7)만큼 수익·RP가 커진다. 이미 받았으면 null.
   */
  claimDaily(today: string, yesterday: string): { streak: number; credits: number; rp: number } | null {
    const d = this.state.daily;
    if (d.last === today) return null;
    d.streak = d.last === yesterday ? d.streak + 1 : 1;
    d.last = today;
    const k = Math.min(7, d.streak);
    const credits = Math.max(this.stats.net, this.stats.rewardPerQ) * 60 * k;
    const rp = Math.max(this.stats.rpRate, 1) * 30 * k;
    this.earnBonus(credits);
    this.state.rp += rp;
    this.state.gacha.seeds += SEEDS.daily * k;
    return { streak: d.streak, credits, rp };
  }

  // ── 이벤트 ────────────────────────────────────────────

  eligibleEvents(): GameEvent[] {
    const era = this.state.era;
    return EVENTS.filter(
      (e) => !e.scripted && e.weight > 0 && e.minEra <= era && (e.maxEra ?? 99) >= era
        && !this.state.active.some((a) => a.id === e.id),
    );
  }

  eligibleQuiz(): QuizQuestion[] {
    const s = this.state;
    return QUIZ.filter((q) => q.era <= s.era && !s.quizSolved.includes(q.id));
  }

  triggerRandomEvent(): void {
    const s = this.state;
    s.nextEventIn = 90 + this.rng() * 90;
    const quizzes = this.eligibleQuiz();
    if (quizzes.length && this.rng() < QUIZ_CHANCE) {
      const quiz = quizzes[Math.floor(this.rng() * quizzes.length)];
      s.pendingQuiz = quiz.id;
      s.stats.quizAsked += 1;
      this.emit({ kind: "quiz", quiz });
      return;
    }
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
      if (amount >= 0) this.earnBonus(amount);
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

  /** 퀴즈 답하기. 맞히면 수익 2분 + RP 1분치. */
  answerQuiz(index: number): { correct: boolean; quiz: QuizQuestion; credits: number; rp: number } | null {
    const s = this.state;
    const quiz = QUIZ.find((q) => q.id === s.pendingQuiz);
    s.pendingQuiz = null;
    if (!quiz) return null;
    const correct = index === quiz.answer;
    let credits = 0, rp = 0;
    if (correct) {
      credits = Math.max(this.stats.net, this.stats.rewardPerQ) * 120;
      rp = Math.max(this.stats.rpRate, 1) * 60;
      this.earnBonus(credits);
      s.rp += rp;
      s.stats.quizCorrect += 1;
      s.quizSolved.push(quiz.id);
    }
    return { correct, quiz, credits, rp };
  }

  // ── 새 모델 출시(프레스티지) ──────────────────────────

  /** 시드 뽑기 1번 또는 10연차 */
  pullSeeds(n: 1 | 10, date = new Date(this.clock())): PullResult[] {
    return pull(this.state.gacha, n, this.rng, date);
  }

  releaseGain(): number {
    return Math.max(0, checkpointsFor(this.state.totalEarned) - this.state.checkpoints);
  }

  release(): boolean {
    const gain = this.releaseGain();
    if (gain < 1) return false;
    const s = this.state;
    const st = this.stats;
    s.models.push({
      version: s.releases + 1, era: s.era, intel: st.intel, ctx: st.ctx, tier: st.tier.id,
      hall: st.hall, at: Math.floor(s.stats.playSeconds),
    });
    if (s.models.length > MODEL_LOG_MAX) s.models.splice(0, s.models.length - MODEL_LOG_MAX);
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
    s.sideFight = null;
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
    if (secs < 30) {
      // 잠깐 다른 앱을 보고 온 정도는 그냥 그 시간만큼 정상 속도로 진행한다
      for (let t = Math.floor(secs); t > 0; t--) this.tick(1);
      s.lastSaved = now;
      return [0, 0, 0];
    }
    s.boss = null;
    s.sideFight = null;
    s.golden = null;
    s.threat = null;
    for (const a of s.active) a.remaining -= secs;
    s.active = s.active.filter((a) => a.remaining > 0);
    const st = this.refresh();
    const eff = Math.min(1, OFFLINE_BASE * st.mult.offline);
    const credits = Math.max(0, st.net) * secs * eff;
    const rp = st.rpRate * secs * eff;
    this.earn(credits);
    s.rp += rp;
    s.stats.answered += st.answered * secs * eff;
    // 파견은 실제 시간으로 흘렀으니 끝난 것은 지금 받는다
    this.checkMissions();
    return [secs, credits, rp];
  }
}
