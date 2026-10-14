// 꾹 누르면 연속 구매. 처음 0.45초는 기다리고(그냥 탭은 한 번만), 그 뒤로 점점 빨라진다.
// 10개마다, 그리고 마일스톤(생산 ×2)에 닿으면 잠깐 멈칫해서 한 번에 다 써 버리지 않게 한다.
import { h, setText } from "./dom";
import { L } from "../i18n/lang";

export interface HoldStep {
  /** 이번에 산 개수 (0이면 멈춤: 돈이 모자람) */
  n: number;
  /** 마일스톤을 넘었는지 (더 길게 멈칫) */
  milestone?: boolean;
}

const START_DELAY = 450;
const PAUSE_EVERY = 10;
const PAUSE_MS = 700;
const MILESTONE_MS = 1100;

/** 지금 누르고 있는 버튼의 멈춤 함수 (손을 떼는 이벤트는 창 전체에 한 번만 건다) */
let activeStop: (() => void) | null = null;
let listening = false;
function listenOnce(): void {
  if (listening) return;
  listening = true;
  const up = () => { activeStop?.(); activeStop = null; };
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  window.addEventListener("blur", up);
}

export function holdToRepeat(btn: HTMLElement, step: () => HoldStep): void {
  listenOnce();
  let timer = 0;
  let holding = false;
  let fired = false;
  let count = 0;
  let total = 0;
  const badge = h("span", { class: "hold-badge", "aria-hidden": "true" });

  const stop = () => {
    holding = false;
    clearTimeout(timer);
    btn.classList.remove("holding", "hold-pause");
    if (total) setTimeout(() => badge.remove(), 900);
  };
  const tick = () => {
    if (!holding || !btn.isConnected) return stop();
    const r = step();
    if (!r.n) return stop();
    fired = true;
    count += 1;
    total += r.n;
    btn.classList.add("holding");
    setText(badge, `+${total}`);
    // 버튼 안은 가격이 바뀔 때마다 다시 그려지니, 배지는 바깥(그 줄)에 붙인다
    const host = btn.parentElement;
    if (host && badge.parentElement !== host) host.append(badge);
    // 점점 빨라진다: 260ms → 최소 70ms
    let wait = Math.max(70, 260 * 0.86 ** count);
    let pause = "";
    if (r.milestone) { wait += MILESTONE_MS; pause = L("×2 달성!", "×2!"); }
    else if (count % PAUSE_EVERY === 0) { wait += PAUSE_MS; pause = L("잠깐…", "hold…"); }
    if (pause) {
      btn.classList.add("hold-pause");
      setText(badge, `+${total} ${pause}`);
      setTimeout(() => btn.classList.remove("hold-pause"), wait - 60);
    }
    timer = window.setTimeout(tick, wait);
  };

  btn.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    holding = true;
    fired = false;
    count = 0;
    total = 0;
    badge.remove();
    clearTimeout(timer);
    activeStop?.();
    activeStop = stop;
    timer = window.setTimeout(tick, START_DELAY);
  });
  btn.addEventListener("pointerleave", () => { if (holding) stop(); });
  // 꾹 누른 뒤 손을 떼면 click이 한 번 더 오는데, 그건 버린다 (이미 연속으로 샀으니)
  btn.addEventListener("click", (e) => {
    if (fired) {
      fired = false;
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }, true);
  // 길게 누를 때 뜨는 시스템 메뉴·글자 선택 막기
  btn.addEventListener("contextmenu", (e) => e.preventDefault());
}
