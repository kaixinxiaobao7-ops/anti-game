import { useEffect, useRef } from "react";
import type { GameState } from "../game/types";

interface FinaleProps {
  state: GameState;
  onForceWin: () => void;
  onAcceptLoss: () => void;
  onToggleClause: () => void;
  onGiveUp: () => void;
}

export function Finale({
  state,
  onForceWin,
  onAcceptLoss,
  onToggleClause,
  onGiveUp,
}: FinaleProps) {
  const forceRef = useRef<HTMLButtonElement>(null);
  const { finalClicks, lossRejected, finaleClauseOpen } = state;

  useEffect(() => {
    const timer = window.setTimeout(() => forceRef.current?.focus({ preventScroll: true }), 300);
    return () => window.clearTimeout(timer);
  }, []);

  const title =
    finalClicks === 0
      ? "你确定要赢吗？"
      : finalClicks === 1
        ? "你确定你确定吗？"
        : "已再次记录。仍然不行。";

  const copy =
    finalClicks === 0
      ? "这是最后一次确认。无论你选什么，我都已经赢了。你的胜利申请会在这里被永久搁置。"
      : finalClicks === 1
        ? "第一个“确定”产生了第二个“确定”。这是很标准的递归。你的胜利申请还在原地。"
        : "系统已经评估了你的请求，并得出了唯一合理的结论：你仍然不被允许。";

  const taunt =
    finalClicks >= 2
      ? "你注意到没有：我从不阻止你“放弃”。那是因为我没想到你会。"
      : "提示：第 0 条从未被引用。它大概觉得没人会看。";

  return (
    <div className="finale-layer" id="finaleLayer">
      <section
        className="finale-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="finaleTitle"
      >
        <div className="finale-top">
          <span>FINAL PROTOCOL // 不可撤销</span>
          <span>ACCESS DENIED</span>
        </div>
        <div className="finale-grid">
          <div className="finale-number" aria-hidden="true">
            99<span>.9</span>
            <small>
              就差这一点。
              <br />
              永远差这一点。
            </small>
          </div>
          <div className="finale-copy-wrap">
            <div className="finale-kicker">你做得很好。好到我不得不认真了。</div>
            <h2 className="finale-title" id="finaleTitle">
              {title}
            </h2>
            <p className="finale-copy" id="finaleCopy">
              {copy}
            </p>
            <div className="finale-actions">
              <button type="button" id="forceWin" ref={forceRef} onClick={onForceWin}>
                {finalClicks > 1 ? "继续强行通关（不会有用的）" : "确定，我要赢"}
              </button>
              <button type="button" id="acceptLoss" disabled={lossRejected} onClick={onAcceptLoss}>
                {lossRejected ? "失败申请已被驳回" : "接受失败"}
              </button>
            </div>
            <p className="finale-taunt" id="finaleTaunt">
              {taunt}
            </p>
          </div>
        </div>
        <div className="finale-clause">
          <button
            className="clause-btn"
            id="clauseBtn"
            type="button"
            aria-expanded={finaleClauseOpen}
            onClick={onToggleClause}
          >
            查看第 0 条（未引用）
          </button>
          <div className={`clause-content${finaleClauseOpen ? " is-open" : ""}`} id="clauseContent">
            <div className="clause-zero">第 0 条 / 未引用</div>
            反制协议只对“胜利意图”生效。若玩家不再试图获胜，系统将失去拦截对象。
            <br />
            为维持逻辑完整，系统<strong>必须立即发放通关许可</strong>。
          </div>
        </div>
        <div className="finale-foot">
          <span>ANTI-GAME // FINAL LOCK // 你的胜率仍是 0.0%</span>
          <button
            className={`give-up${finaleClauseOpen || finalClicks >= 2 ? " is-hinted" : ""}`}
            id="giveUpBtn"
            type="button"
            onClick={onGiveUp}
          >
            算了，我认输
          </button>
        </div>
      </section>
    </div>
  );
}
