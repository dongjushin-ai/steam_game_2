// 창·도감·연표에 쓰는 정지 도트 그림. 그림은 pixel.ts가 캔버스로 그려 data URL로 넘긴다.
import { avatarStill, pixelEmoji, sceneStill } from "./pixel";

/** 창·도감 머리 그림: 그 시대 방 + AI */
export function heroHtml(era: number, accent: string, opts: { avatar?: boolean } = {}): string {
  return `<div class="hero"><img class="px-img" alt="" src="${sceneStill(era, accent, opts.avatar !== false)}"></div>`;
}

/** 작은 AI 얼굴 (연표) */
export function avatarThumb(era: number, accent: string): string {
  return `<img class="av-thumb px-img" alt="" src="${avatarStill(era, accent)}">`;
}

/** 이모지 → 도트 아이콘 <img> 마크업 */
export function pxIcon(emoji: string, cls = "px-ico"): string {
  return `<img class="${cls} px-img" alt="" src="${pixelEmoji(emoji)}">`;
}

/** 이모지 → 도트 아이콘 <img> 요소 */
export function pxi(emoji: string): HTMLImageElement {
  const img = document.createElement("img");
  img.className = "px-img";
  img.alt = "";
  img.src = pixelEmoji(emoji);
  return img;
}
