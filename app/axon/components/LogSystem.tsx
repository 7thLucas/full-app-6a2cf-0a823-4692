// ─────────────────────────────────────────────────────────────────────────────
// LogSystem — Zone 3: Full-width episodic memory log with 5 tabs
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useAxon } from "../store";
import { useConfigurables } from "~/modules/configurables";
import type { LogCategory } from "../types";

const ALL_CATEGORIES: LogCategory[] = [
  "PREFERENCES",
  "WINS",
  "FAILURES",
  "DECISIONS",
  "GENERAL",
];

const CATEGORY_COLORS: Record<LogCategory, string> = {
  PREFERENCES: "#8b5cf6",
  WINS: "#22c55e",
  FAILURES: "#ef4444",
  DECISIONS: "#00d4ff",
  GENERAL: "#94a3b8",
};

export function LogSystem() {
  const { state, dispatch } = useAxon();
  const { config, loading } = useConfigurables();
  const logBottomRef = useRef<HTMLDivElement>(null);

  const logTabLabels = loading ? null : config.logTabLabels;

  const tabLabel = (cat: LogCategory): string => {
    if (!logTabLabels) {
      return cat[0] + cat.slice(1).toLowerCase();
    }
    const map: Record<LogCategory, string> = {
      PREFERENCES: logTabLabels.preferences ?? "Preferences",
      WINS: logTabLabels.wins ?? "Wins",
      FAILURES: logTabLabels.failures ?? "Failures",
      DECISIONS: logTabLabels.decisions ?? "Decisions",
      GENERAL: logTabLabels.general ?? "General",
    };
    return map[cat];
  };

  const filteredLogs = state.logs.filter((l) => l.category === state.activeLogTab);

  // Auto-scroll to bottom on new logs in active tab
  useEffect(() => {
    if (logBottomRef.current) {
      logBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs.length]);

  // Mark logs as old after animation plays
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: "MARK_LOGS_OLD" });
    }, 600);
    return () => clearTimeout(timer);
  }, [state.logs.length, dispatch]);

  const activeColor = CATEGORY_COLORS[state.activeLogTab];

  return (
    <div
      className="flex flex-col w-full shrink-0"
      style={{
        height: "180px",
        background: "#080810",
        borderTop: `1px solid #1e1e2e`,
      }}
    >
      {/* Tab Bar */}
      <div
        className="flex items-stretch shrink-0"
        style={{ borderBottom: "1px solid #1e1e2e", height: "36px" }}
      >
        <div
          className="flex items-center px-4 shrink-0"
          style={{
            borderRight: "1px solid #1e1e2e",
            minWidth: "80px",
          }}
        >
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "#475569" }}
          >
            LOGS
          </span>
        </div>

        {ALL_CATEGORIES.map((cat) => {
          const isActive = cat === state.activeLogTab;
          const color = CATEGORY_COLORS[cat];
          const count = state.logs.filter((l) => l.category === cat).length;

          return (
            <button
              key={cat}
              className="flex items-center gap-2 px-4 h-full text-[11px] font-semibold tracking-wider uppercase transition-all"
              style={{
                color: isActive ? color : "#475569",
                borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
                background: isActive ? `${color}08` : "transparent",
                cursor: "pointer",
              }}
              onClick={() =>
                dispatch({ type: "SET_ACTIVE_LOG_TAB", payload: cat })
              }
            >
              {tabLabel(cat)}
              {count > 0 && (
                <span
                  className="text-[9px] px-1 rounded-none font-mono-axon"
                  style={{
                    color: isActive ? color : "#475569",
                    background: isActive ? `${color}20` : "#1e1e2e",
                    border: `1px solid ${isActive ? color + "40" : "#1e1e2e"}`,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto px-4 py-2 font-mono-axon">
        {filteredLogs.length === 0 ? (
          <div
            className="text-[11px] italic"
            style={{ color: "#475569" }}
          >
            No entries in {tabLabel(state.activeLogTab)} log.
          </div>
        ) : (
          filteredLogs.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-start gap-3 py-0.5 text-[11px] leading-relaxed ${entry.isNew ? "log-entry-new" : ""}`}
              style={{
                background: idx % 2 === 0 ? "transparent" : "#0f0f1a50",
              }}
            >
              <span
                className="shrink-0"
                style={{ color: "#475569" }}
              >
                [{entry.timestamp}]
              </span>
              <span
                className="shrink-0 font-semibold tracking-wider"
                style={{ color: activeColor }}
              >
                [{entry.category}]
              </span>
              <span style={{ color: "#94a3b8" }}>{entry.message}</span>
            </div>
          ))
        )}
        <div ref={logBottomRef} />
      </div>
    </div>
  );
}
