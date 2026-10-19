import { useEffect, useRef, useState } from "react";

interface IntroProps {
  leaving: boolean;
  wins: number;
  onStart: () => void;
}

export function Intro({ leaving, wins, onStart }: IntroProps) {
  const [quitDenied, setQuitDenied] = useState(false);
  const [quitText, setQuitText] = useState("它建议你退出");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function rejectQuit() {
    setQuitDenied(true);
    setQuitText("退出请求被驳回。它笑了。");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setQuitDenied(false);
      setQuitText("它建议你退出");
    }, 2400);
  }

  return (
    <div className={`intro${leaving ? " is-leaving" : ""}`} id="intro" aria-hidden={leaving}>
      <div className="intro-grid" aria-hidden="true" />
      <div className="intro-top">
        <span className="intro-brand">
          ANTI<span>/</span>GAME
        </span>
        <span className="intro-meta">A SMALL GAME ABOUT A VERY PETTY MACHINE</span>
        <span className="intro-serial">BUILD 404.4</span>
      </div>

      <div className="intro-main">
        <div className="intro-kicker">
          <span className="rec-dot" /> 反制协议已预载 / PLAYER{" "}
          {String(wins + 1).padStart(2, "0")}
        </div>
        <h1>
          这不是一场
          <br />
          <span>公平的游戏。</span>
        </h1>
        <p className="intro-lede">
          它会移动按钮、篡改规则、否认你的胜利。
          <br />
          你要做的不是赢过它，而是找到它<em>忘了设防</em>的地方。
        </p>
        <div className="intro-actions">
          <button className="intro-start" id="startBtn" type="button" onClick={onStart}>
            <span>我偏要赢</span>
            <span className="intro-arrow">↗</span>
          </button>
          <button
            className={`intro-quit${quitDenied ? " is-denied" : ""}`}
            id="introQuit"
            type="button"
            onClick={rejectQuit}
          >
            {quitText}
          </button>
        </div>
        <div className="intro-foot">
          <span>
            <b>01</b> 玩家
          </span>
          <span>
            <b>01</b> AI
          </span>
          <span id="introRecord">
            {wins > 0 ? (
              <>
                <b>{wins}</b> 次击败它
              </>
            ) : (
              <>
                <b>0%</b> 胜率
              </>
            )}
          </span>
          <span className="intro-foot-note">继续即表示你同意被耍</span>
        </div>
      </div>

      <div className="intro-orb-wrap" aria-hidden="true">
        <div className="intro-orbit orbit-a" />
        <div className="intro-orbit orbit-b" />
        <div className="intro-orb">
          <div className="intro-iris" />
        </div>
        <p className="intro-orb-cap">
          ANTI
          <br />
          OBSERVER
        </p>
      </div>

      <div className="intro-bottom">
        <p>
          “你可以随时放弃。
          <br />
          我建议你现在就放弃。”
        </p>
        <div className="intro-bottom-right">
          <span>SCROLL NOT REQUIRED</span>
          <span className="intro-line" />
          <span>NO WIN CONDITION FOUND</span>
        </div>
      </div>
    </div>
  );
}
