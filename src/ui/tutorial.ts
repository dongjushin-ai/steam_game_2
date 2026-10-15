// 첫 30초 안내: 몬스터를 직접 눌러 보고 → 동전을 모으고 → 첫 구매에서 LEVEL UP.
// 말풍선과 깜박이는 화살표가 지금 눌러야 할 곳을 가리킨다. 한 번 끝나면 다시 나오지 않는다.
import { BUILDINGS } from "../data";
import { buildingCost } from "../core/formulas";
import type { Game } from "../core/game";
import { L } from "../i18n/lang";
import { h, setText } from "./dom";
import { celebrate } from "./panels";
import type { Scene } from "./scene";

type Step = "tap" | "earn" | "buy" | "done";

export class Tutorial {
  private step: Step = "tap";
  private el = h("div", { class: "coach", role: "status", "aria-live": "polite" }, h("span", { class: "coach-text" }), h("i", { class: "coach-arrow", "aria-hidden": "true" }));
  private text = this.el.querySelector(".coach-text") as HTMLElement;
  private doneLeft = 0;
  private boughtAtStart: number;
  private killsAtStart: number;

  constructor(private game: Game, private scene: Scene, private onFinish: () => void) {
    document.body.append(this.el);
    this.boughtAtStart = game.state.stats.bought;
    this.killsAtStart = scene.tapKills;
    scene.holdFire = true;
    setTimeout(() => scene.introMob(L("1 더하기 1은?", "What's 1 + 1?")), 600);
  }

  /** 가장 싼 유저 건물 (첫 구매 대상) */
  private firstBuy(): { cost: number; el: HTMLElement | null } {
    const s = this.game.state;
    const b = BUILDINGS.find((x) => x.kind === "demand" && x.era <= s.era)!;
    return { cost: buildingCost(s, b), el: document.querySelector<HTMLElement>(`#panel .row[data-id="${b.id}"] .buy`) };
  }

  /** 매 프레임: 단계 진행과 말풍선 위치 */
  frame(dt: number): void {
    const g = this.game;
    let target: [number, number] | null = null;
    if (this.step === "tap") {
      setText(this.text, L("질문이 왔다! 몬스터를 톡 눌러 답해 줘", "A question! Tap the monster to answer it"));
      target = this.scene.leadMobPoint();
      if (this.scene.tapKills > this.killsAtStart) this.step = "earn";
    } else if (this.step === "earn") {
      // 이제 AI도 천천히 쏜다. 동전이 모이면 다음 단계
      this.scene.holdFire = false;
      setText(this.text, L("좋아! 몇 마리 더 잡아서 동전을 모아", "Nice! Catch a few more to collect coins"));
      target = this.scene.leadMobPoint();
      if (g.state.credits >= this.firstBuy().cost) this.step = "buy";
    } else if (this.step === "buy") {
      const btn = this.firstBuy().el;
      const r = btn?.getBoundingClientRect();
      if (btn && r && r.height > 0 && r.top < window.innerHeight) {
        setText(this.text, L("동전으로 유저를 늘리자. 여기를 눌러!", "Spend coins on users. Tap here!"));
        target = [r.left + r.width / 2, r.top];
      } else {
        // 다른 탭에 있거나 아래 창이 접혀 있으면: 서비스 탭부터
        const nav = document.querySelector<HTMLElement>("#nav button");
        setText(this.text, L("서비스 탭에서 유저를 늘리자", "Open Service to get users"));
        if (nav) {
          const n = nav.getBoundingClientRect();
          target = [n.left + n.width / 2, n.top];
        }
      }
      if (g.state.stats.bought > this.boughtAtStart) {
        this.step = "done";
        this.doneLeft = 3.2;
        celebrate(L("첫 업그레이드!", "First upgrade!"));
      }
    } else {
      setText(this.text, L("이제 AI가 알아서 답한다. 계속 키워 보자!", "Now your AI answers on its own. Keep growing!"));
      target = this.scene.leadMobPoint();
      this.doneLeft -= dt;
      if (this.doneLeft <= 0) return this.finish();
    }
    this.place(target);
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
