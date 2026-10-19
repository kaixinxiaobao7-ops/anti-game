import { useEffect, useRef } from "react";
import type { AntiGame } from "../game/useAntiGame";
import { MOODS } from "../game/constants";
import type { InputSource } from "../game/types";
import { useTypewriter } from "./hooks";

export function GameConsole({ game }: { game: AntiGame }) {
  const { state, actions, meta, buttonCopy } = game;
  const mainRef = useRef<HTMLButtonElement>(null);
  const pointerType = useRef<InputSource>("mouse");
  const modalKind = state.modal?.kind ?? null;
  const stage3 = state.stage === 3;
  const barExploitable = stage3 && state.phase === "playing";
  const progress = state.phase === "finale" ? 99.9 : state.progress;

  useEffect(() => {
    if (state.phase !== "playing" || modalKind !== null || state.stage === 3) return;
    const timer = window.setTimeout(() => {
      mainRef.current?.focus({ preventScroll: true });
    }, state.stage === 0 ? 380 : 0);
    return () => window.clearTimeout(timer);
  }, [state.phase, state.stage, modalKind]);

  useEffect(() => {
    if (!state.deniedPulse) return;
    const element = mainRef.current;
    if (!element) return;
    element.classList.remove("is-denied");
    void element.offsetWidth;
    element.classList.add("is-denied");
    const timer = window.setTimeout(() => element.classList.remove("is-denied"), 430);
    return () => window.clearTimeout(timer);
  }, [state.deniedPulse]);

  const actTag =
    state.phase === "finale" ? (
      <>
        <span>FINAL</span> 最终协议
      </>
    ) : (
      <>
        <span>{meta.act}</span> {meta.name}
      </>
    );

  const systemState =
    state.phase === "finale" ? "AWAITING YOUR SURRENDER" : meta.status;
  const progressLabel =
    state.phase === "finale" ? "最终许可 / 待批准" : meta.progress;
  const progressCode = state.phase === "finale" ? "FINAL_LOCK" : meta.code;
  const actionHint = buttonCopy.actionHint;

  function submit(source: InputSource) {
    actions.attempt(source);
  }

  return (
    <section className="console" id="console" aria-label="游戏区域">
      <div className="console-top">
        <div className="console-tag" id="actTag">
          {actTag}
        </div>
        <div className="console-meta">
          <span className="pulse-dot" />
          <span id="systemState">{systemState}</span>
        </div>
      </div>

      <div className="interaction">
        <div className="orb-wrap">
          <div className={`orb mood-${state.mood}`} id="orb" aria-hidden="true">
            <div className="orb-glow" />
            <div className="ring ring-a" />
            <div className="ring ring-b" />
            <div className="ring ring-c" />
            <div className="eye">
              <div className="iris">
                <div className="pupil" />
                <div className="eye-shine" />
              </div>
            </div>
            <div className="orb-scan" />
            <div className="orb-label">AI—404</div>
          </div>
          <div className="orb-shadow" />
        </div>

        <div className="speech">
          <div className="speech-head">
            <span className="ai-name">
              它 <i>/ ANTI</i>
            </span>
            <span className="ai-status" id="aiStatus">
              {MOODS[state.mood].status}
            </span>
          </div>
          <Typewriter text={state.speech} />
          <div className="hint-line" id="hintLine">
            <span>›</span> {state.hint}
          </div>
        </div>
      </div>

      <div className="action-zone" id="actionZone">
        <div
          className="btn-wrap"
          id="btnWrap"
          style={
            state.dodgeOffset
              ? {
                  transform: `translate(${state.dodgeOffset.x}px, ${state.dodgeOffset.y}px) rotate(${state.dodgeOffset.rot}deg)`,
                }
              : undefined
          }
        >
          <span className="bracket bracket-tl" aria-hidden="true" />
          <span className="bracket bracket-tr" aria-hidden="true" />
          <span className="bracket bracket-bl" aria-hidden="true" />
          <span className="bracket bracket-br" aria-hidden="true" />
          <button
            className="main-btn"
            id="mainBtn"
            type="button"
            ref={mainRef}
            aria-disabled={stage3}
            onPointerDown={(event) => {
              pointerType.current = event.pointerType === "touch" ? "touch" : "mouse";
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") actions.maybeDodge();
            }}
            onClick={(event) => {
              const source: InputSource =
                event.detail === 0 ? "keyboard" : pointerType.current;
              submit(source);
            }}
          >
            <span className="btn-kicker" id="btnKicker">
              {buttonCopy.kicker}
            </span>
            <span className="btn-label" id="btnLabel">
              {buttonCopy.label}
            </span>
            <span className="btn-icon" aria-hidden="true">
              ↗
            </span>
            <span className="btn-shine" aria-hidden="true" />
          </button>
        </div>
        <div className="action-hint" id="actionHint">
          <span
            className={`keycap${state.stage === 1 ? " is-highlight" : ""}`}
            id="keycap"
            role="button"
            tabIndex={0}
            aria-label="用回车键提交"
            onClick={(event) => {
              event.stopPropagation();
              submit("keyboard");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                submit("keyboard");
              }
            }}
          >
            ENTER
          </span>
          <span id="actionHintText">{actionHint}</span>
        </div>
      </div>

      <div className="progress-panel" id="progressPanel">
        <div className="progress-head">
          <div className="progress-name">
            <span id="progressLabel">{progressLabel}</span>
            <span className="progress-code">{progressCode}</span>
          </div>
          <div className="progress-value">
            <span id="pct">{progress.toFixed(1)}</span>
            <small>%</small>
          </div>
        </div>
        <div
          className={`bar${barExploitable ? " can-exploit" : ""}${state.barGlitch ? " glitching" : ""}`}
          id="bar"
          role="progressbar"
          aria-label={
            barExploitable
              ? "通关许可进度条。检测到未覆盖的写入权限，可点击或按回车篡改。"
              : state.phase === "finale"
                ? "最终通关许可，已锁定在 99.9%"
                : "通关许可进度"
          }
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          tabIndex={barExploitable ? 0 : undefined}
          onClick={() => {
            if (barExploitable) actions.hackProgressBar();
          }}
          onKeyDown={(event) => {
            if (barExploitable && (event.key === "Enter" || event.key === " ")) {
              event.preventDefault();
              event.stopPropagation();
              actions.hackProgressBar();
            }
          }}
        >
          <div className="bar-fill" id="barFill" style={{ width: `${progress}%` }} />
          <div className="bar-glitch" aria-hidden="true" />
          <div className="bar-ticks" aria-hidden="true" />
          <div
            className="bar-marker"
            id="barMarker"
            aria-hidden="true"
            style={{ left: `${progress}%` }}
          />
          <div className="bar-breach" aria-hidden="true">
            ← 未设防
          </div>
        </div>
        <div className="progress-foot">
          <div className="stats">
            <span>
              被耍 <b id="statFooled">{state.fooled}</b>
            </span>
            <span>
              尝试 <b id="statAttempts">{state.attempts}</b>
            </span>
            <span>
              漏洞 <b id="statExploits">{Math.min(state.exploits.length, 4)}</b>
              <i>/4</i>
            </span>
          </div>
          <div className="control-meter">
            它的掌控 <span id="control">{state.control}</span>%
          </div>
        </div>
      </div>

      <div className="console-fine">
        系统提示：本游戏没有任何隐藏漏洞。<span>（它刚刚撒谎了。）</span>
      </div>
    </section>
  );
}

function Typewriter({ text }: { text: string }) {
  const visible = useTypewriter(text);
  return (
    <p className="ai-text" id="aiText" aria-live="polite">
      {visible}
    </p>
  );
}
