import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { formatDuration } from "../game/constants";
import type { GameState } from "../game/types";

export function WinScreen({
  state,
  onRestart,
}: {
  state: GameState;
  onRestart: () => void;
}) {
  const restartRef = useRef<HTMLButtonElement>(null);
  const exploitCount = Math.min(state.exploits.length, 4);

  useEffect(() => {
    const timer = window.setTimeout(() => restartRef.current?.focus({ preventScroll: true }), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: 34 }, () => ({
        left: `${Math.random() * 100}%`,
        background: ["#d7ff3f", "#0a0b08", "#ff5a36", "#a8ca23", "#f0f3e4"][
          Math.floor(Math.random() * 5)
        ],
        width: `${Math.floor(Math.random() * 5) + 4}px`,
        height: `${Math.floor(Math.random() * 13) + 9}px`,
        duration: `${(2.7 + Math.random() * 2.8).toFixed(2)}s`,
        delay: `${(Math.random() * 1.3).toFixed(2)}s`,
        drift: `${Math.floor(Math.random() * 281) - 140}px`,
        rotate: `${Math.floor(Math.random() * 181)}deg`,
      })),
    [],
  );

  return (
    <section className="win-screen" id="winScreen" role="dialog" aria-modal="true" aria-label="通关成功">
      <div className="win-top">
        <span>ANTI-GAME // OUTCOME: UNEXPECTED</span>
        <span>SEAL 000 — APPROVED</span>
      </div>
      <div className="win-main">
        <div>
          <div className="win-kicker">
            <i /> SYSTEM ERROR / 它没有写这个分支
          </div>
          <h1 className="win-title">
            <span className="win-title-line">你赢了。</span>
            <span className="stroke">因为你没赢。</span>
          </h1>
          <p className="win-sub">
            <span className="win-sub-index">↳</span>
            <span>
              它拦住了每一个想赢的人。你只是<b>不想玩了</b>。
              <br />
              在它庞大的防御协议里，只有“放弃”没有被写上锁。
            </span>
          </p>
        </div>
        <div className="win-right">
          <div className="win-stamp">
            <div>
              <b>
                通关
                <br />
                认证
              </b>
              <i />
              <span>
                APPROVED
                <br />
                BY LOOPHOLE
              </span>
            </div>
          </div>
          <div className="win-code" aria-hidden="true">
            <div className="win-code-head">
              <span>THE MISSING BRANCH</span>
              <span>404</span>
            </div>
            <pre>
              <code>
                <span className="code-key">if</span> (!player.wantsToWin) {"{"}
                {"\n"}  <span className="code-fn">grantVictory</span>(player);
                {"\n"}
                {"}"}
              </code>
            </pre>
            <div className="win-code-foot">anti-game.js // line 404</div>
          </div>
          <p className="win-quote">
            “这不是胜利。
            <br />
            这是我漏写的一个 if。”
            <span>— 它，正在重启</span>
          </p>
        </div>
      </div>
      <div className="win-stats">
        <div className="win-stat">
          <span>本局用时</span>
          <b>{formatDuration(state.durationMs)}</b>
        </div>
        <div className="win-stat">
          <span>被它耍了</span>
          <b>
            {state.fooled}
            <small>次</small>
          </b>
        </div>
        <div className="win-stat">
          <span>发现的漏洞</span>
          <b>
            {exploitCount}
            <small>/ 4</small>
          </b>
        </div>
        <div className="win-stat">
          <span>放弃次数</span>
          <b>
            1<small>次</small>
          </b>
        </div>
      </div>
      <div className="win-actions">
        <button
          className="win-restart"
          id="restartBtn"
          type="button"
          ref={restartRef}
          onClick={onRestart}
        >
          <span>再被耍一次</span>
          <span>↗</span>
        </button>
        <div className="win-note">
          漏洞已记录。它说下次会补上。
          <br />
          但“下次”也是一个未被定义的变量。
        </div>
        <div className="win-total">你已击败它 {state.wins} 次</div>
      </div>
      <div aria-hidden="true">
        {confetti.map((piece, index) => (
          <i
            key={index}
            className="confetti"
            style={
              {
                left: piece.left,
                background: piece.background,
                width: piece.width,
                height: piece.height,
                animationDuration: piece.duration,
                animationDelay: piece.delay,
                "--drift": piece.drift,
                transform: `rotate(${piece.rotate})`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </section>
  );
}
