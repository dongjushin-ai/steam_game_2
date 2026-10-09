// 번역 검수: npm test 에서 실행된다.
// 1) 모든 데이터 id에 영어가 있는지  2) 영어로 바꾼 뒤 데이터에 한글이 남았는지
// 3) UI·core 코드에 L(…) 밖의 한글 문자열이 있는지  4) 다시 한국어로 돌리면 원문이 복원되는지
import { readFileSync, readdirSync } from "node:fs";
import { BUILDINGS, CODEX, ERAS, EVENTS, GOLDENS, MISSIONS, NEWS, QUIZ, RIVALS, SIDE_BENCHES, THREATS, TIERS, UPGRADES } from "../src/data";
import { ACHIEVEMENTS } from "../src/core/achievements";
import { applyLanguage, missing } from "../src/i18n";

const errors: string[] = [];
const HANGUL = /[가-힣]/;

const snapshot = () => JSON.stringify([ERAS, TIERS, BUILDINGS, UPGRADES, EVENTS, CODEX, QUIZ, NEWS, GOLDENS, RIVALS, ACHIEVEMENTS.map((a) => [a.name, a.desc]), SIDE_BENCHES, MISSIONS, THREATS]);
const before = snapshot();

applyLanguage("en");
if (missing.length) errors.push(`번역 누락 ${missing.length}건: ${missing.join(", ")}`);

// 영어 모드에서 데이터에 한글이 남아 있으면 안 된다 (한국어 숫자 단위는 데이터에 없음)
const leftovers: string[] = [];
const walk = (v: unknown, path: string) => {
  if (typeof v === "string") {
    if (HANGUL.test(v)) leftovers.push(`${path}: ${v.slice(0, 40)}`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (typeof x !== "function") walk(x, `${path}.${k}`);
};
walk({ ERAS, TIERS, BUILDINGS, UPGRADES, EVENTS, CODEX, QUIZ, NEWS, GOLDENS, RIVALS, ACHIEVEMENTS, SIDE_BENCHES, MISSIONS, THREATS }, "data");
if (leftovers.length) errors.push(`영어 모드에 남은 한글 ${leftovers.length}건:\n  ${leftovers.slice(0, 20).join("\n  ")}`);

// 퀴즈 보기 수가 같아야 정답 번호가 맞는다
for (const q of QUIZ) if (q.options.length !== 4) errors.push(`퀴즈 보기 수 이상: ${q.id}`);

applyLanguage("ko");
if (snapshot() !== before) errors.push("한국어로 되돌렸을 때 원문이 복원되지 않음");

// UI·core 코드: L( … ) 밖의 한글 문자열 리터럴 찾기
const ALLOW = [
  /const KOREAN = \[/, // 한글 숫자 단위 (만·억·조…)
  /\["ko", "한국어"\]/, // 언어 이름
  /newState\(aiName = "나의 AI"\)/, // core 기본값 (UI는 언어에 맞춰 넘겨준다)
  /"123만 \(Korean units\)"/, // 한글 단위 표기의 예시 그 자체
];
const files = ["src/ui", "src/core"].flatMap((d) => readdirSync(d).filter((f) => f.endsWith(".ts")).map((f) => `${d}/${f}`))
  .filter((f) => !f.endsWith("achievements.ts")); // 업적 텍스트는 applyLanguage가 처리
for (const f of files) {
  const lines = readFileSync(f, "utf8").split("\n");
  let inKoTable = false;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
    if (/const ko: Record</.test(t)) inKoTable = true; // statLabel의 한국어 표
    if (inKoTable) {
      if (t === "};") inKoTable = false;
      return;
    }
    const code = line.replace(/\/\/.*$/, "");
    if (ALLOW.some((re) => re.test(code))) return;
    // L("한국어", …) 의 첫 인자를 지운 뒤에도 한글이 남아 있으면 번역이 빠진 것
    const stripped = code.replace(/L\(\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g, "L(_");
    if (HANGUL.test(stripped)) errors.push(`${f}:${i + 1} L() 밖의 한글: ${t.slice(0, 70)}`);
  });
}

if (errors.length) {
  console.error(`번역 검사 실패 ${errors.length}건:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`번역 검사 통과: 데이터 누락 0 · 영어 모드 잔여 한글 0 · ko 복원 OK · UI 파일 ${files.length}개 L() 밖 한글 0`);
