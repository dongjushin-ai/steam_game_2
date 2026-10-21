// 배경음악: 오디오 파일 없이 화음 진행에서 칩튠을 즉석으로 만들어 연주한다.
// 화면 옷마다 곡 스타일이 다르다 — pixel: NES풍 사각파 멜로디 / retro: 느린 펄스파 아르페지오 /
// y2k: 반짝이는 종소리 아르페지오 / brutal: 낮은 웅웅거림과 킥, 드문 신호음.
// 시대마다 조(key)가 조금씩 올라가서, 같은 옷 안에서도 시대가 바뀐 게 들린다.
import { audioContext } from "./sound";
import { classicSkin } from "../core/looks";

export type MusicStyle = "pixel" | "retro" | "y2k" | "brutal";

interface Song {
  bpm: number;
  /** 마디마다 화음 (MIDI 번호, 첫 음이 근음) */
  prog: number[][];
  lead: OscillatorType | "pulse";
  bass: OscillatorType | "pulse";
  /** 16칸 중 베이스가 울리는 칸 */
  bassSteps: number[];
  /** 16칸 중 리드가 울리는 칸과 그때 쓸 화음 음 번호 (-1이면 쉼) */
  leadPattern: number[];
  leadOct: number;
  drums: { kick: number[]; snare: number[]; hat: number[] };
  leadVol: number;
}

const C = 60;
const SONGS: Record<MusicStyle, Song> = {
  pixel: {
    bpm: 132,
    prog: [[C, C + 4, C + 7], [C + 7, C + 11, C + 14], [C + 9, C + 12, C + 16], [C + 5, C + 9, C + 12]],
    lead: "square", bass: "triangle",
    bassSteps: [0, 4, 6, 8, 12, 14],
    leadPattern: [0, -1, 1, -1, 2, -1, 1, 2, 3, -1, 2, -1, 1, -1, 0, -1],
    leadOct: 12, leadVol: 0.035,
    drums: { kick: [0, 8], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
  retro: {
    bpm: 100,
    prog: [[C - 3, C, C + 4], [C - 7, C - 3, C], [C, C + 4, C + 7], [C - 5, C - 1, C + 2]],
    lead: "pulse", bass: "square",
    bassSteps: [0, 8, 10],
    leadPattern: [0, -1, 1, -1, 2, -1, 1, -1, 0, -1, 1, -1, 2, -1, 3, -1],
    leadOct: 12, leadVol: 0.028,
    drums: { kick: [0, 10], snare: [8], hat: [4, 12] },
  },
  y2k: {
    bpm: 118,
    prog: [[C + 5, C + 9, C + 12, C + 16], [C + 4, C + 7, C + 11, C + 14], [C + 2, C + 5, C + 9, C + 12], [C, C + 4, C + 7, C + 11]],
    lead: "sine", bass: "sine",
    bassSteps: [0, 3, 6, 8, 11, 14],
    leadPattern: [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1, 2, 3],
    leadOct: 24, leadVol: 0.03,
    drums: { kick: [0, 6, 8], snare: [4, 12], hat: [2, 6, 10, 14] },
  },
  brutal: {
    bpm: 124,
    prog: [[C - 10, C - 3, C + 2], [C - 10, C - 3, C + 2], [C - 12, C - 5, C], [C - 7, C, C + 5]],
    lead: "square", bass: "sawtooth",
    bassSteps: [0, 2, 4, 6, 8, 10, 12, 14],
    leadPattern: [-1, -1, -1, 2, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1],
    leadOct: 24, leadVol: 0.022,
    drums: { kick: [0, 4, 8, 12], snare: [], hat: [2, 6, 10, 14] },
  },
};

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

let pulseWave: PeriodicWave | null = null;
/** 25% 듀티 펄스파 (패미컴·옛날 PC 소리) */
function pulse(a: AudioContext): PeriodicWave {
  if (pulseWave) return pulseWave;
  const n = 32;
  const real = new Float32Array(n), imag = new Float32Array(n);
  for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
  pulseWave = a.createPeriodicWave(real, imag);
  return pulseWave;
}

let noiseBuf: AudioBuffer | null = null;
function noise(a: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  noiseBuf = a.createBuffer(1, a.sampleRate * 0.3, a.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

class Music {
  private on = true;
  private style: MusicStyle = "pixel";
  private key = 0;
  private master: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private nextTime = 0;
  private started = false;

  setEnabled(v: boolean): void {
    this.on = v;
    if (v) this.start();
    else this.stop();
  }

  /** 화면 옷·시대에 맞춰 곡을 바꾼다 (다음 마디부터) */
  setStyle(skin: MusicStyle | "machine" | "blueprint", era: number): void {
    // 기계 시대(시대 10)는 브루탈 음악을 같이 쓴다. 청사진은 시대마다 예전 옷의 음악을 쓴다
    const s = skin === "blueprint" ? classicSkin(era) : skin;
    const style: MusicStyle = s === "machine" ? "brutal" : s;
    this.style = style;
    this.key = [0, 2, 5][era % 3];
  }

  /** 사용자가 처음 누른 뒤에 호출 (브라우저가 그 전엔 소리를 막는다) */
  start(): void {
    if (!this.on || this.timer) return;
    const a = audioContext();
    if (!a) return;
    if (!this.master) {
      this.master = a.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(a.destination);
    }
    this.started = true;
    this.nextTime = a.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 60);
  }

  stop(): void {
    clearInterval(this.timer);
    this.timer = 0;
  }

  /** 앱이 가려지면 쉬고, 돌아오면 다시 */
  pause(hidden: boolean): void {
    if (hidden) this.stop();
    else if (this.started) this.start();
  }

  private schedule(): void {
    const a = audioContext();
    if (!a || !this.master) return;
    const song = SONGS[this.style];
    const dt = 60 / song.bpm / 4;
    // 늦게 깨어났으면 따라잡지 말고 지금부터
    if (this.nextTime < a.currentTime - 0.2) this.nextTime = a.currentTime + 0.05;
    while (this.nextTime < a.currentTime + 0.25) {
      this.playStep(a, song, this.step, this.nextTime, dt);
      this.step++;
      this.nextTime += dt;
    }
  }

  private playStep(a: AudioContext, song: Song, i: number, t: number, dt: number): void {
    const s = i % 16;
    const bar = Math.floor(i / 16) % song.prog.length;
    const chord = song.prog[bar].map((n) => n + this.key);
    // 4마디에 한 번씩 리드를 한 옥타브 올려 단조로움을 깬다
    const lift = Math.floor(i / 64) % 2 === 1 && this.style !== "brutal" ? 12 : 0;
    if (song.bassSteps.includes(s)) this.note(a, song.bass, freq(chord[0] - 24), t, dt * 1.6, 0.05);
    const li = song.leadPattern[s];
    if (li >= 0) {
      const n = chord[li % chord.length] + 12 * Math.floor(li / chord.length);
      this.note(a, song.lead, freq(n + song.leadOct - 12 + lift), t, dt * (this.style === "y2k" ? 2.5 : 1.4), song.leadVol);
      if (this.style === "y2k") this.note(a, "triangle", freq(n + song.leadOct + 12), t, dt * 1.2, song.leadVol * 0.25);
    }
    if (song.drums.kick.includes(s)) this.kick(a, t);
    if (song.drums.snare.includes(s)) this.hit(a, t, 1800, 0.12, 0.035);
    if (song.drums.hat.includes(s)) this.hit(a, t, 7000, 0.03, 0.018);
  }

  private note(a: AudioContext, type: OscillatorType | "pulse", f: number, t: number, dur: number, vol: number): void {
    const o = a.createOscillator();
    const g = a.createGain();
    if (type === "pulse") o.setPeriodicWave(pulse(a));
    else o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private kick(a: AudioContext, t: number): void {
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.09, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + 0.17);
  }

  private hit(a: AudioContext, t: number, cutoff: number, dur: number, vol: number): void {
    const src = a.createBufferSource();
    src.buffer = noise(a);
    const f = a.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = cutoff;
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  }
}

export const music = new Music();
