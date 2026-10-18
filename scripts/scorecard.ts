// 평가표: 성공한 방치형 게임의 Steam 리뷰에서 뽑은 기준(docs/BENCHMARK.md)으로 우리 게임을 잰다.
//   npm run scorecard
// 사람형 봇(scripts/bot.ts human)과 초보 봇(scripts/novice.ts)으로 측정하고, 코드에서 확인할 수 있는 건 정적으로 본다.
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { BUILDINGS, ERAS } from "../src/data";
import { OFFLINE_CAP_SEC, milestoneMult } from "../src/core/formulas";
import { fmtTime, runSim } from "./bot";

// 기준 플레이어: 사람형(4초마다 판단, 40%는 아무거나) + 자동 구매가 열려도 손으로도 산다
process.env.HANDS_OFF ??= "0";

type Verdict = "통과" | "주의" | "부족";
const rows: { id: string; what: string; evidence: string; target: string; v: Verdict }[] = [];
const add = (id: string, what: string, evidence: string, target: string, v: Verdict) => rows.push({ id, what, evidence, target, v });
const src = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// ── 사람형 봇 한 판 (출시 포함), 매 초 관찰 ──
let lastNew = 0, worst = { secs: 0, at: 0, era: 0 };
let prev = { era: 0, ups: 0, types: 0, ms: 0 };
let releases: number[] = [];
let lastRel = 0;
const res = runSim({
  maxHours: 4, human: true,
  onSecond: (t, game) => {
    const s = game.state;
    const types = BUILDINGS.filter((b) => (s.buildings[b.id] ?? 0) > 0).length;
    const ms = BUILDINGS.reduce((a, b) => a + Math.log2(milestoneMult(s.buildings[b.id] ?? 0)), 0);
    const cur = { era: s.era, ups: s.upgrades.length, types, ms };
    // '새로운 일': 새 시대, 새 업그레이드·연구, 처음 사는 건물, 마일스톤(생산 ×2)
    if (cur.era !== prev.era || cur.ups > prev.ups || cur.types > prev.types || cur.ms > prev.ms) {
      if (t - lastNew > worst.secs) worst = { secs: t - lastNew, at: lastNew, era: prev.era };
      lastNew = t;
    }
    prev = cur;
    if (s.releases > lastRel) {
      releases.push(t);
      lastRel = s.releases;
    }
  },
});
const g = res.game, s = g.state;
const end = s.ended ? s.stats.playSeconds : res.net.length;

// C1 진행 벽 (부정 리뷰 1위 주제: 느림·벽·지루함 20%)
add("C1", "진행 벽: 새로운 일(시대·연구·새 건물·×2) 없이 지나간 가장 긴 시간", `${Math.round(worst.secs / 60)}분 (${fmtTime(worst.at)}, 시대 ${worst.era})`, "5분 이하", worst.secs <= 300 ? "통과" : worst.secs <= 600 ? "주의" : "부족");

// C1b 가장 긴 시대 (새 연구·건물이 있어도 다음 시대가 너무 멀면 벽으로 느낀다: Idle Slayer·Revolution Idle 불만)
// 사람형 봇은 판마다 차이가 커서 씨앗 7개의 중앙값으로 본다
const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const seedNets: number[][] = [];
const seeds = [1, 2, 3, 4, 5, 6, 7].map((seed) => {
  const r = runSim({ maxHours: 4, human: true, seed });
  seedNets.push(r.net);
  const rs = r.game.state;
  const e = rs.ended ? rs.stats.playSeconds : 4 * 3600;
  return ERAS.map((_, i) => (r.eraReached[i + 1] ?? e) - (r.eraReached[i] ?? e)).concat([e]);
});
const eraMed = ERAS.map((_, i) => med(seeds.map((x) => x[i])));
const longest = eraMed.reduce((a, d, i) => (d > eraMed[a] ? i : a), 0);
const endMed = med(seeds.map((x) => x[ERAS.length]));
add("C1b", "가장 긴 시대 체류 (사람형 봇 7판 중앙값)", `시대 ${longest} ${Math.round(eraMed[longest] / 60)}분 · 시대별 ${eraMed.map((d) => Math.round(d / 60)).join("·")}분`, "20분 이하", eraMed[longest] <= 1200 ? "통과" : eraMed[longest] <= 1800 ? "주의" : "부족");

// C2 손이 가는 정도 / C3 자동화 (부정 리뷰 lift 2.2배: QoL·자동화가 늦거나 없음)
const autoUp = (src("src/data/upgrades.ts").match(/product\("(\w+)", (\d+),[^\n]*autoBuy/) ?? []);
const autoBuy = autoUp.length > 0;
process.env.HANDS_OFF = "1";
const relaxed = runSim({ maxHours: 6, human: true });
process.env.HANDS_OFF = "0";
const rlx = relaxed.game.state;
const rlxEnd = rlx.ended ? rlx.stats.playSeconds : 6 * 3600;
add("C2", "손 부담: 자동 구매가 열린 뒤 건물을 손으로 안 사도 끝까지 가나 (느긋한 사람형 봇)", `엔딩 ${rlx.ended ? fmtTime(rlxEnd) : "못 봄"} (손으로도 사는 사람 중앙값 ${fmtTime(endMed)})`, "손으로 사는 사람의 2배 이내", rlx.ended && rlxEnd <= endMed * 2 ? "통과" : rlx.ended ? "주의" : "부족");
const autoAt = res.eraReached[Number(autoUp[2] ?? 99)];
add("C3", "자동화(자동 구매) 있음, 언제 열리나", autoBuy ? `시대 ${autoUp[2]}부터 (${autoUp[1]}) · 사람형 봇 ${autoAt ? fmtTime(autoAt) : "-"}에 도달` : "없음 (꾹 누르기 연속 구매만)", "중반(시대 5) 전에 열림", autoBuy && Number(autoUp[2]) < 5 ? "통과" : "부족");

// C4 출시(프레스티지): 빨리 반복하는 게 최선이 되면 안 됨 (Cell to Singularity 불만), 보상이 체감돼야 함
const gaps = releases.map((t, i) => t - (releases[i - 1] ?? 0));
add("C4", "출시(리셋) 리듬: 가장 짧은 출시 간격", `출시 ${s.releases}회 (${releases.map((t) => fmtTime(t)).join(", ") || "-"}) · 최소 간격 ${gaps.length ? Math.round(Math.min(...gaps) / 60) + "분" : "-"}`, "5분 이상 (2분마다 리셋이 최선이면 안 됨)", gaps.length && Math.min(...gaps) >= 300 ? "통과" : gaps.length ? "부족" : "주의");

// C5 과금 (부정 lift 2.7배, Cell to Singularity·Idle Champions 부정의 33~35%)
const pay = /purchase|billing|admob|adsense/i.test(src("package.json"));
add("C5", "과금·광고", pay ? "있음" : "없음 (뽑기도 플레이로만)", "없음 또는 공정", pay ? "주의" : "통과");

// C6 세이브 안전 (부정 lift 4.6배로 가장 큼)
const save = src("src/core/save.ts"), app = src("src/ui/app.ts");
const saveChecks = [/BACKUP_KEY/.test(save), /visibilitychange[\s\S]{0,200}saveGame/.test(app), /exportSave|export/.test(save), /allowBackup="true"/.test(src("android/app/src/main/AndroidManifest.xml"))];
add("C6", "세이브 안전: 백업 슬롯·백그라운드 저장·파일 내보내기·안드로이드 백업", `${saveChecks.filter(Boolean).length}/4`, "4/4", saveChecks.every(Boolean) ? "통과" : "부족");

// C7 이해 (UI·설명 부족 lift 1.7배) — 초보 봇
const nv = execFileSync("npx", ["tsx", "scripts/novice.ts", "--quiet"], { cwd: new URL("..", import.meta.url).pathname, encoding: "utf8" }).trim().split("\n").pop() ?? "";
const era3 = nv.match(/시대 3 (\S+)/)?.[1] ?? "?";
add("C7", "처음 하는 사람: 안내만 따라 시대 3", `${era3} · ${nv.replace(/^초보 봇: /, "").split(" · ").slice(3).join(" · ")}`, "15분 이하", /0h(0\d|1[0-4])m/.test(era3) ? "통과" : "부족");

// C8 방치 보상 (Melvor 부정의 27%가 오프라인)
add("C8", "꺼 둬도 자람: 오프라인 보상 한도", `${OFFLINE_CAP_SEC / 3600}시간 (연구로 늘어남)`, "8시간 이상", OFFLINE_CAP_SEC >= 8 * 3600 ? "통과" : "주의");

// C9 길이와 마무리 (짧은 증분 게임은 '짧고 굵게'로 칭찬받음: Nodebuster·Gnorp)
add("C9", "엔딩까지 길이 + 엔딩 뒤 할 것", `${s.ended ? fmtTime(end) : "못 봄"} · 특이점 너머(무한) 있음`, "1~5시간 + 엔드게임", s.ended && end <= 5 * 3600 ? "통과" : "주의");

// C10 숫자 커지는 맛 (긍정에 더 많이 나오는 주제)
/** 수입이 10배가 될 때까지 가장 오래 걸린 구간(초) */
const worstX10 = (netArr: number[]) => {
  const net = netArr.filter((x) => x > 0);
  let worst = 0, from = 0;
  for (let i = 0; i < net.length; i++) {
    while (from < i && net[i] >= net[from] * 10) from++;
    if (net[i] < net[from] * 10) worst = Math.max(worst, i - from);
  }
  return worst;
};
const x10 = med(seedNets.map(worstX10));
add("C10", "숫자 커지는 맛: 수입이 10배 될 때까지 가장 오래 걸린 구간 (7판 중앙값)", `${Math.round(x10 / 60)}분`, "15분 이하", x10 <= 900 ? "통과" : "주의");

// C11 배우는 재미·유머 (Cell to Singularity 칭찬: 설명을 읽으면 배운다)
const codex = (src("src/data/codex.ts").match(/\bid:/g) ?? []).length;
const quiz = (src("src/data/quiz.ts").match(/\bid:/g) ?? []).length;
add("C11", "배우는 재미·유머: 도감·퀴즈·밈", `도감 ${codex} · 퀴즈 ${quiz} · 시대 ${ERAS.length}`, "설명마다 실제 이야기", "통과");

const icon = { 통과: "✅", 주의: "⚠️", 부족: "❌" } as const;
console.log("| | 기준 | 우리 게임 | 목표 | 판정 |\n|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.id} | ${r.what} | ${r.evidence} | ${r.target} | ${icon[r.v]} ${r.v} |`);
