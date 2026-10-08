import type { NumberFormat } from "./types";
import { L } from "../i18n/lang";

const SHORT = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
const KOREAN = ["", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정", "재", "극"];

let mode: NumberFormat = "short";
export function setNumberFormat(f: NumberFormat): void {
  mode = f;
}

function trim(x: number, digits: number): string {
  const s = x.toFixed(digits);
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/** 큰 수를 짧게: 1.23M / 123만 / 1.23e6 */
export function fmt(n: number, f: NumberFormat = mode): string {
  if (!isFinite(n)) return "∞";
  if (n < 0) return "-" + fmt(-n, f);
  if (n < 1000) return n < 10 ? trim(n, 2) : n < 100 ? trim(n, 1) : Math.floor(n).toString();
  if (f === "sci") return n.toExponential(2).replace("e+", "e");
  if (f === "korean") {
    const i = Math.floor(Math.log10(n) / 4);
    if (i >= KOREAN.length) return n.toExponential(2).replace("e+", "e");
    const v = n / Math.pow(10, i * 4);
    return (v < 10 ? trim(v, 2) : v < 100 ? trim(v, 1) : Math.floor(v).toString()) + KOREAN[i];
  }
  const i = Math.floor(Math.log10(n) / 3);
  if (i >= SHORT.length) return n.toExponential(2).replace("e+", "e");
  const v = n / Math.pow(10, i * 3);
  return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.floor(v).toString()) + SHORT[i];
}

/** 토큰 수: 512 / 32K / 1M */
export function fmtTokens(n: number): string {
  if (n >= 1e6) return trim(n / 1e6, 1) + "M";
  // 2048 → 2K, 32768 → 32K, 200000 → 200K
  if (n >= 1e3) return trim(n % 1024 === 0 ? n / 1024 : n / 1e3, 0) + "K";
  return Math.round(n).toString();
}

export function fmtPct(x: number): string {
  return x < 0.1 ? (x * 100).toFixed(1) + "%" : Math.round(x * 100) + "%";
}

export function fmtDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return L(`${h}시간 ${m}분`, `${h}h ${m}m`);
  if (m > 0) return L(`${m}분 ${s % 60}초`, `${m}m ${s % 60}s`);
  return L(`${s}초`, `${s}s`);
}

export function fmtMult(m: number): string {
  return m >= 1 ? `×${trim(m, 2)}` : `−${Math.round((1 - m) * 100)}%`;
}
