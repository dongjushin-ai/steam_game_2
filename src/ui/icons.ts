// 손으로 찍은 10×10 도트 아이콘. 이모지 대신 UI 곳곳(자원·탭·가격·제목)에 쓴다.
// 글자 하나가 픽셀 하나: k 외곽선, 나머지는 아래 팔레트.

const PAL: Record<string, string> = {
  k: "#000000", w: "#ffffff", y: "#ffd23f", o: "#b8860b", r: "#e83b3b", g: "#3fd16a",
  b: "#3b6be8", c: "#5ee0ff", p: "#8a4fe0", P: "#c58cff", s: "#c0c0c0", d: "#5a5a5a",
  m: "#ff7eb6", n: "#8a5a2a",
};

const ART = {
  coin: `
..kkkkkk..
.kyyyyyyk.
kyywyyyyok
kywyyoyyok
kyyyoyyyok
kyyyoyyyok
kyyyoyyyok
kyyyyyyyok
.kooooook.
..kkkkkk..`,
  rp: `
..kkkkkk..
.kPPpPPPk.
kPPpPPpPPk
kPpPPpPPpk
kPPPpPPpPk
kpPPpPPPPk
kPPpPPpPpk
.kPPPpPPk.
..kkkkkk..
...kpk....`,
  bolt: `
.....kkk..
....kyyk..
...kyyk...
..kyyk....
.kyyyyyk..
.kkkyyk...
...kyk....
..kyk.....
..kk......
..........`,
  quest: `
...kkkk...
.kkswwskk.
.kwwwwwwk.
.kwddddwk.
.kwwwwwwk.
.kwddddwk.
.kwwwwwwk.
.kwdddwwk.
.kwwwwwwk.
.kkkkkkkk.`,
  star: `
....kk....
...kyyk...
...kyyk...
kkkkyykkkk
kyyyyyyyyk
.kyyyyyyk.
..kyyyyk..
.kyykkyyk.
.kyk..kyk.
.kk....kk.`,
  chat: `
..........
.kkkkkkkk.
kwwwwwwwwk
kwdwwdwwdk
kwwwwwwwwk
.kkkwwkkk.
...kwk....
...kk.....
..........
..........`,
  chip: `
..k.k.k...
.kkkkkkk..
kkdddddkk.
.kdcccdk..
kkdcccdkk.
.kdcccdk..
kkdddddkk.
.kkkkkkk..
..k.k.k...
..........`,
  flask: `
...kkkk...
....kk....
....kk....
...kwwk...
...kwwk...
..kwwwwk..
.kmmmmmmk.
kmmwmmmmmk
kmmmmmmmmk
.kkkkkkkk.`,
  trophy: `
kkkkkkkkkk
kyyyyywyyk
kkyyyyyykk
.kyyyyyyk.
..kyyyyk..
...kyyk...
....kk....
...kook...
..kooook..
..kkkkkk..`,
  book: `
.kkkk.kkkk
kwwwwkwwwk
kwddwkwddk
kwwwwkwwwk
kwddwkwddk
kwwwwkwwwk
kwddwkwddk
kwwwwkwwwk
.kkkkkkkkk
..........`,
  gear: `
...kkkk...
.k.kssk.k.
kskssssksk
.kss..ssk.
kss.kk.ssk
kss.kk.ssk
.kss..ssk.
kskssssksk
.k.kssk.k.
...kkkk...`,
  rocket: `
....kk....
...kwwk...
...kwbk...
..kwwwwk..
..kwwwwk..
..kwwwwk..
.kkwwwwkk.
kr.kwwk.rk
...krrk...
....yy....`,
  fire: `
....k.....
...krk....
...krk.k..
..krrkkrk.
..kryrkrk.
.krryyrrk.
.kryyyyrk.
.kryyyyrk.
..krryrk..
...kkkk...`,
  lock: `
...kkkk...
..kk..kk..
..k....k..
.kkkkkkkk.
.kyyyyyyk.
.kyyokyyk.
.kyyokyyk.
.kyyyyyyk.
.kkkkkkkk.
..........`,
  check: `
.........k
........kg
.......kgk
k.....kgk.
gk...kgk..
kgk.kgk...
.kgkgk....
..kgk.....
...k......
..........`,
  bulb: `
..kkkkk...
.kyyyyyk..
kyywyyyyk.
kyyyyyyyk.
kyyyyyyyk.
.kyyyyyk..
..kyyyk...
..kssssk..
..kddddk..
...kkkk...`,
  disk: `
kkkkkkkkk.
kbbwwwwbbk
kbbwwwwbbk
kbbbbbbbbk
kbsssssbbk
kbswwwsbbk
kbsssssbbk
kkkkkkkkkk
..........
..........`,
  clock: `
..kkkkkk..
.kwwwwwwk.
kwwwkwwwwk
kwwwkwwwwk
kwwwkkkwwk
kwwwwwwwwk
kwwwwwwwwk
.kwwwwwwk.
..kkkkkk..
..........`,
  shield: `
.kkkkkkkk.
kbbbbwbbbk
kbbbwwbbbk
kbbbbwbbbk
kbbbbbbbbk
.kbbbbbbk.
.kbbbbbbk.
..kbbbbk..
...kbbk...
....kk....`,
} as const;

export type IconName = keyof typeof ART;

const urls = new Map<string, string>();

function render(name: IconName): string {
  const rows = ART[name].trim().split("\n");
  const cv = document.createElement("canvas");
  cv.width = 10;
  cv.height = 10;
  const g = cv.getContext("2d")!;
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const c = PAL[ch];
    if (!c) return;
    g.fillStyle = c;
    g.fillRect(x, y, 1, 1);
  }));
  return cv.toDataURL();
}

export function iconUrl(name: IconName): string {
  let u = urls.get(name);
  if (!u) {
    u = render(name);
    urls.set(name, u);
  }
  return u;
}

/** 글자 옆에 붙는 작은 도트 아이콘 */
export function ic(name: IconName, cls = "ic"): HTMLImageElement {
  const img = document.createElement("img");
  img.className = `${cls} px-img`;
  img.alt = "";
  img.src = iconUrl(name);
  return img;
}
