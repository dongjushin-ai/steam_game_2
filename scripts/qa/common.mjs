// 브라우저 품질 점검 공통: 개발 서버를 직접 띄우고, 저장해 둔 진행 상태(fixtures)로 게임을 연다.
import { readFileSync } from "fs";
import { createServer } from "vite";
import { chromium } from "playwright";

const root = new URL("../..", import.meta.url).pathname;

/** 개발 서버 + 브라우저 (끝나면 close()) */
export async function start() {
  const server = await createServer({ root, logLevel: "silent", server: { port: 0 } });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  const browser = await chromium.launch();
  return { url, browser, close: async () => { await browser.close(); await server.close(); } };
}

/** 시대 era의 진행 상태로 게임을 연다 (안내·창은 건너뜀) */
export async function openGame(page, url, era, settings = {}) {
  const st = JSON.parse(readFileSync(new URL(`fixtures/era-${era}.json`, import.meta.url), "utf8"));
  Object.assign(st, { lastSaved: Date.now(), nextEventIn: 9999, golden: null, threat: null, daily: { last: "2999-01-01", streak: 1 }, missions: [] });
  Object.assign(st.settings, { tutorialDone: true }, settings);
  await page.addInitScript((t) => { if (!sessionStorage.qa) { localStorage.setItem("ai-kiugi-save", t); sessionStorage.qa = 1; } }, JSON.stringify(st));
  await page.goto(url);
  await page.waitForSelector("canvas.px-scene");
  await page.waitForTimeout(600);
  while (await page.$(".modal .btn")) { await page.click(".modal .btn"); await page.waitForTimeout(120); }
  await page.evaluate(() => document.querySelectorAll("#toasts > *").forEach((e) => e.remove()));
}

export const AXE = readFileSync(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
