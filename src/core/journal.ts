// 플레이 일지: 비공개 테스트에서 '어디서 그만두는지'를 알기 위한 기록. 기기 안에만 저장되고,
// 테스터가 '의견 보내기'를 누를 때 요약 한 줄로 함께 붙는다 (서버로 따로 보내지 않는다, 개인정보 없음).
import type { GameState, Journal } from "./types";

const MAX_DAYS = 60;
const MAX_SESSIONS = 20;

export function emptyJournal(): Journal {
  return { days: [], sessions: 0, sessionSecs: [], firstBuy: null, tutorialDone: null, eraAt: [0], rating: null };
}

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

export function sanitizeJournal(raw: unknown): Journal {
  const r = (raw ?? {}) as Partial<Record<keyof Journal, unknown>>;
  const nums = (v: unknown, max: number) => (Array.isArray(v) ? v.map(num).filter((x): x is number => x !== null).slice(-max) : []);
  const rating = num(r.rating);
  return {
    days: Array.isArray(r.days) ? r.days.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-MAX_DAYS) : [],
    sessions: num(r.sessions) ?? 0,
    sessionSecs: nums(r.sessionSecs, MAX_SESSIONS),
    firstBuy: num(r.firstBuy),
    tutorialDone: num(r.tutorialDone),
    eraAt: nums(r.eraAt, 64).length ? nums(r.eraAt, 64) : [0],
    rating: rating !== null && rating >= 1 && rating <= 5 ? Math.round(rating) : null,
  };
}

/** 앱을 열 때: 세션 하나 시작, 오늘 날짜 기록 */
export function startSession(s: GameState, today: string): void {
  const j = s.journal;
  j.sessions++;
  if (!j.days.includes(today)) j.days = [...j.days, today].slice(-MAX_DAYS);
  j.sessionSecs = [...j.sessionSecs, 0].slice(-MAX_SESSIONS);
}

/** 화면이 갱신될 때마다: 이번 세션 길이, 처음 일어난 일들 */
export function tickJournal(s: GameState, sessionSecs: number): void {
  const j = s.journal;
  if (j.sessionSecs.length) j.sessionSecs[j.sessionSecs.length - 1] = Math.round(sessionSecs);
  const t = Math.round(s.stats.playSeconds);
  if (j.firstBuy === null && s.stats.bought > 0) j.firstBuy = t;
  if (j.tutorialDone === null && s.settings.tutorialDone) j.tutorialDone = t;
  // 출시로 처음 시대로 돌아가도 '처음 도달한 때'만 남긴다
  while (j.eraAt.length <= s.era) j.eraAt.push(t);
}

/** 의견에 붙는 한 줄 요약 */
export function journalLine(s: GameState): string {
  const j = s.journal;
  const m = (x: number) => `${Math.round(x / 6) / 10}m`;
  const med = j.sessionSecs.length ? [...j.sessionSecs].sort((a, b) => a - b)[Math.floor(j.sessionSecs.length / 2)] : 0;
  return [
    `days ${j.days.length} (${j.days[0] ?? "-"}~${j.days[j.days.length - 1] ?? "-"})`,
    `sessions ${j.sessions} · median ${m(med)}`,
    `firstBuy ${j.firstBuy ?? "-"}s · tutorial ${j.tutorialDone ?? "-"}s`,
    `eras ${j.eraAt.slice(1).map((t, i) => `${i + 1}:${m(t)}`).join(" ") || "-"}`,
    `fun ${j.rating ?? "-"}/5`,
  ].join(" | ");
}
