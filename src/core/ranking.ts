// 랭킹: 리더보드에 보낼 점수 계산, 그리고 순위로만 얻는 훈장·칭호·스킨.
// 순위는 구글 플레이 게임즈가 매긴 값을 받아서 판정한다 (점수 자체는 기기에서 보낸다 → Console에서 점수 범위 제한을 걸어 둔다).
import { BOARDS, ERAS, LOOKS, type Board, type Span } from "../data";
import { L } from "../i18n/lang";
import { lookProgress } from "./looks";
import type { GameState } from "./types";

/** 1 금 · 2 은 · 3 동 */
export type MedalTier = 1 | 2 | 3;

export interface Medal {
  board: string;
  span: Span;
  /** 기간 키: 날짜(daily) · 주 번호(weekly) · "all" */
  period: string;
  tier: MedalTier;
  rank: number;
}

export interface RankingState {
  medals: Medal[];
  titles: string[];
  /** 고른 칭호 (null = 안 붙임) */
  title: string | null;
  /** 랭킹 보상 꾸미기 */
  looks: string[];
  /** 엔딩(마지막 보스)을 깬 플레이 시간(초) */
  endAt: number | null;
}

export function newRanking(): RankingState {
  return { medals: [], titles: [], title: null, looks: [], endAt: null };
}

// ── 점수 ───────────────────────────────────────────

/** 업적 점수: 업적 1개 10점 + 꾸미기 1개 5점 */
export function featScore(s: GameState): number {
  return s.achievements.length * 10 + lookProgress(s)[0] * 5;
}

/** 종합 점수: 정복한 시대 · 업적 · 번 돈(자릿수) · 사이드 벤치마크 · 수집 */
export function overallScore(s: GameState): number {
  return Math.floor(
    s.bossesBeaten.length * 1000 + (s.endless?.level ?? 0) * 300 + s.achievements.length * 100 + Math.log10(Math.max(1, s.totalEarned)) * 100
    + s.benchDone.length * 50 + lookProgress(s)[0] * 20,
  );
}

/** 타임어택: 그 시대 보스를 깬 플레이 시간(밀리초). 아직이면 null */
export function clearTime(s: GameState, era: number): number | null {
  const sec = era === ERAS.length - 1 ? s.ranking.endAt : s.eraTimes[era + 1];
  return sec === undefined || sec === null ? null : Math.round(sec * 1000);
}

/** 리더보드에 보낼 점수 (없으면 null) */
export function boardScore(s: GameState, b: Board): number | null {
  if (b.kind === "time") return clearTime(s, b.era!);
  if (b.key === "overall") return overallScore(s);
  if (b.key === "feats") return featScore(s);
  if (b.key === "combo") return s.stats.maxCombo || null;
  if (b.key === "endless") return s.endless.level || null;
  return null;
}

export function fmtBoard(b: Board, v: number): string {
  if (b.kind === "time") {
    const t = Math.floor(v / 1000);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
    return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
  }
  return v.toLocaleString();
}

// ── 순위 보상 ──────────────────────────────────────

export interface Title {
  id: string;
  name: () => string;
  /** 이 훈장을 받으면 열린다 */
  when: (m: Medal) => boolean;
}

const isTA = (m: Medal) => m.board.startsWith("ta");

export const TITLES: Title[] = [
  { id: "t_top10", name: () => L("TOP 10 랭커", "Top 10 Ranker"), when: () => true },
  { id: "t_podium", name: () => L("포디움", "Podium"), when: (m) => m.tier <= 2 },
  { id: "t_champion", name: () => L("챔피언", "Champion"), when: (m) => m.tier === 1 },
  { id: "t_daily1", name: () => L("오늘의 1위", "Today's #1"), when: (m) => m.span === "daily" && m.tier === 1 },
  { id: "t_weekly", name: () => L("이번 주의 AI", "AI of the Week"), when: (m) => m.span === "weekly" },
  { id: "t_speed", name: () => L("스피드러너", "Speedrunner"), when: isTA },
  { id: "t_combo", name: () => L("손가락의 신", "Finger God"), when: (m) => m.board === "combo" },
  { id: "t_hall", name: () => L("명예의 전당", "Hall of Fame"), when: (m) => m.span === "all" && m.board === "overall" },
  { id: "t_beyond", name: () => L("특이점 너머", "Beyond"), when: (m) => m.board === "endless" },
];

/** 랭킹으로만 얻는 꾸미기 (looks.ts의 rank 아이템) */
export const RANK_LOOKS: { id: string; when: (m: Medal) => boolean; how: () => string }[] = [
  { id: "f_spotlight", when: () => true, how: () => L("아무 랭킹 TOP 10", "Any leaderboard Top 10") },
  { id: "p_trophy", when: (m) => m.tier <= 2, how: () => L("아무 랭킹 TOP 3", "Any leaderboard Top 3") },
  { id: "h_laurel", when: (m) => m.tier === 1, how: () => L("아무 랭킹 1위", "#1 on any leaderboard") },
  { id: "c_platinum", when: (m) => m.span === "all", how: () => L("전체 기간 랭킹 TOP 10", "All-time Top 10") },
];

export function tierFor(rank: number): MedalTier | null {
  return rank === 1 ? 1 : rank <= 3 ? 2 : rank <= 10 ? 3 : null;
}

/** 받아 온 순위로 훈장·칭호·스킨을 준다. 새로 얻은 것들을 돌려준다 */
export function grantRank(s: GameState, board: string, span: Span, period: string, rank: number): { medal?: Medal; titles: string[]; looks: string[] } {
  const r = s.ranking;
  const tier = tierFor(rank);
  if (!tier) return { titles: [], looks: [] };
  const same = r.medals.find((m) => m.board === board && m.span === span && m.period === period);
  let medal: Medal | undefined;
  if (!same) {
    medal = { board, span, period, tier, rank };
    r.medals.push(medal);
    if (r.medals.length > 300) r.medals.splice(0, r.medals.length - 300);
  } else if (tier < same.tier) {
    same.tier = tier;
    same.rank = rank;
    medal = same;
  }
  const titles: string[] = [];
  const looks: string[] = [];
  if (medal) {
    for (const t of TITLES) if (!r.titles.includes(t.id) && t.when(medal)) { r.titles.push(t.id); titles.push(t.id); }
    for (const x of RANK_LOOKS) if (!r.looks.includes(x.id) && x.when(medal)) { r.looks.push(x.id); looks.push(x.id); }
  }
  return { medal, titles, looks };
}

export function titleName(id: string | null): string {
  return TITLES.find((t) => t.id === id)?.name() ?? "";
}

export function medalCount(s: GameState): [number, number, number] {
  const c: [number, number, number] = [0, 0, 0];
  for (const m of s.ranking.medals) c[m.tier - 1]++;
  return c;
}

export function sanitizeRanking(raw: unknown): RankingState {
  const r = (raw ?? {}) as Partial<RankingState>;
  const spans = ["daily", "weekly", "all"];
  const medals = Array.isArray(r.medals) ? r.medals.filter((m): m is Medal =>
    !!m && typeof m.board === "string" && BOARDS.some((b) => b.key === m.board) && spans.includes(m.span)
    && typeof m.period === "string" && [1, 2, 3].includes(m.tier) && Number.isInteger(m.rank) && m.rank >= 1).slice(-300) : [];
  const titles = Array.isArray(r.titles) ? r.titles.filter((t) => TITLES.some((x) => x.id === t)) : [];
  const looks = Array.isArray(r.looks) ? r.looks.filter((t) => RANK_LOOKS.some((x) => x.id === t) && LOOKS.some((l) => l.id === t)) : [];
  return {
    medals, titles: [...new Set(titles)], looks: [...new Set(looks)],
    title: typeof r.title === "string" && titles.includes(r.title) ? r.title : null,
    endAt: typeof r.endAt === "number" && Number.isFinite(r.endAt) && r.endAt > 0 ? r.endAt : null,
  };
}
