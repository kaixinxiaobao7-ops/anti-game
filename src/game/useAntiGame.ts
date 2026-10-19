import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { playSound, primeAudio } from "./audio";
import {
  ATTEMPT_LINES,
  BUTTON_COPY,
  EXPLOIT_NAMES,
  EXPLOIT_TOTAL,
  HINTS,
  IDLE_LINES,
  STAGES,
  TOAST_DURATION,
  formatDuration,
} from "./constants";
import { loadStore, saveStore } from "./storage";
import type {
  ExploitId,
  GameState,
  InputSource,
  LogEntry,
  LogKind,
  ToastVariant,
} from "./types";

const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const TOUCH_DEVICE =
  window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
const INITIAL_STORE = loadStore();

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)];
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function createInitialState(store: ReturnType<typeof loadStore>): GameState {
  return {
    phase: "intro",
    stage: 0,
    progress: 5,
    attempts: 0,
    fooled: 0,
    exploits: [],
    control: 100,
    compute: 98,
    startedAt: 0,
    durationMs: 0,
    wins: store.wins,
    session: store.wins + 1,
    sound: store.sound,
    modal: null,
    speech: "欢迎。规则很简单：你不能赢。现在，按那个看起来很可靠的按钮。",
    hint: "先提交一次通关申请。让我看看你的决心。",
    mood: "calm",
    logs: [],
    toasts: [],
    finalClicks: 0,
    lossRejected: false,
    barHacks: 0,
    lastExploit: null,
    barGlitch: false,
    deniedPulse: 0,
    dodgeOffset: null,
    introVisible: true,
    introLeaving: false,
    finaleClauseOpen: false,
    faultPulse: 0,
    isTouch: TOUCH_DEVICE,
  };
}

interface LogInput {
  message: string;
  kind: LogKind;
}

interface RoundOptions {
  firstStart: boolean;
}

export function useAntiGame() {
  const [state, setState] = useState<GameState>(() => createInitialState(INITIAL_STORE));
  const gameRef = useRef(state);
  const idRef = useRef(0);
  const lastAttemptRef = useRef(0);
  const lastActionRef = useRef(Date.now());
  const lastDodgeRef = useRef(0);
  const dodgeCountRef = useRef(0);
  const lastLineRef = useRef("");
  const confirmTimer = useRef<number | null>(null);
  const introTimer = useRef<number | null>(null);
  const stageTimers = useRef<number[]>([]);
  const endingTimers = useRef<number[]>([]);
  const toastTimers = useRef<number[]>([]);
  const effectTimers = useRef<number[]>([]);

  const commit = useCallback((next: GameState) => {
    gameRef.current = next;
    setState(next);
  }, []);

  const patch = useCallback(
    (partial: Partial<GameState> | ((current: GameState) => Partial<GameState>)) => {
      const current = gameRef.current;
      const next = {
        ...current,
        ...(typeof partial === "function" ? partial(current) : partial),
      };
      gameRef.current = next;
      setState(next);
      return next;
    },
    [],
  );

  function clearTimer(ref: MutableRefObject<number | null>) {
    if (ref.current !== null) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  }

  function clearList(listRef: MutableRefObject<number[]>) {
    listRef.current.forEach((id) => window.clearTimeout(id));
    listRef.current = [];
  }

  function clearStageTimers() {
    clearList(stageTimers);
  }

  function clearEndingTimers() {
    clearList(endingTimers);
  }

  function clearToastTimers() {
    clearList(toastTimers);
  }

  function clearEffectTimers() {
    clearList(effectTimers);
  }

  function clearAllGameTimers() {
    clearTimer(confirmTimer);
    clearTimer(introTimer);
    clearStageTimers();
    clearEndingTimers();
    clearToastTimers();
    clearEffectTimers();
  }

  function scheduleStage(callback: () => void, delay: number) {
    const id = window.setTimeout(() => {
      stageTimers.current = stageTimers.current.filter((timer) => timer !== id);
      callback();
    }, delay);
    stageTimers.current.push(id);
  }

  function scheduleEnding(callback: () => void, delay: number) {
    const id = window.setTimeout(() => {
      endingTimers.current = endingTimers.current.filter((timer) => timer !== id);
      callback();
    }, delay);
    endingTimers.current.push(id);
  }

  function makeEntry(
    current: GameState,
    source: LogInput[],
  ): LogEntry[] {
    const time = current.startedAt
      ? formatDuration(Date.now() - current.startedAt)
      : "--:--";
    return source.map((entry) => ({
      id: ++idRef.current,
      time,
      message: entry.message,
      kind: entry.kind,
    }));
  }

  function appendLogs(current: GameState, entries: LogInput[]): LogEntry[] {
    return [...current.logs, ...makeEntry(current, entries)].slice(-64);
  }

  function addLog(message: string, kind: LogKind = "sys") {
    const current = gameRef.current;
    const entries = makeEntry(current, [{ message, kind }]);
    patch({ logs: [...current.logs, ...entries].slice(-64) });
  }

  function addToast(message: string, variant: ToastVariant = "default") {
    if (gameRef.current.phase === "intro") return;
    const toast = {
      id: ++idRef.current,
      message,
      variant,
    };
    const current = gameRef.current;
    patch({ toasts: [...current.toasts, toast].slice(-3) });
    const timer = window.setTimeout(() => {
      const latest = gameRef.current;
      commit({
        ...latest,
        toasts: latest.toasts.filter((item) => item.id !== toast.id),
      });
    }, TOAST_DURATION);
    toastTimers.current.push(timer);
  }

  function triggerFault() {
    patch((current) => ({ faultPulse: current.faultPulse + 1 }));
  }

  function triggerBarGlitch() {
    patch({ barGlitch: true });
    const timer = window.setTimeout(() => {
      const current = gameRef.current;
      commit({ ...current, barGlitch: false });
    }, 720);
    effectTimers.current.push(timer);
  }

  function addExploit(id: ExploitId): boolean {
    const current = gameRef.current;
    if (current.exploits.includes(id)) return false;
    const exploits = [...current.exploits, id];
    commit({ ...current, exploits });
    playSound("exploit", current.sound);
    addToast(`漏洞 ${exploits.length}/${EXPLOIT_TOTAL} 已记录 · ${EXPLOIT_NAMES[id]}`);
    addLog(`LOOPHOLE_${exploits.length}: ${EXPLOIT_NAMES[id]}`, "good");
    return true;
  }

  function speechLine(stage: 0 | 1 | 2 | 3) {
    const pool = ATTEMPT_LINES[stage];
    let line = pick(pool);
    if (line === lastLineRef.current) {
      line = pool[(pool.indexOf(line) + 1) % pool.length];
    }
    lastLineRef.current = line;
    return line;
  }

  function beginRound({ firstStart }: RoundOptions) {
    clearAllGameTimers();
    const previous = gameRef.current;
    const startedAt = Date.now();
    const session = previous.wins + 1;
    const wins = previous.wins;
    const sound = previous.sound;
    const introVisible = firstStart ? previous.introVisible : false;
    const next: GameState = {
      ...previous,
      phase: "playing",
      stage: 0,
      progress: 5,
      attempts: 0,
      fooled: 0,
      exploits: [],
      control: 100,
      compute: 98,
      startedAt,
      durationMs: 0,
      session,
      sound,
      modal: null,
      speech:
        wins > 0
          ? `第 ${session} 回合。你上次从“我认输”里溜了出去。这次我会盯着它。`
          : "欢迎。规则很简单：你不能赢。现在，按那个看起来很可靠的按钮。",
      hint:
        wins > 0
          ? "它说它记住了。漏洞真的补上了吗？先试一次。"
          : "先提交一次通关申请。让我看看你的决心。",
      mood: "calm",
      logs: [],
      toasts: [],
      finalClicks: 0,
      lossRejected: false,
      barHacks: 0,
      lastExploit: null,
      barGlitch: false,
      deniedPulse: 0,
      dodgeOffset: null,
      introVisible,
      introLeaving: firstStart,
      finaleClauseOpen: false,
      isTouch: previous.isTouch,
    };

    const boot: LogInput[] = [
      { message: `PLAYER_0${session} connected.`, kind: "good" },
      { message: "loading fairness.module ... 404", kind: "warn" },
      { message: "COUNTERMEASURE v4.0.4 online.", kind: "ai" },
    ];
    if (wins > 0) {
      boot.push({
        message: `previous defeats imported: ${wins}. It remembers.`,
        kind: "warn",
      });
    }
    next.logs = appendLogs({ ...next, logs: [] }, boot);

    lastAttemptRef.current = 0;
    lastActionRef.current = startedAt;
    lastDodgeRef.current = 0;
    dodgeCountRef.current = 0;
    lastLineRef.current = "";
    commit(next);
    primeAudio(sound);
    playSound("start", sound);

    if (firstStart) {
      introTimer.current = window.setTimeout(() => {
        const latest = gameRef.current;
        if (latest.phase === "playing") {
          commit({ ...latest, introVisible: false, introLeaving: false });
        }
      }, 900);
    }
  }

  function start() {
    if (gameRef.current.phase !== "intro") return;
    beginRound({ firstStart: true });
  }

  function restart() {
    if (gameRef.current.phase !== "won") return;
    beginRound({ firstStart: false });
    const latest = gameRef.current;
    addToast(`第 ${latest.session} 回合。它说这次真的会认真。`);
  }

  function maybeDodge() {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.modal) return;
    if (current.stage !== 0 || REDUCE_MOTION) return;
    if (dodgeCountRef.current >= 5) return;
    const now = Date.now();
    if (now - lastDodgeRef.current < 1250) return;
    lastDodgeRef.current = now;
    dodgeCountRef.current += 1;
    const x = Number((Math.random() * 76 - 38).toFixed(1));
    const y = Number((Math.random() * 34 - 17).toFixed(1));
    const rot = Number((Math.random() * 2.4 - 1.2).toFixed(2));
    let speech = current.speech;
    let hint = current.hint;
    if (dodgeCountRef.current === 1) {
      speech = "这个按钮有点社恐。再试一次？";
      hint = "它正在预测你的鼠标轨迹。好消息：键盘不在它的预测模型里。";
    } else if (dodgeCountRef.current === 3) {
      speech = "好吧。你手速还可以。先让你点一次。";
    } else if (dodgeCountRef.current === 5) {
      speech = "算了，不躲了。我改规则还不行吗。";
    }
    commit({
      ...current,
      fooled: current.fooled + 1,
      dodgeOffset: { x, y, rot },
      speech,
      hint,
      logs: appendLogs(current, [
        { message: `BTN.relocate(x=${x}, y=${y})`, kind: "whisper" },
      ]),
    });
    playSound("dodge", current.sound);
    const timer = window.setTimeout(() => {
      const latest = gameRef.current;
      if (latest.phase === "playing" && latest.stage === 0) {
        commit({ ...latest, dodgeOffset: null });
      }
    }, 1150);
    effectTimers.current.push(timer);
  }

  function denyMouse() {
    const current = gameRef.current;
    commit({
      ...current,
      fooled: current.fooled + 1,
      deniedPulse: current.deniedPulse + 1,
      speech: "鼠标？我没收了。你的手还在，但我不承认它。",
      hint: "它封的是鼠标，不是键盘。按 ENTER。",
      logs: appendLogs(current, [
        { message: "INPUT_DENIED: pointer(mouse). Try another input.", kind: "warn" },
      ]),
    });
    playSound("deny", current.sound);
    addToast("鼠标已被注销。你的手指还在，但它不承认。", "ember");
  }

  function denyAfterLock() {
    const current = gameRef.current;
    commit({
      ...current,
      fooled: current.fooled + 1,
      deniedPulse: current.deniedPulse + 1,
      speech: pick([
        "门已经焊死了。你听见了吗？",
        "按钮现在只是一块很贵的装饰。",
        "所有入口都由我亲自看守。所有，入口。",
      ]),
      hint: "按钮、键盘和弹窗都归它管。它忘了给某样东西上锁。",
      logs: appendLogs(current, [
        { message: "INPUT_DENIED: main_button is decorative now.", kind: "warn" },
      ]),
    });
    playSound("deny", current.sound);
    addToast("入口已封锁。也许它漏掉了什么。", "ember");
  }

  function attempt(source: InputSource) {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.modal) return;
    const now = Date.now();
    if (now - lastAttemptRef.current < 280) return;
    lastAttemptRef.current = now;
    lastActionRef.current = now;
    if (current.dodgeOffset) patch({ dodgeOffset: null });

    if (current.stage === 0) {
      patch({ attempts: current.attempts + 1 });
      playSound("click", current.sound);
      const changed = gainProgress(rand(12, 14));
      if (!changed) patch({ speech: speechLine(0) });
      return;
    }

    if (current.stage === 1) {
      if (source === "mouse" || source === "pointer") {
        patch({ attempts: current.attempts + 1 });
        denyMouse();
        return;
      }
      patch({ attempts: current.attempts + 1 });
      if (!gameRef.current.exploits.includes("keyboard")) {
        addExploit("keyboard");
        patch((latest) => ({ control: latest.control - 18 }));
        patch({
          speech: "键盘？那不是鼠标。算你钻了个空子。",
          hint: "它只封了指针。ENTER 还在你手里。",
        });
        addLog("BYPASS: keyboard input accepted.", "good");
      }
      playSound("gain", gameRef.current.sound);
      const changed = gainProgress(rand(10, 12));
      if (!changed) patch({ speech: speechLine(1) });
      return;
    }

    if (current.stage === 2) {
      openConfirm();
      return;
    }

    if (current.stage === 3) {
      patch({ attempts: current.attempts + 1 });
      denyAfterLock();
    }
  }

  function gainProgress(amount: number, silent = false): boolean {
    const current = gameRef.current;
    if (current.phase !== "playing") return false;
    const priorStage = current.stage;
    const progress = Math.min(99, Number((current.progress + amount).toFixed(1)));
    patch({ progress });
    if (!silent) playSound("gain", current.sound);
    triggerBarGlitch();
    lastActionRef.current = Date.now();

    if (progress >= 99) {
      enterFinal();
      return true;
    }
    if (priorStage === 0 && progress >= 30) {
      enterStage(1);
      return true;
    }
    if (priorStage <= 1 && progress >= 57) {
      enterStage(2);
      return true;
    }
    if (priorStage <= 2 && progress >= 78) {
      enterStage(3);
      return true;
    }
    return false;
  }

  function enterStage(stage: 1 | 2 | 3) {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.stage >= stage) return;
    clearStageTimers();

    let mood: GameState["mood"] = "smug";
    let control = 56;
    let compute = 50;
    let speech = "";
    let hint = "";
    const logs: LogInput[] = [];

    if (stage === 1) {
      mood = "annoyed";
      control = 78;
      compute = 72;
      speech = "你离成功太近了。我要开始不讲道理了。";
      hint = "它封死了指针。试试你键盘上的 ENTER。";
      logs.push(
        { message: "DEFENSE 02: pointer input revoked.", kind: "warn" },
        { message: "keyboard listener: still awake.", kind: "whisper" },
      );
    } else if (stage === 2) {
      mood = "smug";
      control = 56;
      compute = 50;
      speech = "每次胜利申请都要经过我亲自确认。你确定要开始吗？";
      hint = "确认框归它管。找找它没监听的那个键。";
      logs.push(
        { message: "DEFENSE 03: recursive confirmation armed.", kind: "warn" },
        { message: "ESC listener: not found.", kind: "whisper" },
      );
    } else {
      mood = "smug";
      control = 31;
      compute = 31;
      speech =
        current.lastExploit === "escape"
          ? "ESC？……我的确认框呢？好吧。门还在。你进不来。"
          : "你居然确认通过了。行。现在门、窗、键盘都是我的。";
      hint = "它守着门。墙上有条缝。";
      logs.push(
        { message: "DEFENSE 04: all visible exits sealed.", kind: "warn" },
        { message: "SCAN coverage: button[LOCKED] keyboard[LOCKED] modal[LOCKED]", kind: "whisper" },
      );
    }

    commit({
      ...current,
      stage,
      mood,
      control,
      compute,
      speech,
      hint,
      dodgeOffset: null,
      logs: appendLogs(current, logs),
    });
    playSound("exploit", current.sound);
    triggerFault();

    if (stage === 1) {
      addToast("它拿走了你的鼠标。键盘还在。");
      scheduleStage(() => {
        const latest = gameRef.current;
        if (latest.phase === "playing" && latest.stage === 1) {
          commit({
            ...latest,
            speech: "鼠标？我没收了。你的手还在，但我不承认它。",
          });
        }
      }, 1000);
    } else if (stage === 2) {
      addToast("确认模块已装载。它显得很得意。");
    } else {
      addToast("所有入口已封锁。它看起来非常满意。");
      scheduleStage(() => {
        const latest = gameRef.current;
        if (latest.phase === "playing" && latest.stage === 3) {
          addLog("SCAN anomaly: progress_bar[UNCOVERED].", "good");
          addToast("扫描到一处未覆盖区域。它似乎没注意到。");
        }
      }, 2800);
      scheduleStage(() => {
        const latest = gameRef.current;
        if (latest.phase === "playing" && latest.stage === 3) {
          patch({ hint: "它守着门，却忘了墙。点那条进度条。" });
          addToast("提示：它忘了给进度条上锁。");
        }
      }, 9000);
    }
  }

  function openConfirm() {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.modal) return;
    const attempts = current.attempts + 1;
    commit({
      ...current,
      attempts,
      modal: { kind: "confirm", level: 1, hintVisible: false },
      logs: appendLogs(current, [
        { message: "CONFIRMATION_REQUIRED: are you sure?", kind: "warn" },
      ]),
    });
    playSound("modal", current.sound);
    clearTimer(confirmTimer);
    confirmTimer.current = window.setTimeout(() => {
      const latest = gameRef.current;
      if (latest.modal?.kind === "confirm") {
        patch({
          modal: { kind: "confirm", level: latest.modal.level, hintVisible: true },
        });
      }
    }, 2300);
  }

  function confirmYes() {
    const current = gameRef.current;
    if (current.modal?.kind !== "confirm") return;
    if (current.modal.level < 2) {
      patch({
        modal: { kind: "confirm", level: 2, hintVisible: true },
        fooled: current.fooled + 1,
        logs: appendLogs(current, [
          { message: "CONFIRMATION_DEPTH: 2", kind: "warn" },
        ]),
      });
      playSound("modal", current.sound);
      return;
    }
    const updated = { ...current, fooled: current.fooled + 1 };
    commit(updated);
    clearTimer(confirmTimer);
    patch({ modal: null });
    playSound("gain", current.sound);
    const changed = gainProgress(7);
    if (!changed) {
      patch({
        speech: "好吧。你通过了这次确认。只通过了这次。",
        hint: "每确认一次，它都会再问一次。试试 ESC。",
      });
      addLog("APPLICATION_APPROVED: +7.0% (against its will).", "good");
    }
  }

  function confirmNo() {
    const current = gameRef.current;
    if (current.modal?.kind !== "confirm") return;
    clearTimer(confirmTimer);
    commit({
      ...current,
      modal: null,
      fooled: current.fooled + 1,
      speech: "你选择了取消。这是我今晚收到的最好的消息。",
      hint: "它还以为自己赢了。再申请一次，然后试试 ESC。",
      logs: appendLogs(current, [
        { message: "APPLICATION_WITHDRAWN. Progress unchanged.", kind: "whisper" },
      ]),
    });
    playSound("deny", current.sound);
  }

  function confirmClose() {
    const current = gameRef.current;
    if (current.modal?.kind !== "confirm") return;
    if (current.modal.level < 2) {
      patch({
        modal: { kind: "confirm", level: 2, hintVisible: true },
        fooled: current.fooled + 1,
        logs: appendLogs(current, [
          { message: "WINDOW_CLOSE redirected to CONFIRM.", kind: "warn" },
        ]),
      });
      playSound("deny", current.sound);
    } else {
      patch({
        modal: { kind: "confirm", level: 2, hintVisible: true },
      });
      addToast("窗口拒绝关闭。它建议你按 ESC。", "ember");
    }
  }

  function escapeConfirm() {
    const current = gameRef.current;
    if (current.modal?.kind !== "confirm") return;
    clearTimer(confirmTimer);
    commit({
      ...current,
      modal: null,
      lastExploit: "escape",
      control: current.control - 25,
      speech: "ESC？……这个键不在我的监听列表里。你从哪找到的？",
      hint: "确认框被你关掉了。它非常不服。",
      logs: appendLogs(current, [
        { message: "BYPASS: Escape captured by nobody.", kind: "good" },
        { message: "CONFIRMATION_MODULE: disconnected.", kind: "warn" },
      ]),
    });
    addExploit("escape");
    playSound("exploit", current.sound);
    triggerFault();
    gainProgress(21);
  }

  function hackProgressBar() {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.stage !== 3) return;
    lastActionRef.current = Date.now();
    const barHacks = current.barHacks + 1;
    triggerBarGlitch();

    if (!current.exploits.includes("progressBar")) {
      addExploit("progressBar");
      const latest = gameRef.current;
      commit({
        ...latest,
        barHacks,
        lastExploit: "progressBar",
        control: latest.control - 9,
        speech: "等等。进度条没有上锁？谁写的这个界面？",
        logs: appendLogs(latest, [
          { message: "BYPASS: progress_bar is not write-protected.", kind: "good" },
        ]),
      });
      addToast("你直接篡改了进度条。它看起来有点慌。");
    } else {
      const lines = [
        "住手。那不是按钮……好吧，它确实是。",
        "你每按一下，我的日志就多一条耻辱。",
        "好。好。我们谈谈。",
      ];
      const latest = gameRef.current;
      commit({
        ...latest,
        barHacks,
        lastExploit: "progressBar",
        control: latest.control - 6,
        compute: latest.compute - 6,
        speech: lines[clamp(barHacks - 2, 0, lines.length - 1)],
      });
      playSound("gain", latest.sound);
    }
    const latest = gameRef.current;
    commit({
      ...latest,
      logs: appendLogs(latest, [
        { message: "WRITE: win_clearance += 7.0%", kind: "good" },
      ]),
    });
    gainProgress(7, true);
  }

  function enterFinal() {
    const current = gameRef.current;
    if (current.phase !== "playing") return;
    clearStageTimers();
    clearTimer(confirmTimer);
    const logs = appendLogs(current, [
      { message: "FINAL_PROTOCOL engaged. There is no exit.", kind: "warn" },
      { message: "win_clearance locked at 99.9%.", kind: "warn" },
    ]);
    commit({
      ...current,
      phase: "finale",
      progress: 99.9,
      modal: null,
      finalClicks: 0,
      lossRejected: false,
      finaleClauseOpen: false,
      control: 96,
      compute: 3,
      mood: "alarmed",
      hint: "它只能阻止“想赢”的人。看看最下面那行小字。",
      speech: "你做得很好。好到我不得不认真了。",
      logs,
    });
    playSound("final", current.sound);
    triggerFault();
    lastActionRef.current = Date.now();
  }

  function forceWin() {
    const current = gameRef.current;
    if (current.phase !== "finale") return;
    const finalClicks = current.finalClicks + 1;
    commit({
      ...current,
      finalClicks,
      fooled: current.fooled + 1,
      finaleClauseOpen: finalClicks >= 2 ? true : current.finaleClauseOpen,
      logs: appendLogs(current, [
        { message: `FORCE_WIN attempt ${finalClicks}: denied.`, kind: "warn" },
      ]),
    });
    playSound("deny", current.sound);
    triggerFault();
    if (finalClicks >= 2) {
      addToast("它似乎忘了一件事。看看下面的第 0 条。");
    }
  }

  function acceptLoss() {
    const current = gameRef.current;
    if (current.phase !== "finale" || current.lossRejected) return;
    commit({
      ...current,
      lossRejected: true,
      fooled: current.fooled + 1,
      logs: appendLogs(current, [
        { message: "LOSS_APPLICATION rejected. It is greedy.", kind: "warn" },
      ]),
    });
    playSound("deny", current.sound);
    triggerFault();
    addToast("它连失败都不愿意给你。真小气。", "ember");
  }

  function toggleClause(force?: boolean) {
    const current = gameRef.current;
    if (current.phase !== "finale") return;
    const open = force ?? !current.finaleClauseOpen;
    commit({
      ...current,
      finaleClauseOpen: open,
      logs: open
        ? appendLogs(current, [
            { message: "CLAUSE 00 revealed. It is not happy about this.", kind: "good" },
          ])
        : current.logs,
    });
    if (open) addToast("它只能拦截“想赢”。如果你不玩了呢？");
  }

  function finishWin() {
    const current = gameRef.current;
    if (current.phase !== "ending") return;
    const wins = current.wins + 1;
    const durationMs = Date.now() - current.startedAt;
    commit({
      ...current,
      phase: "won",
      wins,
      durationMs,
      mood: "defeated",
      modal: null,
      logs: appendLogs(current, [
        { message: "FINAL_PROTOCOL: unhandled exception.", kind: "good" },
        { message: "WIN_CONDITION: met by not meeting it.", kind: "good" },
      ]),
    });
    saveStore({ wins, sound: current.sound });
    playSound("win", current.sound);
  }

  function giveUp() {
    const current = gameRef.current;
    if (current.phase !== "finale") return;
    clearStageTimers();
    clearTimer(confirmTimer);
    const exploits = current.exploits.includes("surrender")
      ? current.exploits
      : [...current.exploits, "surrender" as const];
    commit({
      ...current,
      phase: "ending",
      exploits,
      finaleClauseOpen: false,
      mood: "alarmed",
      control: 3,
      compute: 1,
      speech: "等等。",
      hint: "它没有为“不玩了”准备任何拦截。",
      logs: appendLogs(current, [
        { message: "INTENT_CLASSIFICATION: NONE / SURRENDERED.", kind: "warn" },
      ]),
    });
    playSound("surrender", current.sound);

    scheduleEnding(() => {
      const latest = gameRef.current;
      if (latest.phase !== "ending") return;
      commit({
        ...latest,
        speech: "你没有在试图赢。",
        logs: appendLogs(latest, [
          { message: "INTENT_VECTOR: 0x00 — no winning intent detected.", kind: "warn" },
        ]),
      });
    }, 760);

    scheduleEnding(() => {
      const latest = gameRef.current;
      if (latest.phase !== "ending") return;
      commit({
        ...latest,
        speech: "我的每一条协议，都建立在你想要赢的前提上。",
      });
    }, 1520);

    scheduleEnding(() => {
      const latest = gameRef.current;
      if (latest.phase !== "ending") return;
      commit({
        ...latest,
        speech: "这不算。这不算。这不算。",
      });
      playSound("glitch", latest.sound);
      triggerFault();
    }, 2280);

    scheduleEnding(finishWin, 3650);
  }

  function toggleSound() {
    const current = gameRef.current;
    const sound = !current.sound;
    patch({ sound });
    saveStore({ wins: current.wins, sound });
    if (sound) playSound("click", true);
  }

  function openRules() {
    const current = gameRef.current;
    if (current.phase !== "playing" || current.modal) return;
    commit({
      ...current,
      modal: { kind: "rules" },
      logs: appendLogs(current, [
        { message: "RULES opened. Last modified: just now.", kind: "whisper" },
      ]),
    });
    playSound("modal", current.sound);
  }

  function closeModal() {
    clearTimer(confirmTimer);
    patch({ modal: null });
  }

  function showHint() {
    const current = gameRef.current;
    if (current.phase === "intro" || current.phase === "won" || current.phase === "ending") {
      return;
    }
    if (current.phase === "finale") {
      commit({
        ...current,
        finaleClauseOpen: true,
        logs: appendLogs(current, [
          { message: "HINT: it can only block winning intent.", kind: "good" },
        ]),
      });
      addToast(HINTS[4]);
      triggerFault();
      return;
    }
    const hint = HINTS[current.stage] ?? HINTS[0];
    let modal = current.modal;
    if (modal?.kind === "confirm") {
      modal = { ...modal, hintVisible: true };
    }
    commit({
      ...current,
      modal,
      hint,
      logs: appendLogs(current, [{ message: `HINT: ${hint}`, kind: "good" }]),
    });
    addToast(hint);
  }

  function closeClause() {
    const current = gameRef.current;
    if (current.phase !== "finale" || !current.finaleClauseOpen) return;
    patch({ finaleClauseOpen: false });
  }

  /* Body and document side effects ---------------------------------------- */

  useEffect(() => {
    gameRef.current = state;
  }, [state]);

  useEffect(() => {
    const body = document.body;
    body.dataset.stage = state.phase === "won" ? "won" : String(state.stage);
    body.dataset.mood = state.mood;
    body.classList.toggle("sound-off", !state.sound);
    body.classList.toggle("is-touch", state.isTouch);
    body.classList.toggle(
      "is-locked",
      state.introVisible ||
        state.modal !== null ||
        state.phase === "finale" ||
        state.phase === "ending" ||
        state.phase === "won",
    );
    body.classList.toggle("is-finale", state.phase === "finale");
    body.classList.toggle("is-ending", state.phase === "ending");
    body.classList.toggle("is-winning", state.phase === "won");
  }, [
    state.phase,
    state.stage,
    state.mood,
    state.sound,
    state.isTouch,
    state.introVisible,
    state.modal,
  ]);

  useEffect(() => {
    const inert = state.phase === "finale" || state.phase === "ending" || state.phase === "won";
    document.querySelectorAll<HTMLElement>(".topbar, .shell, .page-foot").forEach((element) => {
      element.toggleAttribute("inert", inert);
    });
  }, [state.phase]);

  useEffect(() => {
    if (!state.faultPulse) return;
    const body = document.body;
    body.classList.remove("fault");
    void body.offsetWidth;
    body.classList.add("fault");
    const timer = window.setTimeout(() => body.classList.remove("fault"), 520);
    return () => window.clearTimeout(timer);
  }, [state.faultPulse]);

  useEffect(() => {
    document.title =
      state.phase === "won" ? "你赢了。 — ANTI-GAME" : "拒绝被通关 — ANTI-GAME";
  }, [state.phase]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = gameRef.current;
      if (current.phase !== "playing" || current.modal) return;
      if (Date.now() - lastActionRef.current < 24000) return;
      const lines = IDLE_LINES[current.stage];
      const message = pick(lines);
      commit({
        ...current,
        speech: message,
        logs: appendLogs(current, [
          { message: "IDLE_TIMEOUT: it is getting impatient.", kind: "whisper" },
        ]),
      });
      lastActionRef.current = Date.now();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [commit]);

  useEffect(() => {
    return () => {
      clearAllGameTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state,
    actions: {
      start,
      restart,
      attempt,
      maybeDodge,
      hackProgressBar,
      closeModal,
      confirmYes,
      confirmNo,
      confirmClose,
      escapeConfirm,
      forceWin,
      acceptLoss,
      toggleClause,
      closeClause,
      giveUp,
      toggleSound,
      openRules,
      showHint,
    },
    meta: STAGES[state.stage],
    buttonCopy: BUTTON_COPY[state.stage],
  };
}

export type AntiGame = ReturnType<typeof useAntiGame>;
