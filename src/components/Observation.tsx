import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { Phase, Stage } from "../game/types";

const OBSERVATION_TEXT: Record<Stage, string> = {
  0: "它正在记录你的每一次犹豫。",
  1: "指针输入已注销。它开始监听你的键盘。",
  2: "确认逻辑正在递归。它对此很满意。",
  3: "扫描完成：所有入口已封锁。有一处异常。",
};

export function Observation({
  stage,
  phase,
}: {
  stage: Stage;
  phase: Phase;
}) {
  const bars = useMemo(
    () =>
      Array.from({ length: 46 }, () => ({
        height: `${Math.floor(Math.random() * 89) + 12}%`,
        duration: `${(1.4 + Math.random() * 2.2).toFixed(2)}s`,
        delay: `${(Math.random() * 1.6).toFixed(2)}s`,
      })),
    [],
  );

  const text =
    phase === "finale" || phase === "ending"
      ? "意图丢失。协议正在重新定义“胜利”。"
      : OBSERVATION_TEXT[stage];

  return (
    <div className="observation" id="observation" aria-hidden="true">
      <div className="obs-copy">
        <span className="mini-label">OBSERVATION FEED / 实时</span>
        <p id="observeText">{text}</p>
      </div>
      <div className="obs-wave" id="obsWave">
        {bars.map((bar, index) => (
          <i
            key={index}
            style={
              {
                "--h": bar.height,
                "--dur": bar.duration,
                "--delay": bar.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="obs-data">
        <div>
          <span>EYE CONTACT</span>
          <b>LOCKED</b>
        </div>
        <div>
          <span>MOUSE VECTOR</span>
          <b id="mouseVector">+00 / +00</b>
        </div>
      </div>
    </div>
  );
}
