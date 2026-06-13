// ─────────────────────────────────────────────────────────────────────────────
// ActivityScreen — Screen 2: Left/Right agent panels stacked vertically
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect } from "react";
import type { AgentState } from "../../types";
import { useAxon } from "../../store";
import { useConfigurables } from "~/modules/configurables";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, color }: { status: AgentState["status"]; color: string }) {
  const labels: Record<AgentState["status"], string> = {
    idle: "IDLE",
    running: "RUNNING",
    critique: "CRITIQUE",
    done: "DONE",
    error: "ERROR",
  };

  const colors: Record<AgentState["status"], string> = {
    idle: "#475569",
    running: color,
    critique: "#eab308",
    done: "#22c55e",
    error: "#ef4444",
  };

  const isAnimated = status === "running" || status === "critique";

  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase rounded-full"
      style={{
        border: `1px solid ${colors[status]}40`,
        color: colors[status],
        background: `${colors[status]}15`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isAnimated ? "status-dot-running" : ""}`}
        style={{ background: colors[status] }}
      />
      {labels[status]}
    </span>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress, color, active }: { progress: number; color: string; active: boolean }) {
  return (
    <div className="w-full h-1.5 overflow-hidden" style={{ background: "#1e1e2e", borderRadius: "2px" }}>
      <div
        className="h-full transition-all duration-500 relative overflow-hidden"
        style={{ width: `${progress}%`, background: color, borderRadius: "2px" }}
      >
        {active && progress > 0 && progress < 100 && (
          <div className="absolute inset-0 progress-shimmer" />
        )}
      </div>
    </div>
  );
}

// ─── Agent Card ──────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  color,
  label,
  isCrossLink,
}: {
  agent: AgentState;
  color: string;
  label: string;
  isCrossLink: boolean;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  const isActive = agent.status === "running" || agent.status === "critique";
  const recentLogs = agent.actionLog.slice(-10);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [agent.actionLog]);

  return (
    <div
      className="w-full"
      style={{
        background: "#0f0f1a",
        border: `1px solid ${isActive ? color + "50" : "#1e1e2e"}`,
        transition: "border-color 0.3s ease",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid #1e1e2e" }}
      >
        <div className="flex items-center gap-3">
          <div>
            <div
              className="text-sm font-semibold tracking-widest uppercase"
              style={{ color, letterSpacing: "0.16em" }}
            >
              {label}
            </div>
            <div className="text-[10px] tracking-wider uppercase" style={{ color: "#475569" }}>
              EXECUTOR AGENT
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCrossLink && (
            <span
              className="text-[9px] tracking-widest uppercase px-2 py-0.5"
              style={{
                border: "1px solid #eab30840",
                color: "#eab308",
                background: "#eab30810",
                borderRadius: "2px",
              }}
            >
              CROSS-CRITIQUE
            </span>
          )}
          <StatusBadge status={agent.status} color={color} />
        </div>
      </div>

      {/* Current Task */}
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid #1e1e2e" }}>
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#475569" }}>
          CURRENT TASK
        </div>
        <div
          className="text-sm leading-snug"
          style={{ color: agent.status === "idle" ? "#475569" : "#f1f5f9" }}
        >
          {agent.currentTask}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid #1e1e2e" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#475569" }}>
            PROGRESS
          </div>
          <div
            className="font-mono-axon text-[11px]"
            style={{ color: agent.status === "idle" ? "#475569" : color }}
          >
            {agent.progress}%
          </div>
        </div>
        <ProgressBar progress={agent.progress} color={color} active={isActive} />
      </div>

      {/* Action Log */}
      <div className="px-4 py-2.5">
        <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#475569" }}>
          ACTION LOG
        </div>
        <div
          ref={logRef}
          className="font-mono-axon overflow-y-auto"
          style={{ maxHeight: "140px", minHeight: "48px" }}
        >
          {recentLogs.length === 0 ? (
            <div className="text-[11px] italic" style={{ color: "#475569" }}>
              No actions yet.
            </div>
          ) : (
            recentLogs.map((entry, idx) => (
              <div
                key={idx}
                className="text-[11px] leading-relaxed py-0.5 log-entry-new"
                style={{
                  color: "#94a3b8",
                  borderBottom: idx < recentLogs.length - 1 ? "1px solid #1e1e2e50" : "none",
                }}
              >
                <span style={{ color: `${color}80` }}>{">"}</span> {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ActivityScreen() {
  const { state } = useAxon();
  const { config, loading } = useConfigurables();

  const leftColor = loading ? "#f59e0b" : (config.leftAgentColor ?? "#f59e0b");
  const rightColor = loading ? "#10b981" : (config.rightAgentColor ?? "#10b981");
  const leftLabel = loading ? "LEFT" : (config.leftAgentName ?? "LEFT");
  const rightLabel = loading ? "RIGHT" : (config.rightAgentName ?? "RIGHT");

  const bothIdle =
    state.leftAgent.status === "idle" && state.rightAgent.status === "idle";
  const isCrossCritique =
    state.leftAgent.status === "critique" && state.rightAgent.status === "critique";

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto" style={{ background: "#080810" }}>
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
            ACTIVITY
          </div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: "#475569" }}>
            AGENT EXECUTION STATUS
          </div>
        </div>
      </div>

      {/* Cross-critique banner */}
      {isCrossCritique && (
        <div
          className="mx-3 mt-3 px-3 py-2 flex items-center gap-2"
          style={{ border: "1px solid #eab30840", background: "#eab30810", borderRadius: "4px" }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#eab308" }}>
            CROSS-CRITIQUE IN PROGRESS
          </span>
          <span className="text-[11px]" style={{ color: "#94a3b8" }}>
            — Agents are reviewing each other's output
          </span>
        </div>
      )}

      {/* Empty state */}
      {bothIdle && state.leftAgent.actionLog.length === 0 && state.rightAgent.actionLog.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
          <div style={{ color: "#475569", fontSize: "40px" }}>⚡</div>
          <div className="text-base font-medium" style={{ color: "#475569" }}>
            No active tasks
          </div>
          <div className="text-sm leading-relaxed" style={{ color: "#475569" }}>
            Send a message to the Mastermind to get started
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3 pb-4">
          <AgentCard
            agent={state.leftAgent}
            color={leftColor}
            label={leftLabel}
            isCrossLink={isCrossCritique}
          />
          <AgentCard
            agent={state.rightAgent}
            color={rightColor}
            label={rightLabel}
            isCrossLink={isCrossCritique}
          />
        </div>
      )}
    </div>
  );
}
