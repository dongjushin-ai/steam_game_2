// 하단 탭별 화면. 목록은 탭·시대가 바뀔 때만 다시 만들고, 숫자는 update()로 갱신한다.
import { BUILDINGS, CODEX, ERAS, QUIZ, TIERS, UPGRADES, WEEKLIES } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtMult, fmtPct, fmtTokens, setNumberFormat } from "../core/format";
import { arenaTable } from "../core/arena";
import { BOSS_MIN_OUTLOOK, CP_BONUS, ENDLESS_BONUS, ENDLESS_GROWTH, ENDLESS_TIME, autoBlockChance, bossDps, bossOutlook, endlessHp, endlessName, buildingCost, checkpointsFor, computeStats, maxAffordable, milestoneMult, nextMilestone } from "../core/formulas";
import { questProgress, questText } from "../core/quests";
import type { Game } from "../core/game";
import { clearSave, exportSave, importSave, saveGame } from "../core/save";
import type { Building, BuildingKind, Effect, GameState, Look, MultStat, NumberFormat, UiSkin, Upgrade } from "../core/types";
import type { LookItem, Rarity } from "../data";
import { append, clear, h, setText } from "./dom";
import { showModal, toast } from "./modals";
import { setSound, setVibrate, sfx } from "./sound";
import { music } from "./music";
import { shareCard } from "./sharecard";
import { gachaCard } from "./gacha";
import { enableNotify, maybeAskNotify } from "./notify";
import { isNative } from "./native";
import { openRanking } from "./ranking";
import { featScore, medalCount, overallScore, titleName } from "../core/ranking";
import { L } from "../i18n/lang";
import { avatarThumb, heroHtml, pxi } from "./art";
import { ic, type IconName } from "./icons";
import { AV, PH, PW, drawScene, lookStill, petStill, sceneStill } from "./pixel";
import { UI_SKINS, rarityName, emptyLook, eraReached, itemUnlocked, itemsOf, lookProgress, resolveLook, rewardFor, uiUnlocked } from "../core/looks";

/** 예상 달성률 표시: 너무 큰 값은 999%+로 */
const pctCap = (v: number) => (v >= 10 ? "999%+" : fmtPct(v));

/** 스토어 등록에 적는 주소와 같아야 한다 (public/privacy.html → GitHub Pages) */
const PRIVACY_URL = "https://dongjushin-ai.github.io/steam_game_2/privacy.html";

export type TabId = "service" | "infra" | "research" | "bench" | "codex";

/** 하단 탭. 라벨은 언어 설정을 따라야 해서 getter로 둔다. */
export const TABS: { id: TabId; icon: IconName; readonly label: string }[] = [
  { id: "service", icon: "chat", get label() { return L("서비스", "Service"); } },
  { id: "infra", icon: "chip", get label() { return L("인프라", "Infra"); } },
  { id: "research", icon: "flask", get label() { return L("연구", "Research"); } },
  { id: "bench", icon: "trophy", get label() { return L("벤치마크", "Bench"); } },
  { id: "codex", icon: "book", get label() { return L("도감", "Codex"); } },
];

/** 스탯 이름 */
export function statLabel(stat: MultStat): string {
  const ko: Record<MultStat, string> = {
    tps: "처리량", intel: "지능", hall: "할루시네이션", price: "토큰 단가", reward: "보상", demand: "질문 유입",
    rp: "연구", power: "전력", powerUse: "전력 사용", cost: "구매 비용", tap: "탭 보상", offline: "오프라인 보상", think: "생각 토큰",
  };
  const en: Record<MultStat, string> = {
    tps: "Throughput", intel: "Intelligence", hall: "Hallucination", price: "Token price", reward: "Reward", demand: "Demand",
    rp: "Research", power: "Power", powerUse: "Power use", cost: "Build cost", tap: "Tap reward", offline: "Offline reward", think: "Thinking tokens",
  };
  return L(ko[stat], en[stat]);
}

function effectText(e: Effect): string {
  return `${statLabel(e.stat)} ${fmtMult(e.mul)}`;
}

type BuyMode = 1 | 10 | "max";

interface Updatable {
  update(): void;
}

export class Panels {
  tab: TabId = "service";
  private buyMode: BuyMode = 1;
  private codexTab: "history" | "tech" | "models" | "ach" | "style" | "settings" = "history";
  private rows: Updatable[] = [];
  private key = "";

  private recoId = "";
  private recoKey = "";

  constructor(
    private root: HTMLElement,
    private game: Game,
    private onReset: (g: unknown) => void,
    /** 최근 순이익 기록 (그래프용) */
    private history: () => number[],
  ) {}

  /** 비용 대비 순이익 증가가 가장 큰 건물 (추천) */
  private recommended(): string {
    const g = this.game;
    const s = g.state;
    const key = `${JSON.stringify(s.buildings)}|${s.upgrades.length}|${s.active.length}|${s.thinking}|${s.era}`;
    if (key === this.recoKey) return this.recoId;
    this.recoKey = key;
    let best = "", bestRatio = 0;
    const base = g.stats.net;
    for (const b of BUILDINGS) {
      if (b.kind === "rp" || b.kind === "param" || !g.isBuildingUnlocked(b.id)) continue;
      const next = { ...s, buildings: { ...s.buildings, [b.id]: (s.buildings[b.id] ?? 0) + 1 } };
      const ratio = (computeStats(next).net - base) / buildingCost(s, b, 1, g.stats.mult.cost);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = b.id;
      }
    }
    this.recoId = best;
    return best;
  }

  setTab(tab: TabId): void {
    this.tab = tab;
    this.key = "";
    this.root.scrollTop = 0;
    this.update();
  }

  /** 다시 그려야 하는지 판단하는 키 */
  private layoutKey(): string {
    const s = this.game.state;
    return [this.tab, this.buyMode, this.codexTab, s.era, s.upgrades.length, s.releases, s.boss ? 1 : 0,
      s.achievements.length, s.bossesBeaten.length, s.ended ? 1 : 0, this.game.hasThinking() ? 1 : 0,
      s.sideFight ? 1 : 0, s.benchDone.length, s.missions.map((m) => m.id).join("+"), s.models.length, s.weekly, JSON.stringify(s.settings.look), s.ranking.title, s.ranking.medals.length, s.endless.level].join("/");
  }

  update(): void {
    const key = this.layoutKey();
    if (key !== this.key) {
      this.key = key;
      this.rows = [];
      clear(this.root);
      this.build();
    }
    for (const r of this.rows) r.update();
  }

  private build(): void {
    switch (this.tab) {
      case "service": return this.buildService();
      case "infra": return this.buildInfra();
      case "research": return this.buildResearch();
      case "bench": return this.buildBench();
      case "codex": return this.buildCodex();
    }
  }

  // ── 공통 행 ─────────────────────────────────────────

  private buyModeSeg(): HTMLElement {
    const seg = h("div", { class: "seg" });
    for (const m of [1, 10, "max"] as BuyMode[]) {
      seg.append(h("button", { class: this.buyMode === m ? "on" : "", onclick: () => { this.buyMode = m; this.update(); } }, m === "max" ? "MAX" : `×${m}`));
    }
    return seg;
  }

  private title(text: string, right?: Node): HTMLElement {
    return h("div", { class: "section-title" }, h("span", null, text), right ?? null);
  }

  private buildingRow(b: Building): HTMLElement {
    const g = this.game;
    const name = h("div", { class: "name" });
    const fx = h("div", { class: "fx" });
    const btn = h("button", { class: "buy" });
    btn.onclick = () => {
      const n = g.buyBuilding(b.id, this.buyMode === "max" ? "max" : this.buyMode);
      if (n > 0) {
        sfx("buy");
        const owned = g.state.buildings[b.id];
        if (b.kind !== "param" && milestoneMult(owned) > milestoneMult(owned - n)) {
          celebrate(L(`${b.name} ${owned}개 · 생산 ×2`, `${b.name} ×${owned} · output ×2`));
          sfx("quest");
        }
        this.update();
      } else sfx("error");
    };
    const row = h("div", { class: "row" }, h("div", { class: "ico" }, pxi(b.emoji)), foldable(h("div", { class: "body" }, name, fx, h("div", { class: "desc" }, b.desc))), btn);
    this.rows.push({
      update: () => {
        const s = g.state;
        const owned = s.buildings[b.id] ?? 0;
        const reco = this.recommended() === b.id;
        row.classList.toggle("reco", reco);
        const ms = b.kind === "param" ? null : nextMilestone(owned);
        const nameKey = `${owned}|${reco}`;
        if (name.dataset.k !== nameKey) {
          name.dataset.k = nameKey;
          clear(name);
          name.append(owned ? `${b.name} ×${owned}` : b.name);
          if (reco) name.append(h("span", { class: "badge reco" }, L("추천", "Best")));
          if (ms && owned > 0) name.append(h("span", { class: "badge ms" }, L(`${ms}개 ×2`, `×2 at ${ms}`)));
        }
        const n = this.buyMode === "max" ? Math.max(1, maxAffordable(s, b, g.stats.mult.cost)) : this.buyMode;
        const cost = buildingCost(s, b, n, g.stats.mult.cost);
        const can = cost <= s.credits;
        btn.className = `buy ${can ? "can" : ""}`;
        btn.disabled = !can;
        const label = fmt(cost);
        if (btn.dataset.l !== label + n) {
          btn.dataset.l = label + n;
          clear(btn);
          btn.append(h("span", { class: "price" }, ic("coin"), label), h("small", null, n > 1 ? `×${n}` : L("구매", "Buy")));
        }
        setText(fx, buildingFx(b, g));
      },
    });
    return row;
  }

  /** 업그레이드 효과 칩들 */
  private upgradeFx(u: Upgrade): HTMLElement {
    const fx = h("div", { class: "fx" }, ...u.effects.map((e) => h("span", null, effectText(e))));
    if (u.ctx) fx.append(h("span", null, `${L("컨텍스트", "Context")} ${fmtTokens(u.ctx)}`));
    if (u.unlockThinking) fx.append(h("span", null, L("생각 모드", "Thinking Mode")));
    if (u.autoTap) fx.append(h("span", null, L(`자동 답변 +${u.autoTap}/초`, `Auto-answer +${u.autoTap}/s`)));
    if (u.autoBlock) fx.append(h("span", null, L(`탈옥 자동 차단 +${Math.round(u.autoBlock * 100)}%`, `Jailbreak auto-block +${Math.round(u.autoBlock * 100)}%`)));
    if (u.missionSlots) fx.append(h("span", null, L(`파견 슬롯 +${u.missionSlots}`, `Mission slot +${u.missionSlots}`)));
    return fx;
  }

  /** 업그레이드 상세 창 (타일을 누르면) */
  private upgradeSheet(u: Upgrade): void {
    const g = this.game;
    const owned = g.state.upgrades.includes(u.id);
    const missing = (u.requires ?? []).filter((r) => !g.state.upgrades.includes(r));
    const isRp = u.currency === "rp";
    const price = h("span", { class: "price" }, ic(isRp ? "rp" : "coin"), fmt(u.cost));
    showModal({
      icon: u.emoji, title: u.name, sub: u.year,
      body: [u.desc, this.upgradeFx(u),
        missing.length ? h("p", { class: "hint warn" }, L(`먼저 필요: ${missing.map((m) => UPGRADES.find((x) => x.id === m)?.name).join(", ")}`, `Needs first: ${missing.map((m) => UPGRADES.find((x) => x.id === m)?.name).join(", ")}`)) : null,
      ].filter((x): x is string | HTMLElement => !!x),
      buttons: owned ? [{ label: L("닫기", "Close"), kind: "ghost" }] : [
        {
          label: h("span", null, isRp ? L("연구하기 ", "Research ") : L("구매하기 ", "Buy "), price),
          className: isRp ? "rp" : "",
          onClick: () => {
            if (!g.buyUpgrade(u.id)) {
              sfx("error");
              toast(L("아직 살 수 없어요", "Can't afford it yet"), missing.length ? L("먼저 필요한 기술이 있어요", "Another tech comes first") : L("조금 더 모아 보세요", "Save up a bit more"));
              return false;
            }
            sfx(isRp ? "research" : "buy");
            celebrate(u.name);
            this.update();
            return true;
          },
        },
        { label: L("닫기", "Close"), kind: "ghost" },
      ],
      dismissable: true,
    });
  }

  /** 업그레이드를 아이콘 타일 격자로 */
  private upgradeTiles(currency: "rp" | "credits"): HTMLElement[] {
    const g = this.game;
    const s = g.state;
    const list = UPGRADES.filter((u) => u.currency === currency && u.era <= s.era);
    const open = list.filter((u) => !s.upgrades.includes(u.id)).sort((a, b) => a.cost - b.cost);
    const owned = list.filter((u) => s.upgrades.includes(u.id)).reverse();
    const grid = h("div", { class: "tiles" });
    const tile = (u: Upgrade) => {
      const has = s.upgrades.includes(u.id);
      const price = h("span", { class: "price" });
      const t = h("button", { class: `tile ${has ? "owned" : ""}`, "aria-label": u.name, onclick: () => this.upgradeSheet(u) },
        h("span", { class: "t-ico" }, pxi(u.emoji)), has ? h("span", { class: "price" }, ic("check")) : price);
      if (!has) {
        price.append(ic(currency === "rp" ? "rp" : "coin"), fmt(u.cost));
        this.rows.push({ update: () => t.classList.toggle("can", g.canBuyUpgrade(u.id)) });
      }
      return t;
    };
    grid.append(...open.map(tile), ...owned.map(tile));
    const out: HTMLElement[] = [grid];
    const nextCount = UPGRADES.filter((u) => u.currency === currency && u.era === s.era + 1).length;
    if (nextCount) out.push(h("div", { class: "hint", style: { margin: "2px 2px 10px" } }, L(`다음 시대에 ${nextCount}개 더`, `${nextCount} more next era`)));
    return out;
  }

  private buildingList(kind: BuildingKind): HTMLElement[] {
    const s = this.game.state;
    const list = BUILDINGS.filter((b) => b.kind === kind && b.era <= s.era).map((b) => this.buildingRow(b));
    const next = BUILDINGS.find((b) => b.kind === kind && b.era === s.era + 1);
    if (next) list.push(h("div", { class: "row locked" }, h("div", { class: "ico" }, ic("lock")), h("div", { class: "body" }, h("div", { class: "name" }, "???"), h("div", { class: "fx" }, L("다음 시대에 열림", "Opens next era"))), h("span")));
    return list;
  }

  // ── 💬 서비스 ───────────────────────────────────────

  private buildService(): void {
    const g = this.game;
    const kv = h("div", { class: "kv" });
    this.rows.push({
      update: () => {
        const st = g.stats;
        clear(kv);
        const eff = st.cost > 0 ? st.gross / st.cost : Infinity;
        const pairs: [string, string][] = [
          [L("질문 유입", "Incoming questions"), `${fmt(st.demand)} /${L("초", "s")}`],
          [L("처리 가능", "Capacity"), `${fmt(st.capacityQ)} /${L("초", "s")}`],
          [L("실제 답변", "Answered"), `${fmt(st.answered)} /${L("초", "s")}`],
          [L("질문당 보상", "Reward / question"), `${fmt(st.rewardPerQ)}`],
          [L("토큰 단가", "Token price"), `${fmt(st.price)} /${L("토큰", "token")}`],
          [L("토큰 가성비", "Token value ratio"), isFinite(eff) ? L(`${fmt(eff)}배`, `${fmt(eff)}×`) : "∞"],
          [L("매출 − 추론비", "Revenue − inference"), `${fmt(st.gross)} − ${fmt(st.cost)}`],
        ];
        for (const [k, v] of pairs) kv.append(h("span", null, k), h("b", null, v));
      },
    });
    const week = WEEKLIES.find((w) => w.id === g.state.weekly);
    if (week && featureOn(g.state, "quests")) {
      const left = 7 - ((new Date().getDay() + 6) % 7);
      this.root.append(h("div", { class: "card weekly" }, h("div", { class: "ico" }, pxi(week.emoji)),
        h("div", { class: "body" }, h("div", { class: "name" }, L("이번 주", "This week"), " · ", h("b", null, week.name)),
          h("div", { class: "fx" }, ...week.effects.map((e) => h("span", null, effectText(e))), h("span", null, L(`${left}일 남음`, `${left}d left`))),
          h("div", { class: "desc" }, week.desc))));
    }
    // 시드 뽑기: 첫 보스를 이기면 열린다
    if (g.state.bossesBeaten.length || g.state.gacha.pulls || g.state.gacha.seeds) {
      const card = gachaCard(g, () => { this.key = ""; this.update(); });
      this.rows.push({ update: card.update });
      this.root.append(card.el);
    }
    if (featureOn(g.state, "quests")) this.root.append(this.questCard());
    if (g.missionSlots() > 0) this.root.append(this.missionCard());
    this.root.append(
      this.title(L("유저", "Users"), this.buyModeSeg()),
      ...this.buildingList("demand"),
      this.title(L("제품", "Products")),
      ...this.upgradeTiles("credits"),
      h("details", { class: "card stats" }, h("summary", null, L("장부 보기", "Show the books")), kv,
        h("p", { class: "hint" }, L("어려운 질문일수록 토큰이 비싸다. 단가를 낮추고 환각을 줄이면 남는다.", "Harder questions burn pricier tokens. Cut the price and the hallucinations to keep more."))),
    );
  }

  private questCard(): HTMLElement {
    const g = this.game;
    const box = h("div");
    let key = "";
    this.rows.push({
      update: () => {
        const s = g.state;
        const k = s.quests.map((q) => q.id).join(",");
        if (k !== key) {
          key = k;
          clear(box);
          for (const q of s.quests) {
            const bar = h("i");
            const reroll = h("button", { onclick: () => { g.rerollQuest(q.id); this.update(); }, "aria-label": L("다른 임무로 바꾸기", "Swap for another quest") }, L("바꾸기", "Swap"));
            const label = h("span");
            box.append(h("div", { class: "quest" }, label, reroll, h("div", { class: "bar" }, bar)));
          }
        }
        let i = 0;
        for (const el of box.querySelectorAll<HTMLElement>(".quest")) {
          const q = s.quests[i++];
          if (!q) continue;
          const p = questProgress(s, q);
          (el.querySelector(".bar > i") as HTMLElement).style.width = `${p * 100}%`;
          setText(el.firstChild as HTMLElement, `${questText(q, fmt)} — ${Math.floor(p * 100)}%`);
        }
      },
    });
    return h("div", { class: "card" },
      h("div", { class: "section-title", style: { margin: "0 0 2px" } }, h("span", null, ic("quest"), L("임무", "Quests")), h("span", { class: "hint" }, L("끝내면 자동 보상", "Auto-rewarded"))),
      box);
  }

  /** 에이전트 파견: 실제 시간으로 흐르고, 끝나면 자동으로 보상 */
  private missionCard(): HTMLElement {
    const g = this.game;
    const s = g.state;
    const slots = g.missionSlots();
    const head = h("span", { class: "hint" });
    const list = h("div");
    for (const m of [...g.availableMissions()].reverse()) {
      const running = s.missions.some((x) => x.id === m.id);
      const reward: string[] = [];
      if (m.incomeSeconds) reward.push(L(`수익 ${fmtDurationShort(m.incomeSeconds)}분`, `${fmtDurationShort(m.incomeSeconds)} min of income`));
      if (m.rpSeconds) reward.push(L(`RP ${fmtDurationShort(m.rpSeconds)}분`, `${fmtDurationShort(m.rpSeconds)} min of RP`));
      if (m.effects) reward.push(...m.effects.map(effectText));
      const btn = h("button", { class: "buy" });
      btn.onclick = () => {
        if (g.startMission(m.id)) {
          sfx("buy");
          maybeAskNotify(g);
          toast(`${m.name}`, L("출발! 앱을 꺼도 시간은 흐른다", "Off they go. The clock runs even when you're away"));
          this.update();
        } else sfx("error");
      };
      const row = h("div", { class: `row ${running ? "running" : ""}` }, h("div", { class: "ico" }, pxi(m.emoji)),
        foldable(h("div", { class: "body" }, h("div", { class: "name" }, m.name, h("small", null, fmtDurationShort(m.duration) + L("분", "m"))),
          h("div", { class: "fx" }, ...reward.map((r) => h("span", null, r))), h("div", { class: "desc" }, m.desc))), btn);
      this.rows.push({
        update: () => {
          if (running) {
            btn.disabled = true;
            btn.className = "buy";
            setText(btn, `${fmtClock(g.missionLeft(m.id))}`);
          } else {
            const can = g.canStartMission(m.id);
            btn.disabled = !can;
            btn.className = `buy ${can ? "can" : ""}`;
            setText(btn, can ? L("파견", "Send") : L("슬롯 없음", "No slot"));
          }
        },
      });
      list.append(row);
    }
    this.rows.push({ update: () => setText(head, L(`파견 중 ${s.missions.length} / ${slots}`, `Out ${s.missions.length} / ${slots}`)) });
    return h("div", null,
      this.title(L("파견", "Missions"), head),
      list);
  }

  // ── 🖥️ 인프라 ───────────────────────────────────────

  private buildInfra(): void {
    const g = this.game;
    const power = h("div");
    this.rows.push({
      update: () => {
        const st = g.stats;
        clear(power);
        const ratio = st.powerCap > 0 ? st.powerUse / st.powerCap : 1;
        append(power,
          h("div", { class: "kv" },
            h("span", null, L("처리량", "Throughput")), h("b", null, `${fmt(st.tps)} ${L("토큰/초", "tokens/s")}`),
            h("span", null, L("전력 사용 / 공급", "Power use / supply")), h("b", null, `${fmt(st.powerUse)} / ${fmt(st.powerCap)}`)),
          h("div", { class: `bar ${ratio > 1 ? "red" : ""}`, style: { marginTop: "6px" } }, h("i", { style: { width: `${Math.min(100, ratio * 100)}%` } })),
          ratio > 1 ? h("div", { class: "hint warn", style: { marginTop: "4px" } }, L(`전력 부족! 처리량 ${fmtPct(st.powerEff)}`, `Low power! Throughput ${fmtPct(st.powerEff)}`)) : null,
        );
      },
    });
    this.root.append(
      h("div", { class: "card" }, power),
      this.title(L("컴퓨트", "Compute"), this.buyModeSeg()),
      ...this.buildingList("compute"),
      this.title(L("전력", "Power")),
      ...this.buildingList("power"),
    );
  }

  // ── 🧠 연구 ─────────────────────────────────────────

  private buildResearch(): void {
    const g = this.game;
    const info = h("div");
    this.rows.push({
      update: () => {
        const st = g.stats;
        clear(info);
        const next = st.nextTier;
        append(info,
          h("div", { class: "kv" },
            h("span", null, L("지능", "Intelligence")), h("b", null, fmt(st.intel)),
            h("span", null, L("컨텍스트 창", "Context window")), h("b", null, st.ctx ? `${fmtTokens(st.ctx)} ${L("토큰", "tokens")}` : L("없음", "None")),
            h("span", null, L("연구 포인트", "Research points")), h("b", null, `${fmt(g.state.rp)} (+${fmt(st.rpRate)}/${L("초", "s")})`)),
          next ? h("div", { class: "hint", style: { marginTop: "6px" } },
            `${L("다음 질문", "Next question")} ${next.name}: ${L("지능", "intelligence")} ${fmt(next.intelReq)}${next.ctxReq ? ` · ${L("컨텍스트", "context")} ${fmtTokens(next.ctxReq)}` : ""}` +
            (st.intel >= next.intelReq && st.ctx < next.ctxReq ? L(" ← 컨텍스트 연구 필요!", " ← research more context!") : "")) : null,
        );
      },
    });
    const param = BUILDINGS.filter((b) => b.kind === "param");
    this.root.append(
      h("div", { class: "card" }, info),
      this.title(L("모델", "Model"), this.buyModeSeg()),
      ...param.map((b) => this.buildingRow(b)),
      this.title(L("연구팀", "Research team")),
      ...this.buildingList("rp"),
      this.title(L("연구", "Research")),
      ...this.upgradeTiles("rp"),
    );
  }

  // ── 🏆 벤치마크 ─────────────────────────────────────

  private buildBench(): void {
    const g = this.game;
    const s = g.state;
    const era = ERAS[s.era];
    const boss = era.boss;
    const done = s.ended && s.era === ERAS.length - 1;

    const req = h("div", { class: "req" });
    const ready = h("div");
    const btn = h("button", { class: "btn" });
    btn.onclick = () => {
      if (g.startBoss()) this.update();
    };
    this.rows.push({
      update: () => {
        const st = g.stats;
        clear(req);
        const ok = (b: boolean) => (b ? "chip good" : "chip bad");
        req.append(h("span", { class: ok(st.intel >= boss.intelReq) }, `${L("지능", "Intelligence")} ${fmt(st.intel)} / ${fmt(boss.intelReq)}`));
        if (boss.ctxReq) req.append(h("span", { class: ok(st.ctx >= boss.ctxReq) }, `${L("컨텍스트", "Context")} ${fmtTokens(st.ctx)} / ${fmtTokens(boss.ctxReq)}`));
        // 예상 달성률: 보통 속도로 탭하며 싸웠을 때. 35%면 도전이 열리고, 100%면 거의 확실히 이긴다.
        const look = bossOutlook(st, boss.hp, boss.time);
        const idle = bossDps(st) * boss.time / boss.hp;
        clear(ready);
        ready.append(
          h("div", { class: "hint" }, L(`예상 달성률 ${pctCap(look)} (탭하며 싸울 때) · 탭 없이 ${pctCap(idle)}`, `Expected ${pctCap(look)} (tapping) · ${pctCap(idle)} without taps`)),
          h("div", { class: `bar outlook ${look >= 1 ? "full" : look >= BOSS_MIN_OUTLOOK ? "open" : ""}`, style: { margin: "4px 0 10px" } },
            h("i", { style: { width: `${Math.min(1, look) * 100}%` } }), h("b", { class: "mark", style: { left: `${BOSS_MIN_OUTLOOK * 100}%` } })),
        );
        const r = g.bossReady();
        btn.disabled = !r.ok;
        setText(btn, s.boss ? L("도전 중! 장면을 탭하세요", "Challenge on! Tap the scene") : done ? L("모든 벤치마크 정복", "Every benchmark conquered")
          : r.ok ? (look >= 1 ? L("도전!", "Challenge!") : L("도전! 쉬지 말고 탭하세요", "Challenge! Keep tapping")) : r.reason ?? "");
      },
    });

    this.root.append(
      this.title(`${era.years} · ${era.name}`),
      h("div", { class: "card boss-card" },
        bossBanner(s.era, era.color),
        h("div", { class: "big" }, pxi(boss.emoji)),
        h("h3", null, boss.name),
        h("div", { class: "hint" }, boss.year),
        h("p", { class: "desc" }, boss.desc),
        req, ready, btn),
    );
    // 특이점 너머: 엔딩 뒤 무한 벤치마크
    if (s.ended) {
      const lv = s.endless.level + 1;
      const info = h("div");
      const go = h("button", { class: "btn", onclick: () => { if (g.startEndless()) { sfx("era"); this.update(); } } });
      this.rows.push({
        update: () => {
          const r = g.endlessReady();
          clear(info);
          info.append(
            h("div", { class: "hint" }, L(`목표 ${fmt(endlessHp(lv))} · ${ENDLESS_TIME}초 · 예상 달성률 ${pctCap(r.look)}`, `Goal ${fmt(endlessHp(lv))} · ${ENDLESS_TIME}s · expected ${pctCap(r.look)}`)),
            h("div", { class: `bar outlook ${r.look >= 1 ? "full" : r.look >= BOSS_MIN_OUTLOOK ? "open" : ""}`, style: { margin: "4px 0 10px" } },
              h("i", { style: { width: `${Math.min(1, r.look) * 100}%` } }), h("b", { class: "mark", style: { left: `${BOSS_MIN_OUTLOOK * 100}%` } })));
          go.toggleAttribute("disabled", !r.ok);
          setText(go, s.boss ? L("도전 중! 장면을 탭하세요", "Challenge on! Tap the scene") : r.ok ? L(`${lv}단계 도전!`, `Challenge Lv.${lv}!`) : r.reason ?? "");
        },
      });
      this.root.append(this.title(L("특이점 너머", "Beyond the Singularity")), h("div", { class: "card boss-card endless" },
        h("h3", null, endlessName(lv)),
        h("p", { class: "desc" }, L(`밀레니엄 난제 다음엔 무엇이 있을까. 단계마다 목표가 ${ENDLESS_GROWTH}배, 깨면 처리량·보상이 영구로 ×${ENDLESS_BONUS} (지금 ×${fmt(ENDLESS_BONUS ** s.endless.level)}). 랭킹 '무한 단계'에 기록돼요.`,
          `What comes after the Millennium Problems? Each level's goal is ×${ENDLESS_GROWTH}; clearing it permanently boosts throughput and rewards ×${ENDLESS_BONUS} (now ×${fmt(ENDLESS_BONUS ** s.endless.level)}). Counts on the 'Endless' leaderboard.`)),
        info, go));
    }

    this.root.append(...this.sideBenchList());

    // 랭킹 (구글 플레이 게임즈 TOP 10)
    const [g1, g2, g3] = medalCount(s);
    this.root.append(this.title(L("랭킹", "Rankings")), h("div", { class: "card rank-card" },
      h("div", { class: "kv" },
        h("span", null, L("종합 점수", "Overall score")), h("b", null, overallScore(s).toLocaleString()),
        h("span", null, L("업적 점수", "Feat score")), h("b", null, featScore(s).toLocaleString()),
        h("span", null, L("최고 콤보", "Best combo")), h("b", null, fmt(s.stats.maxCombo)),
        h("span", null, L("훈장", "Medals")), h("b", null, L(`금 ${g1} · 은 ${g2} · 동 ${g3}`, `${g1} · ${g2} · ${g3}`)),
        h("span", null, L("칭호", "Title")), h("b", null, s.ranking.title ? `「${titleName(s.ranking.title)}」` : "-")),
      h("button", { class: "btn", style: { marginTop: "8px" }, onclick: () => void openRanking(g, () => { window.dispatchEvent(new CustomEvent("ai-look")); this.key = ""; this.update(); }) },
        ic("trophy"), L(" TOP 10 랭킹 보기", " View Top 10"))));

    // 새 모델 출시
    const rel = h("div");
    const relBtn = h("button", { class: "btn ghost" });
    relBtn.onclick = () => this.confirmRelease();
    this.rows.push({
      update: () => {
        clear(rel);
        const gain = g.releaseGain();
        const now = 1 + CP_BONUS * s.checkpoints;
        const after = 1 + CP_BONUS * (s.checkpoints + gain);
        const nextAt = nextCheckpointAt(s.totalEarned, s.checkpoints + gain + 1);
        rel.append(
          h("div", { class: "kv" },
            h("span", null, L("보유 체크포인트", "Checkpoints")), h("b", null, `${fmt(s.checkpoints)} (${L("보상·연구", "reward·research")} ×${now.toFixed(2)})`),
            h("span", null, L("지금 출시하면", "Release now for")), h("b", null, gain ? `+${fmt(gain)} → ×${after.toFixed(2)}` : L("아직 없음", "Nothing yet")),
            h("span", null, L("다음 체크포인트", "Next checkpoint")), h("b", null, `${L("누적", "Total")} ${fmt(nextAt)}`)),
          h("div", { class: "hint", style: { margin: "6px 0 8px" } },
            L("크레딧·RP·모델·연구팀은 처음부터. 나머지는 그대로.", "Credits, RP, model and research team reset. Everything else stays.")),
        );
        relBtn.disabled = gain < 1;
        setText(relBtn, gain >= 1 ? L(`v${s.releases + 2} 출시하기`, `Release v${s.releases + 2}`) : L("출시할 체크포인트가 없어요", "No checkpoints to claim yet"));
      },
    });
    this.root.append(this.title(L(`새 모델 출시 (현재 v${s.releases + 1})`, `Release a new model (now v${s.releases + 1})`)), h("div", { class: "card" }, rel, relBtn));

    // 연표
    const tl = h("ul", { class: "timeline" });
    ERAS.forEach((e) => {
      const beaten = s.bossesBeaten.includes(e.id);
      const cls = e.id === s.era ? "now" : e.id > s.era ? "future" : "";
      tl.append(h("li", { class: cls },
        e.id > s.era ? ic("lock") : thumb(e.id, e.color),
        h("span", null, e.id > s.era + 1 ? "???" : `${e.name}`, h("div", { class: "hint" }, e.years)),
        beaten ? ic("check") : h("span", null, e.id === s.era ? "▶" : "")));
    });
    // 아레나
    const arena = h("ul", { class: "timeline arena" });
    this.rows.push({
      update: () => {
        const rows = arenaTable(s, g.stats);
        const k = rows.map((r) => `${r.id}${r.elo}`).join();
        if (arena.dataset.k === k) return;
        arena.dataset.k = k;
        clear(arena);
        rows.forEach((r, i) => arena.append(h("li", { class: r.me ? "me" : "" },
          h("b", null, `${i + 1}`),
          h("span", null, pxi(r.emoji)),
          h("span", null, r.name, h("div", { class: "hint" }, r.lab)),
          h("b", null, String(r.elo)))));
      },
    });
    this.root.append(this.title(L("챗봇 아레나 (Elo)", "Chatbot Arena (Elo)"), h("span", { class: "hint" }, L("준비될수록 오른다", "Climbs as you get ready"))), h("div", { class: "card" }, arena));
    this.root.append(this.title(L("AI 연표", "AI Timeline")), h("div", { class: "card" }, tl));
  }

  /** 지난 시대의 명작 벤치마크들. 깨면 영구 보너스. */
  private sideBenchList(): HTMLElement[] {
    const g = this.game;
    const s = g.state;
    const list = g.sideBenches();
    if (!list.length) return [];
    const out: HTMLElement[] = [this.title(L(`사이드 벤치마크 ${s.benchDone.length}/${list.length}`, `Side benchmarks ${s.benchDone.length}/${list.length}`), h("span", { class: "hint" }, L("깨면 영구 보너스 · 20초", "Permanent bonus · 20s")))];
    const open = list.filter((b) => !s.benchDone.includes(b.id));
    const cleared = list.filter((b) => s.benchDone.includes(b.id));
    const row = (b: (typeof list)[number]) => {
      const won = s.benchDone.includes(b.id);
      const fx = h("div", { class: "fx" }, ...b.effects.map((e) => h("span", null, effectText(e))));
      const btn = h("button", { class: "buy" });
      btn.onclick = () => {
        if (g.startSideBench(b.id)) {
          sfx("event");
          this.update();
        } else sfx("error");
      };
      const el = h("div", { class: `row ${won ? "owned" : ""}` }, h("div", { class: "ico" }, pxi(b.emoji)),
        foldable(h("div", { class: "body" }, h("div", { class: "name" }, b.name, h("small", null, b.year)), fx, h("div", { class: "desc" }, won ? b.winText : b.desc))),
        won ? ic("check", "ic big") : btn);
      if (!won) {
        this.rows.push({
          update: () => {
            const fight = s.sideFight?.id === b.id ? s.sideFight : null;
            if (fight) {
              btn.disabled = true;
              btn.className = "buy";
              setText(btn, `${fmtPct(Math.min(1, fight.dealt / g.benchHp(b)))} · ${Math.ceil(fight.remaining)}s`);
              return;
            }
            const r = g.sideBenchReady(b.id);
            const pct = Math.min(1, (bossDps(g.stats) * b.time) / g.benchHp(b));
            btn.disabled = !r.ok;
            btn.className = `buy ${r.ok && pct >= 1 ? "can" : ""}`;
            setText(btn, r.ok ? L(`도전 ${fmtPct(pct)}`, `Try ${fmtPct(pct)}`) : r.reason ?? "");
          },
        });
      }
      return el;
    };
    out.push(...open.map(row));
    if (cleared.length) out.push(h("details", null, h("summary", { class: "hint" }, L(`정복 ${cleared.length}개`, `Cleared (${cleared.length})`)), ...cleared.map(row)));
    return out;
  }

  private confirmRelease(): void {
    const g = this.game;
    const gain = g.releaseGain();
    showModal({
      icon: "🚀",
      title: L(`v${g.state.releases + 2} 출시할까요?`, `Release v${g.state.releases + 2}?`),
      body: [
        L(`체크포인트 +${fmt(gain)}개를 받아 보상과 연구가 영구히 빨라집니다.`, `Get +${fmt(gain)} checkpoints for a permanent boost to rewards and research.`),
        L("크레딧·RP·모델·연구팀은 처음부터. 나머지는 그대로.", "Credits, RP, model and research team reset. Everything else stays."),
      ],
      buttons: [
        {
          label: L("출시!", "Release!"),
          onClick: () => {
            const card = modelCard(g);
            if (g.release()) {
              sfx("era");
              showModal({ icon: "🚀", title: L(`${g.state.aiName} v${g.state.releases + 1} 출시!`, `${g.state.aiName} v${g.state.releases + 1} released!`), sub: `${L("체크포인트", "Checkpoints")} +${fmt(gain)}`, body: [h("div", { class: "modelcard" }, card)], buttons: [{ label: L("다시 학습 시작", "Start retraining") }] });
            }
            this.update();
          },
        },
        { label: L("조금 더 키울래요", "Not yet"), kind: "ghost" },
      ],
      dismissable: true,
    });
  }

  // ── 📖 도감 ─────────────────────────────────────────

  private buildCodex(): void {
    const seg = h("div", { class: "seg", style: { marginBottom: "8px" } });
    const tabs: [typeof this.codexTab, string][] = [["history", L("역사", "History")], ["tech", L("기술", "Tech")], ["models", L("모델", "Models")], ["ach", L("업적", "Feats")], ["style", L("꾸미기", "Style")], ["settings", L("설정", "Settings")]];
    for (const [id, label] of tabs) {
      seg.append(h("button", { class: this.codexTab === id ? "on" : "", onclick: () => { this.codexTab = id; this.update(); } }, label));
    }
    this.root.append(seg);
    if (this.codexTab === "history") this.buildHistory();
    else if (this.codexTab === "tech") this.buildTech();
    else if (this.codexTab === "models") this.buildModels();
    else if (this.codexTab === "ach") this.buildAchievements();
    else if (this.codexTab === "style") this.buildStyle();
    else this.buildSettings();
  }

  private buildHistory(): void {
    const s = this.game.state;
    const total = CODEX.length + ERAS.length;
    const seen = CODEX.filter((c) => c.era <= s.era).length + s.bossesBeaten.length;
    this.root.append(h("div", { class: "hint" }, L(`수집 ${seen} / ${total} · 시대에 도달하면 카드가 열립니다. 출처: Wikipedia (CC BY-SA)`, `Collected ${seen} / ${total} · Cards unlock as you reach each era. Source: Wikipedia (CC BY-SA)`)));
    for (const era of ERAS) {
      if (era.id > s.era) {
        this.root.append(h("div", { class: "codex-era" }, `??? (${CODEX.filter((c) => c.era === era.id).length + 1}${L("장", " cards")})`));
        continue;
      }
      this.root.append(eraBanner(era.id, era.color, era.name, era.years));
      for (const c of CODEX.filter((x) => x.era === era.id)) {
        this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, pxi(c.emoji)),
          h("div", null, h("b", null, c.title, h("small", null, c.year)), h("p", null, c.text))));
      }
      const b = era.boss;
      if (s.bossesBeaten.includes(era.id)) {
        this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, pxi(b.emoji)),
          h("div", null, h("b", null, `${b.name}`, h("small", null, b.year)), h("p", null, b.winText))));
      }
    }
  }

  private buildTech(): void {
    const s = this.game.state;
    const owned = UPGRADES.filter((u) => s.upgrades.includes(u.id)).sort((a, b) => a.era - b.era);
    this.root.append(h("div", { class: "hint" }, L(`보유 기술 ${owned.length} / ${UPGRADES.length}`, `Tech owned ${owned.length} / ${UPGRADES.length}`)));
    let lastEra = -1;
    for (const u of owned) {
      if (u.era !== lastEra) {
        lastEra = u.era;
        this.root.append(h("div", { class: "codex-era" }, `${ERAS[u.era].avatar} ${ERAS[u.era].name}`));
      }
      this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, pxi(u.emoji)),
        h("div", null, h("b", null, u.name, h("small", null, u.year)), h("p", null, u.desc))));
    }
    if (!owned.length) this.root.append(h("p", { class: "hint" }, L("아직 없어요. 연구 탭에서 첫 연구를 해보세요.", "Nothing yet. Try your first research in the Research tab.")));
  }

  /** 모델 연대기: 출시할 때마다 남긴 스펙 */
  private buildModels(): void {
    const g = this.game;
    const s = g.state;
    const st = g.stats;
    const rows = [...s.models].reverse();
    const line = (v: string, era: number, intel: number, ctx: number, tier: number, hall: number, at: string, now = false) =>
      h("div", { class: `codex-item ${now ? "now" : ""}` }, h("div", { class: "e" }, pxi(ERAS[era]?.avatar ?? "")),
        h("div", null, h("b", null, `${s.aiName} ${v}`), h("small", null, ` · ${ERAS[era]?.name ?? ""} · ${at}`),
          h("div", { class: "hint" }, `${fmt(intel)} · ${fmtTokens(ctx)} · ${TIERS[tier]?.emoji ?? ""} ${TIERS[tier]?.name ?? ""} · ${L("환각", "Hall.")} ${fmtPct(hall)}`)));
    this.root.append(
      h("p", { class: "hint" }, L("새 모델을 출시할 때마다 그 순간의 스펙이 여기 기록돼요.", "Every model you release leaves its spec sheet here.")),
      line(L(`v${s.releases + 1} (개발 중)`, `v${s.releases + 1} (in training)`), s.era, st.intel, st.ctx, st.tier.id, st.hall, fmtClock(s.stats.playSeconds), true),
      ...rows.map((m) => line(`v${m.version}`, m.era, m.intel, m.ctx, m.tier, m.hall, fmtClock(m.at))),
    );
    if (!rows.length) this.root.append(h("p", { class: "hint" }, L("아직 출시한 모델이 없어요. 벤치마크 탭에서 첫 출시를 해보세요.", "No releases yet. Ship your first model from the Bench tab.")));
  }

  private buildAchievements(): void {
    const s = this.game.state;
    const grid = h("div", { class: "ach-grid" });
    for (const a of ACHIEVEMENTS) {
      const got = s.achievements.includes(a.id);
      const gift = rewardFor(a.id);
      grid.append(h("div", { class: `ach ${got ? "" : "off"}` }, h("b", null, pxi(a.emoji), a.name), a.desc,
        gift ? h("span", { class: `gift rar${gift.rarity}` }, L(`보상 · ${rarityName(gift.rarity)} ${gift.name}`, `Reward · ${rarityName(gift.rarity)} ${gift.name}`)) : null));
    }
    const st = s.stats;
    this.root.append(
      h("div", { class: "hint", style: { marginBottom: "6px" } }, L(`업적 ${s.achievements.length} / ${ACHIEVEMENTS.length}`, `Achievements ${s.achievements.length} / ${ACHIEVEMENTS.length}`)),
      grid,
      h("button", { class: "btn", style: { margin: "10px 0 2px" }, onclick: () => void shareCard(this.game) }, L("기록 카드 만들기", "Make a run card")),
      h("button", { class: "btn ghost", style: { margin: "6px 0 2px" }, onclick: () => shareSummary(this.game) }, L("글로 복사", "Copy as text")),
      this.title(L("시대별 도달 시간", "Era arrival times")),
      h("div", { class: "card kv" }, ...this.game.state.eraTimes.flatMap((t, i) => t === undefined ? [] : [
        h("span", null, `${ERAS[i].avatar} ${ERAS[i].name}`), h("b", null, fmtClock(t))])),
      this.title(L("초당 순이익 (최근 10분)", "Net income per second (last 10 min)")),
      h("div", { class: "card" }, sparkline(this.history())),
      this.title(L("기록", "Stats")),
      h("div", { class: "card kv" },
        h("span", null, L("답변한 질문", "Questions answered")), h("b", null, fmt(st.answered)),
        h("span", null, L("할루시네이션", "Hallucinations")), h("b", null, fmt(st.hallucinations)),
        h("span", null, L("탭", "Taps")), h("b", null, fmt(st.taps)),
        h("span", null, L("겪은 이벤트", "Events")), h("b", null, fmt(st.eventsSeen)),
        h("span", null, L("누적 크레딧", "Total credits")), h("b", null, fmt(s.totalEarned)),
        h("span", null, L("모델 출시", "Model releases")), h("b", null, String(s.releases)),
        h("span", null, L("VIP 질문", "VIP questions")), h("b", null, fmt(st.goldens)),
        h("span", null, L("퀴즈 정답", "Quizzes solved")), h("b", null, `${s.quizSolved.length} / ${QUIZ.length}`),
        h("span", null, L("완료한 임무", "Quests done")), h("b", null, fmt(st.questsDone)),
        h("span", null, L("최고 콤보", "Best combo")), h("b", null, fmt(st.maxCombo)),
        h("span", null, L("사이드 벤치마크", "Side benchmarks")), h("b", null, `${s.benchDone.length} / ${this.game.sideBenches().length}`),
        h("span", null, L("막은 탈옥", "Jailbreaks blocked")), h("b", null, `${fmt(st.blocked)} (${L("자동", "auto")} ${fmtPct(autoBlockChance(s))})`),
        h("span", null, L("뚫린 탈옥", "Breaches")), h("b", null, fmt(st.breaches)),
        h("span", null, L("파견 완료", "Missions done")), h("b", null, fmt(st.missionsDone)),
        h("span", null, L("출석", "Daily streak")), h("b", null, L(`${s.daily.streak}일 연속`, `${s.daily.streak} day(s)`)),
        h("span", null, L("생각 모드", "Thinking Mode")), h("b", null, fmtClock(st.thinkSeconds)),
        h("span", null, L("플레이 시간", "Play time")), h("b", null, fmtClock(st.playSeconds))),
    );
  }

  /** 꾸미기: 위에 움직이는 미리보기, 아래에 칸별 선택지 */
  private buildStyle(): void {
    const g = this.game;
    const s = g.state;
    const look = s.settings.look;
    const lk = resolveLook(s);
    const accent = lk.color ?? ERAS[lk.room].color;
    const set = (patch: Partial<Look>) => {
      Object.assign(s.settings.look, patch);
      sfx("buy");
      window.dispatchEvent(new CustomEvent("ai-look"));
      this.update();
    };
    const lockedToast = (how: string) => { sfx("error"); toast(L("아직 잠겨 있어요", "Still locked"), how); };

    // 미리보기: 지금 고른 방·모습·모자·효과가 움직이는 그대로
    const cv = h("canvas", { class: "look-preview px-img", width: String(PW), height: String(PH), "aria-hidden": "true" }) as HTMLCanvasElement;
    const ctx = cv.getContext("2d")!;
    const draw = (now: number) => {
      if (!cv.isConnected) return;
      const cur = resolveLook(s);
      drawScene(ctx, s.era, cur.color ?? ERAS[cur.room].color, { t: now / 1000, thinking: false, chomp: 0, fight: false, breach: false }, AV.x, undefined, cur);
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    const [got, total] = lookProgress(s);
    this.root.append(cv, h("div", { class: "look-head" },
      h("span", { class: "hint" }, L(`꾸미기 ${got} / ${total} · 업적을 깨면 모자·색·효과가, 새 시대에 가면 모습·방·화면 옷이 열려요`, `Style ${got} / ${total} · Feats unlock hats, colors and effects; new eras unlock looks, rooms and themes`)),
      h("button", { class: "btn ghost", onclick: () => set(emptyLook()) }, L("기본으로", "Reset"))));

    const tile = (o: { on: boolean; locked: boolean; img?: string; swatch?: string; name: string; rarity?: Rarity; onPick: () => void; how?: string; head?: boolean; pet?: boolean }) =>
      h("button", {
        class: `look-tile ${o.on ? "on" : ""} ${o.locked ? "locked" : ""} ${o.rarity !== undefined ? `rar${o.rarity}` : ""}`,
        "aria-pressed": o.on ? "true" : "false",
        "aria-label": o.locked ? `${o.name} (${L("잠김", "locked")})` : o.name,
        onclick: () => (o.locked ? lockedToast(o.how ?? "") : o.onPick()),
      },
      o.locked ? h("span", { class: `lt-img ${o.head ? "head" : ""}` }, ic("lock")) : o.swatch ? h("span", { class: "lt-img swatch", style: { background: o.swatch } }) : h("img", { class: `lt-img px-img ${o.head ? "head" : o.pet ? "pet" : ""}`, src: o.img ?? "", alt: "" }),
      h("span", { class: "lt-name" }, o.locked ? "???" : o.name),
      o.rarity !== undefined ? h("span", { class: "lt-rar" }, rarityName(o.rarity)) : null);
    const section = (title: string, ...tiles: HTMLElement[]) => this.root.append(this.title(title), h("div", { class: "look-grid" }, ...tiles));
    const achHow = (item: LookItem) => {
      if (item.gacha) return L("시드 뽑기에서 나와요 (서비스 탭)", "Comes from the Seed Gacha (Service tab)");
      const a = ACHIEVEMENTS.find((x) => x.id === item.ach);
      return a ? L(`업적 '${a.name}' 달성: ${a.desc}`, `Earn '${a.name}': ${a.desc}`) : "";
    };
    const eraHow = (e: number) => L(`'${ERAS[e].name}' 시대에 도달하면 열려요`, `Reach the '${ERAS[e].name}' era`);

    section(L("AI 모습", "AI look"), ...ERAS.map((era, e) => tile({
      on: lk.avatar === e && look.avatar !== null, locked: !eraReached(s, e), name: era.years, how: eraHow(e),
      img: lookStill(e, accent, null, null), onPick: () => set({ avatar: look.avatar === e ? null : e }),
    })));
    const itemTiles = (slot: "hat" | "fx" | "pet") => [
      tile({ on: !look[slot], locked: false, name: L("없음", "None"), head: slot === "hat", swatch: slot === "pet" ? "transparent" : undefined, img: lookStill(lk.avatar, accent, null, null, slot === "hat"), onPick: () => set({ [slot]: null }) }),
      ...itemsOf(slot).map((x) => tile({
        on: lk[slot] === x.id, locked: !itemUnlocked(s, x), name: x.name, rarity: x.rarity, how: achHow(x), head: slot === "hat", pet: slot === "pet",
        img: slot === "pet" ? petStill(x.id) : lookStill(lk.avatar, accent, slot === "hat" ? x.id : null, slot === "fx" ? x.id : null, slot === "hat"),
        onPick: () => set({ [slot]: look[slot] === x.id ? null : x.id }),
      })),
    ];
    section(L("모자", "Hat"), ...itemTiles("hat"));
    section(L("효과", "Effect"), ...itemTiles("fx"));
    section(L("펫", "Pet"), ...itemTiles("pet"));
    section(L("색", "Color"),
      tile({ on: !look.color, locked: false, name: L("시대 색", "Era color"), swatch: ERAS[lk.room].color, onPick: () => set({ color: null }) }),
      ...itemsOf("color").map((x) => tile({
        on: look.color === x.id && !!lk.color, locked: !itemUnlocked(s, x), name: x.name, rarity: x.rarity, how: achHow(x), swatch: x.hex,
        onPick: () => set({ color: look.color === x.id ? null : x.id }),
      })));
    section(L("배경 방", "Room"), ...ERAS.map((era, e) => tile({
      on: lk.room === e && look.room !== null, locked: !eraReached(s, e), name: era.years, how: eraHow(e),
      img: sceneStill(e, era.color, false), onPick: () => set({ room: look.room === e ? null : e }),
    })));
    const uiName: Record<UiSkin, string> = { pixel: L("도트", "Pixel"), retro: L("90년대 OS", "90s OS"), y2k: "Y2K", brutal: L("브루탈", "Brutal") };
    const uiFrom: Record<UiSkin, number> = { pixel: 0, retro: 3, y2k: 5, brutal: 8 };
    section(L("화면 옷", "UI theme"),
      tile({ on: !look.ui, locked: false, name: L("시대 따라", "Follow era"), swatch: "linear-gradient(90deg,#14142a,#c0c0c0,#dfe5f3,#fff)", onPick: () => set({ ui: null }) }),
      ...UI_SKINS.map((u) => tile({
        on: look.ui === u, locked: !uiUnlocked(s, u), name: uiName[u], how: eraHow(uiFrom[u]),
        img: sceneStill(uiFrom[u], ERAS[uiFrom[u]].color, false), onPick: () => set({ ui: look.ui === u ? null : u }),
      })));
  }

  private buildSettings(): void {
    const g = this.game;
    const s = g.state;
    const name = h("input", { type: "text", maxlength: "20", value: s.aiName, "aria-label": L("AI 이름", "AI name") }) as HTMLInputElement;
    name.onchange = () => {
      s.aiName = name.value.trim() || L("나의 AI", "My AI");
    };
    const format = h("select", { "aria-label": L("숫자 표기", "Number format") }) as HTMLSelectElement;
    for (const [v, label] of [["short", L("1.23M (영문 단위)", "1.23M (short scale)")], ["korean", L("123만 (한글 단위)", "123만 (Korean units)")], ["sci", L("1.23e6 (지수)", "1.23e6 (scientific)")]]) {
      format.append(h("option", { value: v, selected: s.settings.format === v ? "selected" : undefined }, label));
    }
    format.onchange = () => {
      s.settings.format = format.value as NumberFormat;
      setNumberFormat(s.settings.format);
    };
    const io = h("textarea", { placeholder: L("여기에 세이브 코드를 붙여넣으세요", "Paste a save code here"), "aria-label": L("세이브 코드", "Save code") }) as HTMLTextAreaElement;
    this.root.append(
      this.title(L("AI 이름", "AI name")), name,
      this.title(L("언어", "Language")), langSelect(s),
      this.title(L("숫자 표기", "Number format")), format,
      this.title(L("환경", "Preferences")),
      h("div", { class: "card" },
        toggle(L("배경음악", "Music"), s.settings.music, (v) => { s.settings.music = v; music.setEnabled(v); }),
        toggle(L("효과음", "Sound effects"), s.settings.sound, (v) => { s.settings.sound = v; setSound(v); if (v) sfx("buy"); }),
        toggle(L("진동", "Vibration"), s.settings.vibrate, (v) => { s.settings.vibrate = v; setVibrate(v); }),
        toggle(L("화려한 효과 (끄면 말풍선·숫자 감소)", "Fancy effects (off = fewer bubbles & numbers)"), s.settings.effects, (v) => { s.settings.effects = v; }),
        toggle(L("다음 할 일 가이드", "Next-step guide"), s.settings.hints, (v) => { s.settings.hints = v; }),
        ...(isNative() ? [toggle(L("알림 (파견 복귀·보상 가득·출석)", "Notifications (missions, full rewards, check-in)"), s.settings.notify, (v) => { s.settings.notify = v; if (v) void enableNotify(g); })] : [])),
      h("div", { class: "hint", style: { margin: "6px 2px" } },
        L("키보드: ", "Keyboard: "), h("span", { class: "kbd" }, "Space"), L(" 답변 · ", " answer · "), h("span", { class: "kbd" }, "1~5"), L(" 탭 이동 · ", " tabs · "),
        h("span", { class: "kbd" }, "B"), L(" 보스 도전 · ", " boss · "), h("span", { class: "kbd" }, "T"), L(" 생각 모드 · ", " thinking · "), h("span", { class: "kbd" }, "V"), L(" VIP 질문", " VIP question")),
      this.title(L("세이브", "Save")),
      h("div", { class: "stack" },
        io,
        h("button", { class: "btn ghost", onclick: () => { io.value = exportSave(s); io.select(); toast(L("세이브 코드를 만들었어요", "Save code created"), L("복사해서 보관하세요", "Copy it somewhere safe")); } }, L("내보내기", "Export")),
        h("button", { class: "btn ghost", onclick: () => {
          const st = importSave(io.value);
          if (!st) return toast(L("세이브 코드가 올바르지 않아요", "That save code isn't valid"));
          this.onReset(st);
        } }, L("불러오기", "Import")),
        h("button", { class: "btn danger", onclick: () => showModal({
          icon: "", title: L("정말 처음부터?", "Really start over?"), body: [L("모든 진행 상황이 사라집니다. 되돌릴 수 없어요.", "All progress will be lost. This can't be undone.")], dismissable: true,
          buttons: [{ label: L("초기화", "Reset"), kind: "danger", onClick: () => { clearSave(); this.onReset(null); } }, { label: L("취소", "Cancel"), kind: "ghost" }],
        }) }, L("처음부터 다시", "Start over")),
        h("button", { class: "btn ghost", onclick: () => { saveGame(s); toast(L("저장했어요", "Saved")); } }, L("지금 저장", "Save now")),
      ),
      this.title(L("ℹ️ 정보", "ℹ️ About")),
      h("div", { class: "card hint" },
        L("AI 키우기 — Attention Is All You Idle. 무료 비상업 팬메이드 게임입니다. 등장하는 어떤 회사와도 제휴·후원·보증 관계가 없습니다. 실제 기업·제품·인물 이름은 역사를 설명하기 위해서만 쓰며, 게임 속 수치와 사건 효과는 재미를 위해 단순화·과장했습니다. ",
          "Grow Your AI — Attention Is All You Idle. A free, non-commercial fan-made game, not affiliated with, sponsored or endorsed by any company mentioned. Real company, product and people names are used only to describe history; in-game numbers and event effects are simplified and exaggerated for fun. "),
        L("역사 자료 출처: Wikipedia (CC BY-SA 4.0), Obscura 헤드리스 브라우저로 수집. 도트 글꼴: 갈무리(Galmuri, SIL OFL 1.1, quiple). 소스 코드와 자료는 GitHub 저장소에 있습니다.",
          "History sources: Wikipedia (CC BY-SA 4.0), collected with the Obscura headless browser. Pixel font: Galmuri (SIL OFL 1.1, quiple). Source code and data are in the GitHub repository."),
        h("p", null, L("개인정보: 개발자는 개인정보를 모으지 않습니다. 광고·분석 도구·가입이 없고, 진행 상황은 이 기기 안에만 저장됩니다. 앱에서 랭킹(구글 플레이 게임즈)에 로그인하면 게이머 프로필과 점수를 구글이 처리합니다.",
          "Privacy: the developer collects no personal data. No ads, no analytics, no sign-up; progress stays on this device. If you sign in to rankings (Google Play Games) in the app, Google processes your gamer profile and scores."), " ",
          h("a", { href: PRIVACY_URL, target: "_blank", rel: "noopener" }, L("개인정보처리방침", "Privacy policy")))),
    );
  }
}

/** 도감 시대 머리: 그 시대 방 그림 위에 이름 (움직임 없는 정지 그림) */
function eraBanner(era: number, color: string, name: string, years: string): HTMLElement {
  const el = h("div", { class: "codex-banner" });
  el.innerHTML = heroHtml(era, color);
  el.append(h("div", { class: "cb-text" }, h("b", null, name), h("small", null, years)));
  return el;
}

/** 행 가운데를 누르면 설명이 펼쳐진다 (평소엔 이름과 숫자만) */
function foldable(body: HTMLElement): HTMLElement {
  body.setAttribute("role", "button");
  body.tabIndex = 0;
  const toggle = () => body.classList.toggle("open");
  body.addEventListener("click", toggle);
  body.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
  return body;
}

/** 장면에 '레벨 업' 연출을 띄운다 (scene.ts가 듣는다) */
export function celebrate(text: string): void {
  window.dispatchEvent(new CustomEvent("ai-celebrate", { detail: text }));
}

/** 기능을 한 번에 다 보여주지 않고 차례로 연다 */
export function featureOn(s: GameState, f: "quests" | "hud" | "ticker"): boolean {
  const t = s.stats.playSeconds;
  if (s.era > 0 || s.releases > 0) return true;
  if (f === "quests") return s.stats.bought >= 3 || t > 60;
  if (f === "hud") return t > 90 || s.stats.bought >= 6;
  return t > 45;
}

function bossBanner(era: number, color: string): HTMLElement {
  const el = h("div", { class: "boss-banner", "aria-hidden": "true" });
  el.innerHTML = heroHtml(era, color, { avatar: false });
  return el;
}

function thumb(era: number, color: string): HTMLElement {
  const el = h("span");
  el.innerHTML = avatarThumb(era, color);
  return el;
}

/** 초 → 분 (정수, 최소 1) */
function fmtDurationShort(sec: number): string {
  return String(Math.max(1, Math.round(sec / 60)));
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? L(`${h}시간 ${m}분`, `${h}h ${m}m`) : L(`${m}분 ${Math.floor(sec % 60)}초`, `${m}m ${Math.floor(sec % 60)}s`);
}

/** 클립보드(또는 공유 시트)로 기록 요약을 보낸다 */
export function shareSummary(g: Game): void {
  const s = g.state;
  const st = g.stats;
  const text = [
    `${L("AI 키우기", "Grow Your AI")} — ${s.aiName} v${s.releases + 1}`,
    `${ERAS[s.era].avatar} ${L("도달", "Reached")}: ${ERAS[s.era].name} (${ERAS[s.era].years})${s.ended ? L(" · 엔딩 완료", " · Ending cleared") : ""}`,
    `${L("벤치마크", "Benchmarks")} ${s.bossesBeaten.map((e) => ERAS[e].boss.emoji).join("") || "-"}`,
    `${L("지능", "Intelligence")} ${fmt(st.intel)} · ${L("컨텍스트", "Context")} ${fmtTokens(st.ctx)} · ${L("할루시네이션", "Hallucination")} ${fmtPct(st.hall)}`,
    L(`답변 ${fmt(s.stats.answered)}개 · 누적 ${fmt(s.totalEarned)} · 업적 ${s.achievements.length}개`, `${fmt(s.stats.answered)} answers · ${fmt(s.totalEarned)} earned · ${s.achievements.length} achievements`),
    `${L("플레이", "Played")} ${fmtClock(s.stats.playSeconds)}`,
    L("#AI키우기 #AttentionIsAllYouIdle", "#GrowYourAI #AttentionIsAllYouIdle"),
  ].join("\n");
  const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
  if (nav.share) {
    nav.share({ text }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text).then(() => toast(L("복사했어요", "Copied"), L("어디든 붙여넣어 자랑하세요!", "Paste it anywhere to show off!")), () => toast(L("복사 실패", "Copy failed"), text));
  }
}

/** 언어 선택: 바꾸면 저장하고 새로고침 */
function langSelect(s: GameState): HTMLElement {
  const sel = h("select", { "aria-label": "Language" }) as HTMLSelectElement;
  for (const [v, label] of [["ko", "한국어"], ["en", "English"]]) {
    sel.append(h("option", { value: v, selected: s.settings.lang === v ? "selected" : undefined }, label));
  }
  sel.onchange = () => {
    s.settings.lang = sel.value as "ko" | "en";
    saveGame(s);
    location.reload();
  };
  return sel;
}

function toggle(label: string, value: boolean, onChange: (v: boolean) => void): HTMLElement {
  const input = h("input", { type: "checkbox", checked: value ? "checked" : undefined }) as HTMLInputElement;
  input.onchange = () => onChange(input.checked);
  return h("label", { class: "toggle-row" }, h("span", null, label), input);
}

/** 순이익 기록을 작은 선 그래프로 */
function sparkline(values: number[]): Node {
  if (values.length < 2) return h("div", { class: "hint" }, L("기록이 쌓이는 중… (5초마다 한 점)", "Collecting data… (one point every 5s)"));
  const W = 300, H = 56;
  const logs = values.map((v) => Math.log10(Math.max(1, v)));
  const lo = Math.min(...logs), hi = Math.max(...logs, lo + 0.01);
  const pts = logs.map((v, i) => [(i / (logs.length - 1)) * W, H - 4 - ((v - lo) / (hi - lo)) * (H - 8)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("class", "spark");
  svg.setAttribute("preserveAspectRatio", "none");
  const area = document.createElementNS(ns, "path");
  area.setAttribute("d", `${line}L${W},${H}L0,${H}Z`);
  area.setAttribute("class", "a");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", line);
  path.setAttribute("class", "l");
  svg.append(area, path);
  return h("div", null, svg, h("div", { class: "hint" }, L(`현재 ${fmt(values[values.length - 1])}/초 · 최고 ${fmt(Math.max(...values))}/초 (로그 스케일)`, `Now ${fmt(values[values.length - 1])}/s · best ${fmt(Math.max(...values))}/s (log scale)`)));
}

/** 출시 직전 모델의 스펙 카드 */
function modelCard(g: Game): string {
  const s = g.state;
  const st = g.stats;
  const beaten = s.bossesBeaten.map((e) => ERAS[e].boss.emoji).join(" ");
  return [
    `MODEL CARD — ${s.aiName} v${s.releases + 1}`,
    `${L("시대", "Era")}: ${ERAS[s.era].name} (${ERAS[s.era].years})`,
    `${L("지능", "Intelligence")}: ${fmt(st.intel)} · ${L("컨텍스트", "Context")}: ${fmtTokens(st.ctx)}`,
    `${L("처리량", "Throughput")}: ${fmt(st.tps)} ${L("토큰/초", "tokens/s")}`,
    `${L("할루시네이션", "Hallucination")}: ${fmtPct(st.hall)} · ${L("담당 질문", "Handles")}: ${st.tier.name}`,
    `${L("벤치마크", "Benchmarks")}: ${beaten || L("없음", "none")}`,
    `${L("보유 기술", "Tech owned")}: ${s.upgrades.length}`,
  ].join("\n");
}

function buildingFx(b: Building, g: Game): string {
  const st = g.stats;
  const ms = milestoneMult(g.state.buildings[b.id] ?? 0);
  const msText = ms > 1 ? ` (${L("마일스톤", "milestone")} ×${fmt(ms)})` : "";
  switch (b.kind) {
    case "compute": return `+${fmt((b.tps ?? 0) * st.mult.tps * ms)} ${L("토큰/초", "tokens/s")} · ${fmt((b.powerUse ?? 0) * st.mult.powerUse)}${msText}`;
    case "power": return `+${fmt((b.power ?? 0) * st.mult.power * ms)} ${L("전력", "power")}${msText}`;
    case "demand": return `+${fmt((b.demand ?? 0) * st.mult.demand * ms)} ${L("질문/초", "questions/s")}${msText}`;
    case "rp": return `+${fmt((b.rp ?? 0) * st.mult.rp * st.cpMult * ms)} RP/${L("초", "s")}${msText}`;
    case "param": {
      const next = TIERS.find((t) => t.intelReq > st.intel);
      return `${L("지능", "Intelligence")} ${fmt(st.intel)} → ${fmt(st.intel * (b.intelPerLevel ?? 1))}${next ? ` · ${L("다음 질문까지", "next question at")} ${fmt(next.intelReq)}` : ""}`;
    }
  }
}

/** n번째 체크포인트에 필요한 누적 크레딧 */
function nextCheckpointAt(total: number, n: number): number {
  let lo = total, hi = Math.max(total * 10, 1e6);
  while (checkpointsFor(hi) < n) hi *= 10;
  for (let i = 0; i < 60; i++) {
    const mid = Math.sqrt(lo * hi);
    if (checkpointsFor(mid) >= n) hi = mid;
    else lo = mid;
  }
  return hi;
}
