import { useEffect, useState } from "react";
import { formatDuration } from "../game/constants";
import type { Phase } from "../game/types";

interface TopBarProps {
  phase: Phase;
  startedAt: number;
  durationMs: number;
  sound: boolean;
  sys: string;
  conn: string;
  onToggleSound: () => void;
  onRules: () => void;
}

export function TopBar({
  phase,
  startedAt,
  durationMs,
  sound,
  sys,
  conn,
  onToggleSound,
  onRules,
}: TopBarProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase !== "playing" && phase !== "finale" && phase !== "ending") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const elapsed =
    !startedAt
      ? "00:00"
      : phase === "won"
        ? formatDuration(durationMs)
        : formatDuration(now - startedAt);

  return (
    <header className="topbar">
      <a className="brand" href="./" aria-label="ANTI-GAME 首页">
        <span className="brand-mark" aria-hidden="true">
          <i />
        </span>
        <span className="brand-type">
          ANTI<span>/</span>GAME
        </span>
        <span className="brand-sub">拒绝被通关</span>
      </a>

      <div className="statusline" aria-live="polite">
        <span className="status-dot" id="statusDot" />
        <span id="statusText">{sys}</span>
        <span className="status-sep">//</span>
        <span id="connection">{conn}</span>
      </div>

      <div className="top-actions">
        <div className="timer" aria-label="本局已用时间">
          <span id="timer">{elapsed}</span>
          <small>你的时间</small>
        </div>
        <button
          className="icon-btn"
          id="soundBtn"
          type="button"
          aria-label={sound ? "关闭声音" : "开启声音"}
          aria-pressed={sound}
          title={sound ? "声音：开" : "声音：关"}
          onClick={onToggleSound}
        >
          <svg className="sound-on" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="M16 8.5c1.2 1 1.2 6 0 7" />
            <path d="M19 6c2.5 2.2 2.5 9.8 0 12" />
          </svg>
          <svg className="sound-off" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9h4l5-4v14l-5-4H4z" />
            <path d="m16 9 5 6m0-6-5 6" />
          </svg>
        </button>
        <button
          className="icon-btn text-icon"
          id="rulesBtn"
          type="button"
          aria-label="查看规则"
          title="规则"
          onClick={onRules}
        >
          ?
        </button>
      </div>
    </header>
  );
}
