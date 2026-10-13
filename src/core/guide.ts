// 💡 다음 할 일: 지금 상태에서 가장 도움이 될 행동 하나를 고른다.
import { BUILDINGS, ERAS, UPGRADES } from "../data";
import type { Game } from "./game";
import { buildingCost } from "./formulas";
import { L } from "../i18n/lang";

export type GuideTab = "service" | "infra" | "research" | "bench";

export interface Hint {
  text: string;
  tab: GuideTab;
}

export function nextHint(g: Game): Hint | null {
  const s = g.state;
  const st = g.stats;
  if (s.boss) return null;
  const boss = ERAS[s.era].boss;

  if (g.bossReady().ok) return { text: L(`${boss.name} 도전 가능!`, `${boss.name} is open!`), tab: "bench" };

  const research = UPGRADES.filter((u) => u.currency === "rp" && g.canBuyUpgrade(u.id));
  if (research.length) return { text: (() => { const n = research.sort((a, b) => a.cost - b.cost)[0].name; return L(`연구 가능: ${n}`, `Ready: ${n}`); })(), tab: "research" };

  if (st.powerEff < 0.95) return { text: L("전력 부족 → 인프라", "Low power → Infra"), tab: "infra" };

  const hasResearcher = BUILDINGS.some((b) => b.kind === "rp" && (s.buildings[b.id] ?? 0) > 0);
  if (!hasResearcher) return { text: L("대학원생을 뽑아 연구 시작", "Hire a grad student"), tab: "research" };

  if (st.intel < boss.intelReq) {
    const param = BUILDINGS.find((b) => b.kind === "param")!;
    if (buildingCost(s, param) <= s.credits) return { text: L(`모델 키우기 → 지능 ${Math.ceil(boss.intelReq)}`, `Grow the model → IQ ${Math.ceil(boss.intelReq)}`), tab: "research" };
    return { text: L(`보스까지 지능 ${Math.ceil(boss.intelReq)} (지금 ${st.intel.toFixed(1)})`, `Boss needs IQ ${Math.ceil(boss.intelReq)} (now ${st.intel.toFixed(1)})`), tab: "research" };
  }
  if (st.ctx < boss.ctxReq) return { text: L("컨텍스트를 늘려라", "Need more context"), tab: "research" };

  if (st.bottleneck === "demand") return { text: L("질문 부족 → 유저", "Need questions → Users"), tab: "service" };
  return { text: L("컴퓨트를 늘려라", "Need more compute"), tab: "infra" };
}
