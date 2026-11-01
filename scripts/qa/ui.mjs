// 화면 점검: 기기 4종 × 한·영 × 글자 크기 ×1·×1.3 × 모든 탭(도감 하위 탭 포함).
// 잘린 글자, 화면 밖으로 나간 글자, 24px보다 작은 버튼(WCAG 2.5.8), 겹친 버튼, JS·콘솔 오류, axe 접근성 위반을 찾는다.
//   npm run qa:ui            (문제가 있으면 목록을 보여 주고 실패로 끝난다)
import { start, openGame, AXE } from "./common.mjs";

const { url, browser: b, close } = await start();
const devices = [["phone-s", 360, 740], ["phone", 390, 844], ["tablet", 768, 1024], ["desktop", 1280, 800]];
const issues = new Map();
const add = (k, where) => { if (!issues.has(k)) issues.set(k, new Set()); issues.get(k).add(where); };
const era = Number(process.env.ERA ?? 5);
for (const [dev, w, h] of devices) for (const lang of ["ko", "en"]) for (const ts of [1, 1.3]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", (e) => add(`JS 오류: ${e.message.slice(0, 90)}`, `${dev}/${lang}`));
  p.on("console", (m) => { if (m.type() === "error" && !/vibrate/.test(m.text())) add(`콘솔 오류: ${m.text().slice(0, 90)}`, `${dev}/${lang}`); });
  await openGame(p, url, era, { lang, textSize: ts });
  await p.addScriptTag({ content: AXE });
  const views = [["1"], ["2"], ["3"], ["4"]];
  const codexTabs = await (async () => { await p.keyboard.press("5"); await p.waitForTimeout(200); return p.$$eval("#panel .seg button", (bs) => bs.length); })();
  for (let i = 0; i < codexTabs; i++) views.push(["5", i]);
  for (const [key, sub] of views) {
    await p.keyboard.press(key); await p.waitForTimeout(220);
    if (sub !== undefined) { const bs = await p.$$("#panel .seg button"); await bs[sub].click(); await p.waitForTimeout(220); }
    const where = `${dev}/${lang}/×${ts}/탭${key}${sub !== undefined ? "-" + sub : ""}`;
    const found = await p.evaluate(() => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw + 1) out.push(`가로 넘침 ${document.documentElement.scrollWidth - vw}px`);
      const label = (e) => (e.id ? "#" + e.id : "") + "." + [...e.classList].slice(0, 2).join(".") + " «" + (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 18) + "»";
      for (const e of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(e);
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const hasText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        // 잘린 글자: 넘치는데 말줄임(…)도 스크롤도 없음
        if (hasText && (e.scrollWidth > e.clientWidth + 1) && cs.overflowX === "hidden" && cs.textOverflow !== "ellipsis") out.push(`글자 잘림 ${label(e)}`);
        if (hasText && r.right > vw + 1 && !e.closest("[class*=ticker]")) out.push(`화면 밖 ${label(e)}`);
        // 누르는 것: WCAG 2.5.8 최소 24×24
        if (e.matches("button, a[href], input, select, [role=button]") && (r.width < 24 || r.height < 24)) out.push(`작은 버튼 ${Math.round(r.width)}×${Math.round(r.height)} ${label(e)}`);
      }
      // 겹친 버튼
      // 다른 것(아래 탭 등)에 가려진 것은 빼고: 가운데 점을 눌렀을 때 실제로 그것이 눌리는 것만
      const bs = [...document.querySelectorAll("button, a[href], select, input")].filter((e) => { const r = e.getBoundingClientRect(); if (!r.width || !r.height || getComputedStyle(e).visibility === "hidden") return false; const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!t && (e === t || e.contains(t)); });
      for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
        if (bs[i].contains(bs[j]) || bs[j].contains(bs[i])) continue;
        // 아래 탭에 반쯤 가려진 목록(스크롤하면 보임)은 겹침이 아니다
        if (!!bs[i].closest("#nav") !== !!bs[j].closest("#nav")) continue;
        const a = bs[i].getBoundingClientRect(), c = bs[j].getBoundingClientRect();
        const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
        if (ox > 4 && oy > 4) out.push(`버튼 겹침 ${label(bs[i])} ↔ ${label(bs[j])}`);
      }
      return out;
    });
    for (const f of found) add(f, where);
    const ax = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag22aa"] } })).violations.map((v) => `접근성 ${v.id}: ${v.nodes.slice(0, 1).map((n) => n.target.join(" ")).join("")}`));
    for (const f of ax) add(f, where);
  }
  await p.close();
}
await close();
const rows = [...issues].map(([k, s]) => ({ issue: k, count: s.size, ex: [...s].slice(0, 3).join(", ") })).sort((a, b) => b.count - a.count);
console.log(`화면 ${devices.length * 4}가지 조합 × 탭 점검 · 문제 종류 ${rows.length}`);
for (const r of rows.slice(0, 40)) console.log(`${String(r.count).padStart(3)}  ${r.issue}   [${r.ex}]`);
process.exit(rows.length ? 1 : 0);
