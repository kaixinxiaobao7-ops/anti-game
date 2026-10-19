import { useEffect, useRef } from "react";
import type { LogEntry } from "../game/types";

export function Terminal({
  logs,
  compute,
}: {
  logs: LogEntry[];
  compute: number;
}) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const feed = feedRef.current;
    if (feed) feed.scrollTop = feed.scrollHeight;
  }, [logs]);

  return (
    <aside className="terminal" aria-label="系统日志">
      <div className="term-head">
        <span>它的话 / SYSTEM LOG</span>
        <span className="live-tag">
          <i />
          LIVE
        </span>
      </div>
      <div className="term-feed" id="termFeed" ref={feedRef} aria-live="polite">
        {logs.map((entry) => (
          <div key={entry.id} className={`log-row log-${entry.kind}`}>
            <span className="log-time">{entry.time}</span>
            <span className="log-msg">{entry.message}</span>
          </div>
        ))}
      </div>
      <div className="term-foot">
        <div className="term-stat">
          <span>AI 算力</span>
          <b id="compute">{String(compute).padStart(2, "0")}</b>
          <small>%</small>
        </div>
        <div className="compute-bar">
          <i
            id="computeFill"
            className={compute < 26 ? "low" : ""}
            style={{ width: `${compute}%` }}
          />
        </div>
        <p>每阻止你一次，它就多学一点。</p>
      </div>
    </aside>
  );
}
