// 언어 전환. UI 문구는 L("한국어", "English"), 콘텐츠 데이터는 applyLanguage()가 id별 번역표로 덮어쓴다.
import { BUILDINGS, CODEX, ERAS, EVENTS, GOLDENS, MISSIONS, NEWS, QUIZ, RIVALS, SIDE_BENCHES, THREATS, TIERS, UPGRADES, WEEKLIES, LOOKS, BOARDS } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import type { NewsItem } from "../core/types";
import { BUILDINGS_EN } from "./en/buildings";
import { CODEX_EN } from "./en/codex";
import { ERAS_EN, TIERS_EN } from "./en/eras";
import { EVENTS_EN } from "./en/events";
import { BENCHES_EN, EXTRA_ACHIEVEMENTS_EN, EXTRA_UPGRADES_EN, MISSIONS_EN, THREATS_EN, WEEKLIES_EN, LOOKS_EN, BOARDS_EN } from "./en/extra";
import { ACHIEVEMENTS_EN, GOLDENS_EN, RIVALS_EN } from "./en/misc";
import { NEWS_EN } from "./en/news";
import { QUIZ_EN } from "./en/quiz";
import { UPGRADES_EN, YEARS_EN } from "./en/upgrades";
import { setLangValue, type Lang } from "./lang";

export { L, getLang, type Lang } from "./lang";

/** 브라우저 언어로 기본값 추측 */
export function detectLang(): Lang {
  try {
    return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
  } catch {
    return "ko";
  }
}

// ── 한국어 원문 스냅숏 (언어를 다시 ko로 돌릴 때 복원) ──────────────
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const KO = {
  eras: ERAS.map((e) => ({ name: e.name, years: e.years, intro: e.intro, aiLines: [...e.aiLines], boss: { name: e.boss.name, desc: e.boss.desc, winText: e.boss.winText, year: e.boss.year } })),
  tiers: TIERS.map((t) => ({ name: t.name, examples: [...t.examples] })),
  buildings: BUILDINGS.map((b) => ({ name: b.name, desc: b.desc })),
  upgrades: UPGRADES.map((u) => ({ name: u.name, desc: u.desc, year: u.year })),
  events: EVENTS.map((e) => ({ name: e.name, desc: e.desc, year: e.year, choices: clone(e.choices?.map((c) => ({ label: c.label, desc: c.desc })) ?? []) })),
  codex: CODEX.map((c) => ({ title: c.title, text: c.text, year: c.year })),
  quiz: QUIZ.map((q) => ({ q: q.q, options: [...q.options], explain: q.explain })),
  news: NEWS.map((n) => ({ ...n })),
  goldens: GOLDENS.map((g) => ({ name: g.name, asks: [...g.asks], result: g.result })),
  achievements: ACHIEVEMENTS.map((a) => ({ name: a.name, desc: a.desc })),
  rivals: RIVALS.map((r) => ({ lab: r.lab, quote: r.quote })),
  benches: SIDE_BENCHES.map((b) => ({ name: b.name, desc: b.desc, winText: b.winText, year: b.year })),
  missions: MISSIONS.map((m) => ({ name: m.name, desc: m.desc })),
  threats: [...THREATS],
  weeklies: WEEKLIES.map((w) => ({ name: w.name, desc: w.desc })),
  looks: LOOKS.map((x) => x.name),
  boards: BOARDS.map((x) => x.name),
};
const UPG_EN = { ...UPGRADES_EN, ...EXTRA_UPGRADES_EN };
const ACH_EN = { ...ACHIEVEMENTS_EN, ...EXTRA_ACHIEVEMENTS_EN };

const year = (y: string) => YEARS_EN[y] ?? y;

/** 번역이 빠진 항목 (검수용) */
export const missing: string[] = [];

function pick<T>(table: Record<string | number, T>, id: string | number, where: string): T | undefined {
  const v = table[id];
  if (!v) missing.push(`${where}:${id}`);
  return v;
}

export function applyLanguage(next: Lang): void {
  setLangValue(next);
  missing.length = 0;
  const en = next === "en";

  ERAS.forEach((e, i) => {
    const ko = KO.eras[i];
    const t = en ? pick(ERAS_EN, e.id, "era") : undefined;
    e.name = t?.name ?? ko.name;
    e.years = t?.years ?? ko.years;
    e.intro = t?.intro ?? ko.intro;
    e.aiLines = t?.aiLines ?? ko.aiLines;
    e.boss.name = t?.boss.name ?? ko.boss.name;
    e.boss.desc = t?.boss.desc ?? ko.boss.desc;
    e.boss.winText = t?.boss.winText ?? ko.boss.winText;
    e.boss.year = en ? year(ko.boss.year) : ko.boss.year;
  });
  TIERS.forEach((x, i) => {
    const t = en ? pick(TIERS_EN, x.id, "tier") : undefined;
    x.name = t?.name ?? KO.tiers[i].name;
    x.examples = t?.examples ?? KO.tiers[i].examples;
  });
  BUILDINGS.forEach((x, i) => {
    const t = en ? pick(BUILDINGS_EN, x.id, "building") : undefined;
    x.name = t?.name ?? KO.buildings[i].name;
    x.desc = t?.desc ?? KO.buildings[i].desc;
  });
  UPGRADES.forEach((x, i) => {
    const t = en ? pick(UPG_EN, x.id, "upgrade") : undefined;
    x.name = t?.name ?? KO.upgrades[i].name;
    x.desc = t?.desc ?? KO.upgrades[i].desc;
    x.year = en ? year(KO.upgrades[i].year) : KO.upgrades[i].year;
  });
  EVENTS.forEach((x, i) => {
    const ko = KO.events[i];
    const t = en ? pick(EVENTS_EN, x.id, "event") : undefined;
    x.name = t?.name ?? ko.name;
    x.desc = t?.desc ?? ko.desc;
    x.year = en ? year(ko.year) : ko.year;
    x.choices?.forEach((c, j) => {
      const tc = t?.choices?.[j];
      if (en && x.choices && !tc) missing.push(`event-choice:${x.id}:${j}`);
      c.label = tc?.label ?? ko.choices[j].label;
      c.desc = tc?.desc ?? ko.choices[j].desc;
    });
  });
  CODEX.forEach((x, i) => {
    const t = en ? pick(CODEX_EN, x.id, "codex") : undefined;
    x.title = t?.title ?? KO.codex[i].title;
    x.text = t?.text ?? KO.codex[i].text;
    x.year = en ? year(KO.codex[i].year) : KO.codex[i].year;
  });
  QUIZ.forEach((x, i) => {
    const t = en ? pick(QUIZ_EN, x.id, "quiz") : undefined;
    if (t && t.options.length !== x.options.length) missing.push(`quiz-options:${x.id}`);
    x.q = t?.q ?? KO.quiz[i].q;
    x.options = t?.options ?? KO.quiz[i].options;
    x.explain = t?.explain ?? KO.quiz[i].explain;
  });
  replaceAll(NEWS, en ? NEWS_EN : KO.news);
  GOLDENS.forEach((x, i) => {
    const t = en ? pick(GOLDENS_EN, x.kind, "golden") : undefined;
    x.name = t?.name ?? KO.goldens[i].name;
    x.asks = t?.asks ?? KO.goldens[i].asks;
    x.result = t?.result ?? KO.goldens[i].result;
  });
  ACHIEVEMENTS.forEach((x, i) => {
    const t = en ? pick(ACH_EN, x.id, "achievement") : undefined;
    x.name = t?.name ?? KO.achievements[i].name;
    x.desc = t?.desc ?? KO.achievements[i].desc;
  });
  RIVALS.forEach((x, i) => {
    const t = en ? pick(RIVALS_EN, x.id, "rival") : undefined;
    x.lab = t?.lab ?? KO.rivals[i].lab;
    x.quote = t?.quote ?? KO.rivals[i].quote;
  });
  SIDE_BENCHES.forEach((x, i) => {
    const ko = KO.benches[i];
    const t = en ? pick(BENCHES_EN, x.id, "bench") : undefined;
    x.name = t?.name ?? ko.name;
    x.desc = t?.desc ?? ko.desc;
    x.winText = t?.winText ?? ko.winText;
    x.year = en ? year(ko.year) : ko.year;
  });
  MISSIONS.forEach((x, i) => {
    const t = en ? pick(MISSIONS_EN, x.id, "mission") : undefined;
    x.name = t?.name ?? KO.missions[i].name;
    x.desc = t?.desc ?? KO.missions[i].desc;
  });
  BOARDS.forEach((x, i) => {
    x.name = (en ? pick(BOARDS_EN, x.key, "board")?.name : undefined) ?? KO.boards[i];
  });
  LOOKS.forEach((x, i) => {
    x.name = (en ? pick(LOOKS_EN, x.id, "look")?.name : undefined) ?? KO.looks[i];
  });
  WEEKLIES.forEach((x, i) => {
    const t = en ? pick(WEEKLIES_EN, x.id, "weekly") : undefined;
    x.name = t?.name ?? KO.weeklies[i].name;
    x.desc = t?.desc ?? KO.weeklies[i].desc;
  });
  if (en && THREATS_EN.length !== KO.threats.length) missing.push("threats:length");
  THREATS.splice(0, THREATS.length, ...(en ? THREATS_EN : KO.threats));
}

function replaceAll(target: NewsItem[], items: NewsItem[]): void {
  target.splice(0, target.length, ...items.map((n) => ({ ...n })));
}
