// 꾸미기 아이템. 업적을 깨면 열린다. 등급이 높을수록 화려하다:
// 일반(색만 살짝) → 희귀(모자) → 영웅(움직이는 모자·효과) → 전설(날개·무지개·은하 같은 큰 연출).
// 그림은 ui/pixel.ts의 HATS·FX가 id로 찾아 그린다.

/** 0 일반 · 1 희귀 · 2 영웅 · 3 전설 */
export type Rarity = 0 | 1 | 2 | 3;
export type LookSlot = "color" | "hat" | "fx" | "pet";

export interface LookItem {
  id: string;
  slot: LookSlot;
  name: string;
  rarity: Rarity;
  /** 이 업적을 깨면 열린다 (없으면 시드 뽑기 전용) */
  ach?: string;
  /** 시드 뽑기에서만 나온다 */
  gacha?: boolean;
  /** 주간 한정: 이 주간 이벤트(weekly id)인 주에만 뽑기에 나오고 이번 주 픽업이 된다 */
  limited?: string;
  /** 랭킹 순위로만 얻는다 (core/ranking.ts RANK_LOOKS) */
  rank?: boolean;
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

  // ── 시드 뽑기 전용 (24종). 펫은 AI 옆에서 통통 뛰어다니는 작은 친구 ──
  { id: "p_duck", slot: "pet", name: "고무 오리", rarity: 0, gacha: true },
  { id: "p_coffee", slot: "pet", name: "커피잔", rarity: 0, gacha: true },
  { id: "p_floppy", slot: "pet", name: "플로피 디스크", rarity: 0, gacha: true },
  { id: "p_bug", slot: "pet", name: "버그", rarity: 0, gacha: true },
  { id: "c_leaf", slot: "color", name: "연두", rarity: 0, gacha: true, hex: "#8fe36a" },
  { id: "c_sky", slot: "color", name: "하늘", rarity: 0, gacha: true, hex: "#6fb8ff" },
  { id: "c_sand", slot: "color", name: "모래", rarity: 0, gacha: true, hex: "#e8c48a" },
  { id: "c_lavender", slot: "color", name: "라벤더", rarity: 0, gacha: true, hex: "#c8a8ff" },
  { id: "p_cat", slot: "pet", name: "키보드 고양이", rarity: 1, gacha: true },
  { id: "p_clip", slot: "pet", name: "클립 비서", rarity: 1, gacha: true },
  { id: "p_drone", slot: "pet", name: "미니 드론", rarity: 1, gacha: true },
  { id: "p_chair", slot: "pet", name: "아보카도 의자", rarity: 1, gacha: true },
  { id: "h_headset", slot: "hat", name: "헤드셋", rarity: 1, gacha: true },
  { id: "h_ribbon", slot: "hat", name: "왕리본", rarity: 1, gacha: true },
  { id: "p_robodog", slot: "pet", name: "로봇 강아지", rarity: 2, gacha: true },
  { id: "p_whale", slot: "pet", name: "아기 고래", rarity: 2, gacha: true },
  { id: "h_visor", slot: "hat", name: "네온 바이저", rarity: 2, gacha: true },
  { id: "f_bubbles", slot: "fx", name: "비눗방울", rarity: 2, gacha: true },
  { id: "f_hearts", slot: "fx", name: "하트 뿅뿅", rarity: 2, gacha: true },
  { id: "c_neon", slot: "color", name: "네온 핑크", rarity: 2, gacha: true, hex: "#ff2bd6" },
  { id: "p_dragon", slot: "pet", name: "아기 드래곤", rarity: 3, gacha: true },
  { id: "p_unicorn", slot: "pet", name: "유니콘", rarity: 3, gacha: true },
  { id: "f_aurora", slot: "fx", name: "오로라", rarity: 3, gacha: true },
  { id: "f_meteor", slot: "fx", name: "별똥별 비", rarity: 3, gacha: true },

  // ── 주간 한정 (그 주간 이벤트인 주에만 뽑기에, 그 주의 픽업) ──
  { id: "p_energy", slot: "pet", name: "에너지 드링크", rarity: 2, gacha: true, limited: "w_hackathon" },
  { id: "p_gpu", slot: "pet", name: "중고 GPU", rarity: 2, gacha: true, limited: "w_gpu_sale" },
  { id: "p_redpen", slot: "pet", name: "리뷰어 2의 빨간 펜", rarity: 2, gacha: true, limited: "w_reviewer2" },
  { id: "p_ghost", slot: "pet", name: "환각 유령", rarity: 2, gacha: true, limited: "w_meme" },
  { id: "h_rosette", slot: "hat", name: "1등 리본", rarity: 2, gacha: true, limited: "w_leaderboard" },
  { id: "p_box", slot: "pet", name: "가중치 상자", rarity: 2, gacha: true, limited: "w_open_weights" },
  { id: "p_magnifier", slot: "pet", name: "돋보기", rarity: 2, gacha: true, limited: "w_bug_bounty" },
  { id: "p_snowman", slot: "pet", name: "눈사람", rarity: 2, gacha: true, limited: "w_freeze" },

  // ── 랭킹 전용 (구글 플레이 게임즈 순위로만) ──
  { id: "f_spotlight", slot: "fx", name: "스포트라이트", rarity: 2, rank: true },
  { id: "p_trophy", slot: "pet", name: "트로피", rarity: 3, rank: true },
  { id: "h_laurel", slot: "hat", name: "챔피언 월계관", rarity: 3, rank: true },
  { id: "c_platinum", slot: "color", name: "플래티넘", rarity: 3, rank: true, hex: "#d8e4f0" },
];

export const LOOK_MAP: Record<string, LookItem> = Object.fromEntries(LOOKS.map((x) => [x.id, x]));
