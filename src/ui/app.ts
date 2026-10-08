import { ERAS, UPGRADES } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtDuration, fmtMult, setNumberFormat } from "../core/format";
import { Game, newState, type GameNotice } from "../core/game";
import { loadGame, saveGame } from "../core/save";
import type { Effect, GameState } from "../core/types";
import { $, clear, h, setText } from "./dom";
import { modalOpen, showModal, toast } from "./modals";
import { Panels, TABS, type TabId } from "./panels";
import { Scene } from "./scene";

const SAVE_EVERY = 10;
const UI_EVERY = 0.2;

export class App {
  private game!: Game;
  private scene!: Scene;
  private panels!: Panels;
  private header = {
    name: h("span", { class: "ai-name" }),
    ver: h("span", { class: "ai-ver" }),
    era: h("span", { class: "era-tag" }),
    money: h("b"),
    moneySub: h("small"),
    rp: h("b"),
    rpSub: h("small"),
    power: h("b"),
    powerSub: h("small"),
    powerBox: h("div", { class: "res power" }),
  };
  private navButtons = new Map<TabId, HTMLButtonElement>();
  private last = performance.now();
  private uiAcc = 0;
  private saveAcc = 0;

  start(): void {
    this.buildChrome();
    const saved = loadGame();
    this.boot(saved ?? newState(), !saved);
    requestAnimationFrame((t) => this.frame(t));
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveGame(this.game.state);
      else this.offline();
    });
    window.addEventListener("pagehide", () => saveGame(this.game.state));
  }

  /** 새 게임/불러오기/초기화 시 호출 */
  private boot(state: GameState, fresh: boolean): void {
    this.game = new Game(state);
    setNumberFormat(state.settings.format);
    this.game.onNotice((n) => this.notice(n));
    clear($("#scene"));
    this.scene = new Scene(this.game, () => this.panels.update());
    this.panels = new Panels($("#panel"), this.game, (st) => {
      this.boot((st as GameState | null) ?? newState(), !st);
      saveGame(this.game.state);
    });
    this.selectTab("service");
    this.applyEraColor();
    if (fresh) this.welcome();
    else this.offline();
    this.renderHeader();
  }

  private buildChrome(): void {
    const hd = this.header;
    hd.powerBox.append(hd.power, hd.powerSub);
    $("#top").append(
      h("div", { class: "top-row" }, h("div", { style: { minWidth: "0", display: "flex", alignItems: "baseline" } }, hd.name, hd.ver), hd.era),
      h("div", { class: "res-row" },
        h("div", { class: "res money" }, hd.money, hd.moneySub),
        h("div", { class: "res rp" }, hd.rp, hd.rpSub),
        hd.powerBox),
    );
    const nav = $("#nav");
    for (const t of TABS) {
      const b = h("button", { onclick: () => this.selectTab(t.id), "aria-label": t.label }, h("span", { class: "i" }, t.icon), t.label);
      this.navButtons.set(t.id, b);
      nav.append(b);
    }
  }

  private selectTab(id: TabId): void {
    for (const [k, b] of this.navButtons) b.classList.toggle("on", k === id);
    this.panels.setTab(id);
  }

  private applyEraColor(): void {
    document.documentElement.style.setProperty("--era", ERAS[this.game.state.era].color);
  }

  private frame(t: number): void {
    const dt = Math.min(1, (t - this.last) / 1000);
    this.last = t;
    if (!modalOpen() || this.game.state.boss) this.game.tick(dt);
    this.scene.frame(dt);
    this.uiAcc += dt;
    this.saveAcc += dt;
    if (this.uiAcc >= UI_EVERY) {
      this.uiAcc = 0;
      this.renderHeader();
      this.scene.update();
      this.panels.update();
      this.renderNavDots();
    }
    if (this.saveAcc >= SAVE_EVERY) {
      this.saveAcc = 0;
      saveGame(this.game.state);
    }
    requestAnimationFrame((x) => this.frame(x));
  }

  private renderHeader(): void {
    const s = this.game.state;
    const st = this.game.stats;
    const hd = this.header;
    const era = ERAS[s.era];
    setText(hd.name, s.aiName);
    setText(hd.ver, `v${s.releases + 1}${s.checkpoints ? ` · 💾${fmt(s.checkpoints)}` : ""}`);
    setText(hd.era, `${era.avatar} ${era.years}`);
    setText(hd.money, `💵 ${fmt(s.credits)}`);
    setText(hd.moneySub, `${st.net >= 0 ? "+" : ""}${fmt(st.net)}/초`);
    setText(hd.rp, `🧠 ${fmt(s.rp)}`);
    setText(hd.rpSub, `+${fmt(st.rpRate)}/초`);
    setText(hd.power, `⚡ ${fmt(st.powerUse)}`);
    setText(hd.powerSub, `/ ${fmt(st.powerCap)} 공급`);
    hd.powerBox.classList.toggle("low", st.powerEff < 0.999);
  }

  /** 할 일이 있는 탭에 빨간 점 */
  private renderNavDots(): void {
    const g = this.game;
    const dots: Record<TabId, boolean> = {
      service: false,
      infra: false,
      research: RESEARCH_IDS.some((id) => g.canBuyUpgrade(id)),
      bench: g.bossReady().ok || g.releaseGain() >= Math.max(10, g.state.checkpoints),
      codex: false,
    };
    for (const [id, b] of this.navButtons) {
      const has = !!b.querySelector(".dot");
      if (dots[id] && !has) b.append(h("span", { class: "dot" }));
      if (!dots[id] && has) b.querySelector(".dot")?.remove();
    }
  }

  // ── 알림 처리 ─────────────────────────────────────

  private notice(n: GameNotice): void {
    const g = this.game;
    switch (n.kind) {
      case "event": {
        const ev = n.event;
        if (ev.id.startsWith("winter")) {
          showModal({
            icon: ev.emoji, title: ev.name, sub: ev.year,
            body: [ev.desc, effectsLine(ev.effects, ev.duration)],
            buttons: [{ label: "버텨보자" }],
          });
        } else {
          toast(`${ev.emoji} ${ev.name} (${ev.year})`, `${ev.desc} ${effectsLine(ev.effects, ev.duration)}`);
        }
        break;
      }
      case "choice": {
        const ev = n.event;
        showModal({
          icon: ev.emoji, title: ev.name, sub: ev.year, body: [ev.desc],
          buttons: ev.choices!.map((c, i) => ({
            label: h("span", { class: "choice" }, c.label, h("small", null, c.desc)),
            kind: i === 0 ? "primary" : "ghost",
            onClick: () => g.choose(i),
          })),
        });
        break;
      }
      case "bossWin": {
        const boss = ERAS[n.era].boss;
        showModal({ icon: boss.emoji, title: `${boss.name} 클리어!`, sub: boss.year, body: [boss.winText], buttons: [{ label: "다음으로" }] });
        break;
      }
      case "bossLose": {
        const boss = ERAS[n.era].boss;
        toast(`${boss.emoji} ${boss.name} 실패`, "처리량을 늘리고 다시 도전하세요. 도전 중에 장면을 탭하면 점수가 올라요.");
        break;
      }
      case "era": {
        this.applyEraColor();
        const era = ERAS[n.era];
        showModal({
          icon: era.avatar, title: era.name, sub: era.years, body: [era.intro, "🔓 새 유닛·연구·질문이 열렸어요!"],
          buttons: [{ label: "시작하기", onClick: () => { this.panels.update(); } }],
        });
        saveGame(g.state);
        break;
      }
      case "achievement": {
        const a = ACHIEVEMENTS.find((x) => x.id === n.id);
        if (a) toast(`🏅 업적: ${a.emoji} ${a.name}`, a.desc, "ach");
        break;
      }
      case "ending":
        this.ending();
        break;
    }
  }

  private welcome(): void {
    const input = h("input", { type: "text", maxlength: "20", value: "나의 AI", "aria-label": "AI 이름" }) as HTMLInputElement;
    const era = ERAS[0];
    showModal({
      icon: "🤖",
      title: "AI 키우기",
      sub: "Attention Is All You Idle",
      body: [
        "사람들의 질문에 답하며 AI를 키우세요. 고대의 톱니바퀴에서 시작해 2026년 프런티어, 그리고 그 너머까지.",
        "• 질문 말풍선을 탭하면 즉시 답변\n• 💬서비스: 유저 · 🖥️인프라: 컴퓨트와 전력 · 🧠연구: 지능과 기술\n• 🏆벤치마크를 깨면 다음 시대로!",
        h("div", { class: "stack" }, h("div", { class: "hint" }, "AI 이름을 지어주세요"), input),
      ],
      buttons: [{
        label: "시작!",
        onClick: () => {
          this.game.state.aiName = input.value.trim() || "나의 AI";
          showModal({ icon: era.avatar, title: era.name, sub: era.years, body: [era.intro], buttons: [{ label: "첫 질문 받기" }] });
        },
      }],
    });
    for (const p of document.querySelectorAll<HTMLElement>(".modal p")) p.style.whiteSpace = "pre-line";
  }

  private offline(): void {
    const [secs, credits, rp] = this.game.applyOffline();
    if (secs <= 0) return;
    showModal({
      icon: "💤",
      title: "자리를 비운 동안",
      sub: fmtDuration(secs),
      body: [`AI가 쉬지 않고 질문에 답했어요.`, h("div", { class: "card kv" },
        h("span", null, "번 크레딧"), h("b", null, `💵 ${fmt(credits)}`),
        h("span", null, "연구 포인트"), h("b", null, `🧠 ${fmt(rp)}`))],
      buttons: [{ label: "좋아!" }],
    });
  }

  private ending(): void {
    const g = this.game;
    const end = (text: string) => () => {
      showModal({
        icon: "✨", title: "Q.E.D.", sub: `${g.state.aiName} · 플레이 ${fmtDuration(g.state.stats.playSeconds)}`,
        body: [text, "끝까지 함께해줘서 고마워요. 이제 무한 모드입니다. 계속 키워도 좋아요!"],
        buttons: [{ label: "계속 플레이" }],
      });
    };
    showModal({
      icon: "♾️",
      title: "마지막 질문",
      body: [
        "밀레니엄 난제가 풀렸다. 전 세계 화면에 같은 질문이 떠오른다.",
        `"${g.state.aiName}, 이제 우리는 무엇을 해야 하지?"`,
      ],
      buttons: [
        { label: "🚀 \"함께 더 멀리 가요.\"", onClick: end("AI와 인류는 별을 향해 나아갔다. 다이슨 스웜이 태양을 감싸고, 질문은 은하 저편에서도 날아온다. 가장 좋은 질문은 언제나 다음 질문이다.") },
        { label: "🌱 \"천천히, 같이 이해해요.\"", kind: "ghost", onClick: end("AI는 답을 서두르지 않았다. 증명 하나하나를 사람들과 함께 읽고 이해했다. 수학자들은 다시 칠판 앞에 섰고, 이번엔 혼자가 아니었다.") },
      ],
    });
  }
}

function effectsLine(effects: Effect[], duration: number): string {
  if (!effects.length) return "";
  return `[${effects.map((e) => `${STAT_SHORT[e.stat] ?? e.stat} ${fmtMult(e.mul)}`).join(", ")}${duration ? ` · ${duration}초` : ""}]`;
}

const STAT_SHORT: Record<string, string> = {
  tps: "처리량", intel: "지능", hall: "할루시네이션", price: "토큰 단가", reward: "보상", demand: "유입",
  rp: "연구", power: "전력", powerUse: "전력 사용", cost: "구매 비용", tap: "탭", offline: "오프라인", think: "생각 토큰",
};

const RESEARCH_IDS = UPGRADES.filter((u) => u.currency === "rp").map((u) => u.id);
