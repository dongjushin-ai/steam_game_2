// 임무: 항상 3개가 걸려 있고, 달성하면 자동으로 보상을 받고 새 임무가 나온다.
import type { Stats } from "./formulas";
import type { GameState, Quest, QuestKind } from "./types";
import { L } from "../i18n/lang";

export const QUEST_SLOTS = 3;

/** 임무 종류별 현재 카운터 값 */
export function questCounter(s: GameState, kind: QuestKind): number {
  switch (kind) {
    case "answer": return s.stats.answered;
    case "earn": return s.totalEarned - s.stats.bonusEarned;
    case "buy": return s.stats.bought;
    case "research": return s.stats.researched;
    case "taps": return s.stats.taps;
    case "think": return s.stats.thinkSeconds;
    case "golden": return s.stats.goldens;
    case "combo": return s.stats.maxCombo;
  }
}

export function questProgress(s: GameState, q: Quest): number {
  const v = q.kind === "combo" ? questCounter(s, q.kind) : questCounter(s, q.kind) - q.base;
  return Math.min(1, v / q.target);
}

export function questText(q: Quest, fmt: (n: number) => string): string {
  switch (q.kind) {
    case "answer": return L(`질문 ${fmt(q.target)}개 더 답변하기`, `Answer ${fmt(q.target)} more questions`);
    case "earn": return L(`💵 ${fmt(q.target)} 더 벌기`, `Earn 💵 ${fmt(q.target)} more`);
    case "buy": return L(`건물 ${q.target}개 더 구매하기`, `Buy ${q.target} more buildings`);
    case "research": return L(`연구 ${q.target}개 완료하기`, `Finish ${q.target} research project${q.target > 1 ? "s" : ""}`);
    case "taps": return L(`직접 ${q.target}번 답변하기 (탭)`, `Answer ${q.target} questions by tapping`);
    case "think": return L(`생각 모드로 ${q.target}초 운영하기`, `Run Thinking Mode for ${q.target}s`);
    case "golden": return L(`⭐VIP 질문 ${q.target}개 잡기`, `Catch ${q.target} ⭐VIP question${q.target > 1 ? "s" : ""}`);
    case "combo": return L(`${q.target}콤보 달성하기`, `Reach a ${q.target} combo`);
  }
}

const nice = (x: number): number => {
  if (x < 10) return Math.max(1, Math.round(x));
  const p = Math.pow(10, Math.floor(Math.log10(x)) - 1);
  return Math.round(x / p) * p;
};

/** 현재 상태에 맞는 새 임무 하나 */
export function makeQuest(s: GameState, st: Stats, id: number, rng: () => number, hasThinking: boolean, researchLeft: number): Quest {
  const kinds: QuestKind[] = ["answer", "earn", "buy", "taps", "golden"];
  if (researchLeft > 0) kinds.push("research", "research");
  if (hasThinking) kinds.push("think");
  if (s.stats.maxCombo < 50) kinds.push("combo");
  const taken = new Set(s.quests.map((q) => q.kind));
  const pool = kinds.filter((k) => !taken.has(k));
  const kind = pool[Math.floor(rng() * pool.length)] ?? "answer";
  const r = 0.75 + rng() * 0.5;
  let target: number;
  switch (kind) {
    case "answer": target = nice(Math.max(30, st.answered * 300 * r)); break;
    case "earn": target = nice(Math.max(200, st.net * 400 * r)); break;
    case "buy": target = nice(10 + s.era * 3 * r); break;
    case "research": target = Math.max(1, Math.min(researchLeft, Math.round(1 + rng() * 2))); break;
    case "taps": target = nice(80 + 120 * r); break;
    case "think": target = nice(90 + 60 * r); break;
    case "golden": target = 1; break;
    case "combo": target = [15, 25, 40, 50].find((c) => c > s.stats.maxCombo) ?? 50; break;
  }
  return {
    id, kind, target,
    base: questCounter(s, kind),
    incomeSeconds: Math.round(30 + 40 * r),
    rpSeconds: Math.round(20 + 30 * r),
  };
}
