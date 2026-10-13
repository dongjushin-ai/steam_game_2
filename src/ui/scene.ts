// 메인 장면: 질문이 몬스터가 되어 몰려오고, AI가 답변을 쏘아 맞힌다. 맞은 질문은 동전으로 터진다.
// 몬스터·탄·동전은 도트 캔버스 좌표(높이 120)로 움직이고, 화면 폭에 맞춰 캔버스 폭이 바뀐다.
import { ERAS, EVENTS, GOLDENS, MISSIONS, THREATS, TIERS } from "../data";
import { fmt, fmtPct, fmtTokens } from "../core/format";
import { BENCH_MAP, COMBO_WINDOW, bossDps, comboMult } from "../core/formulas";
import type { Game } from "../core/game";
import type { ActiveEffect } from "../core/types";
import { nextHint, type GuideTab } from "../core/guide";
import { $, clear, h, setText } from "./dom";
import { L } from "../i18n/lang";
import { AV, HZ, PH, PW, drawScene, type Battle, type Mob } from "./pixel";
import { pxi } from "./art";
import { featureOn } from "./panels";

/** 캔버스 폭 범위: 좁은 폰에서는 방의 왼쪽 부분만, 넓으면 전부 */
const MIN_W = 112;

export class Scene {
  private root = $("#scene");
  /** 도트 장면 */
  private canvas = h("canvas", { class: "px-scene", width: String(PW), height: String(PH), "aria-hidden": "true" }) as HTMLCanvasElement;
  private ctx = this.canvas.getContext("2d")!;
  private t = 0;
  private drawAcc = 1;
  private chompLeft = 0;
  private shake = 0;
  private battle: Battle = { mobs: [], shots: [], coins: [], levelUp: 0 };
  private mobSeq = 0;
  private fireAcc = 0;
  /** 몬스터 머리 위 질문 글씨 */
  private labels = new Map<number, HTMLElement>();
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
  private levelEl = h("div", { class: "levelup", "aria-hidden": "true" });
  private goldenEl: HTMLButtonElement | null = null;
  private goldenKey = "";
  private threatEl: HTMLButtonElement | null = null;
  private threatKey = "";
  private spawnAcc = 0;
  private sayTimer = 4;
  private onTap: () => void;
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
    this.root.append(this.canvas, this.say, this.top, this.comboEl, this.levelEl, this.hud);
    this.hud.append(this.bottleneck, h("div", { class: "hud-row" }, this.tierChip, this.hallChip, this.autoChip, this.thinkBtn));
    // 장면을 탭하면 답변 한 발 (몬스터를 직접 누르면 바로 처치)
    this.root.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest(".think-btn, .golden, .threat, button.chip")) return;
      this.tapAt(e.clientX, e.clientY);
    });
    window.addEventListener("ai-celebrate", (e) => this.celebrate((e as CustomEvent<string>).detail));
    new ResizeObserver(() => this.fitCanvas()).observe(this.root);
    this.fitCanvas();
  }

  // ── 캔버스 좌표 ↔ 화면 좌표 ───────────────────────

  private get W(): number {
    return this.canvas.width;
  }
  /** AI가 서는 x: 오른쪽 끝에서 조금 안쪽 */
  private get avx(): number {
    return this.W - AV.w - 6;
  }

  /** 장면 비율에 맞춰 캔버스 폭을 정한다 (높이는 120 고정 → 장면이 커지면 도트도 커진다) */
  private fitCanvas(): void {
    const cw = this.root.clientWidth, ch = this.root.clientHeight;
    if (!cw || !ch) return;
    const w = Math.max(MIN_W, Math.min(PW, Math.round((PH * cw) / ch)));
    if (w !== this.canvas.width) {
      this.canvas.width = w;
      this.drawAcc = 1;
    }
  }

  private scale(): { k: number; ox: number; oy: number } {
    const cw = this.root.clientWidth, ch = this.root.clientHeight;
    const k = Math.max(cw / this.W, ch / PH);
    return { k, ox: (cw - this.W * k) / 2, oy: ch - PH * k };
  }
  private toCss(x: number, y: number): [number, number] {
    const { k, ox, oy } = this.scale();
    return [ox + x * k, oy + y * k];
  }
  private toPx(cx: number, cy: number): [number, number] {
    const { k, ox, oy } = this.scale();
    return [(cx - ox) / k, (cy - oy) / k];
  }

  // ── 입력 ──────────────────────────────────────────

  private tapAt(x: number, y: number): void {
    const v = this.game.tap();
    const r = this.root.getBoundingClientRect();
    const [px, py] = this.toPx(x - r.left, y - r.top);
    // 손가락 근처 몬스터가 있으면 바로 처치
    const hit = this.battle.mobs.find((m) => !m.boss && m.dying === 0 && px >= m.x - 4 && px <= m.x + m.size + 4 && py >= m.y - m.size - 6 && py <= m.y + 4);
    if (hit) this.kill(hit, false, true);
    else this.fireAt(this.target() ?? this.battle.mobs.filter((m) => m.dying === 0 && !m.targeted).sort((a, b) => b.x - a.x)[0], false);
    // 연타해도 숫자가 한 점에 쌓이지 않게 조금씩 흩뿌린다
    const jx = (Math.random() - 0.5) * 36, jy = (Math.random() - 0.5) * 16;
    if (this.game.state.settings.effects || Math.random() < 0.3) this.pop(x - r.left + jx, y - r.top + jy, `+${fmt(v)}`, "big");
    if (this.game.state.settings.effects) this.ripple(x - r.left, y - r.top);
    this.chomp();
    this.onTap();
  }

  /** 탭한 자리에 퍼지는 네모 고리 */
  private ripple(x: number, y: number): void {
    const el = h("div", { class: "ripple", style: { left: `${x}px`, top: `${y}px` } });
    this.root.append(el);
    setTimeout(() => el.remove(), 450);
  }

  private chomp(): void {
    this.chompLeft = 0.25;
  }

  private pop(x: number, y: number, text: string, cls = ""): void {
    const el = h("div", { class: `pop ${cls}`, style: { left: `${x}px`, top: `${y - 10}px` } }, text);
    this.root.append(el);
    setTimeout(() => el.remove(), 900);
  }

  /** 레벨 업 연출: 큰 글씨 + AI 둘레 반짝이 + 살짝 흔들림 */
  celebrate(text: string): void {
    this.battle.levelUp = 0.9;
    this.shake = Math.max(this.shake, 0.2);
    clear(this.levelEl);
    this.levelEl.append(h("b", null, "LEVEL UP!"), h("small", null, text));
    this.levelEl.classList.remove("show");
    void this.levelEl.offsetWidth;
    this.levelEl.classList.add("show");
  }

  // ── 전투 ──────────────────────────────────────────

  private spawn(): void {
    const st = this.game.stats;
    const unlocked = TIERS.filter((t) => t.id <= st.tier.id);
    // 현재 티어 위주로, 가끔 아래 티어도
    const tier = Math.random() < 0.7 ? st.tier : unlocked[Math.floor(Math.random() * unlocked.length)];
    const size = 9 + Math.min(7, Math.floor(tier.id * 0.7));
    const mob: Mob = { id: ++this.mobSeq, x: -size - 2, y: HZ + 2 + Math.floor(Math.random() * 9), size, tier: tier.id, flash: 0, dying: 0, wrong: false, targeted: false };
    this.battle.mobs.push(mob);
    // 질문 글씨는 한두 마리만 (화면이 글자로 덮이지 않게)
    if (this.labels.size < 1 && this.game.state.settings.effects) {
      const q = tier.examples[Math.floor(Math.random() * tier.examples.length)];
      const el = h("div", { class: "mob-label" }, q);
      this.labels.set(mob.id, el);
      this.root.append(el);
      setTimeout(() => this.dropLabel(mob.id), 2200);
    }
  }

  private dropLabel(id: number): void {
    this.labels.get(id)?.remove();
    this.labels.delete(id);
  }

  private bossMob(): Mob | undefined {
    return this.battle.mobs.find((m) => m.boss && m.dying === 0);
  }

  /** AI가 노릴 몬스터: 가장 가까이 온 것 */
  private target(): Mob | undefined {
    const boss = this.bossMob();
    if (boss) return boss;
    // 사거리: 화면 왼쪽 1/3을 지나 걸어 들어온 몬스터만 쏜다 (등장하는 모습이 보이게)
    const range = this.W * 0.34;
    let best: Mob | undefined;
    for (const m of this.battle.mobs) if (m.dying === 0 && !m.targeted && m.x >= range && (!best || m.x > best.x)) best = m;
    return best;
  }

  private fireAt(m: Mob | undefined, auto: boolean): void {
    if (!m) return;
    const bad = auto && !m.boss && Math.random() < this.game.stats.hall;
    if (!m.boss) m.targeted = true;
    this.battle.shots.push({ x: this.avx + 8, y: AV.y + 22, mob: m, bad, v: m.boss ? 220 : 170 });
    this.chomp();
  }

  /** 몬스터 처치: 동전이 튀고 금액이 뜬다 */
  private kill(m: Mob, wrong: boolean, tapped: boolean): void {
    m.dying = 0.001;
    m.wrong = wrong;
    this.dropLabel(m.id);
    const [cx, cy] = this.toCss(m.x + m.size / 2, m.y - m.size);
    if (wrong) {
      this.pop(cx, cy, L("환각!", "Hallucination!"), "bad");
      return;
    }
    const n = m.boss ? 14 : tapped ? 6 : 3;
    for (let i = 0; i < n; i++) {
      this.battle.coins.push({ x: m.x + m.size / 2, y: m.y - m.size / 2, vx: (Math.random() - 0.3) * 50, vy: -30 - Math.random() * 40, t: 0 });
    }
    // 자동 처치는 숫자를 가끔만 띄운다 (겹쳐서 읽을 수 없게 되지 않도록)
    if (!tapped && this.game.state.settings.effects && m.id % 3 === 0) {
      const st = this.game.stats;
      const per = st.net / Math.max(0.4, Math.min(1.2, st.answered));
      this.pop(cx, cy, `+${fmt(Math.max(0, per))}`);
    }
  }

  private stepBattle(dt: number): void {
    const s = this.game.state;
    const b = this.battle;
    const fightOn = !!(s.boss || s.sideFight);
    // 보스: 도전이 시작되면 등장, 끝나면 터진다
    const boss = this.bossMob();
    if (fightOn && !boss) b.mobs.push({ id: ++this.mobSeq, x: -24, y: HZ + 6, size: 28, tier: s.era, boss: true, flash: 0, dying: 0, wrong: false, targeted: false });
    if (!fightOn && boss) this.kill(boss, false, false);
    const front = this.avx - 6;
    for (const m of b.mobs) {
      m.flash = Math.max(0, m.flash - dt);
      if (m.dying > 0) {
        m.dying += dt * 2.5;
        continue;
      }
      const speed = m.boss ? 30 : 14;
      const stop = m.boss ? front - m.size - 14 : front - m.size;
      m.x = Math.min(stop, m.x + speed * dt);
      // 쏘기 전에 AI 앞까지 와 버린 몬스터는 그냥 답해 준다
      if (!m.boss && m.x >= stop) this.kill(m, false, false);
    }
    b.mobs = b.mobs.filter((m) => m.dying < 1);
    // 자동 발사: 초당 답변 수만큼 (화면에서는 0.6~3발로)
    const rate = fightOn ? 4 : Math.max(0.6, Math.min(3, this.game.stats.answered));
    this.fireAcc += dt * rate;
    while (this.fireAcc >= 1) {
      this.fireAcc -= 1;
      this.fireAt(this.target(), true);
    }
    for (const sh of b.shots) {
      const tx = sh.mob.x + sh.mob.size / 2, ty = sh.mob.y - sh.mob.size / 2;
      const dx = tx - sh.x, dy = ty - sh.y;
      const d = Math.hypot(dx, dy);
      const step = sh.v * dt;
      if (d <= step || sh.mob.dying > 0) {
        sh.v = 0;
        if (sh.mob.dying === 0) {
          if (sh.mob.boss) {
            sh.mob.flash = 0.06;
            this.shake = Math.max(this.shake, 0.08);
          } else this.kill(sh.mob, sh.bad, false);
        }
      } else {
        sh.x += (dx / d) * step;
        sh.y += (dy / d) * step;
      }
    }
    b.shots = b.shots.filter((sh) => sh.v > 0);
    // 동전: 튀었다가 왼쪽 위(크레딧 숫자)로 빨려 간다
    let arrived = 0;
    for (const c of b.coins) {
      c.t += dt;
      if (c.t < 0.35) {
        c.vy += 160 * dt;
      } else {
        c.vx += (4 - c.x) * dt * 9;
        c.vy += (-8 - c.y) * dt * 9;
        c.vx *= 0.9;
        c.vy *= 0.9;
      }
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.t > 1.1 || (c.t > 0.35 && c.y < 2)) arrived++;
    }
    if (arrived) window.dispatchEvent(new CustomEvent("ai-coin"));
    b.coins = b.coins.filter((c) => !(c.t > 1.1 || (c.t > 0.35 && c.y < 2)));
    b.levelUp = Math.max(0, b.levelUp - dt);
    this.shake = Math.max(0, this.shake - dt);
  }

  /** 질문 글씨가 몬스터를 따라다닌다 */
  private placeLabels(): void {
    for (const [id, el] of this.labels) {
      const m = this.battle.mobs.find((x) => x.id === id);
      if (!m) {
        this.dropLabel(id);
        continue;
      }
      const [x, y] = this.toCss(m.x + m.size / 2, m.y - m.size - 4);
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-30%, -100%)`;
    }
  }

  /** 매 프레임 */
  frame(dt: number): void {
    const st = this.game.stats;
    if (document.hidden) return;
    this.t += dt;
    this.chompLeft = Math.max(0, this.chompLeft - dt);
    const rate = Math.max(0.35, Math.min(1.2, st.answered)) * (this.game.state.settings.effects ? 1 : 0.4);
    this.spawnAcc += dt * rate;
    const fighting = !!(this.game.state.boss || this.game.state.sideFight);
    if (this.spawnAcc >= 1 && !fighting && this.battle.mobs.filter((m) => !m.boss).length < 7) {
      this.spawnAcc = 0;
      this.spawn();
    }
    this.stepBattle(dt);
    // 도트 장면은 초당 20장 (옛 게임처럼 살짝 뚝뚝)
    this.drawAcc += dt;
    if (this.drawAcc >= 0.05) {
      this.drawAcc = 0;
      const s = this.game.state;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      drawScene(this.ctx, s.era, ERAS[s.era].color, {
        t: reduce ? 0.5 : this.t, thinking: s.thinking, chomp: this.chompLeft,
        fight: !!(s.boss || s.sideFight), breach: !reduce && s.active.some((a) => a.id === "breach"),
      }, this.avx, this.battle);
      this.placeLabels();
      // 화면 흔들림: 도트 한 칸 단위로
      const { k } = this.scale();
      if (this.shake > 0 && !reduce) {
        const dx = Math.round((Math.random() - 0.5) * 2) * k, dy = Math.round((Math.random() - 0.5) * 2) * k;
        this.canvas.style.transform = `translate(${dx}px, ${dy}px)`;
      } else this.canvas.style.transform = "";
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
          h("span", { class: "g-ico" }, pxi(def.emoji)), h("span", null, h("b", null, `${def.name}`), h("small", null, ask)));
        el.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          const r = this.root.getBoundingClientRect();
          const got = this.game.claimGolden();
          if (got) this.pop(e.clientX - r.left, e.clientY - r.top, `${got.name}!`, "big gold");
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
          h("span", { class: "g-ico" }, pxi("")), h("span", null, h("b", null, L("탈옥 시도! 탭해서 차단", "Jailbreak! Tap to block")), h("small", null, text)));
        el.addEventListener("pointerdown", (e) => {
          e.stopPropagation();
          const r = this.root.getBoundingClientRect();
          const got = this.game.blockThreat();
          if (got) this.pop(e.clientX - r.left, e.clientY - r.top, L("차단!", "Blocked!"), "big gold");
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
    this.root.dataset.era = String(g.state.era);
    setText(this.tierChip, `${st.tier.name} · ${fmtTokens(st.tokensPerQ)}`);
    this.tierChip.title = L(`담당 질문: ${st.tier.name}, 질문당 ${fmtTokens(st.tokensPerQ)} 토큰`, `Handles: ${st.tier.name}, ${fmtTokens(st.tokensPerQ)} tokens per question`);
    setText(this.hallChip, `${L("환각", "Halluc.")} ${fmtPct(st.hall)}`);
    this.hallChip.title = `${L("할루시네이션", "Hallucination")} ${fmtPct(st.hall)}`;
    this.hallChip.className = `chip ${st.hall > 0.3 ? "bad" : st.hall < 0.08 ? "good" : ""}`;
    // 처음 1~2분은 상태 칩을 숨긴다 (기능을 차례로 보여준다)
    const hudOn = featureOn(g.state, "hud");
    this.tierChip.style.display = hudOn ? "" : "none";
    this.hallChip.style.display = hudOn ? "" : "none";

    // 가이드가 켜져 있으면 '다음 할 일'을, 아니면 병목을 보여준다 (탭하면 해당 화면으로)
    const hint = g.state.settings.hints ? nextHint(g) : null;
    if (hint) {
      setText(this.bottleneck, `${hint.text}`);
      this.bottleneck.className = "chip hint";
      this.hintTab = hint.tab;
    } else if (st.bottleneck === "power") {
      setText(this.bottleneck, `${L("전력 부족", "Low power")} ${fmtPct(st.powerEff)}`);
      this.bottleneck.className = "chip bad";
      this.hintTab = "infra";
    } else if (st.bottleneck === "demand") {
      setText(this.bottleneck, L("질문 부족 → 서비스", "Need questions → Service"));
      this.bottleneck.className = "chip warn";
      this.hintTab = "service";
    } else {
      setText(this.bottleneck, L("처리량 부족 → 인프라", "Need throughput → Infra"));
      this.bottleneck.className = "chip warn";
      this.hintTab = "infra";
    }
    if (st.net < 0) {
      setText(this.bottleneck, L("적자! 토큰 단가를 낮추세요", "Losing money! Lower your token price"));
      this.bottleneck.className = "chip bad";
      this.hintTab = "research";
    }


    this.autoChip.style.display = st.autoTap > 0 ? "" : "none";
    setText(this.autoChip, `${fmt(st.autoTap)}/${L("초", "s")}`);
    this.autoChip.title = L("초당 자동 답변", "Auto-answers per second");

    // 콤보
    const s = g.state;
    const live = s.combo >= 3 && s.stats.playSeconds - s.lastTapAt <= COMBO_WINDOW;
    this.comboEl.classList.toggle("show", live);
    if (live) setText(this.comboEl, L(`${s.combo} 콤보 · 탭 ×${comboMult(s.combo).toFixed(2)}`, `${s.combo} combo · tap ×${comboMult(s.combo).toFixed(2)}`));

    this.updateGolden();
    this.updateThreat();

    this.thinkBtn.style.display = g.hasThinking() ? "" : "none";
    setText(this.thinkBtn, `${L("생각", "Think")} ${g.state.thinking ? "ON" : "OFF"}`);
    this.thinkBtn.setAttribute("aria-label", `${L("생각 모드", "Thinking Mode")} ${g.state.thinking ? "ON" : "OFF"}`);
    this.thinkBtn.classList.toggle("on", g.state.thinking);
    // HUD 줄이 넘치면 오른쪽을 흐리게 해서 옆으로 밀 수 있다는 걸 알린다
    const row = this.thinkBtn.parentElement;
    if (row) row.classList.toggle("more", row.scrollWidth > row.clientWidth + 2 && row.scrollLeft + row.clientWidth < row.scrollWidth - 2);

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
        h("div", null, `${boss.name} — ${fmtPct(pct)} · ${L(`남은 시간 ${Math.ceil(fight.remaining)}초 · 탭하면 추가 점수!`, `${Math.ceil(fight.remaining)}s left · tap for bonus score!`)}`),
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
          this.top.append(h("span", { class: "chip event" }, `${activeName(a)} ${Math.ceil(a.remaining)}s`));
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

