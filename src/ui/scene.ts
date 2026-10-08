// 메인 장면: 질문 말풍선이 AI에게 날아가고, 탭하면 즉시 답변한다.
import { ERAS, TIERS } from "../data";
import { fmt, fmtPct, fmtTokens } from "../core/format";
import { bossDps } from "../core/formulas";
import type { Game } from "../core/game";
import { $, clear, h, setText } from "./dom";

export class Scene {
  private root = $("#scene");
  private avatar = h("div", { class: "avatar", "aria-hidden": "true" });
  private say = h("div", { class: "say" });
  private hud = h("div", { class: "scene-hud" });
  private top = h("div", { class: "scene-top" });
  private bossBar = h("div", { class: "boss-bar" });
  private tierChip = h("span", { class: "chip" });
  private hallChip = h("span", { class: "chip" });
  private bottleneck = h("span", { class: "chip" });
  private thinkBtn = h("button", { class: "chip think-btn" });
  private spawnAcc = 0;
  private sayTimer = 4;
  private onTap: () => void;

  constructor(private game: Game, onTap: () => void) {
    this.onTap = onTap;
    this.thinkBtn.onclick = (e) => {
      e.stopPropagation();
      game.toggleThinking();
    };
    this.root.append(h("div", { class: "grid-bg" }), this.avatar, this.say, this.top, this.hud);
    this.hud.append(this.tierChip, this.hallChip, this.bottleneck, this.thinkBtn);
    // 빈 곳을 탭해도 답변 하나
    this.root.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".bubble, .think-btn")) return;
      this.tapAt(e.clientX, e.clientY);
    });
  }

  private tapAt(x: number, y: number): void {
    const v = this.game.tap();
    const r = this.root.getBoundingClientRect();
    this.pop(x - r.left, y - r.top, `+${fmt(v)}`, "big");
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
      this.pop(to * 0.8, y, wrong ? "❌ 할루시네이션" : `+${fmt(Math.max(0, perBubble))}`, wrong ? "bad" : "");
    });
    this.root.append(b);
  }

  /** 매 프레임 */
  frame(dt: number): void {
    const st = this.game.stats;
    if (document.hidden) return;
    const rate = Math.max(0.35, Math.min(1.2, st.answered));
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

  /** 몇 번에 한 번씩: 숫자·칩 갱신 */
  update(): void {
    const g = this.game;
    const st = g.stats;
    const era = ERAS[g.state.era];
    setText(this.avatar, era.avatar);
    setText(this.tierChip, `${st.tier.emoji} ${st.tier.name} · ${fmtTokens(st.tokensPerQ)}토큰`);
    setText(this.hallChip, `🌀 할루시네이션 ${fmtPct(st.hall)}`);
    this.hallChip.className = `chip ${st.hall > 0.3 ? "bad" : st.hall < 0.08 ? "good" : ""}`;

    if (st.bottleneck === "power") {
      setText(this.bottleneck, `⚡ 전력 부족 ${fmtPct(st.powerEff)}`);
      this.bottleneck.className = "chip bad";
    } else if (st.bottleneck === "demand") {
      setText(this.bottleneck, "📉 질문 부족 → 💬서비스");
      this.bottleneck.className = "chip warn";
    } else {
      setText(this.bottleneck, "🖥️ 처리량 부족 → 인프라");
      this.bottleneck.className = "chip warn";
    }
    if (st.net < 0) {
      setText(this.bottleneck, "💸 적자! 토큰 단가를 낮추세요");
      this.bottleneck.className = "chip bad";
    }

    this.thinkBtn.style.display = g.hasThinking() ? "" : "none";
    setText(this.thinkBtn, g.state.thinking ? "🤔 생각 모드 ON" : "🤔 생각 모드 OFF");
    this.thinkBtn.classList.toggle("on", g.state.thinking);

    // 진행 중 이벤트 / 보스
    const fight = g.state.boss;
    if (fight) {
      const boss = ERAS[fight.era].boss;
      clear(this.top);
      const pct = Math.min(1, fight.dealt / boss.hp);
      clear(this.bossBar);
      this.bossBar.append(
        h("div", null, `${boss.emoji} ${boss.name} — ${fmtPct(pct)} · 남은 시간 ${Math.ceil(fight.remaining)}초 · 탭하면 추가 점수!`),
        h("div", { class: "bar red" }, h("i", { style: { width: `${pct * 100}%` } })),
        h("div", { class: "hint" }, `초당 ${fmt(bossDps(st))} 정답 토큰 / 목표 ${fmt(boss.hp)}`),
      );
      if (!this.bossBar.isConnected) this.root.append(this.bossBar);
    } else {
      this.bossBar.remove();
      const key = g.state.active.map((a) => `${a.id}:${Math.ceil(a.remaining)}`).join("|");
      if (this.top.dataset.key !== key) {
        this.top.dataset.key = key;
        clear(this.top);
        for (const a of g.state.active) {
          this.top.append(h("span", { class: "chip event" }, `${a.emoji} ${a.name.split(":")[0]} ${Math.ceil(a.remaining)}s`));
        }
      }
    }
  }
}
