// 기록 자랑 카드: 지금 시대의 도트 장면 + AI 이름 + 기록 몇 줄을 PNG 한 장으로.
// 휴대폰이면 공유 시트로, 아니면 파일로 저장한다. 어느 쪽도 안 되면 그림을 길게 눌러 저장하면 된다.
import { ERAS } from "../data";
import { ACHIEVEMENTS } from "../core/achievements";
import { fmt, fmtPct } from "../core/format";
import type { Game } from "../core/game";
import { isNative, shareImage } from "./native";
import { L } from "../i18n/lang";
import { h } from "./dom";
import { showModal, toast } from "./modals";
import { sceneCanvas } from "./pixel";
import { resolveLook } from "../core/looks";

const CW = 720;
const CH = 960;

/** 화면 옷별 카드 색 */
function palette(era: number): { bg: string; panel: string; ink: string; sub: string; accent: string } {
  const accent = era === 8 ? "#ff4a1c" : era === 9 ? "#2b2bff" : era === 10 ? "#ffe600" : ERAS[era].color;
  if (era <= 2) return { bg: "#0c0c24", panel: "#1c1c4a", ink: "#ffffff", sub: "#a4a4d8", accent };
  if (era <= 4) return { bg: "#008080", panel: "#c0c0c0", ink: "#000000", sub: "#3c3c3c", accent: "#000080" };
  if (era <= 7) return { bg: "#c9d6ff", panel: "#f6f8fd", ink: "#141a3a", sub: "#4a5578", accent };
  if (era === 10) return { bg: "#000000", panel: "#000000", ink: "#ffffff", sub: "#c8c8c8", accent };
  return { bg: "#f2f2ed", panel: "#ffffff", ink: "#000000", sub: "#3a3a3a", accent };
}

/** 기록에서 고른 한 줄 농담 */
function tagline(g: Game): string {
  const s = g.state, st = g.stats;
  if (s.ended) return L("AI를 키웠다. 아니, AI가 나를 키웠다.", "I grew an AI. Or did it grow me?");
  if (s.stats.breaches > 0) return L(`할머니 공격에 ${s.stats.breaches}번 당함`, `Fell for the grandma exploit ${s.stats.breaches}×`);
  if (st.hall > 0.2) return L(`환각률 ${fmtPct(st.hall)}. 자신감은 100%.`, `Hallucinates ${fmtPct(st.hall)}. Confidence: 100%.`);
  if (s.stats.taps > 500) return L(`${fmt(s.stats.taps)}번 탭 = ${fmt(s.stats.taps)}개의 인간 피드백`, `${fmt(s.stats.taps)} taps = ${fmt(s.stats.taps)} pieces of human feedback`);
  return L("strawberry의 r은 아직 세는 중", "Still counting the r's in strawberry");
}

export async function makeCard(g: Game): Promise<HTMLCanvasElement> {
  try {
    await Promise.all([document.fonts.load('24px "Galmuri11"'), document.fonts.load('bold 48px "Galmuri11"')]);
  } catch {
    // 글꼴을 못 불러도 기본 글꼴로 그린다
  }
  const s = g.state;
  const era = ERAS[s.era];
  const c = palette(s.era);
  const cv = document.createElement("canvas");
  cv.width = CW;
  cv.height = CH;
  const x = cv.getContext("2d")!;
  x.imageSmoothingEnabled = false;
  x.fillStyle = c.bg;
  x.fillRect(0, 0, CW, CH);
  // 두꺼운 도트 테두리 (모서리는 계단식)
  x.fillStyle = c.ink;
  x.fillRect(12, 18, CW - 24, CH - 36);
  x.fillRect(18, 12, CW - 36, CH - 24);
  x.fillStyle = c.panel;
  x.fillRect(24, 24, CW - 48, CH - 48);
  // 장면
  // 꾸민 모습 그대로 (자랑 카드라서)
  const lk = resolveLook(s);
  const scene = sceneCanvas(s.era, lk.color ?? ERAS[lk.room].color, lk);
  x.drawImage(scene, 0, 0, 192, 120, 36, 36, CW - 72, Math.round(((CW - 72) * 120) / 192));
  let y = 36 + Math.round(((CW - 72) * 120) / 192) + 16;
  x.fillStyle = c.ink;
  x.fillRect(36, y - 12, CW - 72, 6);
  const text = (t: string, size: number, color: string, bold = false, dy = 0) => {
    x.font = `${bold ? "bold " : ""}${size}px "Galmuri11", "Apple SD Gothic Neo", "Malgun Gothic", monospace`;
    x.fillStyle = color;
    x.textBaseline = "top";
    let str = t;
    while (x.measureText(str).width > CW - 84 && str.length > 4) str = str.slice(0, -2) + "…";
    x.fillText(str, 42, y + dy);
    y += size + 12;
  };
  text(`${s.aiName} v${s.releases + 1}`, 48, c.ink, true);
  text(`${era.name} · ${era.years}`, 24, c.sub);
  y += 8;
  const h = Math.floor(s.stats.playSeconds / 3600), m = Math.floor((s.stats.playSeconds % 3600) / 60);
  const lines = [
    L(`질문 ${fmt(s.stats.answered)}개에 답함`, `Answered ${fmt(s.stats.answered)} questions`),
    L(`누적 ${fmt(s.totalEarned)} 크레딧`, `Earned ${fmt(s.totalEarned)} credits`),
    L(`벤치마크 ${s.bossesBeaten.length}/${ERAS.length} · 업적 ${s.achievements.length}/${ACHIEVEMENTS.length}`, `Benchmarks ${s.bossesBeaten.length}/${ERAS.length} · Achievements ${s.achievements.length}/${ACHIEVEMENTS.length}`),
    h ? L(`플레이 ${h}시간 ${m}분`, `Played ${h}h ${m}m`) : L(`플레이 ${m}분`, `Played ${m} min`),
  ];
  for (const l of lines) text(`▶ ${l}`, 24, c.ink);
  // 강조 띠: 한 줄 농담
  y += 6;
  x.fillStyle = c.accent;
  x.fillRect(36, y - 6, CW - 72, 48);
  y += 4;
  text(tagline(g), 24, s.era >= 3 && s.era <= 4 ? "#ffffff" : s.era === 9 ? "#ffffff" : "#000000", true);
  // 바닥글
  y = CH - 72;
  text(L("AI 키우기 · Attention Is All You Idle", "Grow Your AI · Attention Is All You Idle"), 20, c.sub);
  return cv;
}

/** 카드를 보여주고 공유·저장 버튼을 단다 */
export async function shareCard(g: Game): Promise<void> {
  const cv = await makeCard(g);
  const url = cv.toDataURL("image/png");
  const blob: Blob | null = await new Promise((res) => cv.toBlob(res, "image/png"));
  const file = blob ? new File([blob], "ai-kiugi.png", { type: "image/png" }) : null;
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  const canShare = !!(file && nav.canShare?.({ files: [file] }));
  const save = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-kiugi.png";
    document.body.append(a);
    a.click();
    a.remove();
    toast(L("이미지를 저장했어요", "Image saved"), L("저장이 안 되면 그림을 길게 눌러 저장하세요", "If nothing saved, long-press the picture"));
    return false;
  };
  if (isNative()) {
    showModal({
      title: L("기록 카드", "Your run card"),
      body: [h("img", { class: "share-img", src: url, alt: L("기록 카드", "Run card") })],
      buttons: [
        { label: L("공유·저장", "Share / Save"), onClick: () => { void shareImage(url, "ai-kiugi.png", L("#AI키우기", "#GrowYourAI")).catch(() => {}); return false; } },
        { label: L("닫기", "Close"), kind: "ghost" },
      ],
      dismissable: true,
    });
    return;
  }
  showModal({
    title: L("기록 카드", "Your run card"),
    body: [h("img", { class: "share-img", src: url, alt: L("기록 카드", "Run card") }), h("p", { class: "hint" }, L("그림을 길게 눌러도 저장할 수 있어요", "You can also long-press the picture to save it"))],
    buttons: [
      ...(canShare ? [{ label: L("공유하기", "Share"), onClick: () => { void navigator.share({ files: [file!], text: L("#AI키우기", "#GrowYourAI") }).catch(() => {}); return false; } }] : []),
      { label: L("이미지 저장", "Save image"), kind: canShare ? "ghost" as const : undefined, onClick: save },
      { label: L("닫기", "Close"), kind: "ghost" },
    ],
    dismissable: true,
  });
}
