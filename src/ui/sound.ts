// 효과음: Web Audio로 직접 합성한다 (오디오 파일 없음).
// 진동: 앱에서는 Capacitor Haptics(짧고 또렷한 진동), 웹에서는 navigator.vibrate.
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNative } from "./native";
type Sfx = "tap" | "buy" | "research" | "golden" | "claim" | "event" | "quest" | "win" | "lose" | "era" | "error" | "correct" | "wrong";

let ctx: AudioContext | null = null;
let enabled = true;
let vibrateOn = true;

export function setSound(on: boolean): void {
  enabled = on;
}
export function setVibrate(on: boolean): void {
  vibrateOn = on;
}

/** 효과음·음악이 함께 쓰는 오디오 컨텍스트 (사용자가 한 번 누른 뒤에만 소리가 난다) */
export function audioContext(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function audio(): AudioContext | null {
  return enabled ? audioContext() : null;
}

/** 음 하나: 주파수(Hz), 시작(초), 길이(초), 파형, 음량 */
function tone(a: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "square", vol = 0.05): void {
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + start;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const NOTES: Record<Sfx, [number, number, number, OscillatorType?, number?][]> = {
  tap: [[880, 0, 0.05, "square", 0.025]],
  buy: [[523, 0, 0.06], [784, 0.05, 0.08]],
  research: [[392, 0, 0.08, "triangle", 0.08], [523, 0.07, 0.08, "triangle", 0.08], [659, 0.14, 0.12, "triangle", 0.08]],
  golden: [[1047, 0, 0.08, "sine", 0.06], [1319, 0.06, 0.08, "sine", 0.06], [1568, 0.12, 0.14, "sine", 0.06]],
  claim: [[784, 0, 0.06, "square", 0.04], [1047, 0.05, 0.06, "square", 0.04], [1319, 0.1, 0.06, "square", 0.04], [1568, 0.15, 0.16, "square", 0.04]],
  event: [[660, 0, 0.12, "triangle", 0.06], [880, 0.1, 0.16, "triangle", 0.06]],
  quest: [[988, 0, 0.08, "sine", 0.07], [1319, 0.08, 0.18, "sine", 0.07]],
  win: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.35]],
  lose: [[392, 0, 0.15, "sawtooth", 0.04], [330, 0.15, 0.15, "sawtooth", 0.04], [262, 0.3, 0.3, "sawtooth", 0.04]],
  era: [[262, 0, 0.5, "triangle", 0.06], [330, 0, 0.5, "triangle", 0.05], [392, 0, 0.5, "triangle", 0.05], [523, 0.25, 0.6, "triangle", 0.05]],
  error: [[140, 0, 0.12, "sawtooth", 0.04]],
  correct: [[784, 0, 0.08, "sine", 0.07], [1175, 0.08, 0.2, "sine", 0.07]],
  wrong: [[220, 0, 0.18, "square", 0.04], [196, 0.15, 0.25, "square", 0.04]],
};

const VIBES: Partial<Record<Sfx, number | number[]>> = {
  tap: 8, golden: [30, 40, 30], claim: 25, win: [60, 50, 120], lose: 120, era: [40, 60, 40], quest: 20, wrong: 80,
};

let lastTap = 0;

/** 앱 진동: 손맛이 필요한 순간만, 세기를 다르게 */
const HAPTIC: Partial<Record<Sfx, () => Promise<void>>> = {
  tap: () => Haptics.impact({ style: ImpactStyle.Light }),
  buy: () => Haptics.impact({ style: ImpactStyle.Light }),
  research: () => Haptics.impact({ style: ImpactStyle.Medium }),
  quest: () => Haptics.impact({ style: ImpactStyle.Medium }),
  claim: () => Haptics.impact({ style: ImpactStyle.Medium }),
  golden: () => Haptics.notification({ type: NotificationType.Success }),
  win: () => Haptics.notification({ type: NotificationType.Success }),
  era: () => Haptics.impact({ style: ImpactStyle.Heavy }),
  lose: () => Haptics.notification({ type: NotificationType.Warning }),
  wrong: () => Haptics.notification({ type: NotificationType.Warning }),
  error: () => Haptics.notification({ type: NotificationType.Error }),
};
let lastHaptic = 0;

export function sfx(name: Sfx): void {
  if (vibrateOn && isNative() && HAPTIC[name]) {
    // 연타·연속 구매 때 진동이 뭉개지지 않게 가벼운 것은 60ms 간격
    const now = performance.now();
    const light = name === "tap" || name === "buy";
    if (!light || now - lastHaptic > 60) {
      lastHaptic = now;
      void HAPTIC[name]!().catch(() => {});
    }
  } else if (vibrateOn && VIBES[name] && "vibrate" in navigator) {
    try {
      navigator.vibrate(VIBES[name]!);
    } catch {
      // 지원 안 하는 기기
    }
  }
  const a = audio();
  if (!a) return;
  // 연타 소리가 겹쳐서 시끄럽지 않게
  if (name === "tap") {
    const now = performance.now();
    if (now - lastTap < 45) return;
    lastTap = now;
  }
  for (const [f, start, dur, type, vol] of NOTES[name]) tone(a, f, start, dur, type, vol);
}
