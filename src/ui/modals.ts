import { $, clear, h } from "./dom";

export interface ModalButton {
  label: string | Node;
  kind?: "primary" | "ghost" | "danger";
  className?: string;
  /** false를 반환하면 모달을 닫지 않는다 */
  onClick?: () => void | boolean;
}

export interface ModalSpec {
  icon?: string;
  title: string;
  sub?: string;
  body?: (Node | string)[];
  buttons?: ModalButton[];
  /** 바깥을 눌러 닫을 수 있는지 */
  dismissable?: boolean;
}

const queue: ModalSpec[] = [];
let open = false;

/** 모달은 하나씩 순서대로 보여준다. */
export function showModal(spec: ModalSpec): void {
  queue.push(spec);
  if (!open) next();
}

export function modalOpen(): boolean {
  return open;
}

function next(): void {
  const root = $("#modal-root");
  clear(root);
  const spec = queue.shift();
  if (!spec) {
    open = false;
    return;
  }
  open = true;
  const close = () => next();
  const buttons = (spec.buttons ?? [{ label: "확인" }]).map((b) =>
    h(
      "button",
      {
        class: `btn ${b.kind === "ghost" ? "ghost" : b.kind === "danger" ? "danger" : ""} ${b.className ?? ""}`,
        onclick: () => {
          if (b.onClick?.() !== false) close();
        },
      },
      b.label,
    ),
  );
  const modal = h(
    "div",
    { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": spec.title },
    spec.icon ? h("div", { class: "m-ico" }, spec.icon) : null,
    h("h2", null, spec.title),
    spec.sub ? h("div", { class: "m-sub" }, spec.sub) : null,
    ...(spec.body ?? []).map((b) => (typeof b === "string" ? h("p", null, b) : b)),
    h("div", { class: "m-btns" }, ...buttons),
  );
  root.append(modal);
  root.onclick = (e) => {
    if (spec.dismissable && e.target === root) close();
  };
}

export function toast(title: string, text = "", kind = ""): void {
  const box = $("#toasts");
  const el = h("div", { class: `toast ${kind}` }, h("b", null, title), text);
  box.append(el);
  while (box.children.length > 3) box.firstChild?.remove();
  setTimeout(() => el.remove(), 4200);
  el.onclick = () => el.remove();
}
