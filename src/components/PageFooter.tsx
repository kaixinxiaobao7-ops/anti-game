import { Fragment } from "react";
import { TICKER } from "../game/constants";

export function PageFooter() {
  const repetitions = [0, 1];
  return (
    <footer className="page-foot">
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track" id="tickerTrack">
          {repetitions.map((repetition) =>
            TICKER.map((text) => (
              <Fragment key={`${repetition}-${text}`}>
                <span>{text}</span>
                <i>✳</i>
              </Fragment>
            )),
          )}
        </div>
      </div>
      <div className="foot-meta">
        <span>© 2026 ANTI-GAME</span>
        <span>建议佩戴耳机 · 没有耳机也行</span>
      </div>
    </footer>
  );
}
