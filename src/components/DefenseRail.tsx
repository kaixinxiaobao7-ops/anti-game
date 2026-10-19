import { LAYERS, MOODS } from "../game/constants";
import type { Mood, Phase, Stage } from "../game/types";

interface DefenseRailProps {
  stage: Stage;
  phase: Phase;
  mood: Mood;
}

export function DefenseRail({ stage, phase, mood }: DefenseRailProps) {
  const active = phase === "finale" ? 3 : stage;
  const moodInfo = MOODS[mood];

  return (
    <aside className="left-rail" aria-label="防御层级">
      <div className="rail-label">
        DEFENSE LAYERS <span>04</span>
      </div>
      <ol className="layers" id="layers">
        {LAYERS.map((layer, index) => {
          const isActive = index === active;
          const isDone = index < active;
          let stateLabel = "—";
          if (isDone) stateLabel = "BYPASSED";
          else if (isActive) {
            stateLabel = phase === "finale" ? "LOCK" : index === 3 ? "SEALED" : "ON";
          }
          return (
            <li
              key={layer.no}
              className={`layer${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
              data-layer={index}
            >
              <span className="layer-no">{layer.no}</span>
              <span className="layer-info">
                <b>{layer.title}</b>
                <small>{layer.sub}</small>
              </span>
              <span className="layer-state">{stateLabel}</span>
            </li>
          );
        })}
      </ol>

      <div className="rail-divider">
        <span />
        <i>×</i>
        <span />
      </div>

      <div className="rail-bottom">
        <div className="mini-label">它现在的心情</div>
        <div className="mood-line">
          <span className="mood-face" id="moodFace">
            {moodInfo.face}
          </span>
          <b id="moodText">{moodInfo.text}</b>
        </div>
        <blockquote id="railQuote">{moodInfo.quote}</blockquote>
        <div className="compat">
          <span>HUMAN DETECTED</span>
          <span>不要相信按钮</span>
        </div>
      </div>
    </aside>
  );
}
