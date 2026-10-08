// 챗봇 아레나 리더보드: 가상 라이벌과 플레이어의 Elo 순위
import { ERAS, RIVALS } from "../data";
import { arenaElo, type Stats } from "./formulas";
import type { GameState } from "./types";
import { L } from "../i18n/lang";

export interface ArenaRow {
  id: string;
  emoji: string;
  name: string;
  lab: string;
  elo: number;
  me: boolean;
}

export function arenaTable(s: GameState, st: Stats): ArenaRow[] {
  const boss = ERAS[s.era].boss;
  // 라이벌은 시대 안에서 시간이 지날수록 조금씩 오른다 (15분에 걸쳐 +0.5시대)
  const inEra = Math.min(1, Math.max(0, (s.stats.playSeconds - s.eraStartedAt) / 900));
  const rows: ArenaRow[] = RIVALS.filter((r) => r.from <= s.era).map((r) => ({
    id: r.id, emoji: r.emoji, name: r.name, lab: r.lab, me: false,
    elo: Math.round(r.base + r.perEra * (s.era + 0.25 + inEra * 0.5)),
  }));
  rows.push({ id: "me", emoji: ERAS[s.era].avatar, name: `${s.aiName} v${s.releases + 1}`, lab: L("우리 연구소", "Our lab"), me: true, elo: arenaElo(s.era, st, boss.hp, boss.time) });
  return rows.sort((a, b) => b.elo - a.elo);
}

export function arenaRank(s: GameState, st: Stats): number {
  return arenaTable(s, st).findIndex((r) => r.me) + 1;
}
