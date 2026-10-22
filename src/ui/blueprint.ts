// 청사진 그림체: 도트로 그린 장면을 '설계 도면'으로 옮겨 그린다.
// 색 경계를 찾아 선만 남기고, 종이(시대마다 다름) 위에 모눈을 깐다.
// 적(질문 몬스터)은 수정펜 색, 보스는 아직 그리는 중인 점선으로 그린다 (완성될수록 쓰러진다).

/** 도면 종이: 0~3 청사진 · 4~6 트레이싱지 · 7~9 CAD 화면 · 10 공장 도면 */
export type Paper = "blue" | "trace" | "cad" | "factory";

export function paperOf(era: number): Paper {
  return era <= 3 ? "blue" : era <= 6 ? "trace" : era <= 9 ? "cad" : "factory";
}

interface Ink {
  bg: string;
  grid: string;
  major: string;
  line: string;
  red: string;
  /** 동전처럼 원래 색을 살려 둘 신호색 */
  gold: string;
}

export const PAPERS: Record<Paper, Ink> = {
  blue: { bg: "#1d4f7a", grid: "#245a87", major: "#2f6896", line: "#e8f1f8", red: "#f2b98a", gold: "#f2d58a" },
  trace: { bg: "#e4e6e1", grid: "#d8dbd5", major: "#c8ccc5", line: "#2b3036", red: "#983e23", gold: "#8a6400" },
  cad: { bg: "#121815", grid: "#18221d", major: "#203128", line: "#8fd6a8", red: "#f0a080", gold: "#e0d08a" },
  factory: { bg: "#2b2c30", grid: "#323338", major: "#3e3f45", line: "#ece8e0", red: "#e09a5a", gold: "#e6cf8a" },
};

let mode: Paper | null = null;

/** 청사진으로 그릴 종이 (null이면 도트 그대로) */
export function setBlueprint(p: Paper | null): void {
  mode = p;
}
export function blueprintMode(): Paper | null {
  return mode;
}

export interface Box { x: number; y: number; w: number; h: number }

const rgbCache = new Map<string, [number, number, number]>();
function rgb(hex: string): [number, number, number] {
  let c = rgbCache.get(hex);
  if (!c) {
    const n = parseInt(hex.slice(1), 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, c);
  }
  return c;
}

function alloc(n: number) {
  return { n, ch: new Float32Array(n * 4), tmp: new Float32Array(n * 4), bl: new Float32Array(n * 4), gx: new Float32Array(n), gy: new Float32Array(n), mag: new Float32Array(n), edge: new Uint8Array(n) };
}
let buf = alloc(0);

/** 원래 그림에서 색을 살려 둘 신호: 동전 */
const COIN = [0xff, 0xd2, 0x3f];

/**
 * 캔버스에 그려진 도트 그림을 도면 선화로 바꾼다.
 * transparent: 배경 없는 그림(얼굴 썸네일 등) — 빈 곳은 비워 두고 모눈도 깔지 않는다.
 */
export function inkify(g: CanvasRenderingContext2D, o: { marks?: Box[]; boss?: Box & { done: number }; focus?: Box[]; transparent?: boolean } = {}): void {
  if (!mode) return;
  const ink = PAPERS[mode];
  const W = g.canvas.width, H = g.canvas.height;
  if (!W || !H) return;
  const img = g.getImageData(0, 0, W, H);
  const d = img.data;
  const n = W * H;
  // 매 프레임 부르므로 버퍼는 다시 쓴다
  if (buf.n !== n) buf = alloc(n);
  const { ch, tmp, bl, gx, gy, mag } = buf;
  // 디더 점: 상하좌우가 모두 같은 색인데 혼자 다르면 둘의 평균으로 (바둑판 무늬가 고른 면이 된다)
  const px = new Uint32Array(d.buffer, d.byteOffset, n);
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3] / 255;
    ch[i * 4] = d[i * 4] * a;
    ch[i * 4 + 1] = d[i * 4 + 1] * a;
    ch[i * 4 + 2] = d[i * 4 + 2] * a;
    ch[i * 4 + 3] = d[i * 4 + 3];
  }
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, v = px[i - 1];
      if (px[i] !== v && px[i + 1] === v && px[i - W] === v && px[i + W] === v) {
        for (let c = 0; c < 4; c++) ch[i * 4 + c] = (ch[i * 4 + c] + ch[(i - 1) * 4 + c]) / 2;
      }
    }
  }
  // 3×3 평균 (가로 → 세로): 디더 무늬는 섞이고 큰 색 경계만 남는다
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x, l = x > 0 ? i - 1 : i, r = x < W - 1 ? i + 1 : i;
      for (let c = 0; c < 4; c++) tmp[i * 4 + c] = (ch[l * 4 + c] + ch[i * 4 + c] + ch[r * 4 + c]) / 3;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x, u = y > 0 ? i - W : i, dn = y < H - 1 ? i + W : i;
      for (let c = 0; c < 4; c++) bl[i * 4 + c] = (tmp[u * 4 + c] + tmp[i * 4 + c] + tmp[dn * 4 + c]) / 765;
    }
  }
  // 경계 세기와 방향
  const nc = o.transparent ? 4 : 3;
  mag.fill(0);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      let sx = 0, sy = 0;
      for (let c = 0; c < nc; c++) {
        sx += Math.abs(bl[(i + 1) * 4 + c] - bl[(i - 1) * 4 + c]);
        sy += Math.abs(bl[(i + W) * 4 + c] - bl[(i - W) * 4 + c]);
      }
      gx[i] = sx;
      gy[i] = sy;
      mag[i] = sx + sy;
    }
  }
  const T = 0.22;
  // 1) 경계: 경계 방향으로 이웃보다 셀 때만 (선이 한 칸 굵기)
  const E = buf.edge;
  E.fill(0);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x, m = mag[i];
      if (m <= T) continue;
      E[i] = gx[i] >= gy[i] ? +(m >= mag[i - 1] && m >= mag[i + 1]) : +(m >= mag[i - W] && m >= mag[i + W]);
    }
  }
  // 2) 칠하기: 주인공(AI)과 적은 밝은 선, 배경은 흐린 선 (명도 차이로 눈이 갈 곳을 정한다)
  const bg = rgb(ink.bg), grid = rgb(ink.grid), major = rgb(ink.major), line = rgb(ink.line), red = rgb(ink.red), gold = rgb(ink.gold);
  const dim: [number, number, number] = o.focus ? [0, 1, 2].map((k) => Math.round(line[k] * 0.42 + bg[k] * 0.58)) as [number, number, number] : line;
  const focus = o.focus ?? [];
  const marks = o.marks ?? [];
  const boss = o.boss;
  const bossSolidFrom = boss ? boss.y + boss.h * (1 - Math.max(0, Math.min(1, boss.done))) : 0;
  const inBox = (b: Box, x: number, y: number) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x, j = i * 4;
      const coin = d[j] === COIN[0] && d[j + 1] === COIN[1] && d[j + 2] === COIN[2];
      const inBoss = !!boss && inBox(boss, x, y);
      const inMark = !inBoss && marks.some((b) => inBox(b, x, y));
      const inFocus = !inBoss && !inMark && focus.some((b) => inBox(b, x, y));
      const edge = E[i];
      let c: [number, number, number] | null;
      let a = 255;
      if (coin) c = gold;
      else if (edge) {
        // 보스: 아래부터 완성된 만큼 실선, 나머지는 점선
        if (inBoss) c = y >= bossSolidFrom || ((x + y) >> 1) % 2 === 0 ? red : null;
        else c = inMark ? red : inFocus ? line : dim;
      } else c = null;
      if (!c) {
        if (o.transparent) {
          // 빈 곳은 비우고, 그림 안쪽은 종이색으로 칠해 선이 보이게
          if (bl[i * 4 + 3] < 0.5) { a = 0; c = bg; }
          else c = bg;
        } else c = x % 40 === 0 || y % 40 === 0 ? major : x % 8 === 0 || y % 8 === 0 ? grid : bg;
      }
      d[j] = c[0];
      d[j + 1] = c[1];
      d[j + 2] = c[2];
      d[j + 3] = a;
    }
  }
  g.putImageData(img, 0, 0);
}
