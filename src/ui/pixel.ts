// 도트 그래픽 엔진. 장면은 192×120 캔버스에 정수 좌표로만 그리고, 화면에는 픽셀을 키워서(nearest) 보여준다.
// 시대마다 팔레트가 다르다: 0~2 NES풍 → 3 EGA 16색 → 4 VGA → 5~7 Y2K 파스텔·크롬 → 8~10 1비트 + 강조색 하나(브루탈리즘).
// 정지한 배경은 시대마다 한 번만 그려 두고(캐시), 매 프레임에는 LED·릴·팬·별·AI만 덧그린다.

export const PW = 192;
export const PH = 120;
/** 벽과 바닥의 경계 */
export const HZ = 88;
/** AI 스프라이트 자리 (40×40) */
export const AV = { x: 126, y: 36, w: 40, h: 40 };

export interface SceneFlags {
  /** 초 */
  t: number;
  thinking: boolean;
  /** 남은 '냠' 시간(초): 질문을 삼키는 표정 */
  chomp: number;
  fight: boolean;
  breach: boolean;
}

type G = CanvasRenderingContext2D;

// ── 기본 도구 ─────────────────────────────────────────

/** 같은 그림이 늘 같게 나오도록 고정 시드 난수 */
function rand(seed: number): () => number {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}
/** 위치·시각으로 정해지는 의사 난수 (LED 깜박임용) */
function hash(a: number, b: number, c = 0): number {
  let x = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2147483647);
  x = Math.imul(x ^ (x >>> 13), 1274126177);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const patCache = new Map<string, CanvasPattern | string>();

/** 4×4 베이어 디더 패턴. level 0~16 (c1이 차지하는 칸 수). c2가 null이면 투명. */
function dither(g: G, c1: string, c2: string | null, level: number): CanvasPattern | string {
  level = Math.max(0, Math.min(16, Math.round(level)));
  if (level >= 16) return c1;
  if (level <= 0 && c2) return c2;
  const key = `${c1}|${c2}|${level}`;
  let p = patCache.get(key);
  if (!p) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 4;
    const x = cv.getContext("2d")!;
    for (let i = 0; i < 16; i++) {
      const col = BAYER[i] < level ? c1 : c2;
      if (!col) continue;
      x.fillStyle = col;
      x.fillRect(i % 4, Math.floor(i / 4), 1, 1);
    }
    p = g.createPattern(cv, "repeat") ?? c1;
    patCache.set(key, p);
  }
  return p;
}

class Px {
  constructor(public g: G) {}
  r(x: number, y: number, w: number, h: number, c: string | CanvasPattern): void {
    this.g.fillStyle = c;
    this.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  p(x: number, y: number, c: string): void {
    this.r(x, y, 1, 1, c);
  }
  /** 디더로 섞은 사각형 */
  d(x: number, y: number, w: number, h: number, c1: string, c2: string | null, level: number): void {
    this.r(x, y, w, h, dither(this.g, c1, c2, level));
  }
  /** 테두리만 */
  box(x: number, y: number, w: number, h: number, c: string): void {
    this.r(x, y, w, 1, c);
    this.r(x, y + h - 1, w, 1, c);
    this.r(x, y, 1, h, c);
    this.r(x + w - 1, y, 1, h, c);
  }
  /** 위→아래 디더 그라데이션 (색 띠 사이를 베이어로 잇는다) */
  vgrad(x: number, y: number, w: number, h: number, cols: string[], steps = 4): void {
    const seg = cols.length - 1;
    const bandH = h / (seg * steps);
    let yy = y;
    for (let s = 0; s < seg; s++) {
      for (let k = 0; k < steps; k++) {
        const y1 = Math.round(y + (s * steps + k + 1) * bandH);
        this.d(x, yy, w, y1 - yy, cols[s + 1], cols[s], (k / steps) * 16 + 2);
        yy = y1;
      }
    }
  }
  circ(cx: number, cy: number, r: number, c: string | CanvasPattern): void {
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy) + r * 0.6));
      this.r(cx - w, cy + dy, w * 2 + 1, 1, c);
    }
  }
  ring(cx: number, cy: number, r: number, c: string): void {
    let x = r, y = 0, err = 1 - r;
    while (x >= y) {
      for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) this.p(cx + a, cy + b, c);
      y++;
      if (err < 0) err += 2 * y + 1;
      else {
        x--;
        err += 2 * (y - x) + 1;
      }
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: string): void {
    const n = Math.max(12, Math.round((rx + ry) * 3));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      this.p(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), c);
    }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: string): void {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; i < 400; i++) {
      this.p(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  /** 볼록 다각형 채우기 (스캔라인) */
  poly(pts: [number, number][], c: string | CanvasPattern): void {
    const ys = pts.map((q) => q[1]);
    const y0 = Math.ceil(Math.min(...ys)), y1 = Math.floor(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
      if (xs.length >= 2) {
        const a = Math.round(Math.min(...xs)), b = Math.round(Math.max(...xs));
        this.r(a, y, b - a + 1, 1, c);
      }
    }
  }
  /** 4방향 반짝임 ✦ */
  sparkle(x: number, y: number, c: string, big = false): void {
    this.p(x, y, c);
    const n = big ? 2 : 1;
    for (let k = 1; k <= n; k++) {
      this.p(x - k, y, c); this.p(x + k, y, c); this.p(x, y - k, c); this.p(x, y + k, c);
    }
  }
}

// ── 시대별 방 ─────────────────────────────────────────
// bg: 한 번만 그리는 정지 배경. fg: 매 프레임 그리는 움직이는 것.

interface Room {
  bg(p: Px, accent: string): void;
  fg(p: Px, t: number, accent: string): void;
}

/** 위에서 퍼지는 조명 (성긴 점) */
function cone(p: Px, x: number, top: number, bottom: number, c: string, density = 2): void {
  for (let y = top; y < bottom; y++) {
    const w = 3 + (y - top) * 0.32;
    p.d(x - w, y, w * 2, 1, c, null, density);
  }
}

/** 빛나는 바닥 반사 (Y2K): 바닥 위에 위쪽 그림을 뒤집어 흐리게 */
function reflect(p: Px, alpha: number): void {
  const g = p.g;
  const h = PH - HZ;
  g.save();
  g.globalAlpha = alpha;
  g.translate(0, HZ * 2);
  g.scale(1, -1);
  g.drawImage(g.canvas, 0, HZ - h, PW, h, 0, HZ - h, PW, h);
  g.restore();
}

const ROOMS: Room[] = [
  // 0 빅토리아풍 서재 (NES풍 갈색)
  {
    bg(p) {
      const rnd = rand(11);
      p.r(0, 0, PW, HZ, "#3b2314");
      for (let x = 2; x < PW; x += 6) p.r(x, 0, 1, 55, "#331e10");
      p.r(0, 55, PW, HZ - 55, "#2b190c");
      p.r(0, 54, PW, 2, "#6b4226");
      for (let x = 4; x < PW; x += 24) p.box(x, 60, 18, 24, "#5a3720");
      // 바닥 판자
      p.r(0, HZ, PW, PH - HZ, "#4a2e16");
      for (let y = HZ + 4, row = 0; y < PH; y += 5, row++) {
        p.r(0, y, PW, 1, "#382210");
        for (let x = (row % 2) * 12; x < PW; x += 24) p.r(x, y - 4, 1, 4, "#382210");
      }
      p.r(0, HZ, PW, 1, "#22140a");
      // 아치 창
      p.circ(29, 26, 17, "#6b4226");
      p.r(12, 26, 35, 28, "#6b4226");
      p.circ(29, 26, 15, "#0f1b3d");
      p.vgrad(14, 26, 31, 26, ["#0f1b3d", "#24386c"]);
      p.vgrad(16, 11, 27, 15, ["#0b1430", "#0f1b3d"]);
      p.circ(36, 20, 4, "#f4ecd0");
      p.circ(38, 19, 3, "#0f1b3d");
      p.r(28, 10, 2, 42, "#6b4226");
      p.r(14, 33, 31, 2, "#6b4226");
      // 책장
      p.r(58, 22, 42, 66, "#4a2d18");
      p.r(60, 24, 38, 62, "#1b0f08");
      const books = ["#a8302c", "#2c4a9c", "#3c7c3c", "#c89c3c", "#6c3c8c", "#2c8c8c", "#8c5c2c"];
      for (const shelf of [38, 54, 70, 86]) {
        let x = 61;
        while (x < 96) {
          const w = 2 + Math.floor(rnd() * 2);
          const h = 9 + Math.floor(rnd() * 5);
          if (x + w > 97) break;
          const col = books[Math.floor(rnd() * books.length)];
          p.r(x, shelf - h, w, h, col);
          p.r(x, shelf - h + 2, w, 1, "#e8c98a");
          x += w + (rnd() < 0.15 ? 2 : 0);
        }
        p.r(59, shelf, 40, 2, "#6b4226");
      }
      // 책상, 종이, 촛대
      p.r(102, 70, 28, 2, "#7a4c2a");
      p.r(103, 72, 26, 3, "#4a2d18");
      p.r(104, 75, 2, 13, "#3b2314");
      p.r(126, 75, 2, 13, "#3b2314");
      p.r(106, 68, 8, 2, "#efe3c2");
      p.r(116, 69, 7, 1, "#c8a050");
      p.r(118, 61, 3, 8, "#efe9d8");
      // 양탄자
      p.r(36, 98, 84, 12, "#6c2424");
      p.box(37, 99, 82, 10, "#b8543c");
      for (let x = 38; x < 118; x += 3) { p.p(x, 97, "#b8543c"); p.p(x, 110, "#b8543c"); }
    },
    fg(p, t) {
      const f = Math.floor(t * 8) % 3;
      p.circ(119, 58, f === 1 ? 9 : 8, dither(p.g, "#ffb347", null, 2));
      p.circ(119, 58, 4, dither(p.g, "#ffd070", null, 4));
      p.r(119, 59 - (f === 2 ? 1 : 0), 1, 2, "#ff9030");
      p.p(119, 58 - (f === 0 ? 1 : 0), "#ffe070");
      // 별 반짝임
      const stars = [[18, 16], [24, 30], [40, 32], [20, 44], [36, 46], [42, 12]];
      stars.forEach(([x, y], i) => {
        if (Math.floor(t * 1.5 + i * 1.7) % 3 !== 0) p.p(x, y, "#ffffff");
      });
    },
  },
  // 1 진공관 컴퓨터실 (NES풍 녹회색)
  {
    bg(p) {
      p.r(0, 0, PW, HZ, "#2c3529");
      p.r(0, 0, PW, 4, "#1c2219");
      cone(p, 42, 4, HZ, "#fff6d8", 2);
      cone(p, 108, 4, HZ, "#fff6d8", 2);
      for (let y = HZ; y < PH; y += 4) for (let x = 0; x < PW; x += 8) p.r(x + ((y / 4) % 2) * 4, y, 4, 4, "#3a4636");
      p.d(0, HZ, PW, PH - HZ, "#2b3428", null, 6);
      p.r(0, HZ, PW, 1, "#1c2219");
      for (let i = 0; i < 4; i++) {
        const x = 6 + i * 30;
        p.r(x + 2, HZ - 1, 24, 3, "#1a1f17");
        p.r(x, 28, 26, 60, "#5a6650");
        p.r(x, 28, 26, 2, "#7f8c72");
        p.r(x + 2, 31, 22, 47, "#232a1f");
        for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) p.r(x + 4 + c * 4, 33 + r * 6, 2, 4, "#3c4636");
        for (const dx of [7, 18]) {
          p.circ(x + dx, 83, 2, "#1b1f1a");
          p.p(x + dx, 81, "#d8dccf");
        }
      }
      // 패치 케이블
      const rnd = rand(21);
      const cables = ["#c0392b", "#e1b12c", "#2d7dd2", "#d8dccf"];
      for (let i = 0; i < 6; i++) {
        const x1 = 10 + rnd() * 90, x2 = x1 + 12 + rnd() * 24, sag = 6 + rnd() * 6;
        for (let k = 0; k <= 20; k++) {
          const u = k / 20;
          p.p(x1 + (x2 - x1) * u, 78 + Math.sin(u * Math.PI) * sag, cables[i % 4]);
        }
      }
    },
    fg(p, t) {
      const fr = Math.floor(t * 6);
      for (let i = 0; i < 4; i++) {
        const x = 6 + i * 30;
        for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
          const h = hash(i * 40 + r * 5 + c, fr);
          p.r(x + 4 + c * 4, 33 + r * 6, 2, 2, h < 0.1 ? "#7a4510" : h < 0.3 ? "#c87020" : "#ffb040");
        }
      }
    },
  },
  // 2 메인프레임실 (NES풍 청록)
  {
    bg(p) {
      p.r(0, 0, PW, HZ, "#18302e");
      cone(p, 50, 0, HZ, "#e8fff6", 2);
      cone(p, 112, 0, HZ, "#e8fff6", 2);
      for (let y = HZ; y < PH; y += 6) for (let x = 0; x < PW; x += 12) p.r(x + ((y / 6) % 2) * 6, y, 6, 6, "#23403c");
      p.d(0, HZ, PW, PH - HZ, "#122624", null, 5);
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 32;
        p.r(x + 2, HZ - 1, 26, 3, "#0a1514");
        p.r(x, 26, 28, 62, "#c8d0cc");
        p.r(x, 26, 28, 1, "#eef3f0");
        p.r(x + 3, 29, 22, 24, "#142220");
        p.r(x + 10, 47, 8, 5, "#0e1514");
        ["#d94b3c", "#3cb371", "#e1b12c", "#f0f0f0"].forEach((c, k) => p.r(x + 3 + k * 6, 56, 4, 2, c));
        p.r(x + 2, 61, 24, 25, "#8f9a96");
        for (let y = 64; y < 84; y += 3) p.r(x + 4, y, 20, 1, "#6f7a76");
      }
      p.r(104, HZ - 1, 26, 3, "#0a1514");
      p.r(102, 52, 26, 36, "#2c3a37");
      p.r(104, 54, 22, 18, "#0f1716");
      p.r(104, 74, 22, 1, "#4fae8a");
      for (let k = 0; k < 7; k++) p.r(105 + k * 3, 78, 2, 6, "#d8dcd6");
    },
    fg(p, t) {
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 32;
        [[x + 9, 39], [x + 19, 39]].forEach(([cx, cy], k) => {
          p.circ(cx, cy, 6, "#3a4644");
          p.ring(cx, cy, 6, "#9fb2ae");
          const a0 = t * (2 + ((i + k) % 3)) * (k ? -1 : 1);
          for (let s = 0; s < 3; s++) {
            const a = a0 + (s * Math.PI * 2) / 3;
            p.line(cx, cy, cx + Math.cos(a) * 5, cy + Math.sin(a) * 5, "#9fb2ae");
          }
          p.p(cx, cy, "#eef3f0");
        });
      }
      const fr = Math.floor(t * 3);
      const cols = ["#ff5e4d", "#ffb347", "#ffe066"];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
        p.r(105 + c * 3, 56 + r * 4, 2, 2, hash(r * 7 + c, fr + c) < 0.55 ? cols[(r + c) % 3] : "#2a1a14");
      }
    },
  },
  // 3 80년대 사무실 (EGA 16색 그대로)
  {
    bg(p) {
      p.vgrad(0, 0, PW, HZ, ["#000000", "#555555"], 3);
      p.r(0, HZ, PW, PH - HZ, "#AA5500");
      p.d(0, HZ, PW, PH - HZ, "#000000", null, 6);
      p.r(0, HZ, PW, 1, "#000000");
      // 블라인드 창과 밤의 도시
      p.r(8, 10, 56, 42, "#AAAAAA");
      p.r(10, 12, 52, 38, "#000000");
      const rnd = rand(31);
      for (let i = 0; i < 9; i++) {
        const bx = 10 + i * 6, bh = 8 + Math.floor(rnd() * 20);
        p.r(bx, 50 - bh, 5, bh, "#0000AA");
        for (let k = 0; k < 4; k++) if (rnd() < 0.6) p.p(bx + 1 + Math.floor(rnd() * 3), 50 - bh + 2 + Math.floor(rnd() * (bh - 3)), "#FFFF55");
      }
      for (let y = 13; y < 50; y += 3) p.r(10, y, 52, 1, "#555555");
      // 포스터
      p.r(72, 12, 22, 30, "#FFFFFF");
      p.r(74, 14, 18, 14, "#5555FF");
      p.circ(83, 21, 4, "#FFFF55");
      p.r(74, 31, 14, 2, "#555555");
      p.r(74, 35, 10, 2, "#555555");
      // 책상
      for (const [x, w] of [[4, 60], [66, 60]]) {
        p.r(x + 2, HZ - 1, w - 4, 3, "#000000");
        p.r(x, 68, w, 3, "#AA5500");
        p.r(x, 71, w, 1, "#000000");
        p.r(x + 2, 72, 2, 16, "#555555");
        p.r(x + w - 4, 72, 2, 16, "#555555");
      }
      for (const x of [10, 70, 98]) {
        p.r(x, 49, 20, 18, "#AAAAAA");
        p.box(x, 49, 20, 18, "#555555");
        p.r(x + 2, 51, 16, 11, "#000000");
        for (let k = 0; k < 3; k++) p.r(x + 3, 53 + k * 3, 5 + ((x + k * 7) % 8), 1, "#55FF55");
        p.r(x + 6, 66, 8, 2, "#555555");
        p.r(x - 1, 66, 22, 2, "#AAAAAA");
      }
      p.r(40, 64, 4, 4, "#000000");
      p.r(41, 64, 2, 1, "#AAAAAA");
      p.r(52, 63, 3, 5, "#AA0000");
    },
    fg(p, t) {
      if (Math.floor(t * 2) % 2 === 0) for (const x of [10, 70, 98]) p.r(x + 3, 62 - 1, 2, 1, "#55FF55");
    },
  },
  // 4 90년대 서버실 (VGA 보라)
  {
    bg(p) {
      p.r(0, 0, PW, HZ, "#2b2547");
      p.r(0, 5, PW, 3, "#4a4070");
      for (let x = 0; x < PW; x += 6) p.r(x, 5, 1, 5, "#4a4070");
      cone(p, 84, 8, HZ, "#fff6d8", 1);
      for (let y = HZ; y < PH; y += 5) for (let x = 0; x < PW; x += 10) p.r(x + ((y / 5) % 2) * 5, y, 5, 5, "#3a3160");
      p.d(0, HZ, PW, PH - HZ, "#221c3a", null, 5);
      for (const x of [6, 32]) {
        p.r(x + 1, HZ - 1, 22, 3, "#0f0e16");
        p.r(x, 26, 24, 62, "#1c1a26");
        p.r(x + 2, 28, 20, 58, "#0f0e16");
        for (let u = 0; u < 11; u++) {
          const y = 29 + u * 5;
          p.r(x + 3, y, 18, 4, u % 3 === 0 ? "#cfc6ad" : "#3a3850");
          if (u % 3 !== 0) p.r(x + 8, y + 2, 10, 1, "#55537a");
        }
      }
      // 책상, 체스판 CRT, 타워
      p.r(64, HZ - 1, 60, 3, "#151225");
      p.r(62, 70, 64, 3, "#4a4060");
      p.r(64, 73, 2, 15, "#2e2840");
      p.r(120, 73, 2, 15, "#2e2840");
      p.r(70, 42, 32, 27, "#c9c1a6");
      p.box(70, 42, 32, 27, "#8e8670");
      p.r(73, 45, 26, 19, "#101010");
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) p.r(74 + c * 3, 46 + r * 2, 3, 2, (r + c) % 2 ? "#3b5f3b" : "#d9e4c8");
      p.r(80, 47, 1, 1, "#111111");
      p.r(89, 58, 1, 1, "#ffffff");
      p.r(82, 69, 8, 1, "#a9a18a");
      p.r(104, 44, 14, 26, "#d4ccb2");
      p.box(104, 44, 14, 26, "#9e967e");
      p.r(106, 48, 10, 2, "#9e967e");
      p.r(106, 52, 10, 2, "#9e967e");
      p.r(74, 68, 26, 2, "#b8b097");
    },
    fg(p, t) {
      const fr = Math.floor(t * 4);
      for (const x of [6, 32]) for (let u = 0; u < 11; u++) {
        const y = 29 + u * 5;
        p.r(x + 4, y + 1, 2, 2, hash(x + u, fr) < 0.5 ? (u % 2 ? "#5dff7a" : "#ffb347") : "#2a2838");
      }
      p.p(109, 66, Math.floor(t * 3) % 2 ? "#5dff7a" : "#1a3a20");
    },
  },
  // 5 2010년대 딥러닝 책상 (Y2K 파스텔 네온)
  {
    bg(p) {
      p.vgrad(0, 0, PW, HZ, ["#1c0f2a", "#3a1f52"], 4);
      p.r(0, HZ, PW, PH - HZ, "#24122f");
      p.d(0, HZ, PW, PH - HZ, "#3a1f52", null, 3);
      // 선반과 소품
      p.r(8, 32, 48, 2, "#5a3a72");
      p.r(12, 24, 5, 8, "#ffd36f");
      p.r(20, 26, 12, 6, "#6fe3ff");
      p.circ(42, 28, 4, "#7cd67c");
      // 책상
      p.r(4, 72, 124, 3, "#4a2a5e");
      p.r(4, 75, 124, 2, "#2a1638");
      p.r(8, 77, 3, 11, "#2a1638");
      p.r(121, 77, 3, 11, "#2a1638");
      // 모니터 3대
      const mon = (x: number) => {
        p.r(x, 48, 30, 20, "#101018");
        p.r(x + 2, 50, 26, 15, "#121a2c");
        p.r(x + 13, 68, 4, 3, "#2a2a34");
        p.r(x + 9, 71, 12, 1, "#2a2a34");
      };
      mon(8); mon(40); mon(72);
      let py = 52;
      for (let i = 0; i < 24; i++) {
        const y = 52 + Math.round(11 * (1 - Math.exp(-i / 6)));
        p.p(11 + i, y, "#ff6fae");
        if (i && Math.abs(y - py) > 1) p.p(11 + i, y - 1, "#ff6fae");
        py = y;
      }
      const rnd = rand(51);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) p.r(43 + c * 4, 51 + r * 4, 3, 3, ["#ff6fae", "#b48cff", "#6fe3ff", "#ffd36f", "#7cd67c"][Math.floor(rnd() * 5)]);
      for (let k = 0; k < 5; k++) p.r(75 + (k % 2) * 3, 52 + k * 3, 6 + Math.floor(rnd() * 14), 1, ["#7fdbca", "#c792ea", "#ffcb6b"][k % 3]);
      // GPU 타워
      p.r(104, 40, 22, 32, "#0d0a10");
      p.r(106, 42, 18, 28, "#1a1322");
      p.box(106, 42, 18, 28, "#3a2a4a");
      p.r(26, 70, 40, 2, "#1a1a22");
    },
    fg(p, t) {
      // RGB 띠: 색이 흘러간다
      const cols = ["#ff6fae", "#b48cff", "#6fe3ff"];
      for (let x = 0; x < PW; x += 8) p.r(x, 14, 8, 2, cols[(Math.floor(x / 8) + Math.floor(t * 4)) % 3]);
      p.d(0, 16, PW, 3, cols[Math.floor(t * 4) % 3], null, 3);
      for (const cy of [50, 62]) {
        p.ring(115, cy, 5, cols[(Math.floor(t * 4) + cy) % 3]);
        const a0 = t * 9;
        for (let s = 0; s < 3; s++) {
          const a = a0 + (s * Math.PI * 2) / 3;
          p.line(115, cy, 115 + Math.cos(a) * 4, cy + Math.sin(a) * 4, "#6a5a7a");
        }
      }
      p.r(108, 68, 14, 1, cols[Math.floor(t * 4 + 1) % 3]);
      // Y2K 반짝이
      [[30, 8], [70, 22], [140, 10], [96, 30]].forEach(([x, y], i) => {
        const ph = Math.floor(t * 3 + i * 2) % 4;
        if (ph < 2) p.sparkle(x, y, "#ffe9ff", ph === 0);
      });
    },
  },
  // 6 작은 데이터센터 (Y2K 크롬 + 반사 바닥)
  {
    bg(p) {
      p.vgrad(0, 0, PW, HZ, ["#1b2a40", "#3a5578"], 4);
      p.r(0, 18, PW, 2, "#d8e2ee");
      p.r(0, 20, PW, 1, "#7d93ad");
      for (let i = 0; i < 4; i++) {
        const x = 6 + i * 30;
        p.r(x, 24, 26, 64, "#b9c6d3");
        p.r(x, 24, 1, 64, "#eef3f8");
        p.r(x + 25, 24, 1, 64, "#7d8a98");
        p.r(x + 2, 26, 22, 60, "#20262e");
        for (let u = 0; u < 11; u++) {
          p.r(x + 3, 28 + u * 5, 20, 4, "#2c343e");
          p.r(x + 14, 29 + u * 5, 7, 1, "#3c4652");
        }
      }
      p.vgrad(0, HZ, PW, PH - HZ, ["#5d7590", "#1d2b40"], 3);
      reflect(p, 0.28);
      p.r(0, HZ, PW, 1, "#eef3f8");
    },
    fg(p, t) {
      const fr = Math.floor(t * 4);
      for (let i = 0; i < 4; i++) for (let u = 0; u < 11; u++) for (let k = 0; k < 2; k++) {
        const x = 6 + i * 30 + 5 + k * 3, y = 29 + u * 5;
        const h = hash(i * 50 + u * 3 + k, Math.floor((fr + i + k) / 2));
        p.r(x, y, 1, 2, h < 0.6 ? (h < 0.45 ? "#4db8ff" : "#3cff8a") : "#1a2028");
      }
      [[160, 12], [24, 10], [100, 8]].forEach(([x, y], i) => {
        if (Math.floor(t * 2 + i) % 3 === 0) p.sparkle(x, y, "#ffffff", true);
      });
    },
  },
  // 7 챗봇 데이터센터 통로 (Y2K 아쿠아)
  aisleRoom({ wall: ["#05140f", "#0f3a30"], face: ["#1d4a42", "#163a34"], top: "#7fe8c9", led: ["#7fffd4", "#10a37f", "#6fe3ff"], floor: ["#0d3a30", "#05140f"], light: "#e8fff6", glossy: true }),
  // 8 추론과 에이전트 (브루탈 시작: 종이 흰색 + 검정 + 주황)
  aisleRoom({ wall: ["#f2f2ed", "#f2f2ed"], face: ["#111111", "#000000"], top: "#f2f2ed", led: ["#ff4a1c", "#f2f2ed"], floor: ["#d8d8d0", "#f2f2ed"], light: "#000000", pipes: "#ff4a1c", holo: true, mono: true }),
  // 9 기가와트 캠퍼스 (1비트 밤 + 전기 파랑)
  {
    bg(p) {
      p.vgrad(0, 0, PW, HZ - 12, ["#000000", "#000000", "#3a3a3a"], 4);
      p.circ(30, 16, 6, "#f2f2ed");
      for (const x of [8, 58]) {
        p.line(x, 64, x + 4, 40, "#f2f2ed");
        p.line(x + 8, 64, x + 4, 40, "#f2f2ed");
        p.r(x, 46, 9, 1, "#f2f2ed");
        p.r(x - 2, 42, 13, 1, "#f2f2ed");
      }
      for (let x = 0; x < PW; x++) {
        const y = 42 + Math.round(Math.abs(Math.sin((x - 12) / 56 * Math.PI)) * 4);
        if (x % 2 === 0) p.p(x, y, "#888888");
      }
      for (const x of [78, 98]) {
        p.poly([[x, 72], [x + 3, 56], [x + 13, 56], [x + 16, 72]], "#f2f2ed");
        p.d(x + 2, 58, 12, 14, "#000000", null, 4);
      }
      for (const [x, w, h] of [[0, 34, 16], [36, 30, 22], [134, 58, 20]]) {
        p.r(x, HZ - 12 - h, w, h, "#000000");
        p.box(x, HZ - 12 - h, w, h, "#f2f2ed");
        for (let row = 0; row < Math.floor((h - 4) / 4); row++) p.r(x + 3, HZ - 12 - h + 3 + row * 4, w - 6, 1, row % 2 ? "#2b2bff" : "#f2f2ed");
      }
      p.r(0, HZ - 12, PW, 12, "#000000");
      p.r(0, HZ - 12, PW, 1, "#f2f2ed");
      // 유리벽 창틀
      for (let x = 0; x <= PW; x += 32) p.r(x, 0, 2, HZ, "#1a1a1a");
      p.r(0, HZ, PW, PH - HZ, "#000000");
      p.d(0, HZ, PW, PH - HZ, "#3a3a3a", null, 4);
      p.r(0, HZ, PW, 1, "#f2f2ed");
    },
    fg(p, t) {
      for (let i = 0; i < 24; i++) {
        const x = Math.floor(hash(i, 1) * PW), y = Math.floor(hash(i, 2) * 36);
        if (Math.floor(t * 2 + i) % 4 !== 0) p.p(x, y, "#f2f2ed");
      }
      for (const x of [86, 106]) for (let k = 0; k < 3; k++) {
        const ph = ((t * 0.5 + k / 3) % 1);
        p.d(x - 5 - ph * 4, 50 - ph * 16 - 3, 10 + ph * 8, 6, "#f2f2ed", null, 8 - ph * 8);
      }
    },
  },
  // 10 우주 (거의 순수한 흑백 + 노랑)
  {
    bg(p) {
      p.r(0, 0, PW, PH, "#000000");
      // 행성 가장자리
      for (let y = 84; y < PH; y++) {
        const dy = (y - 140) / 58;
        const half = Math.sqrt(Math.max(0, 1 - dy * dy)) * 110;
        p.d(-40, y, 40 + half, 1, "#f2f2ed", null, Math.min(10, (y - 84) / 3));
      }
      p.circ(70, 46, 14, "#ffe600");
      p.d(50, 26, 40, 40, "#ffe600", null, 2);
      p.circ(70, 46, 9, "#f2f2ed");
    },
    fg(p, t) {
      for (let i = 0; i < 60; i++) {
        const x = Math.floor(hash(i, 7) * PW), y = Math.floor(hash(i, 8) * 80);
        if ((x - 70) ** 2 + (y - 46) ** 2 < 400) continue;
        if (Math.floor(t * 1.5 + i * 0.7) % 5 !== 0) p.p(x, y, "#f2f2ed");
      }
      // 다이슨 스웜
      for (const [rx, ry, n, sp] of [[30, 9, 14, 0.25], [44, 14, 20, -0.16]] as const) {
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + t * sp;
          const x = 70 + Math.cos(a) * rx, y = 46 + Math.sin(a) * ry;
          if (Math.sin(a) < 0 && (x - 70) ** 2 + (y - 46) ** 2 < 200) continue;
          p.r(x, y, 2, 1, "#f2f2ed");
        }
      }
    },
  },
];

interface AisleSpec {
  wall: [string, string];
  face: [string, string];
  top: string;
  led: string[];
  floor: [string, string];
  light: string;
  glossy?: boolean;
  pipes?: string;
  holo?: boolean;
  mono?: boolean;
}

/** 원근 데이터센터 통로 */
function aisleRoom(o: AisleSpec): Room {
  const vx = 80, vy = 46;
  const n = 6;
  const faces: { pts: [number, number][]; k: number; side: number; i: number }[] = [];
  for (const side of [-1, 1]) {
    for (let i = n - 1; i >= 0; i--) {
      const k0 = (1 - i / n) ** 1.5, k1 = (1 - (i + 1) / n) ** 1.5;
      const xa = vx + side * (110 * k0 + 6), xb = vx + side * (110 * k1 + 6);
      const t0 = vy - 44 * k0 - 2, t1 = vy - 44 * k1 - 2;
      const b0 = vy + 42 * k0 + 2, b1 = vy + 42 * k1 + 2;
      faces.push({ pts: [[xa, t0], [xb, t1], [xb, b1], [xa, b0]], k: k0, side, i });
    }
  }
  return {
    bg(p) {
      p.vgrad(0, 0, PW, HZ, o.mono ? [o.wall[0], o.wall[1]] : [o.wall[0], o.wall[1]], 3);
      p.vgrad(0, HZ, PW, PH - HZ, [o.floor[0], o.floor[1]], 3);
      // 바닥은 소실점으로 모이는 판
      p.poly([[vx - 8, vy + 2], [vx + 8, vy + 2], [PW + 40, PH], [-40, PH]], o.mono ? dither(p.g, "#000000", null, 4) : o.floor[0]);
      for (let k = 1; k < 8; k++) {
        const u = (k / 8) ** 2;
        const y = Math.round(vy + 2 + (PH - vy - 2) * u);
        p.r(vx - 8 - (48 + 8) * u * 2, y, (8 + (48 + 8) * u * 2) * 2, 1, o.mono ? "#000000" : o.wall[1]);
      }
      // 천장 조명
      for (let k = 0; k < 6; k++) {
        const u = (1 - k / 6) ** 1.6;
        const y = Math.round(vy - 40 * u);
        p.r(vx - 3 - 30 * u, y, (3 + 30 * u) * 2, 1, o.light);
      }
      if (o.pipes) {
        for (const off of [-1, 1]) {
          p.line(vx + off * 100, 0, vx + off * 4, vy - 6, o.pipes);
          p.line(vx + off * 100, 1, vx + off * 4, vy - 5, o.pipes);
          p.line(vx + off * 86, 0, vx + off * 3, vy - 6, "#000000");
        }
      }
      for (const f of faces) {
        p.poly(f.pts, f.i % 2 ? o.face[0] : o.face[1]);
        const [[xa, ta], [xb, tb]] = f.pts;
        p.line(xa, ta, xb, tb, o.top);
        if (o.mono) p.line(f.pts[3][0], f.pts[3][1], f.pts[2][0], f.pts[2][1], "#f2f2ed");
      }
      if (o.holo) {
        for (const [x, y, w, h] of [[14, 30, 26, 18], [48, 18, 20, 13]]) {
          p.r(x, y, w, h, "#000000");
          p.box(x, y, w, h, "#ff4a1c");
          for (let k = 0; k < 3; k++) p.r(x + 3, y + 3 + k * Math.floor(h / 4), 6 + ((x + k * 5) % (w - 8)), 1, "#f2f2ed");
        }
      }
      if (o.glossy) reflect(p, 0.22);
    },
    fg(p, t) {
      const fr = Math.floor(t * 3);
      for (const f of faces) {
        const [[xa, ta], [xb, tb], [, bb], [, ba]] = f.pts;
        const rows = 5;
        for (let r = 0; r < rows; r++) for (let c = 0; c < 3; c++) {
          const u = (c + 0.5) / 3, v = (r + 0.5) / rows;
          const x = xa + (xb - xa) * u;
          const y = ta + (tb - ta) * u + ((ba - ta) + ((bb - tb) - (ba - ta)) * u) * v;
          const h = hash(f.side * 100 + f.i * 20 + r * 3 + c, Math.floor((fr + r + c) / 2));
          if (h < 0.6) p.r(x, y, f.k > 0.5 ? 2 : 1, 1, o.led[Math.floor(h * 10) % o.led.length]);
        }
      }
    },
  };
}

// ── AI 스프라이트 (40×40, 시대별) ─────────────────────

interface AvatarCtx {
  t: number;
  blink: boolean;
  happy: boolean;
  accent: string;
}

/** 눈 한 쌍. blink면 가는 선, happy면 ^ ^ */
function eyes(p: Px, x1: number, x2: number, y: number, w: number, h: number, c: string, a: AvatarCtx): void {
  for (const x of [x1, x2]) {
    if (a.blink) p.r(x, y + Math.floor(h / 2), w, 1, c);
    else if (a.happy) {
      p.p(x, y + 1, c); p.r(x + 1, y, Math.max(1, w - 2), 1, c); p.p(x + w - 1, y + 1, c);
    } else p.r(x, y, w, h, c);
  }
}

function gear(p: Px, cx: number, cy: number, r: number, teeth: number, rot: number, c: string, hub: string): void {
  p.circ(cx, cy, r, c);
  for (let i = 0; i < teeth; i++) {
    const a = rot + (i / teeth) * Math.PI * 2;
    p.r(cx + Math.cos(a) * (r + 1) - 1, cy + Math.sin(a) * (r + 1) - 1, 2, 2, c);
  }
  p.circ(cx, cy, Math.max(1, Math.floor(r / 3)), hub);
}

const AVATARS: ((p: Px, a: AvatarCtx) => void)[] = [
  // 0 태엽 자동인형
  (p, a) => {
    gear(p, 7, 9, 5, 8, a.t * 0.8, "#b08d57", "#3a2a18");
    gear(p, 33, 8, 4, 7, -a.t * 1.1, "#b08d57", "#3a2a18");
    p.circ(20, 22, 15, "#5a3d1e");
    p.circ(20, 22, 14, "#c8a050");
    p.circ(19, 21, 11, "#e2bf6e");
    p.circ(20, 22, 10, "#2a1a0a");
    for (let i = 0; i < 10; i++) { const t = (i / 10) * Math.PI * 2; p.p(20 + Math.round(Math.cos(t) * 12.5), 22 + Math.round(Math.sin(t) * 12.5), "#6b4a20"); }
    p.r(10, 13, 2, 2, "#f6e2a8");
    eyes(p, 14, 23, 18, 4, 3, "#ffb347", a);
    p.r(16, 27, 9, 1, "#ffb347");
    p.p(15, 26, "#ffb347"); p.p(25, 26, "#ffb347");
  },
  // 1 진공관
  (p, a) => {
    p.r(12, 30, 16, 6, "#9aa6ab");
    p.r(12, 30, 16, 1, "#e9eef0");
    p.r(12, 33, 16, 1, "#6d777b");
    for (const x of [14, 19, 24]) p.r(x, 36, 2, 3, "#777777");
    p.circ(20, 12, 8, "#cfe3c4");
    p.r(12, 12, 17, 18, "#cfe3c4");
    p.circ(20, 12, 7, "#1d2a1d");
    p.r(13, 12, 15, 18, "#1d2a1d");
    p.d(13, 5, 15, 25, a.accent, null, 4);
    const fl = Math.floor(a.t * 10) % 2 ? "#ffcf6a" : "#ff9a3a";
    for (let k = 0; k < 5; k++) p.line(15 + k * 2.5, k % 2 ? 26 : 20, 17.5 + k * 2.5, k % 2 ? 20 : 26, fl);
    eyes(p, 16, 22, 11, 2, 3, "#ffcf6a", a);
    p.r(14, 6, 1, 4, "#ffffff");
  },
  // 2 메인프레임 콘솔
  (p, a) => {
    p.r(5, 7, 30, 30, "#5d686d");
    p.r(6, 8, 28, 28, "#c8d0cc");
    p.r(6, 8, 28, 1, "#eef3f0");
    p.r(9, 11, 22, 14, "#142220");
    if (a.blink) { p.r(12, 18, 5, 1, "#ff5e4d"); p.r(23, 18, 5, 1, "#ff5e4d"); }
    else {
      p.circ(14, 18, 2, a.happy ? "#ffb347" : "#ff5e4d");
      p.circ(25, 18, 2, a.happy ? "#ffb347" : "#ff5e4d");
      p.p(13, 17, "#ffd0c8"); p.p(24, 17, "#ffd0c8");
    }
    const fr = Math.floor(a.t * 4);
    for (let k = 0; k < 6; k++) p.r(9 + k * 4, 28, 2, 2, hash(k, fr) < 0.6 ? ["#ffb347", "#3cb371", "#ff5e4d"][k % 3] : "#4a5450");
    p.r(9, 32, 22, 1, "#8f9a96");
  },
  // 3 베이지 단말기 (EGA)
  (p, a) => {
    p.r(7, 3, 26, 30, "#555555");
    p.r(8, 4, 24, 28, "#AAAAAA");
    p.r(8, 4, 24, 1, "#FFFFFF");
    p.r(11, 7, 18, 15, "#000000");
    eyes(p, 14, 22, 11, 3, 3, "#55FF55", a);
    p.r(16, 18, 8, 1, "#55FF55");
    p.p(15, 17, "#55FF55"); p.p(24, 17, "#55FF55");
    p.r(20, 26, 9, 1, "#555555");
    p.r(9, 33, 22, 4, "#AAAAAA");
    p.r(9, 36, 22, 1, "#555555");
  },
  // 4 CRT 모니터
  (p, a) => {
    p.r(3, 5, 34, 27, "#8e86a6");
    p.r(4, 6, 32, 25, "#d6d0e4");
    p.r(4, 6, 32, 1, "#ffffff");
    p.r(7, 9, 26, 19, "#0a0a14");
    p.d(7, 9, 26, 19, a.accent, null, 2);
    eyes(p, 11, 24, 13, 5, 5, a.accent, a);
    p.r(15, 23, 10, 2, a.accent);
    p.r(16, 32, 8, 3, "#b8b2c8");
    p.r(10, 35, 20, 2, "#c9c3d8");
  },
  // 5 카메라 렌즈 눈
  (p, a) => {
    p.circ(20, 20, 17, "#15161b");
    p.circ(20, 20, 16, "#2a2d35");
    p.ring(20, 20, 14, "#4a4f5a");
    for (let s = 0; s < 6; s++) {
      const ang = a.t * 0.6 + (s * Math.PI) / 3;
      p.line(20 + Math.cos(ang) * 10, 20 + Math.sin(ang) * 10, 20 + Math.cos(ang + 0.9) * 14, 20 + Math.sin(ang + 0.9) * 14, "#1e2027");
    }
    if (a.blink) { p.r(10, 19, 21, 2, "#000000"); return; }
    p.circ(20, 20, 9, a.accent);
    p.ring(20, 20, 7, "#ffffff");
    p.circ(20, 20, 5, "#3a0d1d");
    p.circ(20, 20, 2, "#0a0508");
    p.r(15, 15, 2, 2, "#ffffff");
  },
  // 6 칩 로봇
  (p, a) => {
    for (let k = 0; k < 5; k++) {
      p.r(11 + k * 4, 4, 2, 4, "#c9cdd3"); p.r(11 + k * 4, 32, 2, 4, "#c9cdd3");
      p.r(4, 11 + k * 4, 4, 2, "#c9cdd3"); p.r(32, 11 + k * 4, 4, 2, "#c9cdd3");
    }
    p.r(8, 8, 24, 24, "#15181e");
    p.r(9, 9, 22, 22, "#3a3f4a");
    p.r(9, 9, 22, 1, "#5a6070");
    p.r(12, 12, 16, 16, "#111418");
    p.box(12, 12, 16, 16, a.accent);
    eyes(p, 15, 22, 16, 3, 5, a.accent, a);
    p.r(17, 24, 6, 1, a.accent);
  },
  // 7 챗봇 구체
  (p, a) => {
    p.poly([[9, 30], [6, 38], [16, 33]], "#0a6e55");
    p.circ(20, 19, 16, "#064534");
    p.circ(20, 19, 15, "#0a6e55");
    p.circ(18, 17, 13, a.accent);
    p.circ(16, 14, 8, "#4fd1ad");
    p.d(8, 4, 24, 30, "#0a6e55", null, 2);
    p.r(11, 9, 3, 2, "#ffffff");
    p.r(10, 11, 2, 2, "#ffffff");
    eyes(p, 14, 23, 15, 3, 5, "#04120d", a);
    p.r(16, 25, 8, 1, "#04120d");
    p.p(15, 24, "#04120d"); p.p(24, 24, "#04120d");
  },
  // 8 에이전트 로봇 (브루탈: 흑백 + 주황)
  (p, a) => {
    for (let k = 0; k < 3; k++) {
      const ang = a.t * 0.9 + (k * Math.PI * 2) / 3;
      p.r(20 + Math.cos(ang) * 21 - 1, 20 + Math.sin(ang) * 21 - 1, 3, 3, ["#ff4a1c", "#000000", "#ff4a1c"][k]);
    }
    p.r(3, 15, 4, 10, "#000000");
    p.r(33, 15, 4, 10, "#000000");
    p.r(6, 6, 28, 28, "#000000");
    p.r(8, 8, 24, 24, "#f2f2ed");
    p.r(10, 15, 20, 10, "#000000");
    eyes(p, 13, 23, 17, 4, 5, "#ff4a1c", a);
    p.r(5, 25, 2, 7, "#000000");
    p.r(5, 31, 8, 2, "#000000");
    p.r(12, 30, 2, 2, "#ff4a1c");
  },
  // 9 신경망 구체 (흰 선 와이어프레임)
  (p, a) => {
    p.circ(20, 20, 17, "#000000");
    p.ring(20, 20, 17, "#f2f2ed");
    for (let k = 0; k < 3; k++) {
      const rx = Math.abs(Math.cos(a.t * 0.8 + (k * Math.PI) / 3)) * 17;
      p.ellipse(20, 20, rx, 17, k === 0 ? "#2b2bff" : "#f2f2ed");
    }
    p.ellipse(20, 20, 17, 5, "#f2f2ed");
    p.circ(20, 20, 7, "#000000");
    p.ring(20, 20, 7, "#f2f2ed");
    eyes(p, 17, 22, 18, 2, 4, "#f2f2ed", a);
  },
  // 10 빛의 존재
  (p, a) => {
    for (let k = 0; k < 12; k++) {
      const ang = a.t * 0.4 + (k / 12) * Math.PI * 2;
      p.line(20 + Math.cos(ang) * 12, 20 + Math.sin(ang) * 12, 20 + Math.cos(ang) * (k % 2 ? 16 : 19), 20 + Math.sin(ang) * (k % 2 ? 16 : 19), k % 2 ? "#f2f2ed" : "#ffe600");
    }
    p.circ(20, 20, 10, "#ffe600");
    p.circ(20, 20, 8, "#f2f2ed");
    eyes(p, 16, 22, 18, 2, 4, "#000000", a);
  },
];

// ── 그리기 ────────────────────────────────────────────

const bgCache = new Map<string, HTMLCanvasElement>();

function background(era: number, accent: string): HTMLCanvasElement {
  const key = `${era}|${accent}`;
  let cv = bgCache.get(key);
  if (!cv) {
    cv = document.createElement("canvas");
    cv.width = PW;
    cv.height = PH;
    const g = cv.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    (ROOMS[era] ?? ROOMS[ROOMS.length - 1]).bg(new Px(g), accent);
    bgCache.set(key, cv);
  }
  return cv;
}

/** AI 스프라이트를 (ox, oy)에 그린다 */
export function drawAvatar(g: G, era: number, accent: string, ox: number, oy: number, t: number, opts: { happy?: boolean; blinkOk?: boolean } = {}): void {
  g.save();
  g.translate(ox, oy);
  const blink = opts.blinkOk !== false && t % 4.2 < 0.16;
  (AVATARS[era] ?? AVATARS[AVATARS.length - 1])(new Px(g), { t, blink, happy: !!opts.happy, accent });
  g.restore();
}

/** 장면 한 프레임 */
export function drawScene(g: G, era: number, accent: string, f: SceneFlags): void {
  g.imageSmoothingEnabled = false;
  g.drawImage(background(era, accent), 0, 0);
  const p = new Px(g);
  (ROOMS[era] ?? ROOMS[ROOMS.length - 1]).fg(p, f.t, accent);
  // AI: 바닥 그림자 + 계단식으로 둥실
  const bob = Math.round(Math.sin(f.t * 1.8) * 1.5);
  const dark = era >= 8 && era !== 9 ? "#000000" : "#000000";
  p.d(AV.x + 8, HZ - 3, 24, 3, dark, null, era === 8 ? 10 : 8);
  if (f.thinking) {
    for (let k = 0; k < 8; k++) {
      const a = f.t * 2.4 + (k / 8) * Math.PI * 2;
      p.r(AV.x + 20 + Math.cos(a) * 24 - 1, AV.y + 20 + bob + Math.sin(a) * 22 - 1, 2, 2, k % 2 ? accent : "#ffffff");
    }
  }
  drawAvatar(g, era, accent, AV.x, AV.y + bob - (f.chomp > 0 ? 1 : 0), f.t, { happy: f.chomp > 0 });
  // 보스전: 테두리가 빨갛게 깜박 / 탈옥: 줄이 어긋나는 글리치
  if (f.fight && Math.floor(f.t * 3) % 2 === 0) {
    p.d(0, 0, PW, 3, "#ff2d2d", null, 10);
    p.d(0, PH - 3, PW, 3, "#ff2d2d", null, 10);
    p.d(0, 0, 3, PH, "#ff2d2d", null, 10);
    p.d(PW - 3, 0, 3, PH, "#ff2d2d", null, 10);
  }
  if (f.breach) {
    const fr = Math.floor(f.t * 8);
    for (let k = 0; k < 4; k++) {
      const y = Math.floor(hash(k, fr) * PH);
      const h = 2 + Math.floor(hash(k, fr, 1) * 5);
      const dx = Math.floor((hash(k, fr, 2) - 0.5) * 10);
      g.drawImage(g.canvas, 0, y, PW, h, dx, y, PW, h);
      p.d(0, y, PW, 1, "#ff2d55", null, 6);
    }
  }
}

/** 정지 그림 (창·도감 머리). 캐시된 data URL. */
const stillCache = new Map<string, string>();
export function sceneStill(era: number, accent: string, withAvatar = true): string {
  const key = `${era}|${accent}|${withAvatar}`;
  let url = stillCache.get(key);
  if (!url) {
    const cv = document.createElement("canvas");
    cv.width = PW;
    cv.height = PH;
    const g = cv.getContext("2d")!;
    drawScene(g, era, accent, { t: 0.5, thinking: false, chomp: 0, fight: false, breach: false });
    if (!withAvatar) {
      g.drawImage(background(era, accent), AV.x - 8, 0, 56, PH, AV.x - 8, 0, 56, PH);
      (ROOMS[era] ?? ROOMS[0]).fg(new Px(g), 0.5, accent);
    }
    url = cv.toDataURL();
    stillCache.set(key, url);
  }
  return url;
}

/** AI 얼굴만 (연표 썸네일) */
export function avatarStill(era: number, accent: string): string {
  const key = `av|${era}|${accent}`;
  let url = stillCache.get(key);
  if (!url) {
    const cv = document.createElement("canvas");
    cv.width = 40;
    cv.height = 40;
    drawAvatar(cv.getContext("2d")!, era, accent, 0, 0, 0.5, { blinkOk: false });
    url = cv.toDataURL();
    stillCache.set(key, url);
  }
  return url;
}

/** 이모지를 16×16 도트 아이콘으로 */
const emojiCache = new Map<string, string>();
export function pixelEmoji(emoji: string, res = 16): string {
  const key = `${emoji}|${res}`;
  let url = emojiCache.get(key);
  if (!url) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = res;
    const g = cv.getContext("2d")!;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `${Math.round(res * 0.86)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    g.fillText(emoji, res / 2, res / 2 + res * 0.06);
    // 반투명 가장자리를 잘라 또렷한 도트로
    const img = g.getImageData(0, 0, res, res);
    for (let i = 3; i < img.data.length; i += 4) img.data[i] = img.data[i] > 110 ? 255 : 0;
    g.putImageData(img, 0, 0);
    url = cv.toDataURL();
    emojiCache.set(key, url);
  }
  return url;
}
