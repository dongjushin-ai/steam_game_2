// 꾸미기 아이템. 업적을 깨면 열린다. 등급이 높을수록 화려하다:
// 일반(색만 살짝) → 희귀(모자) → 영웅(움직이는 모자·효과) → 전설(날개·무지개·은하 같은 큰 연출).
// 그림은 ui/pixel.ts의 HATS·FX가 id로 찾아 그린다.

/** 0 일반 · 1 희귀 · 2 영웅 · 3 전설 */
export type Rarity = 0 | 1 | 2 | 3;
export type LookSlot = "color" | "hat" | "fx";

export interface LookItem {
  id: string;
  slot: LookSlot;
  name: string;
  rarity: Rarity;
  /** 이 업적을 깨면 열린다 */
  ach: string;
  /** 색 아이템: 강조색 */
  hex?: string;
}

export const LOOKS: LookItem[] = [
  // ── 색: 강조색만 바꾼다 (일반·희귀) ──
  { id: "c_mint", slot: "color", name: "민트", rarity: 0, ach: "taps_100", hex: "#3fe0c5" },
  { id: "c_pink", slot: "color", name: "벚꽃", rarity: 0, ach: "combo_25", hex: "#ff7eb6" },
  { id: "c_ice", slot: "color", name: "아이스", rarity: 0, ach: "winter", hex: "#8fd8ff" },
  { id: "c_sunset", slot: "color", name: "노을", rarity: 0, ach: "quests_5", hex: "#ff8a3d" },
  { id: "c_gold", slot: "color", name: "황금", rarity: 1, ach: "golden_1", hex: "#ffd23f" },
  { id: "c_violet", slot: "color", name: "보라", rarity: 1, ach: "thinker", hex: "#a46bff" },
  { id: "c_alert", slot: "color", name: "경보", rarity: 1, ach: "deficit", hex: "#ff3b3b" },
  { id: "c_lime", slot: "color", name: "형광", rarity: 1, ach: "vibe", hex: "#b6ff3b" },
  // ── 모자 ──
  { id: "h_sprout", slot: "hat", name: "새싹", rarity: 0, ach: "first_answer" },
  { id: "h_beanie", slot: "hat", name: "털모자", rarity: 0, ach: "answers_1k" },
  { id: "h_party", slot: "hat", name: "고깔모자", rarity: 0, ach: "release_1" },
  { id: "h_cat", slot: "hat", name: "고양이 귀", rarity: 1, ach: "halluc_100" },
  { id: "h_grad", slot: "hat", name: "학사모", rarity: 1, ach: "quiz_10" },
  { id: "h_chef", slot: "hat", name: "셰프 모자", rarity: 1, ach: "mission_1" },
  { id: "h_propeller", slot: "hat", name: "프로펠러 모자", rarity: 2, ach: "combo_50" },
  { id: "h_halo", slot: "hat", name: "천사 링", rarity: 2, ach: "hall_1" },
  { id: "h_horns", slot: "hat", name: "악마 뿔", rarity: 2, ach: "breach_1" },
  { id: "h_wizard", slot: "hat", name: "마법사 모자", rarity: 3, ach: "ending" },
  // ── 효과: 몸 둘레 연출 (영웅·전설) ──
  { id: "f_dust", slot: "fx", name: "반짝 먼지", rarity: 2, ach: "bench_1" },
  { id: "f_matrix", slot: "fx", name: "코드 비", rarity: 2, ach: "auto" },
  { id: "f_flame", slot: "fx", name: "불꽃 오라", rarity: 2, ach: "taps_1000" },
  { id: "f_wings", slot: "fx", name: "황금 날개", rarity: 3, ach: "golden_25" },
  { id: "f_rainbow", slot: "fx", name: "무지개 오라", rarity: 3, ach: "arena_1" },
  { id: "f_galaxy", slot: "fx", name: "은하", rarity: 3, ach: "tier_11" },
];

export const LOOK_MAP: Record<string, LookItem> = Object.fromEntries(LOOKS.map((x) => [x.id, x]));
