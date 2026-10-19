import { useEffect } from "react";
import { DefenseRail } from "./components/DefenseRail";
import { Finale } from "./components/Finale";
import { GameConsole } from "./components/GameConsole";
import { Intro } from "./components/Intro";
import { ConfirmModal, RulesModal } from "./components/Modals";
import { Observation } from "./components/Observation";
import { PageFooter } from "./components/PageFooter";
import { PointerEffects } from "./components/PointerEffects";
import { Terminal } from "./components/Terminal";
import { ToastStack } from "./components/ToastStack";
import { TopBar } from "./components/TopBar";
import { WinScreen } from "./components/WinScreen";
import { useAntiGame } from "./game/useAntiGame";

export default function App() {
  const game = useAntiGame();
  const { state, actions, meta } = game;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;

      if (state.phase === "intro") {
        if (event.key === "Enter" && !target?.closest("button")) {
          event.preventDefault();
          actions.start();
        }
        return;
      }

      if (state.modal) {
        if (event.key === "Escape") {
          event.preventDefault();
          if (state.modal.kind === "confirm") actions.escapeConfirm();
          else actions.closeModal();
        }
        return;
      }

      if (state.phase === "finale") {
        if (event.key === "Escape") actions.closeClause();
        return;
      }

      if (state.phase !== "playing") return;

      if (event.key === "Enter" || event.key === " ") {
        if (event.repeat) return;
        if (target?.closest("button") && target.id !== "mainBtn") return;
        if (target?.closest("#keycap")) return;
        if (target?.closest("a")) return;
        if (state.stage === 3 && document.activeElement?.id === "bar") {
          event.preventDefault();
          actions.hackProgressBar();
          return;
        }
        event.preventDefault();
        actions.attempt("keyboard");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.phase, state.modal, actions]);

  const overrides =
    state.phase === "finale"
      ? { sys: "最终协议已接管", conn: "FINAL LOCK / 99.9" }
      : state.phase === "ending"
        ? { sys: "未定义意图", conn: "ERROR / UNCLASSIFIED" }
        : state.phase === "won"
          ? { sys: "系统错误", conn: "OUTCOME / UNEXPECTED" }
          : { sys: meta.sys, conn: meta.conn };

  return (
    <>
      <div className="noise" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="page-glow" aria-hidden="true" />
      <div className="fault-bars" id="faultBars" aria-hidden="true" />
      <PointerEffects />

      <TopBar
        phase={state.phase}
        startedAt={state.startedAt}
        durationMs={state.durationMs}
        sound={state.sound}
        sys={overrides.sys}
        conn={overrides.conn}
        onToggleSound={actions.toggleSound}
        onRules={actions.openRules}
      />

      <div className="shell">
        <DefenseRail stage={state.stage} phase={state.phase} mood={state.mood} />

        <main className="main-stage">
          <div className="stage-meta">
            <span>
              <i className="tiny-square" /> A GAME THAT PLAYS YOU
            </span>
            <span>NO. 404 — 特别不友好版</span>
          </div>

          <h1 className="hero-title" aria-label="拒绝被通关">
            <span className="title-line">拒绝</span>
            <span className="title-line title-outline">
              被通关<span className="acid-dot">.</span>
            </span>
          </h1>

          <p className="hero-sub">
            <span className="sub-index">01</span> 它唯一的胜利，是让你永远只差一点。
          </p>

          <GameConsole game={game} />
          <Observation stage={state.stage} phase={state.phase} />

          <div className="stage-foot">
            <div className="micro">
              ↳ 如果卡住了，说明它在正常工作。{" "}
              <button id="hintBtn" type="button" onClick={actions.showHint}>
                给我一点提示
              </button>
            </div>
            <div className="micro micro-right">
              ANTI-GAME v4.0.4 // “公平”是一个未被定义的变量
            </div>
          </div>
        </main>

        <Terminal logs={state.logs} compute={state.compute} />
      </div>

      <PageFooter />
      <ToastStack toasts={state.toasts} />

      {state.introVisible && (
        <Intro leaving={state.introLeaving} wins={state.wins} onStart={actions.start} />
      )}

      {state.modal?.kind === "confirm" && (
        <ConfirmModal
          modal={state.modal}
          onYes={actions.confirmYes}
          onNo={actions.confirmNo}
          onClose={actions.confirmClose}
          onEscape={actions.escapeConfirm}
        />
      )}

      {state.modal?.kind === "rules" && (
        <RulesModal stage={state.stage} onClose={actions.closeModal} />
      )}

      {state.phase === "finale" && (
        <Finale
          state={state}
          onForceWin={actions.forceWin}
          onAcceptLoss={actions.acceptLoss}
          onToggleClause={() => actions.toggleClause()}
          onGiveUp={actions.giveUp}
        />
      )}

      {state.phase === "ending" && <div className="ending-fx" id="endingFx" aria-hidden="true" />}

      {state.phase === "won" && <WinScreen state={state} onRestart={actions.restart} />}
    </>
  );
}
