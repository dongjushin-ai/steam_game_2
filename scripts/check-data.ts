// 콘텐츠 데이터 무결성 검사: npm test 에서 실행된다.
import { BUILDINGS, CODEX, ERAS, EVENTS, MISSIONS, SIDE_BENCHES, TIERS, UPGRADES, WEEKLIES } from "../src/data";
import { ACHIEVEMENTS } from "../src/core/achievements";

const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

function unique(name: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${name}: 중복 id ${id}`);
    seen.add(id);
  }
}

unique("buildings", BUILDINGS.map((b) => b.id));
unique("upgrades", UPGRADES.map((u) => u.id));
unique("events", EVENTS.map((e) => e.id));
unique("codex", CODEX.map((c) => c.id));
unique("achievements", ACHIEVEMENTS.map((a) => a.id));
unique("all ids", [...BUILDINGS.map((b) => b.id), ...UPGRADES.map((u) => u.id)]);

unique("side benches", SIDE_BENCHES.map((b) => b.id));
unique("missions", MISSIONS.map((m) => m.id));
unique("weeklies", WEEKLIES.map((w) => w.id));
for (const w of WEEKLIES) if (!w.effects.length) fail(`${w.id}: 효과 없음`);

const maxEra = ERAS.length - 1;
for (const b of SIDE_BENCHES) {
  if (b.era < 0 || b.era > maxEra) fail(`${b.id}: era 범위 밖`);
  if (!(b.hpFactor > 0 && b.hpFactor <= 1)) fail(`${b.id}: hpFactor 이상`);
  if (!b.effects.length) fail(`${b.id}: 보상 효과 없음`);
}
for (const m of MISSIONS) {
  if (m.era < 0 || m.era > maxEra) fail(`${m.id}: era 범위 밖`);
  if (!(m.duration > 0)) fail(`${m.id}: duration 이상`);
  if (!m.incomeSeconds && !m.rpSeconds && !m.effects) fail(`${m.id}: 보상 없음`);
  if (m.effects && !m.effectDuration) fail(`${m.id}: 효과 지속시간 없음`);
}
ERAS.forEach((e, i) => {
  if (e.id !== i) fail(`eras[${i}].id = ${e.id}`);
  if (!(e.boss.hp > 0) || !isFinite(e.boss.hp)) fail(`era ${i} 보스 체력이 이상함: ${e.boss.hp}`);
  if (e.winter && !EVENTS.some((ev) => ev.id === e.winter)) fail(`era ${i} winter 이벤트 없음: ${e.winter}`);
  if (i > 0 && e.boss.intelReq < ERAS[i - 1].boss.intelReq) fail(`era ${i} 보스 지능 요구치가 이전 시대보다 낮음`);
});

for (const b of BUILDINGS) {
  if (b.era < 0 || b.era > maxEra) fail(`${b.id}: era 범위 밖`);
  if (!(b.baseCost > 0) || !(b.growth > 1)) fail(`${b.id}: 비용 이상`);
  const stat = { compute: b.tps, power: b.power, demand: b.demand, rp: b.rp, param: b.intelPerLevel }[b.kind];
  if (!stat) fail(`${b.id}: ${b.kind} 수치 없음`);
}
for (const kind of ["compute", "power", "demand", "rp"] as const) {
  if (!BUILDINGS.some((b) => b.kind === kind && b.era === 0)) fail(`${kind}: 시대 0에 시작 건물이 없음`);
}

const upgradeIds = new Set(UPGRADES.map((u) => u.id));
for (const u of UPGRADES) {
  if (u.era < 0 || u.era > maxEra) fail(`${u.id}: era 범위 밖`);
  if (!(u.cost > 0)) fail(`${u.id}: 비용 이상`);
  for (const r of u.requires ?? []) {
    if (!upgradeIds.has(r)) fail(`${u.id}: 없는 선행 연구 ${r}`);
    else if (UPGRADES.find((x) => x.id === r)!.era > u.era) fail(`${u.id}: 선행 연구 ${r}가 더 늦은 시대`);
  }
  for (const e of u.effects) if (!(e.mul > 0)) fail(`${u.id}: 효과 배수 이상 ${e.stat}`);
  if (!u.effects.length && !u.ctx && !u.unlockThinking && !u.autoTap) fail(`${u.id}: 효과 없음`);
}

// 보스 컨텍스트 요구치는 그 시대까지 열리는 연구로 달성 가능해야 한다
ERAS.forEach((e) => {
  const reachable = Math.max(0, ...UPGRADES.filter((u) => u.era <= e.id && u.ctx).map((u) => u.ctx!));
  if (reachable < e.boss.ctxReq) fail(`era ${e.id} 보스 컨텍스트 ${e.boss.ctxReq}를 달성할 연구가 없음 (최대 ${reachable})`);
});

TIERS.forEach((t, i) => {
  if (t.id !== i + 1) fail(`tiers[${i}].id = ${t.id}`);
  if (i > 0) {
    const p = TIERS[i - 1];
    if (t.intelReq < p.intelReq || t.ctxReq < p.ctxReq) fail(`tier ${t.id}: 요구치가 이전 티어보다 낮음`);
    if (t.reward / t.tokens <= p.reward / p.tokens) fail(`tier ${t.id}: 토큰당 보상이 이전 티어보다 낮음`);
  }
  if (!t.examples.length) fail(`tier ${t.id}: 예시 질문 없음`);
});

for (const ev of EVENTS) {
  if (ev.minEra > (ev.maxEra ?? maxEra)) fail(`${ev.id}: minEra > maxEra`);
  if (!ev.scripted && ev.weight <= 0) fail(`${ev.id}: 가중치 0`);
  if (!ev.effects.length && !ev.choices && !ev.incomeSeconds && !ev.rpSeconds) fail(`${ev.id}: 효과 없음`);
  if (ev.effects.length && ev.duration <= 0) fail(`${ev.id}: 지속 시간 없음`);
}
for (let era = 0; era <= maxEra; era++) {
  if (!EVENTS.some((e) => !e.scripted && e.minEra <= era && (e.maxEra ?? maxEra) >= era)) fail(`era ${era}: 랜덤 이벤트 없음`);
}
for (const c of CODEX) if (c.era < 0 || c.era > maxEra) fail(`codex ${c.id}: era 범위 밖`);

if (errors.length) {
  console.error(`데이터 검사 실패 ${errors.length}건:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`데이터 검사 통과: 시대 ${ERAS.length} · 건물 ${BUILDINGS.length} · 업그레이드 ${UPGRADES.length} · 티어 ${TIERS.length} · 이벤트 ${EVENTS.length} · 도감 ${CODEX.length} · 업적 ${ACHIEVEMENTS.length}`);
