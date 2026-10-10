// 시대별 장면 배경. 이모지 대신 SVG로 그린 '방'을 깐다: 연구실 → 진공관 실험실 → 메인프레임실 →
// 80년대 사무실 → 서버실 → GPU 책상 → 데이터센터 → 하이퍼스케일 → 기가와트 캠퍼스 → 우주.
// viewBox 400×260, 벽과 바닥 경계(지평선)는 y=190. 오른쪽(x≥270)은 AI 아바타 자리라 비워 둔다.
// 반짝이는 LED·돌아가는 릴·팬은 CSS 클래스(.bd-led, .bd-spin …)로 움직인다.

const W = 400;
const H = 260;
const HZ = 190;

interface Palette {
  wall: [string, string];
  floor: [string, string];
  /** 바닥 줄 색 */
  line: string;
}

const PALETTES: Palette[] = [
  { wall: ["#2e2016", "#1a110b"], floor: ["#3a2817", "#1d140c"], line: "#5a3f26" },
  { wall: ["#2c3229", "#191d17"], floor: ["#30362c", "#1a1e18"], line: "#454d3f" },
  { wall: ["#1c2b2a", "#111a19"], floor: ["#253634", "#121b1a"], line: "#33504c" },
  { wall: ["#1e2536", "#121621"], floor: ["#262c3e", "#141824"], line: "#363f58" },
  { wall: ["#241e35", "#14111f"], floor: ["#2b2440", "#161222"], line: "#3d3359" },
  { wall: ["#2a1823", "#160c13"], floor: ["#251520", "#120a10"], line: "#44263a" },
  { wall: ["#26201a", "#14110e"], floor: ["#2d2822", "#161310"], line: "#4a4238" },
  { wall: ["#0f1f1b", "#08110f"], floor: ["#11211d", "#070e0c"], line: "#1c3a32" },
  { wall: ["#28160f", "#120a07"], floor: ["#22130e", "#0e0806"], line: "#43251a" },
  { wall: ["#141833", "#0a0c1c"], floor: ["#151a30", "#090b18"], line: "#252c55" },
  { wall: ["#05060d", "#05060d"], floor: ["#05060d", "#05060d"], line: "#05060d" },
];

/** 같은 시대는 늘 같은 그림이 나오도록 고정 시드 난수 */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number, fill: string, extra = "") =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" fill="${fill}" ${extra}/>`;
const circle = (cx: number, cy: number, r: number, fill: string, extra = "") =>
  `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${fill}" ${extra}/>`;
/**
 * 움직이는 조각 표시. 정지한 방은 한 번만 그리고, 표시된 조각만 따로 떼어
 * 별도 GPU 층(.bd-anim)에 올린다 → LED 하나가 깜박일 때 방 전체를 다시 그리지 않는다.
 */
const A0 = "\u0001";
const A1 = "\u0002";
const anim = (svg: string) => A0 + svg + A1;
/** 깜박이는 LED. 타이밍을 몇 가지로 묶어서 화면이 바뀌는 횟수를 줄인다. */
const LED_DELAYS = [0, 0.7, 1.4, 2.1];
const LED_DURS = [1.6, 2.4, 3.2];
const led = (x: number, y: number, r: number, color: string, rnd: () => number, cls = "bd-led") =>
  anim(circle(x, y, r, color, `class="${cls}" style="animation-delay:-${LED_DELAYS[Math.floor(rnd() * 4)]}s;animation-duration:${LED_DURS[Math.floor(rnd() * 3)]}s"`));
/** 바닥 그림자 */
const shadow = (cx: number, w: number) => `<ellipse cx="${r1(cx)}" cy="${HZ + 2}" rx="${r1(w / 2 + 6)}" ry="5" fill="#000" opacity=".45"/>`;

// ── 공통 방 ─────────────────────────────────────────

function room(era: number, accent: string): { defs: string; back: string; front: string } {
  const p = PALETTES[era];
  const defs = `
    <linearGradient id="bdWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.wall[1]}"/><stop offset="1" stop-color="${p.wall[0]}"/></linearGradient>
    <linearGradient id="bdFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.floor[0]}"/><stop offset="1" stop-color="${p.floor[1]}"/></linearGradient>
    <radialGradient id="bdGlow" cx="0.78" cy="0.5" r="0.5"><stop offset="0" stop-color="${accent}" stop-opacity=".42"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="bdVig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <linearGradient id="bdCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".16"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
    <linearGradient id="bdShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  let back = rect(0, 0, W, HZ, "url(#bdWall)") + rect(0, HZ, W, H - HZ, "url(#bdFloor)");
  if (era < 10) {
    // 원근 바닥 줄
    const vx = 200;
    for (let x = -400; x <= 800; x += 50) {
      back += `<line x1="${r1(vx + (x - vx) * 0.28)}" y1="${HZ}" x2="${x}" y2="${H}" stroke="${p.line}" stroke-width=".8" opacity=".55"/>`;
    }
    for (const y of [197, 207, 221, 241]) back += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${p.line}" stroke-width=".8" opacity=".45"/>`;
    back += `<line x1="0" y1="${HZ}" x2="${W}" y2="${HZ}" stroke="#000" stroke-width="2" opacity=".5"/>`;
  }
  const front = rect(0, 0, W, H, "url(#bdGlow)") + rect(0, 0, W, H, "url(#bdVig)");
  return { defs, back, front };
}

/** 천장 조명 원뿔 */
function lightCones(xs: number[]): string {
  return xs.map((x) => `<polygon points="${x - 6},0 ${x + 6},0 ${x + 46},${HZ + 30} ${x - 46},${HZ + 30}" fill="url(#bdCone)"/>` + rect(x - 10, 0, 20, 3, "#fff7dc", 'opacity=".55"')).join("");
}

// ── 시대별 장면 ─────────────────────────────────────

/** 0: 빅토리아풍 서재 — 창밖 달, 책장, 촛불 */
function study(rnd: () => number): string {
  let s = "";
  // 벽지 줄무늬와 징두리 판벽
  for (let x = 6; x < W; x += 14) s += rect(x, 0, 1, 118, "#000", 'opacity=".18"');
  s += rect(0, 118, W, 72, "#2a1a10") + rect(0, 116, W, 4, "#4a3220");
  for (let x = 8; x < W; x += 48) s += rect(x, 128, 38, 52, "none", 'stroke="#4a3220" stroke-width="1.5" rx="2"');
  // 아치형 창
  s += `<defs><linearGradient id="bdNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1633"/><stop offset="1" stop-color="#26385e"/></linearGradient></defs>`;
  s += `<path d="M28 112 V52 a38 38 0 0 1 76 0 V112 Z" fill="url(#bdNight)" stroke="#5a3d22" stroke-width="5"/>`;
  for (let i = 0; i < 14; i++) s += anim(circle(34 + rnd() * 64, 22 + rnd() * 80, rnd() * 0.9 + 0.3, "#fff", `class="bd-twinkle" style="animation-delay:-${Math.floor(rnd() * 4) * 0.8}s"`));
  s += circle(82, 40, 9, "#f4ecd0") + circle(86, 37, 8, "#0b1633", 'opacity=".9"');
  s += rect(64, 16, 4, 96, "#5a3d22") + rect(28, 66, 76, 4, "#5a3d22");
  // 책장
  s += shadow(170, 84) + rect(128, 46, 84, 144, "#3b2513") + rect(132, 50, 76, 136, "#1b100a");
  const colors = ["#7a2e2e", "#2e4a7a", "#3d6b3d", "#8a6a2e", "#5a3a6a", "#6b4a2a", "#2e6b6b"];
  for (let row = 0; row < 4; row++) {
    const base = 82 + row * 34;
    let x = 134;
    while (x < 204) {
      const w = 3 + rnd() * 5;
      const h = 20 + rnd() * 9;
      if (x + w > 206) break;
      s += rect(x, base - h, w, h, colors[Math.floor(rnd() * colors.length)], 'rx=".6"') + rect(x, base - h + 3, w, 1.2, "#e8c98a", 'opacity=".5"');
      x += w + 0.6;
    }
    s += rect(130, base, 80, 4, "#4a2f18");
  }
  // 책상과 촛불, 종이
  s += shadow(240, 50) + rect(214, 150, 54, 6, "#5a3a20") + rect(218, 156, 4, 34, "#3b2513") + rect(260, 156, 4, 34, "#3b2513");
  s += rect(222, 144, 18, 6, "#efe3c2", 'transform="rotate(-6 231 147)"') + rect(244, 128, 5, 22, "#efe9d8") + anim(`<ellipse cx="246.5" cy="124" rx="2.4" ry="5" fill="#ffcf5a" class="bd-flicker"/>`);
  s += anim(`<g opacity=".14">${circle(246.5, 126, 22, "#ffb347", 'class="bd-flicker"')}</g>`);
  return s;
}

/** 1: 1950년대 진공관 컴퓨터실 — 패널 가득 진공관, 패치 케이블 */
function tubeLab(rnd: () => number): string {
  let s = lightCones([70, 200]);
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 62;
    s += shadow(x + 28, 56) + rect(x, 56, 56, 134, "#4a5046") + rect(x + 3, 60, 50, 126, "#2b302a") + rect(x, 56, 56, 6, "#5f665a");
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 5; c++) {
        const tx = x + 9 + c * 9.5;
        const ty = 70 + r * 13;
        s += rect(tx - 2.2, ty - 4, 4.4, 8, "#3c4239", 'rx="2"') + led(tx, ty, 1.7, "#ffb347", rnd, "bd-flicker");
      }
    }
    // 다이얼과 스위치
    s += circle(x + 16, 168, 6, "#1b1f1a", 'stroke="#8f9886" stroke-width="1.2"') + `<line x1="${x + 16}" y1="168" x2="${x + 19}" y2="164" stroke="#d8dccf" stroke-width="1"/>`;
    s += circle(x + 40, 168, 6, "#1b1f1a", 'stroke="#8f9886" stroke-width="1.2"') + `<line x1="${x + 40}" y1="168" x2="${x + 36}" y2="165" stroke="#d8dccf" stroke-width="1"/>`;
  }
  // 패치 케이블
  const cables = ["#c0392b", "#e1b12c", "#2d7dd2", "#1b1b1b"];
  for (let i = 0; i < 6; i++) {
    const x1 = 14 + rnd() * 220;
    const x2 = x1 + 20 + rnd() * 50;
    s += `<path d="M${r1(x1)} 150 C ${r1(x1)} ${r1(178 + rnd() * 10)}, ${r1(x2)} ${r1(178 + rnd() * 10)}, ${r1(x2)} 150" fill="none" stroke="${cables[i % 4]}" stroke-width="1.6" opacity=".85"/>`;
  }
  return s;
}

/** 2: 메인프레임실 — 테이프 드라이브 릴이 돌고, 콘솔 램프가 깜박인다 */
function mainframe(rnd: () => number): string {
  let s = lightCones([60, 180]);
  for (let i = 0; i < 3; i++) {
    const x = 8 + i * 64;
    s += shadow(x + 28, 58) + rect(x, 58, 58, 132, "#cfd6d2", 'rx="2"') + rect(x + 4, 64, 50, 64, "#1a2322", 'rx="2"');
    for (const [cx, cy] of [[x + 17, 82], [x + 41, 82]]) {
      s += A0 + `<g class="bd-spin" style="animation-duration:${r1(3 + rnd() * 3)}s">` + circle(cx, cy, 11, "#3a4644", 'stroke="#9fb2ae" stroke-width="1.4"') + circle(cx, cy, 3, "#cfd6d2");
      for (let k = 0; k < 3; k++) {
        const a = (k * 2 * Math.PI) / 3;
        s += `<line x1="${r1(cx + Math.cos(a) * 3)}" y1="${r1(cy + Math.sin(a) * 3)}" x2="${r1(cx + Math.cos(a) * 10)}" y2="${r1(cy + Math.sin(a) * 10)}" stroke="#9fb2ae" stroke-width="1.6"/>`;
      }
      s += "</g>" + A1;
    }
    s += rect(x + 10, 100, 38, 22, "#0e1514", 'rx="2"') + rect(x + 22, 102, 14, 18, "#283533");
    for (let k = 0; k < 4; k++) s += rect(x + 8 + k * 11, 136, 7, 5, ["#d94b3c", "#3cb371", "#e1b12c", "#f0f0f0"][k], 'rx="1"');
    s += rect(x + 6, 150, 46, 30, "#b7c0bb", 'rx="2"');
  }
  // 콘솔 패널
  s += shadow(230, 64) + rect(198, 112, 66, 78, "#2c3a37", 'rx="3"') + rect(202, 116, 58, 40, "#141d1c", 'rx="2"');
  const cols = ["#ff5e4d", "#ffb347", "#ffe066"];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) s += led(207 + c * 7, 122 + r * 9, 1.8, cols[(r + c) % 3], rnd);
  s += rect(202, 162, 58, 4, "#4fae8a", 'opacity=".6"');
  for (let k = 0; k < 7; k++) s += rect(204 + k * 8, 170, 5, 9, "#d8dcd6", 'rx="1"');
  return s;
}

/** 3: 80년대 사무실 — 블라인드 창, 베이지 단말기의 초록 글자 */
function office(rnd: () => number): string {
  let s = "";
  // 블라인드 창과 도시 불빛
  s += rect(18, 22, 120, 82, "#0d1430") + rect(18, 22, 120, 82, "none", 'stroke="#3a4560" stroke-width="4"');
  for (let i = 0; i < 18; i++) {
    const bx = 22 + rnd() * 110;
    const bh = 14 + rnd() * 40;
    s += rect(bx, 104 - bh, 8 + rnd() * 8, bh, "#151d3a");
    for (let k = 0; k < 3; k++) if (rnd() < 0.6) s += rect(bx + 2 + rnd() * 4, 104 - bh + 4 + rnd() * (bh - 8), 1.6, 1.6, "#ffd77a", 'opacity=".8"');
  }
  for (let y = 26; y < 104; y += 5) s += rect(18, y, 120, 1.6, "#8a93a8", 'opacity=".35"');
  // 벽 포스터
  s += rect(160, 30, 46, 60, "#e6e0cc", 'rx="1"') + rect(165, 36, 36, 24, "#5b8bd9") + rect(165, 66, 30, 3, "#555") + rect(165, 73, 22, 3, "#555");
  // 책상 두 개와 단말기
  for (const [x, w] of [[10, 120], [138, 124]] as const) {
    s += shadow(x + w / 2, w) + rect(x, 150, w, 7, "#6a5a48") + rect(x + 4, 157, 5, 33, "#4a3f33") + rect(x + w - 9, 157, 5, 33, "#4a3f33");
  }
  for (const x of [26, 156, 212]) {
    s += rect(x, 108, 40, 36, "#d6ceb2", 'rx="4"') + rect(x + 5, 113, 30, 22, "#0b2312", 'rx="2"');
    for (let k = 0; k < 4; k++) s += rect(x + 8, 117 + k * 4.5, 8 + rnd() * 16, 1.8, "#5dff7a", 'opacity=".85"');
    s += anim(rect(x + 8 + 14, 117 + 4 * 4.5, 3, 2.4, "#5dff7a", 'class="bd-blink"'));
    s += rect(x + 14, 144, 12, 6, "#bfb79b") + rect(x - 2, 146, 44, 4, "#cfc7aa", 'rx="1"');
  }
  // 플로피와 머그잔
  s += rect(92, 141, 10, 10, "#2d2d2d") + rect(94, 141, 6, 4, "#bbb") + rect(112, 140, 7, 10, "#c0392b", 'rx="1.5"');
  return s;
}

/** 4: 90~2000년대 — 서버 랙, 체스판이 뜬 CRT, 베이지 타워 */
function serverRoom(rnd: () => number): string {
  let s = lightCones([120]);
  // 케이블 트레이
  s += rect(0, 18, W, 5, "#3d3359") + rect(0, 23, W, 1.5, "#000", 'opacity=".4"');
  // 랙 두 개
  for (const x of [12, 66]) {
    s += shadow(x + 24, 48) + rect(x, 50, 48, 140, "#1c1a26", 'rx="2"') + rect(x + 3, 54, 42, 132, "#0f0e16");
    for (let u = 0; u < 12; u++) {
      const y = 57 + u * 10.8;
      s += rect(x + 5, y, 38, 8.6, u % 3 === 0 ? "#cfc6ad" : "#2c2a3a", 'rx="1"');
      s += led(x + 9, y + 4.3, 1.2, u % 2 ? "#5dff7a" : "#ffb347", rnd);
      if (u % 3 !== 0) s += rect(x + 14, y + 3.5, 20, 1.4, "#555")
    }
  }
  // 책상, CRT, 타워
  s += shadow(200, 120) + rect(130, 150, 132, 7, "#4a4060") + rect(134, 157, 5, 33, "#2e2840") + rect(253, 157, 5, 33, "#2e2840");
  s += rect(150, 96, 62, 52, "#c9c1a6", 'rx="5"') + rect(156, 101, 50, 38, "#101010", 'rx="3"');
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) s += rect(167 + c * 3.5, 104 + r * 3.9, 3.5, 3.9, (r + c) % 2 ? "#3b5f3b" : "#d9e4c8");
  s += circle(172, 112, 1.2, "#111") + circle(186, 127, 1.2, "#fff");
  s += rect(170, 148, 22, 3, "#a9a18a") + rect(156, 144, 50, 4, "#b8b097");
  s += rect(222, 100, 26, 50, "#d4ccb2", 'rx="2"') + rect(226, 108, 18, 3, "#9e967e") + rect(226, 114, 18, 3, "#9e967e") + led(230, 138, 1.4, "#5dff7a", rnd);
  return s;
}

/** 5: 2010년대 딥러닝 책상 — 모니터 3대(손실 곡선·고양이 그리드·코드), RGB 팬 GPU 타워 */
function gpuDesk(rnd: () => number, accent: string): string {
  let s = "";
  // 벽 LED 스트립
  s += rect(0, 30, W, 2, accent, 'opacity=".7"') + rect(0, 26, W, 10, accent, 'opacity=".08"');
  // 선반 위 소품
  s += rect(20, 64, 90, 3, "#3a2232") + rect(26, 48, 10, 16, "#e8b04a", 'rx="2"') + rect(40, 52, 22, 12, "#2b6c9a", 'rx="1"') + circle(80, 56, 8, "#3a7d44");
  // 책상
  s += shadow(140, 250) + rect(8, 150, 254, 8, "#2b1a24") + rect(14, 158, 6, 32, "#1c1118") + rect(246, 158, 6, 32, "#1c1118");
  // 모니터 3대
  const mon = (x: number, inner: string) => rect(x, 94, 58, 40, "#0b0b10", 'rx="3"') + rect(x + 3, 97, 52, 32, "#101722") + inner + rect(x + 25, 134, 8, 10, "#222") + rect(x + 16, 144, 26, 4, "#2a2a2a", 'rx="1"');
  let loss = `M16 101`;
  for (let i = 1; i <= 12; i++) loss += ` L${16 + i * 4} ${r1(101 + 24 * (1 - Math.exp(-i / 3.5)) + (rnd() - 0.5) * 2)}`;
  s += mon(12, `<path d="${loss}" fill="none" stroke="#ff6b8a" stroke-width="1.4"/>` + rect(15, 125, 50, 0.8, "#445"));
  let grid = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) grid += rect(78 + c * 8.3, 99 + r * 7.4, 7.4, 6.6, `hsl(${Math.floor(rnd() * 360)} 35% ${30 + rnd() * 30}%)`, 'rx=".8"');
  s += mon(74, grid);
  let code = "";
  for (let k = 0; k < 6; k++) code += rect(141 + (k % 3) * 3, 100 + k * 4.6, 10 + rnd() * 26, 1.8, ["#7fdbca", "#c792ea", "#ffcb6b"][k % 3]);
  s += mon(136, code);
  // GPU 타워 (유리 측면, RGB 팬)
  s += rect(204, 86, 50, 64, "#0d0a10", 'rx="3"') + rect(207, 89, 44, 58, "#150f19", 'stroke="#3a2532" stroke-width="1"');
  s += `<defs><linearGradient id="bdRgb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4d8d"/><stop offset=".5" stop-color="#7c5cff"/><stop offset="1" stop-color="#2de2e6"/></linearGradient></defs>`;
  for (const cy of [102, 124]) {
    s += circle(229, cy, 9, "none", 'stroke="url(#bdRgb)" stroke-width="2.2"');
    s += A0 + `<g class="bd-spin" style="animation-duration:.9s">`;
    for (let k = 0; k < 5; k++) s += `<ellipse cx="229" cy="${cy - 4}" rx="2" ry="4" fill="#3a2f44" transform="rotate(${k * 72} 229 ${cy})"/>`;
    s += "</g>" + circle(229, cy, 2, "#1a1420") + A1;
  }
  s += rect(209, 138, 40, 6, "#2a1f30") + rect(211, 139.5, 30, 3, "url(#bdRgb)", 'opacity=".9"');
  // 키보드, 마우스
  s += rect(60, 146, 80, 5, "#1a1a1f", 'rx="1"') + rect(62, 147, 76, 2, "url(#bdRgb)", 'opacity=".5"') + rect(150, 146, 8, 5, "#1a1a1f", 'rx="2.5"');
  return s;
}

/** 랙 한 대 (정면) */
function rack(x: number, y: number, w: number, h: number, rnd: () => number, ledColors: string[], body = "#14171c"): string {
  let s = shadow(x + w / 2, w) + rect(x, y, w, h, body, 'rx="2"') + rect(x + 3, y + 3, w - 6, h - 6, "#0a0c10");
  const units = Math.floor((h - 8) / 9);
  for (let u = 0; u < units; u++) {
    const uy = y + 5 + u * 9;
    s += rect(x + 5, uy, w - 10, 7, "#1d2229", 'rx=".8"');
    for (let k = 0; k < 3; k++) if (rnd() < 0.8) s += led(x + 9 + k * 4, uy + 3.5, 1, ledColors[Math.floor(rnd() * ledColors.length)], rnd);
    s += rect(x + w - 22, uy + 2.5, 14, 2, "#2a3038");
  }
  return s + rect(x, y, w, h, "url(#bdShine)", 'rx="2" opacity=".5"');
}

/** 6: 작은 데이터센터 — 랙 네 대, 노란 케이블 트레이 */
function smallDc(rnd: () => number): string {
  let s = lightCones([60, 190]);
  s += rect(0, 22, W, 4, "#c9a227") ;
  for (let x = 0; x < W; x += 10) s += rect(x, 22, 1.5, 8, "#c9a227");
  for (let i = 0; i < 4; i++) s += rack(10 + i * 62, 50, 54, 140, rnd, ["#3cff8a", "#3cff8a", "#4db8ff", "#ffb347"]);
  return s;
}

/** 원근 통로: 양쪽으로 랙이 소실점까지 늘어선다 */
function aisle(rnd: () => number, accent: string, opts: { pipes?: boolean; holo?: boolean }): string {
  const vx = 200;
  const vy = 105;
  let s = "";
  // 천장 조명 줄
  for (let i = 0; i < 7; i++) {
    const t = i / 7;
    const y = vy - (vy - 4) * (1 - t) ** 1.6;
    const half = 60 * (1 - t) ** 1.6 + 4;
    s += rect(vx - half, y, half * 2, Math.max(0.8, 3 * (1 - t)), "#e8fff6", 'opacity=".5"');
  }
  if (opts.pipes) {
    // 천장을 따라 소실점으로 가는 냉각수 배관 (빨강: 뜨거운 물, 파랑: 찬물)
    for (const [off, col] of [[-26, "#b8573a"], [-20, "#3a77b8"], [20, "#3a77b8"], [26, "#b8573a"]] as const) {
      s += `<path d="M${vx + off * 9} 8 L${vx + off * 0.5} ${vy - 8}" stroke="${col}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
      s += `<path d="M${vx + off * 9} 6.5 L${vx + off * 0.5} ${vy - 9}" stroke="#fff" stroke-opacity=".25" stroke-width="1" fill="none"/>`;
    }
  }
  // 양쪽 랙 줄
  for (const side of [-1, 1]) {
    const n = 7;
    for (let i = n - 1; i >= 0; i--) {
      const t0 = i / n;
      const t1 = (i + 1) / n;
      const k0 = (1 - t0) ** 1.5;
      const k1 = (1 - t1) ** 1.5;
      const xa = vx + side * (230 * k0 + 14);
      const xb = vx + side * (230 * k1 + 14);
      const top0 = vy - 100 * k0 - 4;
      const top1 = vy - 100 * k1 - 4;
      const bot0 = vy + 90 * k0 + 4;
      const bot1 = vy + 90 * k1 + 4;
      s += `<polygon points="${r1(xa)},${r1(top0)} ${r1(xb)},${r1(top1)} ${r1(xb)},${r1(bot1)} ${r1(xa)},${r1(bot0)}" fill="${i % 2 ? "#1a2329" : "#212b32"}" stroke="#05080a" stroke-width="1"/>`;
      // 문 손잡이 줄과 윗면 하이라이트
      s += `<line x1="${r1(xa)}" y1="${r1(top0)}" x2="${r1(xb)}" y2="${r1(top1)}" stroke="#8fa3ad" stroke-opacity=".35" stroke-width="${r1(Math.max(0.5, 1.5 * k0))}"/>`;
      s += `<line x1="${r1(xa + (xb - xa) * 0.08)}" y1="${r1(top0 + (bot0 - top0) * 0.1)}" x2="${r1(xa + (xb - xa) * 0.08)}" y2="${r1(bot0 - (bot0 - top0) * 0.1)}" stroke="#000" stroke-opacity=".5" stroke-width="${r1(Math.max(0.4, 2 * k0))}"/>`;
      // LED 줄
      const rows = 6;
      for (let r = 0; r < rows; r++) {
        const f = (r + 0.5) / rows;
        const ya = top0 + (bot0 - top0) * f;
        const yb = top1 + (bot1 - top1) * f;
        for (let c = 0; c < 3; c++) {
          const g = (c + 0.5) / 3;
          if (rnd() < 0.7) s += led(xa + (xb - xa) * g, ya + (yb - ya) * g, Math.max(0.6, 1.8 * k0), rnd() < 0.8 ? accent : "#4db8ff", rnd);
        }
      }
    }
  }
  // 바닥 반사
  s += `<polygon points="${vx - 18},${vy + 6} ${vx + 18},${vy + 6} ${vx + 140},${H} ${vx - 140},${H}" fill="${accent}" opacity=".08"/>`;
  s += `<polygon points="${vx - 4},${vy} ${vx + 4},${vy} ${vx + 30},${H} ${vx - 30},${H}" fill="#e8fff6" opacity=".05"/>`;
  if (opts.holo) {
    // 떠 있는 홀로그램 화면
    for (const [x, y, w, h] of [[34, 70, 54, 36], [104, 46, 40, 28]] as const) {
      s += rect(x, y, w, h, accent, `opacity=".14" rx="3" stroke="${accent}" stroke-opacity=".7"`);
      for (let k = 0; k < 4; k++) s += rect(x + 5, y + 6 + k * (h / 5), w * (0.3 + rnd() * 0.55), 1.6, accent, 'opacity=".75"');
    }
  }
  return s;
}

/** 9: 기가와트 캠퍼스 — 유리벽 너머 밤의 데이터센터 단지, 냉각탑 증기, 송전탑 */
function campus(rnd: () => number): string {
  let s = `<defs><linearGradient id="bdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a1f"/><stop offset=".7" stop-color="#1c2357"/><stop offset="1" stop-color="#3a3f7a"/></linearGradient></defs>`;
  s += rect(0, 0, W, HZ, "url(#bdSky)");
  for (let i = 0; i < 40; i++) s += anim(circle(rnd() * W, rnd() * 90, rnd() * 0.8 + 0.2, "#fff", `class="bd-twinkle" style="animation-delay:-${Math.floor(rnd() * 4) * 0.8}s"`));
  s += circle(60, 34, 10, "#e9ecff", 'opacity=".9"');
  // 송전탑과 전선
  for (const x of [16, 126, 236]) {
    s += `<path d="M${x} 150 L${x + 6} 96 L${x + 12} 150 M${x + 2} 128 L${x + 10} 128 M${x - 4} 104 L${x + 16} 104" stroke="#5a6190" stroke-width="1.2" fill="none"/>`;
  }
  s += `<path d="M2 106 Q 71 120 132 104 T 252 104 T 400 108" stroke="#5a6190" stroke-width=".7" fill="none"/>`;
  // 냉각탑과 증기
  for (const x of [170, 214]) {
    s += `<path d="M${x} 160 Q ${x + 6} 128 ${x + 2} 112 L${x + 22} 112 Q ${x + 18} 128 ${x + 24} 160 Z" fill="#2a2f55"/>`;
    for (let k = 0; k < 3; k++) s += anim(`<g opacity=".16">${circle(x + 12 + (rnd() - 0.5) * 8, 104 - k * 9, 7 + k * 3, "#c9cdf0", `class="bd-steam" style="animation-delay:-${r1(rnd() * 4)}s"`)}</g>`);
  }
  // 데이터센터 건물 (창문 줄이 켜져 있다)
  for (const [x, w, h] of [[0, 70, 34], [74, 90, 44], [250, 150, 40]] as const) {
    s += rect(x, HZ - 30 - h, w, h, "#11152e");
    for (let row = 0; row < Math.floor(h / 7); row++) s += rect(x + 4, HZ - 30 - h + 4 + row * 7, w - 8, 1.8, "#7f8cff", `opacity="${r1(0.35 + rnd() * 0.5)}"`);
  }
  s += rect(0, HZ - 30, W, 30, "#0b0e22");
  // 유리벽 창틀
  for (let x = 0; x <= W; x += 66) s += rect(x - 2, 0, 4, HZ, "#1a1f3d");
  s += rect(0, 0, W, 6, "#1a1f3d") + rect(0, HZ - 4, W, 4, "#1a1f3d");
  s += `<polygon points="0,0 120,0 40,${HZ} 0,${HZ}" fill="#fff" opacity=".03"/>`;
  return s;
}

/** 10: 우주 — 별, 성운, 다이슨 스웜이 도는 태양 */
function space(rnd: () => number, accent: string): string {
  let s = `<defs>
    <radialGradient id="bdSun"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="bdNeb1"><stop offset="0" stop-color="#7a3cff" stop-opacity=".35"/><stop offset="1" stop-color="#7a3cff" stop-opacity="0"/></radialGradient>
    <radialGradient id="bdNeb2"><stop offset="0" stop-color="#ff5aa0" stop-opacity=".22"/><stop offset="1" stop-color="#ff5aa0" stop-opacity="0"/></radialGradient>
    <linearGradient id="bdPlanet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b6bd9"/><stop offset="1" stop-color="#0c1530"/></linearGradient>
  </defs>`;
  s += `<ellipse cx="90" cy="60" rx="140" ry="70" fill="url(#bdNeb1)"/><ellipse cx="300" cy="40" rx="120" ry="60" fill="url(#bdNeb2)"/>`;
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const star = circle(x, y, rnd() * 0.9 + 0.2, "#fff", `class="bd-twinkle" style="animation-delay:-${Math.floor(rnd() * 4) * 1}s"`);
    // 움직이는 층은 맨 위에 그려지므로 행성·태양 위에 별이 찍히지 않게 거른다
    const onPlanet = ((x - 40) / 222) ** 2 + ((y - 300) / 112) ** 2 < 1;
    const onSun = (x - 150) ** 2 + (y - 100) ** 2 < 30 ** 2;
    if (!onPlanet && !onSun) s += anim(star);
  }
  s += circle(150, 100, 46, "url(#bdSun)") + circle(150, 100, 13, "#fffbe6");
  // 다이슨 스웜: 기울어진 궤도 위 위성들
  for (const [rx, ry, rot, n, dur] of [[70, 20, -18, 18, 40], [96, 30, 12, 26, 60]] as const) {
    s += A0 + `<g transform="rotate(${rot} 150 100)"><ellipse cx="150" cy="100" rx="${rx}" ry="${ry}" fill="none" stroke="${accent}" stroke-opacity=".25" stroke-width=".6"/>`;
    s += `<g class="bd-orbit" style="animation-duration:${dur}s">`;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      s += rect(150 + Math.cos(a) * rx - 1.5, 100 + Math.sin(a) * ry - 1, 3, 2, "#ffe9a8", 'opacity=".9"');
    }
    s += "</g></g>" + A1;
  }
  // 행성 가장자리
  s += `<ellipse cx="40" cy="300" rx="220" ry="110" fill="url(#bdPlanet)"/><ellipse cx="40" cy="300" rx="220" ry="110" fill="none" stroke="#8fd3ff" stroke-opacity=".5" stroke-width="2"/>`;
  return s;
}

/** 시대 번호 → 배경 SVG 문자열 */
export function backdropSvg(era: number, accent: string): string {
  const rnd = rand(1000 + era * 77);
  const base = room(era, accent);
  const scenes: (() => string)[] = [
    () => study(rnd),
    () => tubeLab(rnd),
    () => mainframe(rnd),
    () => office(rnd),
    () => serverRoom(rnd),
    () => gpuDesk(rnd, accent),
    () => smallDc(rnd),
    () => aisle(rnd, accent, {}),
    () => aisle(rnd, accent, { pipes: true, holo: true }),
    () => campus(rnd),
    () => space(rnd, accent),
  ];
  const body = (scenes[era] ?? scenes[scenes.length - 1])();
  // 표시된 움직이는 조각을 떼어 내서 세 층으로: 정지한 방 / 움직이는 것 / 조명·비네트
  const moving: string[] = [];
  // 같은 타이밍으로 깜박이는 단일 요소들은 <g> 하나로 묶어 애니메이션 하나로 돌린다
  // (SVG 안의 애니메이션은 요소마다 메인 스레드 비용이 들어서, 150개를 따로 돌리면 저가 폰에서 끊긴다)
  const groups = new Map<string, string[]>();
  const still = body.replace(/\u0001([\s\S]*?)\u0002/g, (_, part: string) => {
    const m = /^<(circle|rect|ellipse) ([^>]*?)class="(bd-[\w-]+)"(?: style="([^"]*)")?([^>]*)\/>$/.exec(part);
    if (m) {
      const key = `${m[3]}|${m[4] ?? ""}`;
      const list = groups.get(key) ?? [];
      list.push(`<${m[1]} ${m[2]}${m[5]}/>`);
      groups.set(key, list);
    } else moving.push(part);
    return "";
  });
  for (const [key, list] of groups) {
    const [cls, style] = key.split("|");
    moving.push(`<g class="${cls}"${style ? ` style="${style}"` : ""}>${list.join("")}</g>`);
  }
  const svg = (cls: string, inner: string) =>
    `<svg class="bd-layer ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${inner}</svg>`;
  return `<div class="backdrop">${svg("bd-still", `<defs>${base.defs}</defs>${base.back}${still}`)}${svg("bd-anim", moving.join(""))}${svg("bd-front", base.front)}</div>`;
}
