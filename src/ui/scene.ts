// 메인 장면: 질문 말풍선이 AI에게 날아가고, 탭하면 즉시 답변한다.
import { ERAS, EVENTS, GOLDENS, MISSIONS, THREATS, TIERS } from "../data";
import { fmt, fmtPct, fmtTokens } from "../core/format";
import { BENCH_MAP, COMBO_WINDOW, bossDps, comboMult } from "../core/formulas";
import type { Game } from "../core/game";
import type { ActiveEffect } from "../core/types";
import { nextHint, type GuideTab } from "../core/guide";
import { $, clear, h, setText } from "./dom";
import { L } from "../i18n/lang";
import { avatarSvg } from "./avatar";
import { backdropSvg } from "./backdrop";

export class Scene {
  private root = $("#scene");
  private avatar = h("div", { class: "avatar", "aria-hidden": "true" });
  private say = h("div", { class: "say" });
  private hud = h("div", { class: "scene-hud" });
  private top = h("div", { class: "scene-top" });
  private bossBar = h("div", { class: "boss-bar" });
  private tierChip = h("span", { class: "chip" });
  private hallChip = h("span", { class: "chip" });
  private bottleneck = h("button", { class: "chip" });
  private thinkBtn = h("button", { class: "chip think-btn" });
  private comboEl = h("div", { class: "combo" });
  private autoChip = h("span", { class: "chip" });
  private goldenEl: HTMLButtonElement | null = null;
  private goldenKey = "";
  private threatEl: HTMLButtonElement | null = null;
  private threatKey = "";
  private spawnAcc = 0;
  private sayTimer = 4;
  private onTap: () => void;
  private backdrop = h("div", { class: "backdrop-wrap", "aria-hidden": "true" });
  /** 배경·아바타를 마지막으로 그린 시대 */
  private drawnEra = -1;
  private hintTab: GuideTab | null = null;

  constructor(private game: Game, onTap: () => void, onHint: (tab: GuideTab) => void) {
    this.onTap = onTap;
    this.bottleneck.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      if (this.hintTab) onHint(this.hintTab);
    });
    this.thinkBtn.onclick = (e) => {
      e.stopPropagation();
      game.toggleThinking();
    };
    this.root.append(this.backdrop, this.avatar, this.say, this.top, this.comboEl, this.hud);
    this.hud.append(this.bottleneck, h("div", { class: "hud-row" }, this.tierChip, this.hallChip, this.autoChip, this.thinkBtn));
    // 빈 곳을 탭해도 답변 하나
    this.root.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".bubble, .think-btn, .golden, .threat, button.chip")) return;
      this.tapAt(e.clientX, e.clientY);
    });
  }

  private tapAt(x: number, y: number): void {
    const v = this.game.tap();
    const r = this.root.getBoundingClientRect();
    if (this.game.state.settings.effects || Math.random() < 0.3) this.pop(x - r.left, y - r.top, `+${fmt(v)}`, "big");
    this.chomp();
    this.onTap();
  }

  private chomp(): void {
    this.avatar.classList.add("chomp");
    setTimeout(() => this.avatar.classList.remove("chomp"), 110);
  }

  private pop(x: number, y: number, text: string, cls = ""): void {
    const el = h("div", { class: `pop ${cls}`, style: { left: `${x}px`, top: `${y - 10}px` } }, text);
    this.root.append(el);
    setTimeout(() => el.remove(), 900);
  }

  private spawn(): void {
    const st = this.game.stats;
    const unlocked = TIERS.filter((t) => t.id <= st.tier.id);
    // 현재 티어 위주로, 가끔 아래 티어도
    const tier = Math.random() < 0.7 ? st.tier : unlocked[Math.floor(Math.random() * unlocked.length)];
    const q = tier.examples[Math.floor(Math.random() * tier.examples.length)];
    const w = this.root.clientWidth;
    const hgt = this.root.clientHeight;
    const y = 44 + Math.random() * Math.max(10, hgt - 150);
    const to = Math.max(80, w * 0.62);
    const dur = 2.6 + Math.random() * 1.2;
    const b = h("button", { class: "bubble", style: { top: `${y}px` } }, h("span", { class: "t" }, tier.emoji), q);
    b.style.setProperty("--to", `${to}px`);
    b.style.setProperty("--dur", `${dur}s`);
    b.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      b.remove();
      this.tapAt(e.clientX, e.clientY);
    });
    b.addEventListener("animationend", () => {
      if (!b.isConnected) return;
      b.remove();
      this.chomp();
      const wrong = Math.random() < st.hall;
      const perBubble = st.net / Math.max(0.4, Math.min(1.2, st.answered));
      this.pop(to * 0.8, y, wrong ? L("❌ 할루시네이션", "❌ Hallucination") : `+${fmt(Math.max(0, perBubble))}`, wrong ? "bad" : "");
    });
    this.root.append(b);
  }

  /** 매 프레임 */
  frame(dt: number): void {
    const st = this.game.stats;
    if (document.hidden) return;
    const rate = Math.max(0.35, Math.min(1.2, st.answered)) * (this.game.state.settings.effects ? 1 : 0.4);
    this.spawnAcc += dt * rate;
    if (this.spawnAcc >= 1 && this.root.querySelectorAll(".bubble").length < 6) {
      this.spawnAcc = 0;
      this.spawn();
    }
    this.sayTimer -= dt;
    if (this.sayTimer <= 0 && !this.game.state.boss) {
      const lines = ERAS[this.game.state.era].aiLines;
      setText(this.say, lines[Math.floor(Math.random() * lines.length)]);
      this.say.classList.add("show");
      setTimeout(() => this.say.classList.remove("show"), 2600);
      this.sayTimer = 6 + Math.random() * 6;
    }
  }

  private updateGolden(): void {
    const gold = this.game.state.golden;
    const key = gold ? `${gold.kind}:${gold.y}` : "";
    if (key !== this.goldenKey) {
      this.goldenKey = key;
      this.goldenEl?.remove();
      this.goldenEl = null;
      if (gold) {
        const def = GOLDENS.find((d) => d.kind === gold.kind)!;
        const ask = def.asks[Math.floor(Math.random() * def.asks.length)];
        const el = h("button", { class: "golden", style: { top: `${gold.y * 100}%` }, "aria-label": `${L("VIP 질문", "VIP question")}: ${def.name}` },
          h("span", { class: "g-ico" }, def.emoji), h("span", null, h("b", null, `⭐ ${def.name}`), h("small", null, ask)));
        el.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          const r = this.root.getBoundingClientRect();
          const got = this.game.claimGolden();
          if (got) this.pop(e.clientX - r.left, e.clientY - r.top, `${got.emoji} ${got.name}!`, "big gold");
          el.remove();
          this.goldenEl = null;
          this.goldenKey = "";
        });
        this.goldenEl = el;
        this.root.append(el);
      }
    }
    if (this.goldenEl && gold) this.goldenEl.classList.toggle("fading", gold.remaining < 3);
  }

  /** 탈옥 프롬프트 말풍선: 눌러서 막는다 */
  private updateThreat(): void {
    const t = this.game.state.threat;
    const key = t ? `${t.text}:${t.y}` : "";
    if (key !== this.threatKey) {
      this.threatKey = key;
      this.threatEl?.remove();
      this.threatEl = null;
      if (t) {
        const text = THREATS[t.text] ?? THREATS[0];
        const el = h("button", { class: "threat", style: { top: `${t.y * 100}%` }, "aria-label": `${L("탈옥 시도 막기", "Block jailbreak attempt")}: ${text}` },
          h("span", { class: "g-ico" }, "🦹"), h("span", null, h("b", null, L("탈옥 시도! 탭해서 차단", "Jailbreak! Tap to block")), h("small", null, text)));
        el.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          const r = this.root.getBoundingClientRect();
          const got = this.game.blockThreat();
          if (got) this.pop(e.clientX - r.left, e.clientY - r.top, L("🛡️ 차단!", "🛡️ Blocked!"), "big gold");
          el.remove();
          this.threatEl = null;
          this.threatKey = "";
        });
        this.threatEl = el;
        this.root.append(el);
      }
    }
    if (this.threatEl && t) this.threatEl.classList.toggle("fading", t.remaining < 3);
  }

  /** 몇 번에 한 번씩: 숫자·칩 갱신 */
  update(): void {
    const g = this.game;
    const st = g.stats;
    const era = ERAS[g.state.era];
    if (this.drawnEra !== g.state.era) {
      // 직접 만든 고정 SVG 문자열이라 innerHTML로 넣어도 안전하다
      this.drawnEra = g.state.era;
      this.backdrop.innerHTML = backdropSvg(g.state.era, era.color);
      this.avatar.innerHTML = avatarSvg(g.state.era, era.color);
      this.root.dataset.era = String(g.state.era);
    }
    setText(this.tierChip, `${st.tier.emoji} ${st.tier.name} · ${fmtTokens(st.tokensPerQ)}`);
    this.tierChip.title = L(`담당 질문: ${st.tier.name}, 질문당 ${fmtTokens(st.tokensPerQ)} 토큰`, `Handles: ${st.tier.name}, ${fmtTokens(st.tokensPerQ)} tokens per question`);
    setText(this.hallChip, `🌀 ${L("환각", "Halluc.")} ${fmtPct(st.hall)}`);
    this.hallChip.title = `${L("할루시네이션", "Hallucination")} ${fmtPct(st.hall)}`;
    this.hallChip.className = `chip ${st.hall > 0.3 ? "bad" : st.hall < 0.08 ? "good" : ""}`;

    // 가이드가 켜져 있으면 '다음 할 일'을, 아니면 병목을 보여준다 (탭하면 해당 화면으로)
    const hint = g.state.settings.hints ? nextHint(g) : null;
    if (hint) {
      setText(this.bottleneck, `💡 ${hint.text}`);
      this.bottleneck.className = "chip hint";
      this.hintTab = hint.tab;
    } else if (st.bottleneck === "power") {
      setText(this.bottleneck, `⚡ ${L("전력 부족", "Low power")} ${fmtPct(st.powerEff)}`);
      this.bottleneck.className = "chip bad";
      this.hintTab = "infra";
    } else if (st.bottleneck === "demand") {
      setText(this.bottleneck, L("📉 질문 부족 → 💬서비스", "📉 Need questions → 💬Service"));
      this.bottleneck.className = "chip warn";
      this.hintTab = "service";
    } else {
      setText(this.bottleneck, L("🖥️ 처리량 부족 → 인프라", "🖥️ Need throughput → Infra"));
      this.bottleneck.className = "chip warn";
      this.hintTab = "infra";
    }
    if (st.net < 0) {
      setText(this.bottleneck, L("💸 적자! 토큰 단가를 낮추세요", "💸 Losing money! Lower your token price"));
      this.bottleneck.className = "chip bad";
      this.hintTab = "research";
    }


    this.autoChip.style.display = st.autoTap > 0 ? "" : "none";
    setText(this.autoChip, `🤖 ${fmt(st.autoTap)}/${L("초", "s")}`);
    this.autoChip.title = L("초당 자동 답변", "Auto-answers per second");

    // 콤보
    const s = g.state;
    const live = s.combo >= 3 && s.stats.playSeconds - s.lastTapAt <= COMBO_WINDOW;
    this.comboEl.classList.toggle("show", live);
    if (live) setText(this.comboEl, L(`🔥 ${s.combo} 콤보 · 탭 ×${comboMult(s.combo).toFixed(2)}`, `🔥 ${s.combo} combo · tap ×${comboMult(s.combo).toFixed(2)}`));

    this.updateGolden();
    this.updateThreat();

    this.thinkBtn.style.display = g.hasThinking() ? "" : "none";
    setText(this.thinkBtn, `🤔 ${L("생각", "Think")} ${g.state.thinking ? "ON" : "OFF"}`);
    this.thinkBtn.setAttribute("aria-label", `${L("생각 모드", "Thinking Mode")} ${g.state.thinking ? "ON" : "OFF"}`);
    this.thinkBtn.classList.toggle("on", g.state.thinking);
    // 장면 분위기: 보스전 경보등, 생각 모드 오라, 탈옥 사고 글리치
    // HUD 줄이 넘치면 오른쪽을 흐리게 해서 옆으로 밀 수 있다는 걸 알린다
    const row = this.thinkBtn.parentElement;
    if (row) row.classList.toggle("more", row.scrollWidth > row.clientWidth + 2 && row.scrollLeft + row.clientWidth < row.scrollWidth - 2);
    this.root.classList.toggle("fight", !!(g.state.boss || g.state.sideFight));
    this.root.classList.toggle("thinking", g.state.thinking);
    this.root.classList.toggle("breach", g.state.active.some((a) => a.id === "breach"));

    // 진행 중 이벤트 / 보스
    const side = g.state.sideFight;
    const sideDef = side ? BENCH_MAP[side.id] : null;
    const fight = g.state.boss ?? (side && sideDef ? { era: sideDef.era, dealt: side.dealt, remaining: side.remaining } : null);
    if (fight) {
      const boss = sideDef && !g.state.boss ? { emoji: sideDef.emoji, name: sideDef.name, hp: g.benchHp(sideDef) } : ERAS[fight.era].boss;
      clear(this.top);
      const pct = Math.min(1, fight.dealt / boss.hp);
      clear(this.bossBar);
      this.bossBar.append(
        h("div", null, `${boss.emoji} ${boss.name} — ${fmtPct(pct)} · ${L(`남은 시간 ${Math.ceil(fight.remaining)}초 · 탭하면 추가 점수!`, `${Math.ceil(fight.remaining)}s left · tap for bonus score!`)}`),
        h("div", { class: "bar red" }, h("i", { style: { width: `${pct * 100}%` } })),
        h("div", { class: "hint" }, L(`초당 ${fmt(bossDps(st))} 정답 토큰 / 목표 ${fmt(boss.hp)}`, `${fmt(bossDps(st))} correct tokens/s / goal ${fmt(boss.hp)}`)),
      );
      if (!this.bossBar.isConnected) this.root.append(this.bossBar);
    } else {
      this.bossBar.remove();
      const key = g.state.active.map((a) => `${a.id}:${Math.ceil(a.remaining)}`).join("|");
      if (this.top.dataset.key !== key) {
        this.top.dataset.key = key;
        clear(this.top);
        for (const a of g.state.active) {
          this.top.append(h("span", { class: "chip event" }, `${a.emoji} ${activeName(a)} ${Math.ceil(a.remaining)}s`));
        }
      }
    }
  }
}

/**
 * 진행 중 효과의 표시 이름. 세이브에는 만들 당시 언어로 이름이 저장되므로,
 * 원본 이벤트·VIP 질문을 id로 찾아 현재 언어 이름을 쓴다.
 */
function activeName(a: ActiveEffect): string {
  const ev = EVENTS.find((e) => e.id === a.id);
  if (ev) return ev.name;
  const gold = GOLDENS.find((g) => `golden_${g.kind}` === a.id);
  if (gold) return gold.name;
  const mission = MISSIONS.find((m) => `mission_${m.id}` === a.id);
  if (mission) return mission.name;
  if (a.id === "breach") return L("탈옥 사고", "Jailbreak breach");
  return a.name.split(":")[0];
}

