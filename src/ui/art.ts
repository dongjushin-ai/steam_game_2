// 그림 조각들을 화면 여러 곳(장면·창·도감)에 동시에 쓸 때를 위한 도우미.
import { avatarSvg } from "./avatar";
import { backdropSvg } from "./backdrop";

let seq = 0;

/**
 * SVG 안의 그라데이션 id를 복사본마다 다르게 바꾼다.
 * 같은 문서에 같은 id가 두 번 있으면 url(#id)가 첫 번째 것을 가리켜서 다른 시대 색이 섞인다.
 */
export function uniqueIds(svg: string): string {
  const p = `u${(seq++).toString(36)}`;
  return svg.replace(/id="([\w-]+)"/g, `id="${p}-$1"`).replace(/url\(#([\w-]+)\)/g, `url(#${p}-$1)`);
}

export function sceneArt(era: number, accent: string): { backdrop: string; avatar: string } {
  return { backdrop: uniqueIds(backdropSvg(era, accent)), avatar: uniqueIds(avatarSvg(era, accent)) };
}

/** 창·도감 머리에 들어가는 그림: 그 시대 방 + 가운데 오른쪽의 AI */
export function heroHtml(era: number, accent: string, opts: { still?: boolean } = {}): string {
  const art = sceneArt(era, accent);
  return `<div class="hero${opts.still ? " still" : ""}" style="--hero:${accent}">${art.backdrop}<div class="hero-av">${art.avatar}</div></div>`;
}

/** 작은 아바타 썸네일 (연표 등) */
export function avatarThumb(era: number, accent: string): string {
  return `<span class="av-thumb still">${uniqueIds(avatarSvg(era, accent))}</span>`;
}
