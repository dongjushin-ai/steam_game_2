// 꾸미기: 무엇이 열렸는지, 지금 무엇을 입고 있는지.
import { ERAS, LOOK_MAP, LOOKS, type LookItem, type LookSlot } from "../data";
import type { GameState, Look, UiSkin } from "./types";
import { L } from "../i18n/lang";

/** 등급 이름: 0 일반 · 1 희귀 · 2 영웅 · 3 전설 */
export function rarityName(r: number): string {
  return [L("일반", "Common"), L("희귀", "Rare"), L("영웅", "Epic"), L("전설", "Legendary")][r] ?? "";
}

export const UI_SKINS: UiSkin[] = ["pixel", "retro", "y2k", "brutal", "machine"];
/** 화면 옷이 처음 나오는 시대 */
const UI_FROM: Record<UiSkin, number> = { pixel: 0, retro: 3, y2k: 5, brutal: 8, machine: 10 };

export function emptyLook(): Look {
  return { avatar: null, room: null, hat: null, color: null, fx: null, ui: null, pet: null };
}

/** 시대별 기본 화면 옷 */
export function eraSkin(era: number): UiSkin {
  return era <= 2 ? "pixel" : era <= 4 ? "retro" : era <= 7 ? "y2k" : era <= 9 ? "brutal" : "machine";
}

/** 가 본 시대 (출시로 처음부터 다시 해도 이긴 보스는 남는다) */
export function eraReached(s: GameState, era: number): boolean {
  return era <= s.era || s.bossesBeaten.includes(era - 1);
}

export function itemUnlocked(s: GameState, item: LookItem): boolean {
  if (item.rank) return s.ranking.looks.includes(item.id);
  return item.gacha ? s.gacha.owned.includes(item.id) : !!item.ach && s.achievements.includes(item.ach);
}

export function uiUnlocked(s: GameState, ui: UiSkin): boolean {
  return eraReached(s, UI_FROM[ui]);
}

/** 이 업적을 깨면 받는 꾸미기 */
export function rewardFor(achId: string): LookItem | undefined {
  return LOOKS.find((x) => x.ach === achId);
}

export function itemsOf(slot: LookSlot): LookItem[] {
  return LOOKS.filter((x) => x.slot === slot);
}

/** 모은 개수 / 전체 (시대 그림 포함) */
export function lookProgress(s: GameState): [number, number] {
  const eras = ERAS.filter((_, i) => eraReached(s, i)).length;
  const items = LOOKS.filter((x) => itemUnlocked(s, x)).length;
  return [eras + items, ERAS.length + LOOKS.length];
}

/** 실제로 쓸 값: 잠긴 것·사라진 것은 기본값으로 */
export function resolveLook(s: GameState): { avatar: number; room: number; hat: string | null; fx: string | null; pet: string | null; color: string | null; ui: UiSkin } {
  const l = s.settings.look;
  const era = (v: number | null) => (v !== null && v >= 0 && v < ERAS.length && eraReached(s, v) ? v : s.era);
  const item = (id: string | null, slot: LookSlot) => (id && LOOK_MAP[id]?.slot === slot && itemUnlocked(s, LOOK_MAP[id]) ? id : null);
  const color = item(l.color, "color");
  return {
    avatar: era(l.avatar),
    room: era(l.room),
    hat: item(l.hat, "hat"),
    fx: item(l.fx, "fx"),
    pet: item(l.pet, "pet"),
    color: color ? LOOK_MAP[color].hex! : null,
    ui: l.ui && uiUnlocked(s, l.ui) ? l.ui : eraSkin(s.era),
  };
}

/** 세이브에서 읽은 값 정리 */
export function sanitizeLook(raw: unknown): Look {
  const r = (raw ?? {}) as Partial<Record<keyof Look, unknown>>;
  const era = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) < ERAS.length ? (v as number) : null);
  const item = (v: unknown, slot: LookSlot) => (typeof v === "string" && LOOK_MAP[v]?.slot === slot ? v : null);
  return {
    avatar: era(r.avatar),
    room: era(r.room),
    hat: item(r.hat, "hat"),
    color: item(r.color, "color"),
    fx: item(r.fx, "fx"),
    ui: typeof r.ui === "string" && (UI_SKINS as string[]).includes(r.ui) ? (r.ui as UiSkin) : null,
    pet: item(r.pet, "pet"),
  };
}
