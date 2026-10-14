// 알림 (안드로이드 앱에서만): 앱을 내릴 때 예약하고, 돌아오면 지운다.
// 파견 복귀 · 오프라인 보상 가득 · 내일 출석. 정확한 알람 권한은 쓰지 않는다 (몇 분 늦어도 괜찮은 알림들).
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Game } from "../core/game";
import { OFFLINE_CAP_SEC } from "../core/formulas";
import { MISSIONS } from "../data";
import { L } from "../i18n/lang";
import { showModal } from "./modals";
import { isNative } from "./native";

const IDS = { offline: 1, daily: 2, missionBase: 100 } as const;

async function granted(): Promise<boolean> {
  try {
    return (await LocalNotifications.checkPermissions()).display === "granted";
  } catch {
    return false;
  }
}

/** 처음 파견을 보낼 때 한 번만 물어본다 (갑자기 시스템 창부터 띄우지 않게) */
export function maybeAskNotify(game: Game): void {
  const s = game.state.settings;
  if (!isNative() || s.notifyAsked) return;
  s.notifyAsked = true;
  showModal({
    title: L("알림을 켤까요?", "Turn on notifications?"),
    body: [L("파견이 끝났을 때, 오프라인 보상이 가득 찼을 때, 출석 보상이 기다릴 때만 알려 드려요. 설정에서 언제든 끌 수 있어요.",
      "Only when a mission returns, when offline rewards are full, or when your daily reward is waiting. You can turn this off in Settings any time.")],
    buttons: [
      { label: L("알림 켜기", "Turn on"), onClick: () => { void enableNotify(game); } },
      { label: L("나중에", "Not now"), kind: "ghost", onClick: () => { s.notify = false; } },
    ],
  });
}

/** 설정에서 켰을 때 / 처음 물었을 때: 시스템 권한 요청 */
export async function enableNotify(game: Game): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const r = await LocalNotifications.requestPermissions();
    game.state.settings.notify = r.display === "granted";
  } catch {
    game.state.settings.notify = false;
  }
  return game.state.settings.notify;
}

export async function cancelReminders(): Promise<void> {
  if (!isNative()) return;
  try {
    const p = await LocalNotifications.getPending();
    if (p.notifications.length) await LocalNotifications.cancel({ notifications: p.notifications.map((n) => ({ id: n.id })) });
  } catch {
    // 알림 기능이 없는 기기면 그냥 넘어간다
  }
}

/** 앱을 내릴 때: 다가올 일들을 예약 */
export async function scheduleReminders(game: Game): Promise<void> {
  const s = game.state;
  if (!isNative() || !s.settings.notify || !(await granted())) return;
  await cancelReminders();
  const now = Date.now();
  const list: { id: number; title: string; body: string; at: number }[] = [];
  s.missions.forEach((m, i) => {
    const def = MISSIONS.find((x) => x.id === m.id);
    if (def && m.endsAt > now + 30_000) list.push({ id: IDS.missionBase + i, title: L(`파견 복귀: ${def.name}`, `Back from: ${def.name}`), body: L("보상을 받으러 오세요", "Come collect the reward"), at: m.endsAt });
  });
  list.push({ id: IDS.offline, title: L(`${s.aiName}가 쉬지 않고 일했어요`, `${s.aiName} kept working`), body: L("오프라인 보상이 가득 찼어요. 더 쌓이지 않아요!", "Offline rewards are full and won't grow any more!"), at: now + OFFLINE_CAP_SEC * 1000 });
  const noon = new Date();
  noon.setDate(noon.getDate() + 1);
  noon.setHours(12, 0, 0, 0);
  list.push({ id: IDS.daily, title: L("출석 보상이 기다려요", "Your daily reward is waiting"), body: L(`${s.daily.streak + 1}일 연속 출석을 이어 가세요`, `Keep your streak going: day ${s.daily.streak + 1}`), at: noon.getTime() });
  try {
    await LocalNotifications.schedule({
      notifications: list.map((n) => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at), allowWhileIdle: true }, smallIcon: "ic_stat_ai", isExactNotification: false })),
    });
  } catch {
    // 예약 실패는 게임에 영향이 없다
  }
}
