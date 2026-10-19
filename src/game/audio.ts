export type SoundName =
  | "start"
  | "click"
  | "dodge"
  | "deny"
  | "gain"
  | "modal"
  | "exploit"
  | "final"
  | "glitch"
  | "win"
  | "surrender";

let audioCtx: AudioContext | null = null;

function ensureAudio(enabled: boolean): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration = 0.08,
  options: {
    type?: OscillatorType;
    volume?: number;
    endFreq?: number;
    delay?: number;
  } = {},
): void {
  const ctx = audioCtx;
  if (!ctx) return;
  const { type = "square", volume = 0.02, endFreq, delay = 0 } = options;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + duration);
  }
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(duration = 0.16, volume = 0.025): void {
  const ctx = audioCtx;
  if (!ctx) return;
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(ctx.destination);
  source.start();
}

export function playSound(kind: SoundName, enabled: boolean): void {
  if (!enabled) return;
  if (!ensureAudio(true)) return;

  switch (kind) {
    case "start":
      tone(196, 0.14, { type: "triangle", volume: 0.025 });
      tone(392, 0.16, { type: "triangle", volume: 0.02, delay: 0.09 });
      tone(523.25, 0.25, { type: "triangle", volume: 0.018, delay: 0.18 });
      break;
    case "click":
      tone(330, 0.06, { type: "square", volume: 0.014, endFreq: 210 });
      break;
    case "dodge":
      tone(520, 0.08, { type: "triangle", volume: 0.018, endFreq: 280 });
      break;
    case "deny":
      tone(140, 0.15, { type: "sawtooth", volume: 0.02, endFreq: 86 });
      noiseBurst(0.08, 0.012);
      break;
    case "gain":
      tone(300, 0.07, { type: "triangle", volume: 0.018, endFreq: 470 });
      break;
    case "modal":
      tone(174, 0.13, { type: "sine", volume: 0.025 });
      tone(164, 0.16, { type: "sine", volume: 0.015, delay: 0.08 });
      break;
    case "exploit":
      tone(440, 0.09, { type: "square", volume: 0.018, endFreq: 660 });
      tone(880, 0.18, { type: "triangle", volume: 0.022, delay: 0.08 });
      break;
    case "final":
      tone(72, 0.9, { type: "sawtooth", volume: 0.022, endFreq: 41 });
      tone(144, 0.4, { type: "sine", volume: 0.015, delay: 0.1 });
      break;
    case "glitch":
      noiseBurst(0.3, 0.03);
      tone(90, 0.25, { type: "sawtooth", volume: 0.02, endFreq: 45 });
      break;
    case "win":
      [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
        tone(freq, 0.3, { type: "triangle", volume: 0.026, delay: i * 0.12 });
      });
      break;
    case "surrender":
      tone(330, 0.35, { type: "sine", volume: 0.02, endFreq: 660 });
      break;
    default:
      break;
  }
}

export function primeAudio(enabled: boolean): void {
  ensureAudio(enabled);
}
