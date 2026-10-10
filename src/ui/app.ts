import { ERAS, EVENTS, NEWS, QUIZ, UPGRADES } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtDuration, fmtMult, setNumberFormat } from "../core/format";
import { Game, newState, type GameNotice } from "../core/game";
import { loadGame, saveGame } from "../core/save";
import type { Effect, GameState } from "../core/types";
import { $, clear, h, setText } from "./dom";
import { modalOpen, showModal, toast } from "./modals";
import { Panels, TABS, shareSummary, statLabel, type TabId } from "./panels";
import { Scene } from "./scene";
import { heroHtml, pxi } from "./art";
import { questText } from "../core/quests";
import type { QuizQuestion } from "../core/types";
import { setSound, setVibrate, sfx } from "./sound";
import { L, applyLanguage, detectLang } from "../i18n";

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
  private tickerTimer = 0;
  private last = performance.now();
  private uiAcc = 0;
  private saveAcc = 0;

  start(): void {
    const saved = loadGame();
    const lang = saved?.settings.lang ?? detectLang();
    applyLanguage(lang);
    document.documentElement.lang = lang;
    document.title = L("AI 키우기", "Grow Your AI");
    $("#scene").setAttribute("aria-label", L("질문 처리 화면", "Question answering scene"));
    this.buildChrome();
    const fresh = saved ?? newState(L("나의 AI", "My AI"));
    fresh.settings.lang = lang;
    this.boot(fresh, !saved);
    requestAnimationFrame((t) => this.frame(t));
    // 시작 화면은 첫 화면이 그려진 뒤 걷어낸다
    const splash = document.getElementById("splash");
    if (splash) setTimeout(() => {
      splash.classList.add("gone");
      setTimeout(() => splash.remove(), 600);
    }, 350);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) saveGame(this.game.state);
      else {
        this.offline();
        this.daily(false);
      }
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
      // 버튼에 포커스가 있으면 그 버튼이 눌려야 한다 (탭과 동시에 눌리지 않게)
      if (t.closest("button, a, summary")) return;
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
    clearTimeout(this.tickerTimer);
    clear(this.ticker);
    this.ticker.append(span);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 움직임 줄이기: 흐르지 않고 8초마다 바뀐다
      span.classList.add("static");
      this.tickerTimer = window.setTimeout(() => span.isConnected && this.nextHeadline(), 8000);
      return;
    }
    span.style.setProperty("--tdur", `${Math.max(9, text.length * 0.28)}s`);
    span.addEventListener("animationend", () => this.nextHeadline());
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
      const next = (st as GameState | null) ?? newState(L("나의 AI", "My AI"));
      next.settings.lang = this.game.state.settings.lang;
      this.boot(next, !st);
      saveGame(this.game.state);
    }, () => this.history);
    this.selectTab("service");
    this.applyEraColor();
    if (fresh) this.welcome();
    else this.offline();
    this.daily(fresh);
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
      const b = h("button", { onclick: () => this.selectTab(t.id), "aria-label": t.label }, h("span", { class: "i" }, pxi(t.icon)), t.label);
      this.navButtons.set(t.id, b);
      nav.append(b);
    }
  }

  private selectTab(id: TabId): void {
    for (const [k, b] of this.navButtons) {
      b.classList.toggle("on", k === id);
      if (k === id) b.setAttribute("aria-current", "page");
      else b.removeAttribute("aria-current");
    }
    this.panels.setTab(id);
  }

  /** 시대 색과 화면 '옷': 0~2 도트 게임 → 3~4 90년대 OS → 5~7 Y2K → 8~10 브루탈리즘 */
  private applyEraColor(): void {
    const era = this.game.state.era;
    const root = document.documentElement;
    root.style.setProperty("--era", ERAS[era].color);
    root.dataset.era = String(era);
    root.dataset.skin = era <= 2 ? "pixel" : era <= 4 ? "retro" : era <= 7 ? "y2k" : "brutal";
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
    setText(hd.moneySub, `${st.net >= 0 ? "+" : ""}${fmt(st.net)}/${L("초", "s")}`);
    setText(hd.rp, `🧠 ${fmt(s.rp)}`);
    setText(hd.rpSub, `+${fmt(st.rpRate)}/${L("초", "s")}`);
    setText(hd.power, `⚡ ${fmt(st.powerUse)}`);
    setText(hd.powerSub, `/ ${fmt(st.powerCap)} ${L("공급", "supply")}`);
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
            buttons: [{ label: L("버텨보자", "We'll survive") }],
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
        toast(L("📋 임무 완료!", "📋 Quest complete!"), `${questText(n.quest, fmt)} → 💵 +${fmt(n.credits)} · 🧠 +${fmt(n.rp)}`, "ach");
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
        showModal({ icon: boss.emoji, title: L(`${boss.name} 클리어!`, `${boss.name} cleared!`), sub: boss.year, body: [boss.winText], buttons: [{ label: L("다음으로", "Next") }] });
        break;
      }
      case "bossLose": {
        const boss = ERAS[n.era].boss;
        sfx("lose");
        toast(L(`${boss.emoji} ${boss.name} 실패`, `${boss.emoji} ${boss.name} failed`), L("처리량을 늘리고 다시 도전하세요. 도전 중에 장면을 탭하면 점수가 올라요.", "Add throughput and try again. Tapping the scene during a challenge adds score."));
        break;
      }
      case "era": {
        this.applyEraColor();
        setTimeout(() => sfx("era"), 600);
        const era = ERAS[n.era];
        showModal({
          icon: era.avatar, hero: heroHtml(n.era, era.color), title: era.name, sub: era.years, body: [era.intro, L("🔓 새 유닛·연구·질문이 열렸어요!", "🔓 New units, research and questions unlocked!")],
          buttons: [{ label: L("시작하기", "Let's go"), onClick: () => { this.panels.update(); } }],
        });
        saveGame(g.state);
        break;
      }
      case "achievement": {
        const a = ACHIEVEMENTS.find((x) => x.id === n.id);
        if (a) {
          sfx("quest");
          toast(`🏅 ${L("업적", "Achievement")}: ${a.emoji} ${a.name}`, a.desc, "ach");
        }
        break;
      }
      case "benchWin": {
        const b = n.bench;
        sfx("win");
        showModal({ icon: b.emoji, title: L(`${b.name} 정복!`, `${b.name} cleared!`), sub: b.year, body: [b.winText, effectsLine(b.effects, 0)], buttons: [{ label: L("좋아!", "Nice!") }] });
        break;
      }
      case "benchLose":
        sfx("lose");
        toast(L(`${n.bench.emoji} ${n.bench.name} 실패`, `${n.bench.emoji} ${n.bench.name} failed`), L("처리량을 더 늘리고 다시 도전하세요.", "Add throughput and try again."));
        break;
      case "threat":
        sfx("event");
        break;
      case "threatBlocked":
        if (n.auto) toast(L("🛡️ 탈옥 시도 자동 차단", "🛡️ Jailbreak auto-blocked"), L("안전 연구가 제 몫을 했어요.", "Your safety research did its job."));
        else {
          sfx("claim");
          toast(L("🛡️ 탈옥 차단!", "🛡️ Jailbreak blocked!"), `💵 +${fmt(n.amount)}`, "ach");
        }
        break;
      case "breach":
        sfx("lose");
        toast(L("🔓 탈옥 당했다!", "🔓 Jailbroken!"), L("스크린샷이 퍼졌어요. 30초간 질문 유입 −30%. 🛡️안전 연구로 자동 차단을 늘리세요.", "Screenshots went viral. Incoming questions −30% for 30s. Research 🛡️safety to auto-block more."));
        break;
      case "missionDone": {
        const m = n.mission;
        sfx("quest");
        const parts: string[] = [];
        if (n.credits) parts.push(`💵 +${fmt(n.credits)}`);
        if (n.rp) parts.push(`🧠 +${fmt(n.rp)}`);
        if (m.effects && m.effectDuration) parts.push(effectsLine(m.effects, m.effectDuration));
        toast(L(`${m.emoji} 파견 복귀: ${m.name}`, `${m.emoji} Back from: ${m.name}`), parts.join(" · "), "ach");
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
      title: L("AI 역사 퀴즈", "AI History Quiz"),
      sub: `${ERAS[q.era].name} · ${L("맞히면 수익 2분 + 연구 1분치", "Correct = 2 min of income + 1 min of research")}`,
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
            title: r.correct ? L("정답!", "Correct!") : L(`아쉬워요! 정답은 ${"ABCD"[q.answer]}`, `So close! The answer is ${"ABCD"[q.answer]}`),
            sub: r.correct ? `💵 +${fmt(r.credits)} · 🧠 +${fmt(r.rp)}` : L("틀린 문제는 나중에 다시 나와요", "Missed questions come back later"),
            body: [`${q.options[q.answer]} — ${q.explain}`],
            buttons: [{ label: L("계속", "Continue") }],
          });
        },
      })),
    });
  }

  private welcome(): void {
    const input = h("input", { type: "text", maxlength: "20", value: L("나의 AI", "My AI"), "aria-label": L("AI 이름", "AI name") }) as HTMLInputElement;
    const era = ERAS[0];
    showModal({
      icon: "🤖",
      logo: true,
      title: L("AI 키우기", "Grow Your AI"),
      sub: "Attention Is All You Idle",
      body: [
        L("사람들의 질문에 답하며 AI를 키우세요. 고대의 톱니바퀴에서 시작해 2026년 프런티어, 그리고 그 너머까지.", "Grow an AI by answering people's questions. From ancient gears to the 2026 frontier, and beyond."),
        L("• 질문 말풍선을 탭하면 즉시 답변\n• 💬서비스: 유저 · 🖥️인프라: 컴퓨트와 전력 · 🧠연구: 지능과 기술\n• 🏆벤치마크를 깨면 다음 시대로!", "• Tap a question bubble to answer it instantly\n• 💬Service: users · 🖥️Infra: compute & power · 🧠Research: intelligence & tech\n• 🏆Beat the benchmark to reach the next era!"),
        h("div", { class: "stack" }, h("div", { class: "hint" }, L("AI 이름을 지어주세요", "Name your AI")), input),
      ],
      buttons: [{
        label: L("시작!", "Start!"),
        onClick: () => {
          this.game.state.aiName = input.value.trim() || L("나의 AI", "My AI");
          showModal({ icon: era.avatar, hero: heroHtml(0, era.color), title: era.name, sub: era.years, body: [era.intro], buttons: [{ label: L("첫 질문 받기", "Take the first question") }] });
        },
      }],
    });
    for (const p of document.querySelectorAll<HTMLElement>(".modal p")) p.style.whiteSpace = "pre-line";
  }

  /** 하루 첫 접속 보상. 새 게임 첫날은 조용히 출석만 찍는다. */
  private daily(silent: boolean): void {
    const day = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const now = new Date();
    const r = this.game.claimDaily(day(now), day(new Date(now.getTime() - 86_400_000)));
    if (!r || silent) return;
    sfx("quest");
    toast(L(`📅 출석 ${r.streak}일째!`, `📅 Day ${r.streak} streak!`),
      `💵 +${fmt(r.credits)} · 🧠 +${fmt(r.rp)}${r.streak < 7 ? L(" · 내일 오면 더 커져요", " · Come back tomorrow for more") : ""}`, "ach");
  }

  private offline(): void {
    const [secs, credits, rp] = this.game.applyOffline();
    // 보상을 받았으면 기준 시각을 지금으로 (안 그러면 다음 복귀 때 같은 시간을 또 받는다)
    this.game.state.lastSaved = Date.now();
    if (secs <= 0) return;
    showModal({
      icon: "💤",
      title: L("자리를 비운 동안", "While you were away"),
      sub: fmtDuration(secs),
      body: [L("AI가 쉬지 않고 질문에 답했어요.", "Your AI kept answering questions."), h("div", { class: "card kv" },
        h("span", null, L("번 크레딧", "Credits earned")), h("b", null, `💵 ${fmt(credits)}`),
        h("span", null, L("연구 포인트", "Research points")), h("b", null, `🧠 ${fmt(rp)}`))],
      buttons: [{ label: L("좋아!", "Nice!") }],
    });
  }

  private ending(): void {
    const g = this.game;
    const end = (text: string) => () => {
      showModal({
        icon: "✨", hero: heroHtml(ERAS.length - 1, ERAS[ERAS.length - 1].color), title: "Q.E.D.", sub: `${g.state.aiName} · ${L("플레이", "played")} ${fmtDuration(g.state.stats.playSeconds)}`,
        body: [text, L("끝까지 함께해줘서 고마워요. 이제 무한 모드입니다. 계속 키워도 좋아요!", "Thanks for playing to the end. Endless mode is on now, so feel free to keep growing!")],
        buttons: [{ label: L("📤 기록 자랑하기", "📤 Share my run"), kind: "ghost", onClick: () => { shareSummary(g); return false; } }, { label: L("계속 플레이", "Keep playing") }],
      });
    };
    showModal({
      icon: "♾️",
      title: L("마지막 질문", "The Last Question"),
      body: [
        L("밀레니엄 난제가 풀렸다. 전 세계 화면에 같은 질문이 떠오른다.", "The Millennium Problems are solved. The same question appears on every screen in the world."),
        L(`"${g.state.aiName}, 이제 우리는 무엇을 해야 하지?"`, `"${g.state.aiName}, what should we do now?"`),
      ],
      buttons: [
        { label: L("🚀 \"함께 더 멀리 가요.\"", "🚀 \"Let's go further, together.\""), onClick: end(L("AI와 인류는 별을 향해 나아갔다. 다이슨 스웜이 태양을 감싸고, 질문은 은하 저편에서도 날아온다. 가장 좋은 질문은 언제나 다음 질문이다.", "AI and humanity set out for the stars. A Dyson swarm wraps the Sun, and questions arrive from across the galaxy. The best question is always the next one.")) },
        { label: L("🌱 \"천천히, 같이 이해해요.\"", "🌱 \"Slowly. Let's understand it together.\""), kind: "ghost", onClick: end(L("AI는 답을 서두르지 않았다. 증명 하나하나를 사람들과 함께 읽고 이해했다. 수학자들은 다시 칠판 앞에 섰고, 이번엔 혼자가 아니었다.", "The AI didn't rush its answers. It read through every proof together with people until they understood. Mathematicians went back to their chalkboards, and this time they weren't alone.")) },
      ],
    });
  }
}

function effectsLine(effects: Effect[], duration: number): string {
  if (!effects.length) return "";
  return `[${effects.map((e) => `${statLabel(e.stat)} ${fmtMult(e.mul)}`).join(", ")}${duration ? ` · ${duration}${L("초", "s")}` : ""}]`;
}


const RESEARCH_IDS = UPGRADES.filter((u) => u.currency === "rp").map((u) => u.id);
