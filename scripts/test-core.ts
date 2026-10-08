// 핵심 로직 테스트 (npm test). 외부 테스트 프레임워크 없이 node:assert만 쓴다.
import assert from "node:assert/strict";
import { ERAS, EVENTS } from "../src/data";
import { Game, newState } from "../src/core/game";
import { BUILDING_MAP, COMBO_MAX, OFFLINE_CAP_SEC, buildingCost, checkpointsFor, comboMult, computeStats, milestoneMult } from "../src/core/formulas";
import { arenaTable } from "../src/core/arena";
import { questProgress } from "../src/core/quests";
import { QUIZ } from "../src/data";
import { fmt, fmtTokens } from "../src/core/format";
import { exportSave, importSave, migrate } from "../src/core/save";

let passed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`✗ ${name}`);
    throw e;
  }
}

test("새 게임은 시작 키트로 돈을 번다", () => {
  const g = new Game(newState());
  assert.ok(g.stats.net > 0);
  g.tick(10);
  assert.ok(g.state.credits > 0);
});

test("탭은 크레딧을 준다", () => {
  const g = new Game(newState());
  const v = g.tap();
  assert.ok(v > 0);
  assert.equal(g.state.credits, v);
});

test("건물 구매: 비용 차감, 가격 상승, 잠긴 시대는 못 산다", () => {
  const g = new Game(newState());
  g.state.credits = 1e6;
  const before = buildingCost(g.state, BUILDING_MAP.c_diff);
  assert.equal(g.buyBuilding("c_diff"), 1);
  assert.ok(buildingCost(g.state, BUILDING_MAP.c_diff) > before);
  assert.equal(g.buyBuilding("c_eniac"), 0, "시대 1 건물은 시대 0에서 못 산다");
  assert.ok(g.buyBuilding("p_dorm", "max") > 1);
});

test("연구는 RP로 사고 효과가 반영된다", () => {
  const g = new Game(newState());
  const intel = g.stats.intel;
  assert.equal(g.buyUpgrade("u_algorithm"), false, "RP가 없으면 실패");
  g.state.rp = 100;
  assert.equal(g.buyUpgrade("u_algorithm"), true);
  assert.equal(g.stats.intel, intel * 2);
  assert.equal(g.buyUpgrade("u_algorithm"), false, "중복 구매 불가");
});

test("선행 연구가 없으면 커넥터를 못 산다", () => {
  const s = newState();
  s.era = 8;
  s.credits = 1e30;
  const g = new Game(s);
  assert.equal(g.buyUpgrade("k_github"), false);
  g.state.rp = 1e30;
  assert.ok(g.buyUpgrade("u_mcp"));
  assert.ok(g.buyUpgrade("k_github"));
});

test("보스: 조건 미달이면 시작 불가, 이기면 다음 시대", () => {
  const g = new Game(newState());
  assert.equal(g.startBoss(), false);
  g.state.buildings.x_params = 10; // 지능 1.2^10 ≈ 6.2
  g.state.buildings.c_diff = 500;
  g.state.buildings.p_dorm = 500;
  g.refresh();
  const notices: string[] = [];
  g.onNotice((n) => notices.push(n.kind));
  assert.ok(g.startBoss());
  for (let i = 0; i < 40 && g.state.era === 0; i++) g.tick(1);
  assert.equal(g.state.era, 1);
  assert.ok(notices.includes("bossWin") && notices.includes("era"));
});

test("보스: 시간 안에 못 깨면 실패", () => {
  const g = new Game(newState());
  g.state.buildings.x_params = 10;
  g.refresh();
  assert.ok(g.startBoss());
  for (let i = 0; i < ERAS[0].boss.time + 2; i++) g.tick(1);
  assert.equal(g.state.boss, null);
  assert.equal(g.state.era, 0);
});

test("AI 겨울은 시대 3 진입 때 발동한다", () => {
  const s = newState();
  s.era = 2;
  s.bossesBeaten = [0, 1];
  s.buildings = { ...s.buildings, x_params: 40, c_mainframe: 300, p_institute: 300 };
  s.upgrades = ["u_semantic"];
  const g = new Game(s);
  ERAS[2].boss.hp = 1;
  assert.ok(g.startBoss());
  g.tick(1);
  assert.equal(g.state.era, 3);
  assert.ok(g.state.active.some((a) => a.id === "winter1"));
});

test("새 모델 출시: 인프라·연구는 유지, 파라미터·연구팀·크레딧은 초기화", () => {
  const s = newState();
  s.totalEarned = 1e12;
  s.credits = 5e9;
  s.buildings = { c_diff: 50, p_dorm: 40, d_neighbors: 30, x_params: 20, r_student: 10 };
  s.upgrades = ["u_algorithm"];
  const g = new Game(s);
  const gain = g.releaseGain();
  assert.equal(gain, checkpointsFor(1e12));
  assert.ok(g.release());
  assert.equal(g.state.checkpoints, gain);
  assert.equal(g.state.credits, 0);
  assert.equal(g.state.buildings.c_diff, 50);
  assert.equal(g.state.buildings.d_neighbors, 30);
  assert.equal(g.state.buildings.x_params, 0);
  assert.equal(g.state.buildings.r_student, 0);
  assert.deepEqual(g.state.upgrades, ["u_algorithm"]);
  assert.equal(g.release(), false, "받을 체크포인트가 없으면 출시 불가");
});

test("생각 모드: 할루시네이션은 줄고 토큰은 늘어난다", () => {
  const s = newState();
  s.upgrades = ["u_reasoning"];
  const g = new Game(s);
  const off = g.stats;
  g.toggleThinking();
  assert.ok(g.stats.hall < off.hall);
  assert.ok(g.stats.tokensPerQ > off.tokensPerQ);
});

test("전력이 모자라면 처리량이 깎인다", () => {
  const s = newState();
  s.buildings.c_diff = 100;
  s.buildings.d_neighbors = 1000;
  const st = computeStats(s);
  assert.ok(st.powerEff < 0.1);
  assert.equal(st.bottleneck, "power");
});

test("선택 이벤트는 고른 효과를 적용한다", () => {
  const g = new Game(newState(), () => 0);
  g.state.era = 6;
  const ev = EVENTS.find((e) => e.id === "gpt2_release")!;
  g.state.pendingChoice = ev.id;
  g.choose(1);
  assert.equal(g.state.pendingChoice, null);
  assert.ok(g.state.active.some((a) => a.id === ev.id && a.effects.some((e) => e.stat === "hall")));
});

test("오프라인 보상은 최대 시간으로 제한된다", () => {
  const s = newState();
  s.lastSaved = Date.now() - 1000 * 3600 * 24 * 7;
  const g = new Game(s);
  const [secs, credits] = g.applyOffline();
  assert.equal(secs, OFFLINE_CAP_SEC);
  assert.ok(credits > 0);
});

test("세이브 내보내기/불러오기 왕복, 깨진 입력은 거부", () => {
  const s = newState("한글 이름 🤖");
  s.credits = 123;
  const back = importSave(exportSave(s))!;
  assert.equal(back.aiName, "한글 이름 🤖");
  assert.equal(back.credits, 123);
  assert.equal(importSave("not base64!!"), null);
  assert.equal(migrate({ hello: 1 }), null);
  const partial = migrate({ era: 2, credits: 5 })!;
  assert.equal(partial.stats.taps, 0, "빠진 필드는 기본값");
});

test("숫자 표기", () => {
  assert.equal(fmt(1234, "short"), "1.23K");
  assert.equal(fmt(12345678, "korean"), "1234만");
  assert.equal(fmt(1.5e6, "sci"), "1.50e6");
  assert.equal(fmtTokens(200000), "200K");
  assert.equal(fmtTokens(32768), "32K");
  assert.equal(fmtTokens(1e6), "1M");
});


test("마일스톤: 25개부터 생산량 ×2", () => {
  assert.equal(milestoneMult(24), 1);
  assert.equal(milestoneMult(25), 2);
  assert.equal(milestoneMult(100), 8);
  const s = newState();
  s.buildings = { c_diff: 24, p_dorm: 100, d_neighbors: 100 };
  const before = computeStats(s).tps;
  s.buildings.c_diff = 25;
  assert.ok(computeStats(s).tps > before * 2, "24개 → 25개는 두 배 이상");
});

test("콤보: 연속 탭이면 보상이 오르고, 쉬면 끊긴다", () => {
  const g = new Game(newState());
  const first = g.tap();
  for (let i = 0; i < 60; i++) g.tap();
  assert.equal(g.state.combo, 61);
  assert.equal(g.state.stats.maxCombo, 61);
  assert.ok(g.tap() > first * 1.9, "최대 콤보는 약 ×2");
  assert.equal(comboMult(1000), comboMult(COMBO_MAX));
  g.tick(2);
  g.tap();
  assert.equal(g.state.combo, 1);
});

test("VIP 질문: 나타났다가 시간이 지나면 사라지고, 잡으면 보상", () => {
  const g = new Game(newState(), () => 0);
  g.state.nextGoldenIn = 0.5;
  const notices: string[] = [];
  g.onNotice((n) => notices.push(n.kind));
  g.tick(1);
  assert.ok(g.state.golden, "등장");
  assert.ok(notices.includes("golden"));
  const before = g.state.credits;
  const def = g.claimGolden()!;
  assert.equal(def.kind, "investor");
  assert.ok(g.state.credits > before);
  assert.equal(g.state.stats.goldens, 1);
  assert.equal(g.claimGolden(), null, "두 번은 못 잡는다");
  g.state.nextGoldenIn = 0.1;
  g.tick(1);
  for (let i = 0; i < 15; i++) g.tick(1);
  assert.equal(g.state.golden, null, "12초 뒤 사라진다");
});

test("임무: 항상 3개, 달성하면 보상 후 새 임무", () => {
  const g = new Game(newState());
  assert.equal(g.state.quests.length, 3);
  const q = g.state.quests[0];
  // 강제로 달성
  q.kind = "taps";
  q.base = 0;
  q.target = 5;
  for (let i = 0; i < 5; i++) g.tap();
  assert.equal(questProgress(g.state, q), 1);
  const before = g.state.credits;
  g.checkQuests();
  assert.equal(g.state.stats.questsDone, 1);
  assert.ok(g.state.credits > before);
  assert.equal(g.state.quests.length, 3);
  assert.ok(!g.state.quests.includes(q));
  const id = g.state.quests[0].id;
  g.rerollQuest(id);
  assert.ok(!g.state.quests.some((x) => x.id === id));
  assert.equal(g.state.quests.length, 3);
});

test("퀴즈: 맞히면 보상과 기록, 틀리면 다시 나올 수 있다", () => {
  const g = new Game(newState());
  const q = QUIZ.find((x) => x.era === 0)!;
  g.state.pendingQuiz = q.id;
  const wrong = g.answerQuiz((q.answer + 1) % q.options.length)!;
  assert.equal(wrong.correct, false);
  assert.ok(!g.state.quizSolved.includes(q.id));
  g.state.pendingQuiz = q.id;
  const right = g.answerQuiz(q.answer)!;
  assert.ok(right.correct && right.credits > 0);
  assert.ok(g.state.quizSolved.includes(q.id));
  assert.ok(!g.eligibleQuiz().some((x) => x.id === q.id));
});

test("퀴즈가 떠 있는 동안 이벤트 타이머는 멈춘다", () => {
  const g = new Game(newState());
  g.state.pendingQuiz = QUIZ[0].id;
  g.state.nextEventIn = 5;
  g.tick(10);
  assert.equal(g.state.nextEventIn, 5);
});

test("자동 답변: 상품을 사면 초당 자동으로 번다", () => {
  const s = newState();
  s.era = 2;
  s.upgrades = ["a_autoreply"];
  const g = new Game(s);
  assert.equal(g.stats.autoTap, 0.5);
  const answered = g.state.stats.answered;
  g.tick(4);
  assert.ok(g.state.stats.answered - answered >= 2);
});

test("아레나: 플레이어가 표에 포함되고 Elo 순으로 정렬", () => {
  const g = new Game(newState("테스트"));
  const rows = arenaTable(g.state, g.stats);
  assert.ok(rows.some((r) => r.me && r.name.startsWith("테스트")));
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].elo >= rows[i].elo);
});

console.log(`핵심 로직 테스트 ${passed}개 통과`);
