// 첫 30초 안내: 몬스터를 직접 눌러 보고 → 동전을 모으고 → 첫 구매에서 LEVEL UP.
// 말풍선과 깜박이는 화살표가 지금 눌러야 할 곳을 가리킨다. 한 번 끝나면 다시 나오지 않는다.
import { BUILDINGS } from "../data";
import { buildingCost } from "../core/formulas";
import type { Game } from "../core/game";
import { L } from "../i18n/lang";
import { h, setText } from "./dom";
import { celebrate } from "./panels";
import type { Scene } from "./scene";

/** 첫 구매 뒤 몇 개 더 사게 하나 (처음 전력 6 = 계산기 4대까지) */
const MORE = 3;

type Step = "oops" | "tap" | "earn" | "buy" | "more" | "done";

export class Tutorial {
  private step: Step = "oops";
  private oopsLeft = 2.4;
  private el = h("div", { class: "coach", role: "status", "aria-live": "polite" }, h("span", { class: "coach-text" }), h("i", { class: "coach-arrow", "aria-hidden": "true" }));
  private text = this.el.querySelector(".coach-text") as HTMLElement;
  private doneLeft = 0;
  private boughtAtStart: number;
  private said = false;
  private moreLeft = 0;
  private killsAtStart: number;

  constructor(private game: Game, private scene: Scene, private onFinish: () => void) {
    document.body.append(this.el);
    this.boughtAtStart = game.state.stats.bought;
    this.killsAtStart = scene.tapKills;
    scene.holdFire = true;
    setTimeout(() => scene.introMob(L("1 더하기 1은?", "What's 1 + 1?")), 300);
  }

  /** 첫 구매 대상: 계산기(컴퓨트). 처음엔 답변 속도가 병목이라 사자마자 수입이 두 배가 된다 */
  private firstBuy(): { cost: number; el: HTMLElement | null } {
    const s = this.game.state;
    const b = BUILDINGS.find((x) => x.kind === "compute" && x.era <= s.era)!;
    return { cost: buildingCost(s, b), el: document.querySelector<HTMLElement>(`#panel .row[data-id="${b.id}"] .buy`) };
  }

  /** 매 프레임: 단계 진행과 말풍선 위치 */
  frame(dt: number): void {
    const g = this.game;
    let target: [number, number] | null = null;
    if (this.step === "oops") {
      // 첫 질문에 AI가 자신만만하게 틀린다 (이 게임의 웃음 포인트: 헛소리)
      this.oopsLeft -= dt;
      if (this.oopsLeft <= 1.2 && !this.said) {
        this.said = true;
        this.scene.speak(L("정답은 11입니다! (확신 99%)", "The answer is 11! (99% confident)"), true, 4);
      }
      target = null;
      if (this.oopsLeft <= 0) {
        this.step = "tap";
        this.scene.bigNextKill = true;
      }
    } else if (this.step === "tap") {
      setText(this.text, L("앗, AI가 헛소리를! 몬스터를 톡 눌러 바로잡아 줘", "Oops, your AI is making things up! Tap the monster to fix it"));
      target = this.scene.leadMobPoint();
      if (this.scene.tapKills > this.killsAtStart) {
        this.step = "earn";
        this.scene.speak(L("…2입니다. 방금 건 못 본 걸로 해 주세요.", "…It's 2. Please forget what you just saw."), false, 3.5);
      }
    } else if (this.step === "earn") {
      // 이제 AI도 천천히 쏜다. 동전이 모이면 다음 단계
      this.scene.holdFire = false;
      setText(this.text, L("좋아! 몇 마리 더 잡아서 동전을 모아", "Nice! Catch a few more to collect coins"));
      target = this.scene.leadMobPoint();
      if (g.state.credits >= this.firstBuy().cost) this.step = "buy";
    } else if (this.step === "buy") {
      target = this.pointBuy(L("동전으로 계산기를 늘리자. 여기를 눌러!", "Spend coins on a calculator. Tap here!"));
      if (g.state.stats.bought > this.boughtAtStart) {
        this.step = "more";
        this.moreLeft = 12;
        celebrate(L("수입 ×2!", "Income ×2!"));
        this.scene.speak(L("머리가 두 배로 빨라졌어요!", "My head just got twice as fast!"), false, 3);
      }
    } else if (this.step === "more") {
      // 몇 번 더 (전력 6 안에서 끝나게 3개까지): 몇 초 만에 수입이 4배
      this.moreLeft -= dt;
      const left = this.boughtAtStart + 1 + MORE - g.state.stats.bought;
      target = this.pointBuy(L(`좋아! ${left}번 더 눌러 봐`, `Nice! ${left} more`));
      if (left <= 0 || this.moreLeft <= 0) {
        this.step = "done";
        this.doneLeft = 3.2;
        if (left <= 0) celebrate(L("수입 ×4!", "Income ×4!"));
      }
    } else {
      setText(this.text, L("이제 AI가 알아서 답한다. 계속 키워 보자!", "Now your AI answers on its own. Keep growing!"));
      target = this.scene.leadMobPoint();
      this.doneLeft -= dt;
      if (this.doneLeft <= 0) return this.finish();
    }
    this.place(target);
  }

  /** 계산기 구매 버튼을 가리킨다. 다른 탭이면 인프라 탭 버튼을 가리킨다 */
  private pointBuy(here: string): [number, number] | null {
    const btn = this.firstBuy().el;
    const r = btn?.getBoundingClientRect();
    if (btn && r && r.height > 0 && r.top < window.innerHeight) {
      setText(this.text, here);
      return [r.left + r.width / 2, r.top];
    }
    const nav = document.querySelectorAll<HTMLElement>("#nav button")[1];
    setText(this.text, L("인프라 탭에서 계산기를 늘리자", "Open Infra to get a calculator"));
    if (!nav) return null;
    const n = nav.getBoundingClientRect();
    return [n.left + n.width / 2, n.top];
  }

  private place(p: [number, number] | null): void {
    if (!p) {
      this.el.style.visibility = "hidden";
      return;
    }
    this.el.style.visibility = "";
    const w = this.el.offsetWidth, hgt = this.el.offsetHeight;
    const x = Math.max(8, Math.min(window.innerWidth - w - 8, p[0] - w / 2));
    const y = Math.max(8, p[1] - hgt - 6);
    this.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    (this.el.querySelector(".coach-arrow") as HTMLElement).style.left = `${Math.round(Math.max(10, Math.min(w - 10, p[0] - x)))}px`;
  }

  /** 새 게임·불러오기로 장면이 바뀔 때: 완료로 치지 않고 치운다 */
  dispose(): void {
    this.el.remove();
  }

  finish(): void {
    this.scene.holdFire = false;
    this.el.remove();
    this.game.state.settings.tutorialDone = true;
    this.onFinish();
  }
}
