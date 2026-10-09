import { ERAS, QUIZ } from "../data";
import { BUILDING_MAP, UPGRADE_MAP } from "./formulas";
import { SAVE_VERSION, newState } from "./game";
import type { GameState, Quest, QuestKind } from "./types";

const KEY = "ai-kiugi-save";
/** 직전 정상 세이브. 본 세이브가 깨졌을 때 여기서 복구한다. */
const BACKUP_KEY = "ai-kiugi-save-backup";
/** 백업은 이 간격(ms)보다 자주 갱신하지 않는다 → 깨진 상태가 백업까지 덮어쓰는 일을 줄인다 */
const BACKUP_EVERY_MS = 60_000;

const QUEST_KINDS: QuestKind[] = ["answer", "earn", "buy", "research", "taps", "think", "golden", "combo"];

/** 유한한 0 이상의 수만 통과, 아니면 기본값 */
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && isFinite(v) && v >= 0 ? v : fallback);
const int = (v: unknown, fallback = 0): number => Math.floor(num(v, fallback));
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

/**
 * 저장 데이터를 현재 형식에 맞게 채우고 고친다.
 * 모르는 값은 기본값으로, 깨진 숫자(NaN·Infinity·음수)는 0으로, 없어진 id는 버린다.
 */
export function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const base = newState();
  const r = raw as Partial<GameState>;
  if (typeof r.era !== "number" || typeof r.credits !== "number") return null;

  const buildings: Record<string, number> = {};
  for (const [id, n] of Object.entries(r.buildings ?? base.buildings)) {
    if (BUILDING_MAP[id]) buildings[id] = int(n);
  }
  const quests: Quest[] = (Array.isArray(r.quests) ? r.quests : []).filter(
    (q): q is Quest => !!q && QUEST_KINDS.includes(q.kind) && num(q.target) > 0,
  ).map((q) => ({ ...q, base: num(q.base), incomeSeconds: num(q.incomeSeconds, 60), rpSeconds: num(q.rpSeconds, 30) }));
  const stats = { ...base.stats };
  for (const k of Object.keys(stats) as (keyof typeof stats)[]) stats[k] = num(r.stats?.[k], stats[k]);
  const lastEra = ERAS.length - 1;

  return {
    ...base,
    ...r,
    version: SAVE_VERSION,
    aiName: typeof r.aiName === "string" && r.aiName.trim() ? r.aiName.slice(0, 40) : base.aiName,
    era: Math.min(lastEra, int(r.era)),
    credits: num(r.credits),
    rp: num(r.rp),
    runEarned: num(r.runEarned),
    totalEarned: num(r.totalEarned),
    checkpoints: int(r.checkpoints),
    releases: int(r.releases),
    buildings,
    upgrades: [...new Set(strList(r.upgrades).filter((id) => UPGRADE_MAP[id]))],
    active: (Array.isArray(r.active) ? r.active : []).filter((a) => a && typeof a.id === "string" && num(a.remaining) > 0),
    bossesBeaten: [...new Set((Array.isArray(r.bossesBeaten) ? r.bossesBeaten : []).filter((e) => Number.isInteger(e) && e >= 0 && e <= lastEra))],
    achievements: [...new Set(strList(r.achievements))],
    quests,
    quizSolved: [...new Set(strList(r.quizSolved).filter((id) => QUIZ.some((q) => q.id === id)))],
    eraTimes: Array.isArray(r.eraTimes) ? r.eraTimes.map((t) => num(t)) : [0],
    nextEventIn: num(r.nextEventIn, base.nextEventIn),
    nextGoldenIn: num(r.nextGoldenIn, base.nextGoldenIn),
    stats,
    settings: { ...base.settings, ...(r.settings ?? {}) },
    lastSaved: num(r.lastSaved, Date.now()),
  };
}

function read(key: string): GameState | null {
  try {
    const text = localStorage.getItem(key);
    return text ? migrate(JSON.parse(text)) : null;
  } catch {
    return null;
  }
}

/** 본 세이브를 읽고, 깨졌으면 백업에서 복구한다. */
export function loadGame(): GameState | null {
  return read(KEY) ?? read(BACKUP_KEY);
}

let lastBackup = 0;

export function saveGame(state: GameState): void {
  state.lastSaved = Date.now();
  try {
    const text = JSON.stringify(state);
    // 쓰기 전에 지금 상태가 정상으로 읽히는지 확인해서, 깨진 세이브로 덮어쓰지 않는다
    if (!migrate(JSON.parse(text))) return;
    localStorage.setItem(KEY, text);
    if (state.lastSaved - lastBackup >= BACKUP_EVERY_MS) {
      localStorage.setItem(BACKUP_KEY, text);
      lastBackup = state.lastSaved;
    }
  } catch {
    // 저장 공간이 막혀 있어도 게임은 계속된다
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    // 무시
  }
}

export function exportSave(state: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function importSave(text: string): GameState | null {
  try {
    return migrate(JSON.parse(decodeURIComponent(escape(atob(text.trim())))));
  } catch {
    return null;
  }
}
