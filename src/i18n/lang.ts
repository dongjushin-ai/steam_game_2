// 현재 언어와 UI 문구 헬퍼. 데이터 모듈을 import하지 않아서 core 어디서든 써도 순환 참조가 없다.
export type Lang = "ko" | "en";

let lang: Lang = "ko";

export function getLang(): Lang {
  return lang;
}

export function setLangValue(next: Lang): void {
  lang = next;
}

/** UI 문구: 현재 언어에 맞는 쪽을 고른다 */
export function L(ko: string, en: string): string {
  return lang === "en" ? en : ko;
}
