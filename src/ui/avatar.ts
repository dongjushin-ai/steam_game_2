// AI 아바타. 시대마다 몸이 바뀐다: 태엽 자동인형 → 진공관 → 메인프레임 콘솔 → 베이지 단말기 →
// CRT 모니터 → 카메라 렌즈 눈 → 칩 로봇 → 챗봇 구체 → 에이전트 로봇 → 신경망 구체 → 빛의 존재.
// 눈(.av-eyes)은 CSS로 깜박이고, 탭하면 .chomp로 살짝 커진다. viewBox 120×120.

const r1 = (n: number) => Math.round(n * 10) / 10;

function defs(accent: string): string {
  return `<defs>
    <radialGradient id="avGlow"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <linearGradient id="avBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d58e"/><stop offset=".5" stop-color="#b08d57"/><stop offset="1" stop-color="#6e5330"/></linearGradient>
    <linearGradient id="avSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9eef0"/><stop offset=".55" stop-color="#9aa6ab"/><stop offset="1" stop-color="#5d686d"/></linearGradient>
    <linearGradient id="avBeige" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2ebd6"/><stop offset="1" stop-color="#b9ae8d"/></linearGradient>
    <linearGradient id="avDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#15181e"/></linearGradient>
    <radialGradient id="avOrb" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="${accent}"/><stop offset="1" stop-color="#05140f"/></radialGradient>
    <radialGradient id="avLens" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="${accent}"/><stop offset=".6" stop-color="#3a0d1d"/><stop offset="1" stop-color="#0a0508"/></radialGradient>
    <linearGradient id="avShine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
  </defs>`;
}

/** 두 눈: 화면형(사각 픽셀) 또는 렌즈형(둥근 빛) */
const eyes = (cx: number, cy: number, gap: number, color: string, shape: "round" | "pixel" | "oval" = "round", size = 5) => {
  const one = (x: number) =>
    shape === "pixel" ? `<rect x="${r1(x - size / 2)}" y="${r1(cy - size / 2)}" width="${size}" height="${size}" fill="${color}"/>`
      : shape === "oval" ? `<ellipse cx="${r1(x)}" cy="${cy}" rx="${r1(size * 0.62)}" ry="${size}" fill="${color}"/>`
        : `<circle cx="${r1(x)}" cy="${cy}" r="${size}" fill="${color}"/><circle cx="${r1(x - size * 0.3)}" cy="${r1(cy - size * 0.3)}" r="${r1(size * 0.32)}" fill="#fff" opacity=".9"/>`;
  return `<g class="av-eyes">${one(cx - gap / 2)}${one(cx + gap / 2)}</g>`;
};

function gear(cx: number, cy: number, r: number, teeth: number, fill: string, cls = "", dur = 12): string {
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rr = i % 2 ? r : r * 1.18;
    d += `${i ? "L" : "M"}${r1(cx + Math.cos(a) * rr)} ${r1(cy + Math.sin(a) * rr)}`;
  }
  return `<g class="${cls}" style="animation-duration:${dur}s"><path d="${d}Z" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r1(r * 0.35)}" fill="#3a2a18"/></g>`;
}

const BODIES: ((a: string) => string)[] = [
  // 0 태엽 자동인형
  () => gear(36, 40, 16, 10, "url(#avBrass)", "av-spin", 14) + gear(86, 34, 12, 8, "url(#avBrass)", "av-spin-rev", 10)
    + `<circle cx="60" cy="66" r="34" fill="url(#avBrass)" stroke="#5a4226" stroke-width="2"/>`
    + `<circle cx="60" cy="66" r="27" fill="#2a1d10"/>`
    + Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${r1(60 + Math.cos(a) * 30.5)}" cy="${r1(66 + Math.sin(a) * 30.5)}" r="1.5" fill="#5a4226"/>`; }).join("")
    + eyes(60, 62, 20, "#ffb347", "round", 6)
    + `<path d="M48 80 Q60 86 72 80" stroke="#ffb347" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  // 1 진공관
  (a) => `<rect x="38" y="88" width="44" height="18" rx="3" fill="url(#avSteel)"/><rect x="44" y="104" width="4" height="10" fill="#777"/><rect x="58" y="104" width="4" height="10" fill="#777"/><rect x="72" y="104" width="4" height="10" fill="#777"/>`
    + `<path d="M42 90 V40 a18 18 0 0 1 36 0 V90 Z" fill="${a}" opacity=".18" stroke="#cfe3c4" stroke-opacity=".7" stroke-width="2"/>`
    + `<rect x="50" y="46" width="20" height="36" rx="2" fill="none" stroke="#8a9a84" stroke-width="1.5"/>`
    + `<path d="M54 76 L58 54 L62 76 L66 54" stroke="#ffcf6a" stroke-width="2" fill="none" class="av-flicker"/>`
    + eyes(60, 40, 14, "#ffcf6a", "round", 4)
    + `<path d="M46 34 Q50 26 56 24" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>`,
  // 2 메인프레임 콘솔
  () => `<rect x="20" y="22" width="80" height="80" rx="8" fill="url(#avSteel)"/><rect x="26" y="28" width="68" height="44" rx="4" fill="#142220"/>`
    + eyes(60, 48, 26, "#ff5e4d", "round", 7)
    + Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 10.4}" y="80" width="6" height="6" rx="1" fill="${["#ffb347", "#3cb371", "#ff5e4d"][i % 3]}" class="av-blink" style="animation-delay:-${i * 0.37}s"/>`).join("")
    + `<rect x="30" y="91" width="60" height="4" rx="2" fill="#5d686d"/>`,
  // 3 베이지 단말기
  () => `<rect x="24" y="16" width="72" height="80" rx="8" fill="url(#avBeige)"/><rect x="32" y="24" width="56" height="44" rx="6" fill="#0b2312"/>`
    + eyes(60, 42, 22, "#5dff7a", "pixel", 6)
    + `<path d="M50 54 h4 v3 h12 v-3 h4" stroke="#5dff7a" stroke-width="2.6" fill="none"/>`
    + `<rect x="38" y="78" width="26" height="4" rx="1" fill="#8f8569"/><rect x="72" y="76" width="10" height="8" rx="1" fill="#a49a7c"/>`
    + `<rect x="30" y="98" width="60" height="10" rx="3" fill="#cfc6a8"/>`,
  // 4 CRT 모니터
  (a) => `<rect x="18" y="18" width="84" height="70" rx="10" fill="#d6d0e4"/><rect x="26" y="25" width="68" height="54" rx="10" fill="#0a0a14"/>`
    + `<rect x="26" y="25" width="68" height="54" rx="10" fill="${a}" opacity=".14"/>`
    + eyes(60, 48, 26, a, "pixel", 8)
    + `<rect x="48" y="62" width="24" height="4" fill="${a}"/>`
    + `<rect x="50" y="88" width="20" height="10" fill="#b8b2c8"/><rect x="36" y="98" width="48" height="6" rx="3" fill="#c9c3d8"/>`,
  // 5 카메라 렌즈 눈
  () => `<circle cx="60" cy="60" r="44" fill="url(#avDark)"/><circle cx="60" cy="60" r="38" fill="none" stroke="#4a4f5a" stroke-width="3"/>`
    + `<g class="av-spin" style="animation-duration:20s">${Array.from({ length: 6 }, (_, i) => `<path d="M60 60 L${r1(60 + Math.cos(i) * 34)} ${r1(60 + Math.sin(i) * 34)}" stroke="#2a2d35" stroke-width="5"/>`).join("")}</g>`
    + `<g class="av-eyes"><circle cx="60" cy="60" r="24" fill="url(#avLens)"/><circle cx="52" cy="52" r="5" fill="#fff" opacity=".85"/></g>`,
  // 6 칩 로봇
  (a) => Array.from({ length: 5 }, (_, i) => `<rect x="${32 + i * 12}" y="10" width="4" height="12" fill="#c9cdd3"/><rect x="${32 + i * 12}" y="98" width="4" height="12" fill="#c9cdd3"/><rect x="10" y="${32 + i * 12}" width="12" height="4" fill="#c9cdd3"/><rect x="98" y="${32 + i * 12}" width="12" height="4" fill="#c9cdd3"/>`).join("")
    + `<rect x="20" y="20" width="80" height="80" rx="10" fill="url(#avDark)"/><rect x="30" y="30" width="60" height="60" rx="6" fill="#111418" stroke="${a}" stroke-opacity=".6"/>`
    + `<path d="M34 76 C 50 50, 70 50, 86 76" stroke="${a}" stroke-opacity=".4" fill="none"/><path d="M34 76 C 50 40, 70 40, 86 76" stroke="${a}" stroke-opacity=".25" fill="none"/>`
    + eyes(60, 54, 24, a, "oval", 7),
  // 7 챗봇 구체
  () => `<path d="M30 92 L22 110 L46 98 Z" fill="url(#avOrb)" opacity=".9"/><circle cx="60" cy="58" r="44" fill="url(#avOrb)"/>`
    + eyes(60, 56, 24, "#04120d", "oval", 8)
    + `<path d="M50 74 Q60 80 70 74" stroke="#04120d" stroke-width="3" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="44" cy="34" rx="14" ry="8" fill="#fff" opacity=".35" transform="rotate(-28 44 34)"/>`,
  // 8 에이전트 로봇 (바이저 + 헤드셋 + 도는 도구들)
  (a) => `<g class="av-orbit" style="animation-duration:9s">${["#ffcf6a", "#7fdbca", "#c792ea"].map((c, i) => { const t = (i / 3) * Math.PI * 2; return `<circle cx="${r1(60 + Math.cos(t) * 54)}" cy="${r1(62 + Math.sin(t) * 54)}" r="5" fill="${c}"/>`; }).join("")}</g>`
    + `<rect x="22" y="22" width="76" height="76" rx="26" fill="url(#avSteel)"/><rect x="28" y="44" width="64" height="28" rx="14" fill="#14090a"/>`
    + `<rect x="28" y="44" width="64" height="28" rx="14" fill="${a}" opacity=".22"/>`
    + eyes(60, 58, 26, a, "oval", 7)
    + `<path d="M16 60 a8 8 0 0 1 8 -8 v16 a8 8 0 0 1 -8 -8 Z" fill="#3a3f4a"/><path d="M104 60 a8 8 0 0 0 -8 -8 v16 a8 8 0 0 0 8 -8 Z" fill="#3a3f4a"/>`
    + `<path d="M24 66 Q24 92 46 90" stroke="#3a3f4a" stroke-width="3" fill="none"/><circle cx="48" cy="90" r="3" fill="${a}"/>`
    + `<rect x="22" y="22" width="76" height="76" rx="26" fill="url(#avShine)" opacity=".6"/>`,
  // 9 신경망 구체
  (a) => `<circle cx="60" cy="60" r="46" fill="url(#avGlow)"/>`
    + `<g class="av-spin" style="animation-duration:16s">${[0, 30, 60, 90, 120, 150].map((d) => `<ellipse cx="60" cy="60" rx="14" ry="38" fill="none" stroke="${a}" stroke-opacity=".7" stroke-width="1.2" transform="rotate(${d} 60 60)"/>`).join("")}</g>`
    + `<ellipse cx="60" cy="60" rx="38" ry="12" fill="none" stroke="#c9d0ff" stroke-opacity=".6" stroke-width="1.2"/>`
    + `<circle cx="60" cy="60" r="18" fill="#0a0c1c" stroke="${a}" stroke-width="2"/>`
    + eyes(60, 60, 14, "#e6eaff", "oval", 4),
  // 10 빛의 존재
  (a) => `<circle cx="60" cy="60" r="56" fill="url(#avGlow)"/>`
    + `<g class="av-spin" style="animation-duration:24s">${Array.from({ length: 12 }, (_, i) => `<path d="M60 60 L${r1(60 + Math.cos((i / 12) * Math.PI * 2) * 54)} ${r1(60 + Math.sin((i / 12) * Math.PI * 2) * 54)}" stroke="${a}" stroke-opacity=".5" stroke-width="${i % 2 ? 1 : 2.4}"/>`).join("")}</g>`
    + `<circle cx="60" cy="60" r="24" fill="#fffbe6"/><circle cx="60" cy="60" r="24" fill="${a}" opacity=".35"/>`
    + eyes(60, 58, 14, "#7a5a00", "oval", 4),
];

/** 시대 번호 → 아바타 SVG 문자열 */
export function avatarSvg(era: number, accent: string): string {
  const body = (BODIES[era] ?? BODIES[BODIES.length - 1])(accent);
  return `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${defs(accent)}<ellipse cx="60" cy="116" rx="34" ry="4" fill="#000" opacity=".45"/>${body}</svg>`;
}
