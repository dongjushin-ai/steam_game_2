import { ERAS, EVENTS, NEWS, QUIZ, UPGRADES } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtDuration, fmtMult, setNumberFormat } from "../core/format";
import { Game, newState, type GameNotice } from "../core/game";
import { loadGame, saveGame } from "../core/save";
import type { Effect, GameState } from "../core/types";
import { $, clear, h, setText } from "./dom";
import { modalOpen, showModal, toast } from "./modals";
import { Panels, TABS, shareSummary, type TabId } from "./panels";
import { Scene } from "./scene";
import { questText } from "../core/quests";
import type { QuizQuestion } from "../core/types";
import { setSound, setVibrate, sfx } from "./sound";

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
  private ticker = h("div", { class: "ticker", "aria-hidden": "true" });
  /** 5초마다 기록한 순이익 (최근 10분) */
  private history: number[] = [];
  private histAcc = 0;
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
    window.addEventListener("keydown", (e) => this.key(e));
  }

  private key(e: KeyboardEvent): void {
    const t = e.target as HTMLElement;
    if (t.matches("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
    const g = this.game;
    if (modalOpen()) return;
    if (e.code === "Space" || e.key === "Enter") {
      e.preventDefault();
      g.tap();
      sfx("tap");
    } else if (/^[1-5]$/.test(e.key)) {
      this.selectTab(TABS[Number(e.key) - 1].id);
    } else if (e.key === "b" || e.key === "B") {
      if (g.startBoss()) this.selectTab("bench");
    } else if (e.key === "t" || e.key === "T") {
      g.toggleThinking();
    } else if (e.key === "v" || e.key === "V") {
      g.claimGolden();
    }
  }

  private nextHeadline(): void {
    const s = this.game.state;
    const pool = NEWS.filter((n) => n.era <= s.era);
    // 현재 시대 뉴스가 더 자주 나오게
    const cur = pool.filter((n) => n.era === s.era);
    const item = Math.random() < 0.6 && cur.length ? cur[Math.floor(Math.random() * cur.length)] : pool[Math.floor(Math.random() * pool.length)];
    const text = item.text.split("{name}").join(s.aiName);
    const span = h("span", null, h("b", null, `📰 ${ERAS[item.era].years.split(" ")[0]}`), text);
    span.style.setProperty("--tdur", `${Math.max(9, text.length * 0.28)}s`);
    span.addEventListener("animationend", () => this.nextHeadline());
    clear(this.ticker);
    this.ticker.append(span);
  }

  /** 새 게임/불러오기/초기화 시 호출 */
  private boot(state: GameState, fresh: boolean): void {
    this.game = new Game(state);
    setNumberFormat(state.settings.format);
    setSound(state.settings.sound);
    setVibrate(state.settings.vibrate);
    this.history = [];
    this.game.onNotice((n) => this.notice(n));
    clear($("#scene"));
    this.scene = new Scene(this.game, () => {
      sfx("tap");
      this.panels.update();
    }, (tab) => this.selectTab(tab));
    this.panels = new Panels($("#panel"), this.game, (st) => {
      this.boot((st as GameState | null) ?? newState(), !st);
      saveGame(this.game.state);
    }, () => this.history);
    this.selectTab("service");
    this.applyEraColor();
    if (fresh) this.welcome();
    else this.offline();
    // 저장 당시 떠 있던 선택지·퀴즈를 다시 보여준다 (안 그러면 이벤트가 멈춘다)
    const pendingEvent = EVENTS.find((e) => e.id === state.pendingChoice);
    if (pendingEvent) this.notice({ kind: "choice", event: pendingEvent });
    else state.pendingChoice = null;
    const pendingQuiz = QUIZ.find((q) => q.id === state.pendingQuiz);
    if (pendingQuiz) this.notice({ kind: "quiz", quiz: pendingQuiz });
    else state.pendingQuiz = null;
    this.renderHeader();
    this.nextHeadline();
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
      this.ticker,
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
    this.histAcc += dt;
    if (this.histAcc >= 5) {
      this.histAcc = 0;
      this.history.push(Math.max(0, this.game.stats.net));
      if (this.history.length > 120) this.history.shift();
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
        sfx("event");
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
      case "quiz":
        sfx("event");
        this.quiz(n.quiz);
        break;
      case "golden":
        sfx("golden");
        break;
      case "goldenClaim":
        sfx("claim");
        toast(`${n.def.emoji} ${n.def.name}`, n.def.result + (n.amount ? ` (+${fmt(n.amount)})` : ""), "ach");
        break;
      case "quest":
        sfx("quest");
        toast("📋 임무 완료!", `${questText(n.quest, fmt)} → 💵 +${fmt(n.credits)} · 🧠 +${fmt(n.rp)}`, "ach");
        break;
      case "choice": {
        const ev = n.event;
        sfx("event");
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
        sfx("win");
        showModal({ icon: boss.emoji, title: `${boss.name} 클리어!`, sub: boss.year, body: [boss.winText], buttons: [{ label: "다음으로" }] });
        break;
      }
      case "bossLose": {
        const boss = ERAS[n.era].boss;
        sfx("lose");
        toast(`${boss.emoji} ${boss.name} 실패`, "처리량을 늘리고 다시 도전하세요. 도전 중에 장면을 탭하면 점수가 올라요.");
        break;
      }
      case "era": {
        this.applyEraColor();
        setTimeout(() => sfx("era"), 600);
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
        if (a) {
          sfx("quest");
          toast(`🏅 업적: ${a.emoji} ${a.name}`, a.desc, "ach");
        }
        break;
      }
      case "ending":
        this.ending();
        break;
    }
  }

  private quiz(q: QuizQuestion): void {
    const g = this.game;
    showModal({
      icon: "🧠",
      title: "AI 역사 퀴즈",
      sub: `${ERAS[q.era].name} · 맞히면 수익 2분 + 연구 1분치`,
      body: [q.q],
      buttons: q.options.map((opt, i) => ({
        label: `${"ABCD"[i]}. ${opt}`,
        kind: "ghost" as const,
        className: "quiz-opt",
        onClick: () => {
          const r = g.answerQuiz(i);
          if (!r) return;
          sfx(r.correct ? "correct" : "wrong");
          showModal({
            icon: r.correct ? "⭕" : "❌",
            title: r.correct ? "정답!" : `아쉬워요! 정답은 ${"ABCD"[q.answer]}`,
            sub: r.correct ? `💵 +${fmt(r.credits)} · 🧠 +${fmt(r.rp)}` : "틀린 문제는 나중에 다시 나와요",
            body: [`${q.options[q.answer]} — ${q.explain}`],
            buttons: [{ label: "계속" }],
          });
        },
      })),
    });
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
        buttons: [{ label: "📤 기록 자랑하기", kind: "ghost", onClick: () => { shareSummary(g); return false; } }, { label: "계속 플레이" }],
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
