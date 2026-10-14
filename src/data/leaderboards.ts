// 구글 플레이 게임즈 리더보드. id는 Play Console › 플레이 게임즈 서비스 › 리더보드에서 만든 뒤 받은 값(예: "CgkI...")을 넣는다.
// 비어 있으면 그 리더보드는 꺼진다 (점수를 보내지 않고 화면에 '준비 중').
// 시간 리더보드: Console에서 '시간 형식, 낮을수록 좋음'. 나머지는 '숫자, 높을수록 좋음'. 설정 방법은 docs/RELEASE.md.

export type BoardKind = "score" | "time";

export interface Board {
  key: string;
  id: string;
  name: string;
  kind: BoardKind;
  /** 타임어택: 이 시대의 보스를 깬 시각 */
  era?: number;
}

export const BOARDS: Board[] = [
  { key: "overall", id: "", name: "종합 점수", kind: "score" },
  { key: "feats", id: "", name: "업적 점수", kind: "score" },
  { key: "combo", id: "", name: "최고 콤보", kind: "score" },
  { key: "endless", id: "", name: "무한 단계", kind: "score" },
  ...Array.from({ length: 11 }, (_, e): Board => ({ key: `ta${e}`, id: "", name: `타임어택 ${e + 1}`, kind: "time", era: e })),
];

/** 순위 보상 판정에 쓰는 기간 */
export type Span = "daily" | "weekly" | "all";
export const SPANS: Span[] = ["daily", "weekly", "all"];
