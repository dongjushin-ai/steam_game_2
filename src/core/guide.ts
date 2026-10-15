// 💡 다음 할 일: 지금 상태에서 가장 도움이 될 행동 하나를 고른다.
import { BUILDINGS, ERAS, UPGRADES } from "../data";
import type { Game } from "./game";
import { bossDps, bossOutlook, buildingCost, computeStats, type Stats } from "./formulas";
import type { Building } from "./types";
import { fmt } from "./format";

/** 안내가 보스 도전을 권하는 예상 달성률 */
export const GUIDE_BOSS_OUTLOOK = 0.9;
import { L } from "../i18n/lang";

export type GuideTab = "service" | "infra" | "research" | "bench";

export interface Hint {
  text: string;
  tab: GuideTab;
  /** 이 안내가 가리키는 건물 (그 줄에 '추천' 표시) */
  target?: string;
  /** 이 안내가 가리키는 제품 (그 칸에 표시) */
  upgrade?: string;
}

export function nextHint(g: Game): Hint | null {
  const s = g.state;
  const st = g.stats;
  if (s.boss) return null;
  const boss = ERAS[s.era].boss;

  // 튜토리얼 중엔 튜토리얼과 같은 곳을 가리킨다 (다른 탭으로 끌고 가지 않게)
  if (!s.settings.tutorialDone) {
    const first = BUILDINGS.find((b) => b.kind === "demand" && b.era <= s.era)!;
    return { text: L(`${first.name} 늘리기 → 서비스`, `Get ${first.name} → Service`), tab: "service", target: first.id };
  }

  // 도전은 35%부터 열리지만, 안내는 이길 만할 때만 보스로 보낸다 (아니면 계속 지고 돈은 쌓이기만 함)
  const ready = g.bossReady().ok;
  const look = bossOutlook(st, boss.hp, boss.time);
  if (ready && look >= GUIDE_BOSS_OUTLOOK) return { text: L(`${boss.name} 도전 가능!`, `${boss.name} is open!`), tab: "bench" };
  const bossPct = ready ? L(`보스 준비 ${Math.floor(look * 100)}% · `, `Boss ${Math.floor(look * 100)}% · `) : "";

  const research = UPGRADES.filter((u) => u.currency === "rp" && g.canBuyUpgrade(u.id));
  if (research.length) return { text: (() => { const n = research.sort((a, b) => a.cost - b.cost)[0].name; return L(`연구 가능: ${n}`, `Ready: ${n}`); })(), tab: "research" };

  // 살 수 있는 제품(서비스 탭 칸): 한 번 사면 영구 배수라 먼저 권한다
  const product = UPGRADES.filter((u) => u.currency === "credits" && g.canBuyUpgrade(u.id)).sort((a, b) => a.cost - b.cost)[0];
  if (product) return { text: L(`제품 출시: ${product.name}`, `Ship: ${product.name}`), tab: "service", upgrade: product.id };

  if (st.bottleneck === "power") {
    const p = best(g, ["power"], (x) => x.powerCap);
    return { text: L(`전력 부족 → ${p?.name ?? "인프라"}`, `Low power → ${p?.name ?? "Infra"}`), tab: "infra", target: p?.id };
  }

  const hasResearcher = BUILDINGS.some((b) => b.kind === "rp" && (s.buildings[b.id] ?? 0) > 0);
  if (!hasResearcher) {
    const r = BUILDINGS.find((b) => b.kind === "rp" && g.isBuildingUnlocked(b.id))!;
    return { text: L(`연구 시작: ${r.name} 뽑기`, `Start research: hire a ${r.name}`), tab: "research", target: r.id };
  }

  if (st.intel < boss.intelReq) {
    const param = BUILDINGS.find((b) => b.kind === "param")!;
    if (buildingCost(s, param) <= s.credits) return { text: L(`모델 키우기 → 지능 ${Math.ceil(boss.intelReq)}`, `Grow the model → IQ ${Math.ceil(boss.intelReq)}`), tab: "research", target: param.id };
    return { text: L(`보스까지 지능 ${Math.ceil(boss.intelReq)} (지금 ${st.intel.toFixed(1)})`, `Boss needs IQ ${Math.ceil(boss.intelReq)} (now ${st.intel.toFixed(1)})`), tab: "research", target: param.id };
  }
  if (st.ctx < boss.ctxReq) {
    // 기억력은 특정 연구로만 오른다: 그 연구 이름과, 모자란 게 연구 점수면 연구원을 가리킨다
    const u = UPGRADES.filter((x) => (x.ctx ?? 0) >= boss.ctxReq && x.era <= s.era && !s.upgrades.includes(x.id)).sort((a, b) => a.cost - b.cost)[0];
    if (!u) return { text: L("기억력을 늘려라", "Need more memory"), tab: "research" };
    const need = (u.requires ?? []).map((r) => UPGRADES.find((x) => x.id === r)!).find((x) => !s.upgrades.includes(x.id)) ?? u;
    if (s.rp >= need.cost) return { text: L(`기억력: ${need.name} 연구`, `Memory: research ${need.name}`), tab: "research" };
    const researcher = BUILDINGS.filter((b) => b.kind === "rp" && g.isBuildingUnlocked(b.id)).sort((a, b) => buildingCost(s, a) / (a.rp ?? 1) - buildingCost(s, b) / (b.rp ?? 1))[0];
    return { text: L(`기억력: ${need.name}까지 연구 점수 ${fmt(need.cost - s.rp)}`, `Memory: ${fmt(need.cost - s.rp)} more research for ${need.name}`), tab: "research", target: researcher?.id };
  }

  // 보스는 열렸는데 아직 약하다: 보스 점수는 답변 속도에서 나오니 그걸 가장 올리는 건물 (수요 병목과 상관없이)
  if (ready) {
    const b = best(g, ["compute", "power"], (x) => bossDps(x));
    if (b) return { text: bossPct + L(`답변 속도 → ${b.name}`, `Answer speed → ${b.name}`), tab: "infra", target: b.id };
  }
  if (st.bottleneck === "demand") return { text: L("질문 부족 → 유저", "Need questions → Users"), tab: "service" };
  // 전력이 꽉 차서 컴퓨트를 더 놓을 수 없으면: 컴퓨트가 아니라 전력을 가리킨다
  const unlocked = (kind: string) => BUILDINGS.filter((b) => b.kind === kind && g.isBuildingUnlocked(b.id));
  const compute = unlocked("compute").sort((a, b) => buildingCost(s, a) - buildingCost(s, b))[0];
  if (compute && st.powerUse + (compute.powerUse ?? 0) * st.mult.powerUse > st.powerCap) {
    const power = unlocked("power").sort((a, b) => buildingCost(s, a) / (a.power ?? 1) - buildingCost(s, b) / (b.power ?? 1))[0];
    if (power) return { text: L(`전력이 꽉 찼다 → ${power.name}`, `Power is full → ${power.name}`), tab: "infra", target: power.id };
  }
  return { text: L("컴퓨트를 늘려라", "Need more compute"), tab: "infra" };
}

/** 이 종류 건물 중 하나 더 샀을 때 metric이 비용 대비 가장 많이 오르는 것 */
function best(g: Game, kinds: string[], metric: (st: Stats) => number): Building | null {
  const s = g.state;
  const base = metric(g.stats);
  let out: Building | null = null, top = 0;
  for (const b of BUILDINGS) {
    if (!kinds.includes(b.kind) || !g.isBuildingUnlocked(b.id)) continue;
    const next = { ...s, buildings: { ...s.buildings, [b.id]: (s.buildings[b.id] ?? 0) + 1 } };
    const r = (metric(computeStats(next)) - base) / buildingCost(s, b, 1, g.stats.mult.cost);
    if (r > top) {
      top = r;
      out = b;
    }
  }
  return out;
}
