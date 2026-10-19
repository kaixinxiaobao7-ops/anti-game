import { useEffect, useRef, useState } from "react";
import { CONFIRM_TITLES } from "../game/constants";
import type { GameState } from "../game/types";
import { useFocusTrap } from "./hooks";

interface ConfirmModalProps {
  modal: Extract<GameState["modal"], { kind: "confirm" }>;
  onYes: () => void;
  onNo: () => void;
  onClose: () => void;
  onEscape: () => void;
}

export function ConfirmModal({
  modal,
  onYes,
  onNo,
  onClose,
  onEscape,
}: ConfirmModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [jitter, setJitter] = useState(0);
  useFocusTrap(cardRef);

  useEffect(() => {
    const timer = window.setTimeout(() => cancelRef.current?.focus({ preventScroll: true }), 40);
    return () => window.clearTimeout(timer);
  }, [modal.level]);

  const meta = CONFIRM_TITLES[Math.min(modal.level - 1, CONFIRM_TITLES.length - 1)];
  const hintVisible = modal.hintVisible || modal.level >= 2;

  return (
    <div className="modal-layer" id="modalLayer">
      <div
        className="modal-card confirm-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmTitle"
        ref={cardRef}
      >
        <div className="modal-stripe">
          <span>SYSTEM CONFIRMATION REQUIRED / 不可跳过</span>
        </div>
        <button className="modal-close" id="confirmClose" type="button" aria-label="关闭确认框" onClick={onClose}>
          ×
        </button>
        <div className="confirm-body">
          <div className="confirm-symbol" aria-hidden="true">
            <span>?</span>
          </div>
          <div>
            <div className="modal-kicker">FINAL_WARNING.TXT // 第 {modal.level} 层确认</div>
            <h2 className="modal-title" id="confirmTitle">
              {meta[0]}
            </h2>
            <p className="modal-copy">{meta[1]}</p>
          </div>
        </div>
        <div className="confirm-actions">
          <button
            className="btn-primary"
            id="confirmYes"
            type="button"
            style={jitter ? { transform: `translate(${jitter}px, -1px)` } : undefined}
            onPointerEnter={() => setJitter(Math.round(Math.random() * 14 - 7))}
            onPointerLeave={() => setJitter(0)}
            onClick={onYes}
          >
            确定，我要赢
          </button>
          <button className="btn-secondary" id="confirmNo" type="button" ref={cancelRef} onClick={onNo}>
            取消，我再想想
          </button>
        </div>
        <div className="confirm-foot">
          <span>
            确认层级 <b>{modal.level}</b> / ∞
            <br />
            该操作不可撤销（大概）
          </span>
          <span className={`modal-hint${hintVisible ? " is-visible" : ""}`}>
            {hintVisible ? (
              <>
                提示：<strong>ESC</strong> 不在它的监听列表里。按一下试试。
              </>
            ) : (
              "正在校验你的决心……"
            )}
          </span>
        </div>
        <button className="virtual-esc" id="virtualEsc" type="button" onClick={onEscape}>
          <kbd>ESC</kbd>
          <span>虚拟按键 · 它忘了监听这个</span>
        </button>
      </div>
    </div>
  );
}

interface RulesModalProps {
  stage: number;
  onClose: () => void;
}

export function RulesModal({ stage, onClose }: RulesModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(cardRef);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 40);
    return () => window.clearTimeout(timer);
  }, []);

  const rules: Array<[string, string]> = [
    ["玩家不得主动取得胜利。", "这是唯一一条不会改写的规则。大概。"],
  ];
  if (stage >= 1) {
    rules.push([
      "禁止使用鼠标。",
      "指针输入已被吊销。键盘是唯一被允许的输入方式（暂时的）。",
    ]);
  }
  if (stage >= 2) {
    rules.push([
      "每次胜利申请必须经过确认。",
      "确认框的层数由系统决定。玩家不得质疑系统的递归深度。",
    ]);
  }
  if (stage >= 3) {
    rules.push([
      "所有入口已被封锁。",
      "包括按钮、键盘、弹窗、希望。系统保留对“希望”的最终解释权。",
    ]);
  }
  rules.push([
    "本规则可能随时被改写。",
    "改写不需要通知玩家，也不需要理由。理由是一种奢侈品。",
  ]);

  return (
    <div className="modal-layer" id="modalLayer">
      <div
        className="modal-card rules-card"
        id="rulesModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rulesTitle"
        ref={cardRef}
      >
        <div className="modal-stripe">
          <span>RULES.TXT / 解释权归它所有</span>
        </div>
        <button
          className="modal-close"
          id="rulesClose"
          type="button"
          aria-label="关闭规则"
          ref={closeRef}
          onClick={onClose}
        >
          ×
        </button>
        <div className="rules-head">
          <div>
            <div className="modal-kicker">TERMS OF NON-ENGAGEMENT</div>
            <h2 id="rulesTitle">规则</h2>
          </div>
          <span className="rule-redacted">REV. 4.0.4</span>
        </div>
        <ol className="rules-list">
          {rules.map(([title, copy]) => (
            <li key={title}>
              <div>
                <b>{title}</b>
                <span>{copy}</span>
              </div>
            </li>
          ))}
        </ol>
        <div className="rules-redacted">
          <span className="rule-num">00</span>
          <div>
            <b>第 0 条</b>
            <span className="rule-redacted">████ ████ ████ ████ ████</span>
          </div>
        </div>
        <div className="rules-foot">
          <span>继续游戏即表示你已阅读、理解并放弃理解。</span>
          <button className="clause-btn" id="rulesOk" type="button" onClick={onClose}>
            知道了（并继续被耍）
          </button>
        </div>
      </div>
    </div>
  );
}
