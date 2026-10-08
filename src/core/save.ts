import { SAVE_VERSION, newState } from "./game";
import type { GameState } from "./types";

const KEY = "ai-kiugi-save";

/** 저장 데이터를 현재 형식에 맞게 채워 넣는다. 모르는 값은 기본값으로. */
export function migrate(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  const base = newState();
  const r = raw as Partial<GameState>;
  if (typeof r.era !== "number" || typeof r.credits !== "number") return null;
  return {
    ...base,
    ...r,
    version: SAVE_VERSION,
    buildings: { ...(r.buildings ?? base.buildings) },
    upgrades: [...(r.upgrades ?? [])],
    active: [...(r.active ?? [])],
    bossesBeaten: [...(r.bossesBeaten ?? [])],
    achievements: [...(r.achievements ?? [])],
    quests: [...(r.quests ?? [])],
    quizSolved: [...(r.quizSolved ?? [])],
    eraTimes: [...(r.eraTimes ?? [0])],
    stats: { ...base.stats, ...(r.stats ?? {}) },
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
}

export function loadGame(): GameState | null {
  try {
    const text = localStorage.getItem(KEY);
    return text ? migrate(JSON.parse(text)) : null;
  } catch {
    return null;
  }
}

export function saveGame(state: GameState): void {
  state.lastSaved = Date.now();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 공간이 막혀 있어도 게임은 계속된다
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
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
