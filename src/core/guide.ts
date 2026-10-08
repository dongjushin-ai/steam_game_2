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

  if (g.bossReady().ok) return { text: L(`${boss.emoji} ${boss.name}에 도전할 수 있어요!`, `${boss.emoji} You can challenge ${boss.name}!`), tab: "bench" };

  const research = UPGRADES.filter((u) => u.currency === "rp" && g.canBuyUpgrade(u.id));
  if (research.length) return { text: (() => { const n = research.sort((a, b) => a.cost - b.cost)[0].name; return L(`🔬 '${n}' 연구 가능`, `🔬 '${n}' is ready to research`); })(), tab: "research" };

  if (st.powerEff < 0.95) return { text: L("⚡ 전력이 모자라요 → 데이터센터 짓기", "⚡ Not enough power → build datacenters"), tab: "infra" };

  const hasResearcher = BUILDINGS.some((b) => b.kind === "rp" && (s.buildings[b.id] ?? 0) > 0);
  if (!hasResearcher) return { text: L("🧑‍🎓 대학원생을 고용해서 연구를 시작하세요", "🧑‍🎓 Hire a grad student to start research"), tab: "research" };

  if (st.intel < boss.intelReq) {
    const param = BUILDINGS.find((b) => b.kind === "param")!;
    if (buildingCost(s, param) <= s.credits) return { text: L(`🧠 파라미터 확장으로 지능 ${Math.ceil(boss.intelReq)} 만들기`, `🧠 Scale up parameters to reach intelligence ${Math.ceil(boss.intelReq)}`), tab: "research" };
    return { text: L(`🧠 보스까지 지능 ${Math.ceil(boss.intelReq)} 필요 (지금 ${st.intel.toFixed(1)})`, `🧠 Boss needs intelligence ${Math.ceil(boss.intelReq)} (now ${st.intel.toFixed(1)})`), tab: "research" };
  }
  if (st.ctx < boss.ctxReq) return { text: L("📜 컨텍스트 창을 늘리는 연구가 필요해요", "📜 Research a bigger context window"), tab: "research" };

  if (st.bottleneck === "demand") return { text: L("📉 질문이 부족해요 → 유저 확보", "📉 Not enough questions → get users"), tab: "service" };
  return { text: L("🖥️ 컴퓨트를 늘려 보스 점수를 올리세요", "🖥️ Add compute to raise your boss score"), tab: "infra" };
}
