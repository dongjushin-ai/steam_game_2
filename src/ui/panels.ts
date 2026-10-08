// 하단 탭별 화면. 목록은 탭·시대가 바뀔 때만 다시 만들고, 숫자는 update()로 갱신한다.
import { BUILDINGS, CODEX, ERAS, QUIZ, TIERS, UPGRADES } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtMult, fmtPct, fmtTokens, setNumberFormat } from "../core/format";
import { arenaTable } from "../core/arena";
import { CP_BONUS, bossDps, buildingCost, checkpointsFor, computeStats, maxAffordable, milestoneMult, nextMilestone } from "../core/formulas";
import { questProgress, questText } from "../core/quests";
import type { Game } from "../core/game";
import { clearSave, exportSave, importSave, saveGame } from "../core/save";
import type { Building, BuildingKind, Effect, MultStat, NumberFormat, Upgrade } from "../core/types";
import { append, clear, h, setText } from "./dom";
import { showModal, toast } from "./modals";
import { setSound, setVibrate, sfx } from "./sound";

export type TabId = "service" | "infra" | "research" | "bench" | "codex";

export const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: "service", icon: "💬", label: "서비스" },
  { id: "infra", icon: "🖥️", label: "인프라" },
  { id: "research", icon: "🧠", label: "연구" },
  { id: "bench", icon: "🏆", label: "벤치마크" },
  { id: "codex", icon: "📖", label: "도감" },
];

const STAT_LABEL: Record<MultStat, string> = {
  tps: "처리량", intel: "지능", hall: "할루시네이션", price: "토큰 단가", reward: "보상", demand: "질문 유입",
  rp: "연구", power: "전력", powerUse: "전력 사용", cost: "구매 비용", tap: "탭 보상", offline: "오프라인 보상", think: "생각 토큰",
};

function effectText(e: Effect): string {
  return `${STAT_LABEL[e.stat]} ${fmtMult(e.mul)}`;
}

type BuyMode = 1 | 10 | "max";

interface Updatable {
  update(): void;
}

export class Panels {
  tab: TabId = "service";
  private buyMode: BuyMode = 1;
  private codexTab: "history" | "tech" | "ach" | "settings" = "history";
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

  /** 비용 대비 순이익 증가가 가장 큰 건물 (💡추천) */
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
      s.achievements.length, s.bossesBeaten.length, s.ended ? 1 : 0, this.game.hasThinking() ? 1 : 0].join("/");
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
          toast(`🎉 ${b.emoji} ${b.name} ${owned}개 달성!`, "마일스톤: 이 건물의 생산량 ×2");
          sfx("quest");
        }
        this.update();
      } else sfx("error");
    };
    const row = h("div", { class: "row" }, h("div", { class: "ico" }, b.emoji), h("div", null, name, h("div", { class: "desc" }, b.desc), fx), btn);
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
          if (reco) name.append(h("span", { class: "badge reco" }, "💡추천"));
          if (ms && owned > 0) name.append(h("span", { class: "badge ms" }, `${ms}개 ×2`));
        }
        const n = this.buyMode === "max" ? Math.max(1, maxAffordable(s, b, g.stats.mult.cost)) : this.buyMode;
        const cost = buildingCost(s, b, n, g.stats.mult.cost);
        const can = cost <= s.credits;
        btn.className = `buy ${can ? "can" : ""}`;
        btn.disabled = !can;
        const label = `💵 ${fmt(cost)}`;
        if (btn.dataset.l !== label + n) {
          btn.dataset.l = label + n;
          clear(btn);
          btn.append(label, h("small", null, n > 1 ? `${n}개 구매` : "구매"));
        }
        setText(fx, buildingFx(b, g));
      },
    });
    return row;
  }

  private upgradeRow(u: Upgrade): HTMLElement {
    const g = this.game;
    const owned = g.state.upgrades.includes(u.id);
    const missing = (u.requires ?? []).filter((r) => !g.state.upgrades.includes(r));
    const fx = h("div", { class: "fx" }, ...u.effects.map((e) => h("span", null, effectText(e))));
    if (u.ctx) fx.append(h("span", null, `컨텍스트 ${fmtTokens(u.ctx)}`));
    if (u.unlockThinking) fx.append(h("span", null, "🤔 생각 모드"));
    const isRp = u.currency === "rp";
    const btn = h("button", { class: `buy ${isRp ? "rp" : ""}` });
    btn.onclick = () => {
      if (g.buyUpgrade(u.id)) {
        sfx(isRp ? "research" : "buy");
        toast(`${u.emoji} ${u.name}`, u.effects.map(effectText).join(" · ") || "해금!");
        this.update();
      }
    };
    const row = h("div", { class: `row ${owned ? "owned" : missing.length ? "locked" : ""}` },
      h("div", { class: "ico" }, u.emoji),
      h("div", null, h("div", { class: "name" }, u.name, h("small", null, u.year)), h("div", { class: "desc" }, u.desc), fx),
      owned ? h("span", { class: "hint" }, "✅") : btn);
    if (!owned) {
      if (missing.length) {
        btn.disabled = true;
        btn.append("🔒", h("small", null, `${missing.map((m) => UPGRADES.find((x) => x.id === m)?.name).join(", ")} 필요`));
      } else {
        this.rows.push({
          update: () => {
            const can = g.canBuyUpgrade(u.id);
            btn.className = `buy ${isRp ? "rp" : ""} ${can ? "can" : ""}`;
            btn.disabled = !can;
            setText(btn, `${isRp ? "🧠" : "💵"} ${fmt(u.cost)}`);
          },
        });
      }
    }
    return row;
  }

  private upgradeList(currency: "rp" | "credits"): HTMLElement[] {
    const s = this.game.state;
    const list = UPGRADES.filter((u) => u.currency === currency && u.era <= s.era);
    const open = list.filter((u) => !s.upgrades.includes(u.id)).sort((a, b) => a.cost - b.cost);
    const owned = list.filter((u) => s.upgrades.includes(u.id)).reverse();
    const out = open.map((u) => this.upgradeRow(u));
    const nextCount = UPGRADES.filter((u) => u.currency === currency && u.era === s.era + 1).length;
    if (nextCount) out.push(h("div", { class: "hint", style: { margin: "4px 2px 10px" } }, `🔒 다음 시대에 ${nextCount}개 더 열려요`));
    if (owned.length) {
      const details = h("details", null, h("summary", { class: "hint" }, `보유 중 ${owned.length}개`), ...owned.map((u) => this.upgradeRow(u)));
      out.push(details);
    }
    return out;
  }

  private buildingList(kind: BuildingKind): HTMLElement[] {
    const s = this.game.state;
    const list = BUILDINGS.filter((b) => b.kind === kind && b.era <= s.era).map((b) => this.buildingRow(b));
    const next = BUILDINGS.find((b) => b.kind === kind && b.era === s.era + 1);
    if (next) list.push(h("div", { class: "row locked" }, h("div", { class: "ico" }, "❔"), h("div", null, h("div", { class: "name" }, "???"), h("div", { class: "desc" }, "다음 시대에 해금")), h("span")));
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
          ["질문 유입", `${fmt(st.demand)} /초`],
          ["처리 가능", `${fmt(st.capacityQ)} /초`],
          ["실제 답변", `${fmt(st.answered)} /초`],
          ["질문당 보상", `💵 ${fmt(st.rewardPerQ)}`],
          ["토큰 단가", `💵 ${fmt(st.price)} /토큰`],
          ["토큰 가성비", isFinite(eff) ? `${fmt(eff)}배` : "∞"],
          ["매출 − 추론비", `${fmt(st.gross)} − ${fmt(st.cost)}`],
        ];
        for (const [k, v] of pairs) kv.append(h("span", null, k), h("b", null, v));
      },
    });
    this.root.append(this.questCard());
    this.root.append(
      h("div", { class: "card" }, kv, h("div", { class: "hint", style: { marginTop: "6px" } },
        "토큰 가성비 = 매출 ÷ 추론 비용. 어려운 질문일수록 토큰도 비싸요. 🧠연구의 효율 기술(양자화·캐싱·증류…)로 단가를 낮추고, 할루시네이션을 줄이면 이익이 늘어요.")),
      this.title("👥 유저 확보", this.buyModeSeg()),
      ...this.buildingList("demand"),
      this.title("🧩 제품 · 플러그인 · 커넥터"),
      ...this.upgradeList("credits"),
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
            const reroll = h("button", { onclick: () => { g.rerollQuest(q.id); this.update(); }, "aria-label": "다른 임무로 바꾸기" }, "🔄 바꾸기");
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
      h("div", { class: "section-title", style: { margin: "0 0 2px" } }, h("span", null, "📋 임무"), h("span", { class: "hint" }, "달성하면 자동 보상 (수익·RP)")),
      box);
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
            h("span", null, "처리량"), h("b", null, `${fmt(st.tps)} 토큰/초`),
            h("span", null, "전력 사용 / 공급"), h("b", null, `⚡ ${fmt(st.powerUse)} / ${fmt(st.powerCap)}`)),
          h("div", { class: `bar ${ratio > 1 ? "red" : ""}`, style: { marginTop: "6px" } }, h("i", { style: { width: `${Math.min(100, ratio * 100)}%` } })),
          ratio > 1 ? h("div", { class: "hint warn", style: { marginTop: "4px" } }, `전력이 모자라 처리량이 ${fmtPct(st.powerEff)}로 떨어졌어요. 데이터센터를 늘리세요.`) : null,
        );
      },
    });
    this.root.append(
      h("div", { class: "card" }, power),
      this.title("🖥️ 컴퓨트", this.buyModeSeg()),
      ...this.buildingList("compute"),
      this.title("🏢 데이터센터 · 전력"),
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
            h("span", null, "지능"), h("b", null, fmt(st.intel)),
            h("span", null, "컨텍스트 창"), h("b", null, st.ctx ? `${fmtTokens(st.ctx)} 토큰` : "없음"),
            h("span", null, "연구 포인트"), h("b", null, `🧠 ${fmt(g.state.rp)} (+${fmt(st.rpRate)}/초)`)),
          next ? h("div", { class: "hint", style: { marginTop: "6px" } },
            `다음 질문 ${next.emoji} ${next.name}: 지능 ${fmt(next.intelReq)}${next.ctxReq ? ` · 컨텍스트 ${fmtTokens(next.ctxReq)}` : ""}` +
            (st.intel >= next.intelReq && st.ctx < next.ctxReq ? " ← 컨텍스트 연구 필요!" : "")) : null,
        );
      },
    });
    const param = BUILDINGS.filter((b) => b.kind === "param");
    this.root.append(
      h("div", { class: "card" }, info),
      this.title("🧠 모델 키우기", this.buyModeSeg()),
      ...param.map((b) => this.buildingRow(b)),
      this.title("👩‍🔬 연구팀"),
      ...this.buildingList("rp"),
      this.title("🔬 연구 (🧠 RP로 구매)"),
      ...this.upgradeList("rp"),
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
        req.append(h("span", { class: ok(st.intel >= boss.intelReq) }, `🧠 지능 ${fmt(st.intel)} / ${fmt(boss.intelReq)}`));
        if (boss.ctxReq) req.append(h("span", { class: ok(st.ctx >= boss.ctxReq) }, `📜 컨텍스트 ${fmtTokens(st.ctx)} / ${fmtTokens(boss.ctxReq)}`));
        const expect = bossDps(st) * boss.time;
        const pct = Math.min(1, expect / boss.hp);
        clear(ready);
        ready.append(
          h("div", { class: "hint" }, `예상 점수 ${fmt(expect)} / 목표 ${fmt(boss.hp)} (${boss.time}초, 탭 미포함)`),
          h("div", { class: "bar", style: { margin: "4px 0 10px" } }, h("i", { style: { width: `${pct * 100}%` } })),
        );
        const r = g.bossReady();
        btn.disabled = !r.ok;
        setText(btn, s.boss ? "도전 중! 장면을 탭하세요" : done ? "모든 벤치마크 정복 ✨" : r.ok ? (pct >= 1 ? "도전하기!" : `도전하기 (예상 ${fmtPct(pct)} · 처리량을 더 늘리세요)`) : `🔒 ${r.reason}`);
      },
    });

    this.root.append(
      this.title(`${era.years} · ${era.name}`),
      h("div", { class: "card boss-card" },
        h("div", { class: "big" }, boss.emoji),
        h("h3", null, boss.name),
        h("div", { class: "hint" }, boss.year),
        h("p", { class: "desc" }, boss.desc),
        req, ready, btn),
    );

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
            h("span", null, "보유 체크포인트"), h("b", null, `💾 ${fmt(s.checkpoints)} (보상·연구 ×${now.toFixed(2)})`),
            h("span", null, "지금 출시하면"), h("b", null, gain ? `+${fmt(gain)} → ×${after.toFixed(2)}` : "아직 없음"),
            h("span", null, "다음 체크포인트"), h("b", null, `누적 💵 ${fmt(nextAt)}`)),
          h("div", { class: "hint", style: { margin: "6px 0 8px" } },
            "모델을 처음부터 다시 학습합니다. 크레딧·연구 포인트·파라미터·연구팀은 초기화되고, 인프라·유저·연구·상품·시대는 그대로 남아요."),
        );
        relBtn.disabled = gain < 1;
        setText(relBtn, gain >= 1 ? `🚀 v${s.releases + 2} 출시하기` : "🚀 출시할 체크포인트가 없어요");
      },
    });
    this.root.append(this.title(`🚀 새 모델 출시 (현재 v${s.releases + 1})`), h("div", { class: "card" }, rel, relBtn));

    // 연표
    const tl = h("ul", { class: "timeline" });
    ERAS.forEach((e) => {
      const beaten = s.bossesBeaten.includes(e.id);
      const cls = e.id === s.era ? "now" : e.id > s.era ? "future" : "";
      tl.append(h("li", { class: cls },
        h("span", null, e.id > s.era ? "❔" : e.avatar),
        h("span", null, e.id > s.era + 1 ? "???" : `${e.name}`, h("div", { class: "hint" }, e.years)),
        h("span", null, beaten ? `✅ ${e.boss.emoji}` : e.id === s.era ? "▶" : "")));
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
          h("span", null, i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`),
          h("span", null, r.emoji),
          h("span", null, r.name, h("div", { class: "hint" }, r.lab)),
          h("b", null, String(r.elo)))));
      },
    });
    this.root.append(this.title("🏟️ 챗봇 아레나 (Elo)", h("span", { class: "hint" }, "보스 준비도·정답률이 오르면 순위 상승")), h("div", { class: "card" }, arena));
    this.root.append(this.title("🗺️ AI 연표"), h("div", { class: "card" }, tl));
  }

  private confirmRelease(): void {
    const g = this.game;
    const gain = g.releaseGain();
    showModal({
      icon: "🚀",
      title: `v${g.state.releases + 2} 출시할까요?`,
      body: [
        `체크포인트 💾 +${fmt(gain)}개를 받아 보상과 연구가 영구히 빨라집니다.`,
        "크레딧, 연구 포인트, 파라미터 확장, 연구팀이 초기화돼요. 인프라·유저·연구·상품·시대는 그대로입니다.",
      ],
      buttons: [
        {
          label: "출시!",
          onClick: () => {
            const card = modelCard(g);
            if (g.release()) {
              sfx("era");
              showModal({ icon: "🚀", title: `${g.state.aiName} v${g.state.releases + 1} 출시!`, sub: `체크포인트 +${fmt(gain)}`, body: [h("div", { class: "modelcard" }, card)], buttons: [{ label: "다시 학습 시작" }] });
            }
            this.update();
          },
        },
        { label: "조금 더 키울래요", kind: "ghost" },
      ],
      dismissable: true,
    });
  }

  // ── 📖 도감 ─────────────────────────────────────────

  private buildCodex(): void {
    const seg = h("div", { class: "seg", style: { marginBottom: "8px" } });
    const tabs: [typeof this.codexTab, string][] = [["history", "📜 역사"], ["tech", "🔬 기술"], ["ach", "🏅 업적"], ["settings", "⚙️ 설정"]];
    for (const [id, label] of tabs) {
      seg.append(h("button", { class: this.codexTab === id ? "on" : "", onclick: () => { this.codexTab = id; this.update(); } }, label));
    }
    this.root.append(seg);
    if (this.codexTab === "history") this.buildHistory();
    else if (this.codexTab === "tech") this.buildTech();
    else if (this.codexTab === "ach") this.buildAchievements();
    else this.buildSettings();
  }

  private buildHistory(): void {
    const s = this.game.state;
    const total = CODEX.length + ERAS.length;
    const seen = CODEX.filter((c) => c.era <= s.era).length + s.bossesBeaten.length;
    this.root.append(h("div", { class: "hint" }, `수집 ${seen} / ${total} · 시대에 도달하면 카드가 열립니다. 출처: Wikipedia (CC BY-SA)`));
    for (const era of ERAS) {
      if (era.id > s.era) {
        this.root.append(h("div", { class: "codex-era" }, `❔ ??? (${CODEX.filter((c) => c.era === era.id).length + 1}장)`));
        continue;
      }
      this.root.append(h("div", { class: "codex-era" }, `${era.avatar} ${era.name} · ${era.years}`));
      for (const c of CODEX.filter((x) => x.era === era.id)) {
        this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, c.emoji),
          h("div", null, h("b", null, c.title, h("small", null, c.year)), h("p", null, c.text))));
      }
      const b = era.boss;
      if (s.bossesBeaten.includes(era.id)) {
        this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, b.emoji),
          h("div", null, h("b", null, `🏆 ${b.name}`, h("small", null, b.year)), h("p", null, b.winText))));
      }
    }
  }

  private buildTech(): void {
    const s = this.game.state;
    const owned = UPGRADES.filter((u) => s.upgrades.includes(u.id)).sort((a, b) => a.era - b.era);
    this.root.append(h("div", { class: "hint" }, `보유 기술 ${owned.length} / ${UPGRADES.length}`));
    let lastEra = -1;
    for (const u of owned) {
      if (u.era !== lastEra) {
        lastEra = u.era;
        this.root.append(h("div", { class: "codex-era" }, `${ERAS[u.era].avatar} ${ERAS[u.era].name}`));
      }
      this.root.append(h("div", { class: "codex-item" }, h("div", { class: "e" }, u.emoji),
        h("div", null, h("b", null, u.name, h("small", null, u.year)), h("p", null, u.desc))));
    }
    if (!owned.length) this.root.append(h("p", { class: "hint" }, "아직 없어요. 🧠 연구 탭에서 첫 연구를 해보세요."));
  }

  private buildAchievements(): void {
    const s = this.game.state;
    const grid = h("div", { class: "ach-grid" });
    for (const a of ACHIEVEMENTS) {
      const got = s.achievements.includes(a.id);
      grid.append(h("div", { class: `ach ${got ? "" : "off"}` }, h("b", null, `${a.emoji} ${a.name}`), a.desc));
    }
    const st = s.stats;
    this.root.append(
      h("div", { class: "hint", style: { marginBottom: "6px" } }, `업적 ${s.achievements.length} / ${ACHIEVEMENTS.length}`),
      grid,
      h("button", { class: "btn", style: { margin: "10px 0 2px" }, onclick: () => shareSummary(this.game) }, "📤 내 기록 자랑하기 (복사)"),
      this.title("⏱️ 시대별 도달 시간"),
      h("div", { class: "card kv" }, ...this.game.state.eraTimes.flatMap((t, i) => t === undefined ? [] : [
        h("span", null, `${ERAS[i].avatar} ${ERAS[i].name}`), h("b", null, fmtClock(t))])),
      this.title("📈 초당 순이익 (최근 10분)"),
      h("div", { class: "card" }, sparkline(this.history())),
      this.title("📊 기록"),
      h("div", { class: "card kv" },
        h("span", null, "답변한 질문"), h("b", null, fmt(st.answered)),
        h("span", null, "할루시네이션"), h("b", null, fmt(st.hallucinations)),
        h("span", null, "탭"), h("b", null, fmt(st.taps)),
        h("span", null, "겪은 이벤트"), h("b", null, fmt(st.eventsSeen)),
        h("span", null, "누적 크레딧"), h("b", null, fmt(s.totalEarned)),
        h("span", null, "모델 출시"), h("b", null, `${s.releases}회`),
        h("span", null, "⭐VIP 질문"), h("b", null, fmt(st.goldens)),
        h("span", null, "퀴즈 정답"), h("b", null, `${s.quizSolved.length} / ${QUIZ.length}`),
        h("span", null, "완료한 임무"), h("b", null, fmt(st.questsDone)),
        h("span", null, "최고 콤보"), h("b", null, fmt(st.maxCombo)),
        h("span", null, "생각 모드"), h("b", null, `${Math.floor(st.thinkSeconds / 60)}분`),
        h("span", null, "플레이 시간"), h("b", null, `${Math.floor(st.playSeconds / 3600)}시간 ${Math.floor((st.playSeconds % 3600) / 60)}분`)),
    );
  }

  private buildSettings(): void {
    const g = this.game;
    const s = g.state;
    const name = h("input", { type: "text", maxlength: "20", value: s.aiName }) as HTMLInputElement;
    name.onchange = () => {
      s.aiName = name.value.trim() || "나의 AI";
    };
    const format = h("select") as HTMLSelectElement;
    for (const [v, label] of [["short", "1.23M (영문 단위)"], ["korean", "123만 (한글 단위)"], ["sci", "1.23e6 (지수)"]]) {
      format.append(h("option", { value: v, selected: s.settings.format === v ? "selected" : undefined }, label));
    }
    format.onchange = () => {
      s.settings.format = format.value as NumberFormat;
      setNumberFormat(s.settings.format);
    };
    const io = h("textarea", { placeholder: "여기에 세이브 코드를 붙여넣으세요" }) as HTMLTextAreaElement;
    this.root.append(
      this.title("🤖 AI 이름"), name,
      this.title("🔢 숫자 표기"), format,
      this.title("🎛️ 환경"),
      h("div", { class: "card" },
        toggle("🔊 효과음", s.settings.sound, (v) => { s.settings.sound = v; setSound(v); if (v) sfx("buy"); }),
        toggle("📳 진동", s.settings.vibrate, (v) => { s.settings.vibrate = v; setVibrate(v); }),
        toggle("✨ 화려한 효과 (끄면 말풍선·숫자 감소)", s.settings.effects, (v) => { s.settings.effects = v; }),
        toggle("💡 다음 할 일 가이드", s.settings.hints, (v) => { s.settings.hints = v; })),
      h("div", { class: "hint", style: { margin: "6px 2px" } },
        "키보드: ", h("span", { class: "kbd" }, "Space"), " 답변 · ", h("span", { class: "kbd" }, "1~5"), " 탭 이동 · ",
        h("span", { class: "kbd" }, "B"), " 보스 도전 · ", h("span", { class: "kbd" }, "T"), " 생각 모드 · ", h("span", { class: "kbd" }, "V"), " VIP 질문"),
      this.title("💾 세이브"),
      h("div", { class: "stack" },
        io,
        h("button", { class: "btn ghost", onclick: () => { io.value = exportSave(s); io.select(); toast("세이브 코드를 만들었어요", "복사해서 보관하세요"); } }, "내보내기"),
        h("button", { class: "btn ghost", onclick: () => {
          const st = importSave(io.value);
          if (!st) return toast("세이브 코드가 올바르지 않아요");
          this.onReset(st);
        } }, "불러오기"),
        h("button", { class: "btn danger", onclick: () => showModal({
          icon: "⚠️", title: "정말 처음부터?", body: ["모든 진행 상황이 사라집니다. 되돌릴 수 없어요."], dismissable: true,
          buttons: [{ label: "초기화", kind: "danger", onClick: () => { clearSave(); this.onReset(null); } }, { label: "취소", kind: "ghost" }],
        }) }, "처음부터 다시"),
        h("button", { class: "btn ghost", onclick: () => { saveGame(s); toast("저장했어요"); } }, "지금 저장"),
      ),
      this.title("ℹ️ 정보"),
      h("div", { class: "card hint" },
        "AI 키우기 — Attention Is All You Idle. 비상업 팬메이드 게임입니다. 실제 기업·제품·인물 이름은 역사 설명(도감)에서만 사용하며, 게임 속 수치와 사건 효과는 재미를 위해 단순화·과장했습니다. ",
        "역사 자료 출처: Wikipedia (CC BY-SA 4.0), Obscura 헤드리스 브라우저로 수집. 소스 코드와 자료는 GitHub 저장소에 있습니다."),
    );
  }
}

function fmtClock(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h}시간 ${m}분` : `${m}분 ${Math.floor(sec % 60)}초`;
}

/** 클립보드(또는 공유 시트)로 기록 요약을 보낸다 */
export function shareSummary(g: Game): void {
  const s = g.state;
  const st = g.stats;
  const text = [
    `🤖 AI 키우기 — ${s.aiName} v${s.releases + 1}`,
    `${ERAS[s.era].avatar} ${ERAS[s.era].name} (${ERAS[s.era].years}) 도달${s.ended ? " · ✨엔딩 완료" : ""}`,
    `🏆 벤치마크 ${s.bossesBeaten.map((e) => ERAS[e].boss.emoji).join("") || "-"}`,
    `🧠 지능 ${fmt(st.intel)} · 📜 컨텍스트 ${fmtTokens(st.ctx)} · 🌀 할루시네이션 ${fmtPct(st.hall)}`,
    `💬 답변 ${fmt(s.stats.answered)}개 · 💵 누적 ${fmt(s.totalEarned)} · 🏅 업적 ${s.achievements.length}개`,
    `⏱️ 플레이 ${fmtClock(s.stats.playSeconds)}`,
    "#AI키우기 #AttentionIsAllYouIdle",
  ].join("\n");
  const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
  if (nav.share) {
    nav.share({ text }).catch(() => {});
  } else {
    navigator.clipboard?.writeText(text).then(() => toast("📋 복사했어요", "어디든 붙여넣어 자랑하세요!"), () => toast("복사 실패", text));
  }
}

function toggle(label: string, value: boolean, onChange: (v: boolean) => void): HTMLElement {
  const input = h("input", { type: "checkbox", checked: value ? "checked" : undefined }) as HTMLInputElement;
  input.onchange = () => onChange(input.checked);
  return h("label", { class: "toggle-row" }, h("span", null, label), input);
}

/** 순이익 기록을 작은 선 그래프로 */
function sparkline(values: number[]): Node {
  if (values.length < 2) return h("div", { class: "hint" }, "기록이 쌓이는 중… (5초마다 한 점)");
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
  return h("div", null, svg, h("div", { class: "hint" }, `현재 ${fmt(values[values.length - 1])}/초 · 최고 ${fmt(Math.max(...values))}/초 (로그 스케일)`));
}

/** 출시 직전 모델의 스펙 카드 */
function modelCard(g: Game): string {
  const s = g.state;
  const st = g.stats;
  const beaten = s.bossesBeaten.map((e) => ERAS[e].boss.emoji).join(" ");
  return [
    `MODEL CARD — ${s.aiName} v${s.releases + 1}`,
    `시대: ${ERAS[s.era].name} (${ERAS[s.era].years})`,
    `지능: ${fmt(st.intel)} · 컨텍스트: ${fmtTokens(st.ctx)}`,
    `처리량: ${fmt(st.tps)} 토큰/초`,
    `할루시네이션: ${fmtPct(st.hall)} · 담당 질문: ${st.tier.emoji} ${st.tier.name}`,
    `벤치마크: ${beaten || "없음"}`,
    `보유 기술: ${s.upgrades.length}개`,
  ].join("\n");
}

function buildingFx(b: Building, g: Game): string {
  const st = g.stats;
  const ms = milestoneMult(g.state.buildings[b.id] ?? 0);
  const msText = ms > 1 ? ` (마일스톤 ×${fmt(ms)})` : "";
  switch (b.kind) {
    case "compute": return `+${fmt((b.tps ?? 0) * st.mult.tps * ms)} 토큰/초 · ⚡${fmt((b.powerUse ?? 0) * st.mult.powerUse)}${msText}`;
    case "power": return `+⚡${fmt((b.power ?? 0) * st.mult.power * ms)} 전력${msText}`;
    case "demand": return `+${fmt((b.demand ?? 0) * st.mult.demand * ms)} 질문/초${msText}`;
    case "rp": return `+🧠${fmt((b.rp ?? 0) * st.mult.rp * st.cpMult * ms)} RP/초${msText}`;
    case "param": {
      const next = TIERS.find((t) => t.intelReq > st.intel);
      return `지능 ${fmt(st.intel)} → ${fmt(st.intel * (b.intelPerLevel ?? 1))}${next ? ` · 다음 질문까지 ${fmt(next.intelReq)}` : ""}`;
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
