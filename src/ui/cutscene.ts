// 컷신: 검은 화면에 도트 그림 하나, 대사가 한 글자씩 찍힌다. 화면을 누르면 다음 줄, '건너뛰기'로 끝.
import { L } from "../i18n/lang";
import { h } from "./dom";

export interface CutLine {
  text: string;
  /** 크게 (마지막 한 방) */
  big?: boolean;
}

export function playCutscene(img: string, lines: CutLine[]): Promise<void> {
  return new Promise((resolve) => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const box = h("div", { class: "cut-lines", "aria-live": "polite" });
    const skip = h("button", { class: "cut-skip" }, L("건너뛰기", "Skip"));
    const hint = h("div", { class: "cut-hint", "aria-hidden": "true" }, "▼");
    const root = h("div", { class: "cutscene", role: "dialog", "aria-modal": "true", "aria-label": L("엔딩", "Ending") },
      h("img", { class: "cut-img px-img", src: img, alt: "" }), box, hint, skip);
    document.body.append(root);
    let i = 0;
    let typing = 0;
    let cur: HTMLElement | null = null;
    let full = "";
    const finish = () => {
      clearInterval(typing);
      root.remove();
      resolve();
    };
    const next = () => {
      // 아직 찍는 중이면 그 줄을 한 번에 다 보여 준다
      if (typing && cur) {
        clearInterval(typing);
        typing = 0;
        cur.textContent = full;
        return;
      }
      if (i >= lines.length) return finish();
      const line = lines[i++];
      cur = h("p", { class: line.big ? "big" : "" });
      box.append(cur);
      full = line.text;
      if (reduce) {
        cur.textContent = full;
        return;
      }
      let n = 0;
      typing = window.setInterval(() => {
        n++;
        cur!.textContent = full.slice(0, n);
        if (n >= full.length) {
          clearInterval(typing);
          typing = 0;
        }
      }, line.big ? 90 : 45);
    };
    root.addEventListener("pointerdown", (e) => {
      if (e.target === skip) return;
      next();
    });
    skip.addEventListener("click", finish);
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") finish();
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    });
    root.tabIndex = -1;
    root.focus();
    next();
  });
}
