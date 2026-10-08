type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown> & { class?: string; onclick?: (e: MouseEvent) => void };

/** 작은 하이퍼스크립트 헬퍼: h("div", { class: "x" }, "text", child) */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = String(v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
      else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export function clear(el: Element): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function $(sel: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) throw new Error(`missing ${sel}`);
  return el;
}

/** 값이 바뀔 때만 textContent를 갱신 */
export function setText(el: Element, text: string): void {
  if (el.textContent !== text) el.textContent = text;
}

/** null/false 자식은 건너뛰고 붙인다 */
export function append(el: Element, ...children: Child[]): void {
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
}
