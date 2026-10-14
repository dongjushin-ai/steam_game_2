// 시드 뽑기 화면: 서비스 탭 카드, 캡슐 여는 연출, 확률표, 조각 교환소.
import type { Game } from "../core/game";
import { PICKUP_SHARE, PITY, effectiveLegendary, POOL, PULL_COST, RATES, SHARD_PRICE, exchange, pickupFor, type PullResult } from "../core/gacha";
import { rarityName, resolveLook } from "../core/looks";
import { ERAS, type LookItem } from "../data";
import { L } from "../i18n/lang";
import { h, setText } from "./dom";
import { showModal, toast } from "./modals";
import { lookStill, petStill } from "./pixel";
import { sfx } from "./sound";

/** 아이템 그림: 지금 모습 위에 그 아이템을 얹은 것 (색은 칩) */
export function itemImg(g: Game, x: LookItem): HTMLElement {
  if (x.slot === "color") return h("span", { class: "lt-img swatch", style: { background: x.hex ?? "#000" } });
  if (x.slot === "pet") return h("img", { class: "lt-img px-img pet", alt: "", src: petStill(x.id) });
  const lk = resolveLook(g.state);
  const accent = lk.color ?? ERAS[lk.room].color;
  return h("img", {
    class: `lt-img px-img ${x.slot === "hat" ? "head" : ""}`, alt: "",
    src: lookStill(lk.avatar, accent, x.slot === "hat" ? x.id : null, x.slot === "fx" ? x.id : null, x.slot === "hat"),
  });
}

const slotName = (x: LookItem) => ({ color: L("색", "Color"), hat: L("모자", "Hat"), fx: L("효과", "Effect"), pet: L("펫", "Pet") })[x.slot];

/** 서비스 탭 카드. update()로 숫자만 갱신한다 */
export function gachaCard(g: Game, rerender: () => void): { el: HTMLElement; update: () => void } {
  const seeds = h("b", { class: "seeds" });
  const pity = h("span", { class: "hint" });
  const one = h("button", { class: "btn", onclick: () => doPull(g, 1, rerender) });
  const ten = h("button", { class: "btn", onclick: () => doPull(g, 10, rerender) });
  const pick = pickupFor(new Date());
  const el = h("div", { class: "card gacha" },
    h("div", { class: "g-top" },
      h("div", null, h("div", { class: "name" }, h("b", null, L("시드 뽑기", "Seed Gacha")), " ", h("span", { class: "hint" }, "seed=42")), seeds),
      h("div", { class: `g-pick rar${pick.rarity}` }, itemImg(g, pick), h("small", null, L("이번 주 픽업", "This week's pickup")), h("span", null, pick.name))),
    h("div", { class: "g-btns" }, one, ten),
    h("div", { class: "g-foot" }, pity,
      h("button", { class: "linkish", onclick: () => showRates(g) }, L("확률 보기", "Odds")),
      h("button", { class: "linkish", onclick: () => showExchange(g, rerender) }, L("조각 교환소", "Shard shop"))));
  const update = () => {
    const s = g.state.gacha;
    setText(seeds, L(`시드 ${s.seeds} · 조각 ${s.shards}`, `Seeds ${s.seeds} · Shards ${s.shards}`));
    setText(one, L(`1회 (시드 ${PULL_COST})`, `×1 (${PULL_COST} seeds)`));
    setText(ten, L(`10연차 (시드 ${PULL_COST * 10}) · 영웅+ 1 확정`, `×10 (${PULL_COST * 10}) · 1 Epic+ guaranteed`));
    one.toggleAttribute("disabled", s.seeds < PULL_COST);
    ten.toggleAttribute("disabled", s.seeds < PULL_COST * 10);
    setText(pity, L(`전설 확정까지 ${PITY - s.pity}회 · 모음 ${s.owned.length}/${POOL.length}`, `Legendary in ≤${PITY - s.pity} · ${s.owned.length}/${POOL.length} collected`));
  };
  update();
  return { el, update };
}

function doPull(g: Game, n: 1 | 10, rerender: () => void): void {
  const res = g.pullSeeds(n);
  if (!res.length) {
    sfx("error");
    toast(L("시드가 모자라요", "Not enough seeds"), L("임무·보스·사이드 벤치마크·VIP 질문·출석으로 모아요", "Earn them from quests, bosses, side benchmarks, VIP questions and check-ins"));
    return;
  }
  sfx("buy");
  reveal(g, res);
  rerender();
}

/** 캡슐 열기: 하나씩 흔들리다 열리고, 제일 좋은 것이 마지막에 크게 */
function reveal(g: Game, res: PullResult[]): void {
  const best = Math.max(...res.map((r) => r.item.rarity));
  const order = res.map((_, i) => i).sort((a, b) => (res[a].item.rarity === best ? 1 : 0) - (res[b].item.rarity === best ? 1 : 0));
  const cells = res.map((r) => h("div", { class: `capsule rar${r.item.rarity}` },
    h("div", { class: "cap-shell" }),
    h("div", { class: "cap-in" }, itemImg(g, r.item), h("span", { class: "lt-name" }, r.item.name),
      h("span", { class: "lt-rar" }, rarityName(r.item.rarity)),
      r.dup ? h("span", { class: "dup" }, L(`중복 → 조각 +${r.shards}`, `Dupe → +${r.shards} shards`)) : h("span", { class: "new" }, r.pickup ? "PICK UP!" : "NEW!"))));
  const grid = h("div", { class: `cap-grid ${res.length === 1 ? "one" : ""}` }, ...cells);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  showModal({
    title: res.length === 1 ? L("시드 뽑기", "Seed Gacha") : L("시드 10연차", "Seed ×10"),
    sub: L("캡슐을 여는 중…", "Opening capsules…"),
    body: [grid],
    buttons: [{ label: L("확인", "OK") }],
    dismissable: true,
  });
  order.forEach((idx, k) => {
    setTimeout(() => {
      const cell = cells[idx];
      cell.classList.add("open");
      const r = res[idx].item.rarity;
      sfx(r >= 2 ? "win" : "tap");
      if (k === order.length - 1) {
        const sub = document.querySelector(".modal .m-sub");
        if (sub) sub.textContent = best === 3 ? L("✦ 전설 등장! ✦", "✦ LEGENDARY! ✦") : best === 2 ? L("영웅 등급!", "Epic!") : L("도감 › 꾸미기에서 입어 보세요", "Try them on in Codex › Style");
        if (best === 3 && !reduce) {
          const flash = h("div", { class: "legend-flash" });
          document.body.append(flash);
          setTimeout(() => flash.remove(), 1200);
        }
      }
    }, reduce ? 0 : 350 + k * (res.length === 1 ? 0 : 180) + (res[idx].item.rarity === best && best >= 2 ? 500 : 0));
  });
}

/** 확률표: 등급별, 아이템별로 모두 공개 */
function showRates(g: Game): void {
  const pick = pickupFor(new Date());
  const rows = [3, 2, 1, 0].flatMap((r) => {
    const items = POOL.filter((x) => x.rarity === r);
    const each = (x: LookItem) => {
      const base = RATES[r];
      const p = pick.rarity === r ? (x.id === pick.id ? base * PICKUP_SHARE : (base * (1 - PICKUP_SHARE)) / (items.length - 1)) : base / items.length;
      return `${(p * 100).toFixed(p * 100 < 1 ? 2 : 1)}%`;
    };
    return [
      h("div", { class: `rate-head rar${r}` }, h("b", null, rarityName(r)), h("span", null, `${(RATES[r] * 100).toFixed(0)}%`)),
      ...items.map((x) => h("div", { class: "rate-row" }, h("span", null, `${x.name}${x.id === pick.id ? L(" (픽업)", " (pickup)") : ""}`), h("small", null, slotName(x)), h("b", null, each(x)))),
    ];
  });
  showModal({
    title: L("확률 공개", "Odds"),
    body: [
      h("p", { class: "hint" }, L(`시드는 플레이로만 얻어요 (현금 결제 없음). ${PITY}번째 안에 전설 확정, 10연차는 영웅 이상 1개 확정, 겹치면 조각으로 돌려받아요. 천장까지 넣은 실제 전설 확률은 약 ${(effectiveLegendary() * 100).toFixed(1)}%예요.`,
        `Seeds come only from play (no real money). A Legendary within ${PITY} pulls, 1 Epic+ in every ×10, and duplicates turn into shards. Counting the guarantee, the real Legendary rate is about ${(effectiveLegendary() * 100).toFixed(1)}%.`)),
      h("div", { class: "rates", tabindex: "0", role: "region", "aria-label": L("등급·아이템별 확률", "Odds by tier and item") }, ...rows),
    ],
    buttons: [{ label: L("닫기", "Close") }],
    dismissable: true,
  });
  void g;
}

/** 조각 교환소: 아직 없는 뽑기 아이템을 조각으로 바로 */
function showExchange(g: Game, rerender: () => void): void {
  const s = g.state.gacha;
  const left = POOL.filter((x) => !s.owned.includes(x.id)).sort((a, b) => b.rarity - a.rarity);
  showModal({
    title: L("조각 교환소", "Shard shop"),
    sub: L(`가진 조각 ${s.shards}`, `You have ${s.shards} shards`),
    body: left.length ? [h("div", { class: "look-grid" }, ...left.map((x) => h("button", {
      class: `look-tile rar${x.rarity}`, disabled: s.shards < SHARD_PRICE[x.rarity] ? "" : undefined,
      onclick: () => {
        if (!exchange(g.state.gacha, x.id)) return;
        sfx("research");
        toast(L(`${x.name} 획득!`, `Got ${x.name}!`), L("도감 › 꾸미기에서 입어 보세요", "Try it on in Codex › Style"), `ach rar${x.rarity}`);
        document.querySelector<HTMLButtonElement>(".modal .m-btns .btn")?.click();
        rerender();
      },
    }, itemImg(g, x), h("span", { class: "lt-name" }, x.name), h("span", { class: "lt-rar" }, `${rarityName(x.rarity)} · ${SHARD_PRICE[x.rarity]}`))))]
      : [h("p", null, L("뽑기 아이템을 전부 모았어요!", "You've collected every gacha item!"))],
    buttons: [{ label: L("닫기", "Close"), kind: "ghost" }],
    dismissable: true,
  });
}
