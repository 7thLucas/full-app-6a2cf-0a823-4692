// ─────────────────────────────────────────────────────────────────────────────
// AgentPanel — Zone 2: Left or Right agent panel
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect } from "react";
import type { AgentState } from "../types";

interface AgentPanelProps {
  agent: AgentState;
  color: string;
  label: string;
}

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

  const isRunning = status === "running";
  const isCritique = status === "critique";

  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
      style={{
        border: `1px solid ${colors[status]}40`,
        color: colors[status],
        background: `${colors[status]}12`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${isRunning || isCritique ? "status-dot-running" : ""}`}
        style={{ background: colors[status] }}
      />
      {labels[status]}
    </span>
  );
}

function ProgressBar({ progress, color, active }: { progress: number; color: string; active: boolean }) {
  return (
    <div
      className="w-full h-1 rounded-none overflow-hidden"
      style={{ background: "#1e1e2e" }}
    >
      <div
        className="h-full transition-all duration-500 relative overflow-hidden"
        style={{
          width: `${progress}%`,
          background: color,
        }}
      >
        {active && progress > 0 && progress < 100 && (
          <div className="absolute inset-0 progress-shimmer" />
        )}
      </div>
    </div>
  );
}

export function AgentPanel({ agent, color, label }: AgentPanelProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isActive = agent.status === "running" || agent.status === "critique";

  // Auto-scroll log to bottom on new entries
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [agent.actionLog]);

  const panelClass = isActive
    ? agent.id === "left"
      ? "panel-active-left"
      : "panel-active-right"
    : "";

  return (
    <div
      className={`flex flex-col h-full ${panelClass}`}
      style={{
        background: "#0f0f1a",
        border: `1px solid ${isActive ? color + "40" : "#1e1e2e"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: `1px solid #1e1e2e`,
          borderLeft: `3px solid ${color}`,
        }}
      >
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color, letterSpacing: "0.16em" }}
          >
            {label}
          </div>
          <div
            className="text-[10px] tracking-wider uppercase mt-0.5"
            style={{ color: "#475569" }}
          >
            EXECUTOR AGENT
          </div>
        </div>
        <StatusBadge status={agent.status} color={color} />
      </div>

      {/* Current Task */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: `1px solid #1e1e2e` }}
      >
        <div
          className="text-[10px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#475569" }}
        >
          CURRENT TASK
        </div>
        <div
          className="text-sm leading-snug truncate"
          style={{ color: agent.status === "idle" ? "#475569" : "#f1f5f9" }}
          title={agent.currentTask}
        >
          {agent.currentTask}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "#475569" }}
          >
            PROGRESS
          </div>
          <div
            className="font-mono-axon text-[10px]"
            style={{ color: agent.status === "idle" ? "#475569" : color }}
          >
            {agent.progress}%
          </div>
        </div>
        <ProgressBar progress={agent.progress} color={color} active={isActive} />
      </div>

      {/* Action Log */}
      <div className="flex flex-col min-h-0 flex-1 px-4 pb-3">
        <div
          className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
          style={{ color: "#475569" }}
        >
          ACTION LOG
        </div>
        <div
          ref={logContainerRef}
          className="flex-1 overflow-y-auto font-mono-axon"
          style={{ minHeight: 0 }}
        >
          {agent.actionLog.length === 0 ? (
            <div
              className="text-[11px] italic"
              style={{ color: "#475569" }}
            >
              No actions yet.
            </div>
          ) : (
            agent.actionLog.map((entry, idx) => (
              <div
                key={idx}
                className="text-[11px] leading-relaxed py-0.5 log-entry-new"
                style={{
                  color: "#94a3b8",
                  borderBottom: idx < agent.actionLog.length - 1 ? "1px solid #1e1e2e50" : "none",
                }}
              >
                <span style={{ color: `${color}80` }}>{">"}</span>{" "}
                {entry}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
