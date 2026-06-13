// ─────────────────────────────────────────────────────────────────────────────
// LogsScreen — Screen 4: 5-tab episodic log viewer
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { useAxon } from "../../store";
import { useConfigurables } from "~/modules/configurables";
import type { LogCategory } from "../../types";

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

const SHORT_LABELS: Record<LogCategory, string> = {
  PREFERENCES: "Prefs",
  WINS: "Wins",
  FAILURES: "Fails",
  DECISIONS: "Decis.",
  GENERAL: "General",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function LogsScreen() {
  const { state, dispatch } = useAxon();
  const { config, loading } = useConfigurables();
  const logBottomRef = useRef<HTMLDivElement>(null);

  const logTabLabels = loading ? null : config.logTabLabels;

  const tabLabel = (cat: LogCategory): string => {
    if (!logTabLabels) return SHORT_LABELS[cat];
    const map: Record<LogCategory, string> = {
      PREFERENCES: logTabLabels.preferences ?? SHORT_LABELS.PREFERENCES,
      WINS: logTabLabels.wins ?? SHORT_LABELS.WINS,
      FAILURES: logTabLabels.failures ?? SHORT_LABELS.FAILURES,
      DECISIONS: logTabLabels.decisions ?? SHORT_LABELS.DECISIONS,
      GENERAL: logTabLabels.general ?? SHORT_LABELS.GENERAL,
    };
    return map[cat];
  };

  const filteredLogs = state.logs.filter((l) => l.category === state.activeLogTab);
  const activeColor = CATEGORY_COLORS[state.activeLogTab];

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

  return (
    <div className="flex flex-col w-full h-full" style={{ background: "#080810" }}>
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid #1e1e2e" }}
      >
        <div>
          <div
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: "#f1f5f9", letterSpacing: "0.14em" }}
          >
            LOGS
          </div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: "#475569" }}>
            EPISODIC MEMORY
          </div>
        </div>
        <div className="ml-auto">
          <span
            className="text-[10px] font-mono-axon px-2 py-0.5"
            style={{
              color: activeColor,
              background: `${activeColor}15`,
              border: `1px solid ${activeColor}30`,
              borderRadius: "3px",
            }}
          >
            {filteredLogs.length} entries
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-stretch shrink-0 overflow-x-auto"
        style={{ borderBottom: "1px solid #1e1e2e", height: "40px" }}
      >
        {ALL_CATEGORIES.map((cat) => {
          const isActive = cat === state.activeLogTab;
          const color = CATEGORY_COLORS[cat];
          const count = state.logs.filter((l) => l.category === cat).length;

          return (
            <button
              key={cat}
              className="flex items-center gap-1.5 px-3 h-full text-[11px] font-semibold tracking-wide shrink-0 transition-all"
              style={{
                color: isActive ? color : "#475569",
                borderBottom: isActive ? `2px solid ${color}` : "2px solid transparent",
                background: isActive ? `${color}08` : "transparent",
                cursor: "pointer",
                minWidth: "64px",
              }}
              onClick={() => dispatch({ type: "SET_ACTIVE_LOG_TAB", payload: cat })}
            >
              {tabLabel(cat)}
              {count > 0 && (
                <span
                  className="text-[9px] px-1 font-mono-axon rounded-sm"
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
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono-axon min-h-0">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
            <div className="text-2xl" style={{ opacity: 0.2 }}>
              ☐
            </div>
            <div className="text-sm" style={{ color: "#475569" }}>
              No entries in {tabLabel(state.activeLogTab)} log
            </div>
            <div className="text-xs" style={{ color: "#2a2a3e" }}>
              Entries appear here as tasks are run
            </div>
          </div>
        ) : (
          filteredLogs.map((entry, idx) => (
            <div
              key={entry.id}
              className={`flex items-start gap-2 py-1.5 text-[12px] leading-relaxed ${entry.isNew ? "log-entry-new" : ""}`}
              style={{
                borderBottom: "1px solid #1e1e2e30",
                background: idx % 2 === 0 ? "transparent" : "#0a0a1450",
              }}
            >
              <span className="shrink-0 text-[11px]" style={{ color: "#334155" }}>
                [{entry.timestamp}]
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
