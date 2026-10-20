// 버튼 설명: 버튼을 꾹 누르면(0.45초) 작은 말풍선으로 무슨 기능인지 알려 준다.
// 정보 칸(돈·연구 점수·전력·시대·준비도 막대)은 그냥 눌러도 설명이 뜬다.
// 꾹 눌러서 설명을 본 뒤에는 그 버튼이 눌리지 않는다. 구매 버튼은 꾹 누르기가 연속 구매라 제외.
import { L } from "../i18n/lang";
import { h, setText } from "./dom";

const HELP: Record<string, () => string> = {
  money: () => L("돈(크레딧): 질문에 답하면 들어와요. 건물·제품을 사는 데 써요. 아래 작은 숫자는 1초에 버는 양.", "Coins: earned by answering questions, spent on buildings and products. The small number is income per second."),
  rp: () => L("연구 점수: 연구원이 만들어요. 연구 탭에서 새 기술을 배우는 데 써요.", "Research score: made by researchers, spent on new tech in Research."),
  power: () => L("전력: 컴퓨터를 돌리는 데 필요해요(쓰는 양 / 공급). 모자라면 답변 속도가 떨어지니 인프라 탭에서 전력 건물을 사요.", "Power: computers need it (used / supply). If it runs short, answer speed drops; buy power in Infra."),
  era: () => L("지금 시대. 보스를 이기면 다음 시대로 넘어가요.", "Current era. Beat the boss to move on."),
  help: () => L("게임 방법과 용어 사전", "How to play and glossary"),
  hint: () => L("다음 할 일: 지금 가장 도움이 되는 행동. 누르면 그 탭으로 가고, 살 것에 '추천' 표시가 붙어요.", "Next step: the most useful thing to do now. Tap to jump there; the item gets a 'Best' tag."),
  think: () => L("생각 모드: 켜면 답이 느리고 비싸지지만 헛소리가 크게 줄어요. 어려운 질문이 많을 때 켜요.", "Thinking Mode: slower, pricier answers but far less nonsense. Turn it on when questions get hard."),
  meter: () => L("다음 시대까지 준비도. 보스에 필요한 지능·기억력과 예상 달성률을 보여 줘요.", "Progress to the next era: the IQ and memory the boss needs, and your expected score."),
  "nav-service": () => L("서비스: 유저를 늘려 질문을 받고, 제품·임무·뽑기를 해요.", "Service: get users for more questions; products, quests and gacha."),
  "nav-infra": () => L("인프라: 답변 속도(컴퓨터)와 전력을 늘려요. 자동 구매도 여기.", "Infra: more answer speed (computers) and power. Auto-buy lives here too."),
  "nav-research": () => L("연구: 연구 점수로 기술을 배우고, 모델을 키워 지능을 올려요.", "Research: learn tech with research score and grow the model for IQ."),
  "nav-bench": () => L("벤치마크: 보스에 도전해 다음 시대로. 새 모델 출시와 랭킹도 여기.", "Bench: challenge the boss to advance. Releases and rankings are here too."),
  "nav-codex": () => L("도감: 역사 이야기, 기술, 꾸미기, 도움말, 설정.", "Codex: history, tech, style, help and settings."),
  buymode: () => L("한 번에 살 개수: ×1, ×10, MAX(살 수 있는 만큼). 구매 버튼을 꾹 누르면 연속으로 사요.", "How many to buy at once: ×1, ×10 or MAX (as many as you can). Hold a buy button to keep buying."),
  autobuy: () => L("자동 구매 켜기/끄기: 켜 두면 1초마다 가장 효율 좋은 건물을, 가진 돈의 15% 이하일 때 사요.", "Auto-buy on/off: buys the best-value building every second when it costs 15% of your coins or less."),
  sheet: () => L("아래 창 크기: 끌어 올리면 크게, 내리면 접혀요. 누르면 보통↔크게.", "Panel size: drag up to enlarge, down to fold. Tap to switch normal/large."),
};

const HOLD_MS = 450;
let bubble: HTMLElement | null = null;
let hideTimer = 0;

function show(el: HTMLElement, ms: number): void {
  const text = HELP[el.dataset.help ?? ""]?.();
  if (!text) return;
  bubble ??= document.body.appendChild(h("div", { class: "tip-bubble", role: "status", "aria-live": "polite" }));
  setText(bubble, text);
  bubble.classList.add("on");
  const r = el.getBoundingClientRect();
  const bw = Math.min(260, window.innerWidth - 16);
  bubble.style.width = `${bw}px`;
  const left = Math.max(8, Math.min(window.innerWidth - bw - 8, r.left + r.width / 2 - bw / 2));
  const above = r.top > 90;
  bubble.style.left = `${left}px`;
  bubble.style.top = above ? "" : `${r.bottom + 8}px`;
  bubble.style.bottom = above ? `${window.innerHeight - r.top + 8}px` : "";
  clearTimeout(hideTimer);
  hideTimer = window.setTimeout(hide, ms);
}

function hide(): void {
  bubble?.classList.remove("on");
}

/** el에 설명을 단다. tap이면 그냥 눌러도 설명 (버튼이 아닌 정보 칸) */
export function tip<T extends HTMLElement>(el: T, key: keyof typeof HELP & string, tap = false): T {
  el.dataset.help = key;
  if (tap) el.dataset.tap = "1";
  return el;
}

export function setupTips(): void {
  let timer = 0;
  let startX = 0, startY = 0;
  let suppress = false;
  document.addEventListener("pointerdown", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-help]");
    if (!el) return;
    startX = e.clientX;
    startY = e.clientY;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      suppress = true;
      show(el, 4000);
    }, HOLD_MS);
  }, { passive: true });
  const cancel = () => clearTimeout(timer);
  document.addEventListener("pointerup", cancel, { passive: true });
  document.addEventListener("pointercancel", cancel, { passive: true });
  document.addEventListener("pointermove", (e) => {
    if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 10) cancel();
  }, { passive: true });
  // 꾹 눌러 설명을 봤으면 그 뒤 클릭은 버린다 (버튼이 실행되지 않게)
  document.addEventListener("click", (e) => {
    if (suppress) {
      suppress = false;
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-help][data-tap]");
    if (el) show(el, 3500);
  }, true);
  // 꾹 누를 때 뜨는 시스템 메뉴 막기
  document.addEventListener("contextmenu", (e) => {
    if ((e.target as HTMLElement).closest("[data-help]")) e.preventDefault();
  });
  document.addEventListener("scroll", hide, { passive: true, capture: true });
}
