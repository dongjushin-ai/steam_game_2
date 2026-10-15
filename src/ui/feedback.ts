// 의견 보내기 (친구 테스트용). 게임 상태를 자동으로 붙여서, 받을 곳이 정해져 있으면 거기로, 아니면 복사·공유.
// 받을 곳 설정: FEEDBACK_FORM(구글 폼 주소) 또는 FEEDBACK_EMAIL. 둘 다 비면 글을 복사하거나 공유 창으로 보낸다.
import { Share } from "@capacitor/share";
import type { Game } from "../core/game";
import { ERAS } from "../data";
import { L } from "../i18n/lang";
import { h } from "./dom";
import { showModal, toast } from "./modals";
import { isNative } from "./native";

export const FEEDBACK_FORM = "";
export const FEEDBACK_EMAIL = "";
const APP_VERSION = "1.0.0";

/** 의견에 붙는 게임 상태 (개인정보 없음: 기기 종류·화면 크기·진행 정도만) */
export function feedbackInfo(g: Game): string {
  const s = g.state;
  const mins = Math.floor(s.stats.playSeconds / 60);
  const ua = navigator.userAgent.match(/Android [\d.]+|iPhone OS [\d_]+|Windows NT [\d.]+|Mac OS X [\d_]+/)?.[0] ?? "";
  return [
    `v${APP_VERSION} · ${isNative() ? "app" : "web"} · ${ua} · ${window.innerWidth}×${window.innerHeight}`,
    `${L("시대", "Era")} ${s.era + 1} ${ERAS[s.era].name} · ${L("플레이", "Played")} ${mins}${L("분", "m")} · ${L("출시", "Releases")} ${s.releases} · ${L("업적", "Feats")} ${s.achievements.length}${s.ended ? ` · ${L("엔딩", "Ended")} · ${L("무한", "Endless")} ${s.endless.level}` : ""}`,
  ].join("\n");
}

export function openFeedback(g: Game): void {
  const text = h("textarea", { class: "fb-text", rows: "5", placeholder: L("어디서 지루했나요? 헷갈렸던 곳, 그만두고 싶었던 순간, 좋았던 것… 뭐든 좋아요.", "Where did it get boring? What confused you, when did you want to quit, what did you like?"), "aria-label": L("의견", "Feedback") }) as HTMLTextAreaElement;
  const info = feedbackInfo(g);
  const full = () => `${text.value.trim()}\n\n---\n${info}`;
  const send = async (): Promise<boolean> => {
    if (!text.value.trim()) {
      toast(L("의견을 적어 주세요", "Write something first"));
      return false;
    }
    if (FEEDBACK_FORM) {
      await navigator.clipboard?.writeText(full()).catch(() => {});
      window.open(FEEDBACK_FORM, "_blank", "noopener");
      toast(L("폼이 열렸어요", "Form opened"), L("의견은 복사해 뒀어요. 붙여넣기만 하세요", "Your note is copied; just paste it"));
      return true;
    }
    if (FEEDBACK_EMAIL) {
      location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(L("AI 키우기 의견", "Grow Your AI feedback"))}&body=${encodeURIComponent(full())}`;
      return true;
    }
    if (isNative()) {
      await Share.share({ title: L("AI 키우기 의견", "Grow Your AI feedback"), text: full() }).catch(() => {});
      return true;
    }
    try {
      await navigator.clipboard.writeText(full());
      toast(L("복사했어요", "Copied"), L("테스트를 부탁한 사람에게 붙여넣어 보내 주세요", "Paste it to whoever asked you to test"));
    } catch {
      toast(L("복사가 안 됐어요", "Couldn't copy"), L("글을 길게 눌러 직접 복사해 주세요", "Long-press the text to copy it"));
      return false;
    }
    return true;
  };
  showModal({
    title: L("의견 보내기", "Send feedback"),
    body: [text, h("p", { class: "hint fb-info" }, L("함께 보내는 정보: ", "Sent along: "), h("code", null, info))],
    buttons: [
      { label: isNative() && !FEEDBACK_FORM && !FEEDBACK_EMAIL ? L("보내기 (공유)", "Send (share)") : L("보내기", "Send"), onClick: () => { void send().then((ok) => { if (ok) document.querySelector<HTMLButtonElement>(".modal .m-btns .btn.ghost")?.click(); }); return false; } },
      { label: L("닫기", "Close"), kind: "ghost" },
    ],
    dismissable: true,
  });
}
