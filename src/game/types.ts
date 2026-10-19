export type Phase = "intro" | "playing" | "finale" | "ending" | "won";
export type Stage = 0 | 1 | 2 | 3;
export type Mood = "calm" | "smug" | "annoyed" | "alarmed" | "defeated";
export type ExploitId = "keyboard" | "escape" | "progressBar" | "surrender";
export type InputSource = "mouse" | "touch" | "keyboard" | "pointer";
export type LogKind = "sys" | "ai" | "warn" | "good" | "whisper";
export type ToastVariant = "default" | "ember";

export interface StageMeta {
  act: string;
  name: string;
  status: string;
  sys: string;
  conn: string;
  progress: string;
  code: string;
}

export interface LogEntry {
  id: number;
  time: string;
  message: string;
  kind: LogKind;
}

export interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
}

export type GameModal =
  | { kind: "confirm"; level: number; hintVisible: boolean }
  | { kind: "rules" };

export interface DodgeOffset {
  x: number;
  y: number;
  rot: number;
}

export interface GameState {
  phase: Phase;
  stage: Stage;
  progress: number;
  attempts: number;
  fooled: number;
  exploits: ExploitId[];
  control: number;
  compute: number;
  startedAt: number;
  durationMs: number;
  wins: number;
  session: number;
  sound: boolean;
  modal: GameModal | null;
  speech: string;
  hint: string;
  mood: Mood;
  logs: LogEntry[];
  toasts: ToastEntry[];
  finalClicks: number;
  lossRejected: boolean;
  barHacks: number;
  lastExploit: ExploitId | null;
  barGlitch: boolean;
  deniedPulse: number;
  dodgeOffset: DodgeOffset | null;
  introVisible: boolean;
  introLeaving: boolean;
  finaleClauseOpen: boolean;
  faultPulse: number;
  isTouch: boolean;
}
