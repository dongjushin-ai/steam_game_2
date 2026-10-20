// 아래 창(패널) 크기: 손잡이를 끌어 올리면 크게, 내리면 접기(장면만 크게). 탭하면 보통 ↔ 크게.
// 상태는 이 기기에만 기억한다 (localStorage, 실패해도 상관없음).
import { tip } from "./tips";
import { h } from "./dom";
import { L } from "../i18n/lang";

export type SheetState = "peek" | "half" | "full";
const KEY = "ai-kiugi-sheet";

export class Sheet {
  readonly handle = tip(h("button", { class: "sheet-handle", type: "button" }, h("span", { class: "grip", "aria-hidden": "true" }), h("span", { class: "sheet-tip" })), "sheet");
  private state: SheetState = "half";
  private app = document.getElementById("app")!;

  constructor(private onChange: () => void) {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "peek" || v === "half" || v === "full") this.state = v;
    } catch {
      // 저장소를 못 쓰면 매번 보통 크기로
    }
    this.apply();
    this.bindDrag();
    this.handle.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") { e.preventDefault(); this.set(this.state === "peek" ? "half" : "full"); }
      if (e.key === "ArrowDown") { e.preventDefault(); this.set(this.state === "full" ? "half" : "peek"); }
    });
  }

  get value(): SheetState {
    return this.state;
  }

  set(s: SheetState): void {
    if (s === this.state) return;
    this.state = s;
    try {
      localStorage.setItem(KEY, s);
    } catch {
      // 저장 실패(사생활 보호 모드 등)는 무시: 이번 실행 동안만 유지
    }
    this.apply();
    this.onChange();
  }

  /** 탭을 누를 때: 접혀 있으면 보통으로 연다 */
  open(): void {
    if (this.state === "peek") this.set("half");
  }

  private apply(): void {
    this.app.dataset.sheet = this.state;
    this.app.style.removeProperty("--scene-drag");
    const tip = this.handle.querySelector(".sheet-tip")!;
    tip.textContent = this.state === "peek" ? L("▲ 메뉴 열기", "▲ Open menu") : this.state === "full" ? L("▼ 장면 크게", "▼ Bigger scene") : L("끌어서 크기 조절", "Drag to resize");
    const size = this.state === "peek" ? L("접힘", "hidden") : this.state === "full" ? L("크게", "large") : L("보통", "normal");
    this.handle.setAttribute("aria-label", `${L("아래 창 크기", "Panel size")}: ${size}. ${L("위아래 화살표로 바꾸기", "Use up/down arrows to change")}`);
  }

  private bindDrag(): void {
    let startY = 0;
    let startH = 0;
    let moved = false;
    let dragging = false;
    const scene = () => document.getElementById("scene")!;
    const bounds = () => {
      const top = document.getElementById("top")!.getBoundingClientRect().height;
      const nav = document.getElementById("nav")!.getBoundingClientRect().height;
      const total = this.app.getBoundingClientRect().height;
      return { min: 110, max: total - top - nav - this.handle.getBoundingClientRect().height };
    };
    this.handle.addEventListener("pointerdown", (e) => {
      dragging = true;
      moved = false;
      startY = e.clientY;
      startH = scene().getBoundingClientRect().height;
      this.handle.setPointerCapture(e.pointerId);
    });
    this.handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      if (Math.abs(dy) > 6) moved = true;
      if (!moved) return;
      const { min, max } = bounds();
      const hgt = Math.max(min, Math.min(max, startH + dy));
      this.app.classList.add("sheet-dragging");
      this.app.style.setProperty("--scene-drag", `${hgt}px`);
    });
    const end = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      this.app.classList.remove("sheet-dragging");
      if (!moved) {
        // 탭: 접힘 → 보통, 보통 ↔ 크게
        this.set(this.state === "half" ? "full" : "half");
        return;
      }
      const { min, max } = bounds();
      const hgt = Math.max(min, Math.min(max, startH + (e.clientY - startY)));
      const panelLeft = max - hgt;
      // 아래 창이 거의 안 남으면 접기, 장면이 작아졌으면 크게, 아니면 보통
      const next: SheetState = panelLeft < 90 ? "peek" : hgt < Math.min(260, max * 0.42) ? "full" : "half";
      if (next === this.state) this.apply();
      else this.set(next);
    };
    this.handle.addEventListener("pointerup", end);
    this.handle.addEventListener("pointercancel", end);
  }
}
