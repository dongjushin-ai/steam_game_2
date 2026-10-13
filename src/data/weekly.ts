import type { Effect, MultStat } from "../core/types";

// 주간 이벤트: 해마다 같은 주에는 같은 테마 (ISO 주 번호로 돌아간다). 서버 없이도 매주 바뀐다.
export interface Weekly {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  effects: Effect[];
}

const fx = (pairs: Partial<Record<MultStat, number>>): Effect[] =>
  Object.entries(pairs).map(([stat, mul]) => ({ stat: stat as MultStat, mul: mul as number }));

export const WEEKLIES: Weekly[] = [
  { id: "w_hackathon", emoji: "🍕", name: "해커톤 주간", desc: "밤샘 코딩 시즌. 손이 빨라진다.", effects: fx({ tap: 1.5 }) },
  { id: "w_gpu_sale", emoji: "🏷️", name: "GPU 대방출", desc: "중고 GPU가 쏟아졌다. 구매 비용이 내려간다.", effects: fx({ cost: 0.85 }) },
  { id: "w_reviewer2", emoji: "📝", name: "학회 마감 주간", desc: "리뷰어 2를 넘기 위해 연구실이 불을 켠다.", effects: fx({ rp: 1.3 }) },
  { id: "w_meme", emoji: "😂", name: "밈 대유행", desc: "AI 대화 캡처가 타임라인을 덮었다. 질문이 몰려온다.", effects: fx({ demand: 1.3 }) },
  { id: "w_leaderboard", emoji: "📈", name: "리더보드 시즌", desc: "모두가 벤치마크 점수를 올리려 GPU를 돌린다.", effects: fx({ tps: 1.2 }) },
  { id: "w_open_weights", emoji: "🔓", name: "오픈 웨이트 축제", desc: "공개 모델이 줄줄이 나왔다. 답변 값이 오른다.", effects: fx({ reward: 1.2 }) },
  { id: "w_bug_bounty", emoji: "🐛", name: "버그 바운티", desc: "사람들이 오답을 제보해 준다. 할루시네이션이 줄어든다.", effects: fx({ hall: 0.85 }) },
  { id: "w_freeze", emoji: "🧊", name: "배포 동결 주간", desc: "금요일 배포 금지. 쉬는 동안 더 많이 번다.", effects: fx({ offline: 1.5 }) },
];

/** 날짜 → ISO 주 번호 → 이번 주 이벤트 */
export function weeklyFor(date: Date): Weekly {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return WEEKLIES[(d.getUTCFullYear() * 53 + week) % WEEKLIES.length];
}
