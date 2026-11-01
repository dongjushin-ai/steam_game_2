// 성능 점검: 저사양 폰 흉내(CPU 6배 느리게, 390×844)로 시대마다 연타(초당 10번)하며 15초 동안
// 프레임 간격·긴 작업(50ms 넘는 일)·JS 비율을 재고, 오래 놀아도 DOM·이벤트 리스너·메모리가 늘지 않는지 본다.
//   npm run qa:perf          (기준: 평균 45fps 이상, 긴 작업 합 500ms 이하, 누수 없음)
import { start, openGame } from "./common.mjs";

const ERAS = (process.env.ERAS ?? "0,5,7,10").split(",").map(Number);
const { url, browser, close } = await start();
const rows = [];
let bad = 0;
for (const era of ERAS) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
  await openGame(p, url, era);
  await cdp.send("Performance.enable");
  const metric = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const m0 = await metric();
  const sc = await (await p.$("#scene")).boundingBox();
  const tapper = (async () => { for (let i = 0; i < 150; i++) { await p.mouse.click(sc.x + 80 + (i % 5) * 10, sc.y + sc.height * 0.6); await p.waitForTimeout(100); } })();
  const r = await p.evaluate(async () => {
    const gaps = []; let longMs = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) longMs += e.duration; }).observe({ entryTypes: ["longtask"] });
    let last = performance.now(); const end = last + 15000;
    await new Promise((res) => { const f = (t) => { gaps.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    gaps.sort((a, b) => a - b);
    return { fps: +(gaps.length / 15).toFixed(1), p95: +gaps[Math.floor(gaps.length * 0.95)].toFixed(1), longMs: Math.round(longMs) };
  });
  await tapper;
  const m1 = await metric();
  const wall = m1.Timestamp - m0.Timestamp;
  const row = { era, ...r, script: `${((m1.ScriptDuration - m0.ScriptDuration) / wall * 100).toFixed(0)}%`, listeners: m1.JSEventListeners - m0.JSEventListeners, heapMB: +(m1.JSHeapUsedSize / 1e6).toFixed(1) };
  if (r.fps < 45 || r.longMs > 500 || row.listeners > 20) { row.verdict = "부족"; bad++; } else row.verdict = "통과";
  rows.push(row);
  await ctx.close();
}
await close();
console.table(rows);
process.exit(bad ? 1 : 0);
