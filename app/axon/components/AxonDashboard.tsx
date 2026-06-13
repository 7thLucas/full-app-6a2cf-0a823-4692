// ─────────────────────────────────────────────────────────────────────────────
// AxonDashboard — Root layout composing all three zones
// ─────────────────────────────────────────────────────────────────────────────

import { CerebroBar } from "./CerebroBar";
import { AgentPanel } from "./AgentPanel";
import { MastermindPanel } from "./MastermindPanel";
import { LogSystem } from "./LogSystem";
import { useAxon } from "../store";
import { useConfigurables } from "~/modules/configurables";

export function AxonDashboard() {
  const { state } = useAxon();
  const { config, loading } = useConfigurables();

  const leftColor = loading ? "#f59e0b" : (config.leftAgentColor ?? "#f59e0b");
  const rightColor = loading ? "#10b981" : (config.rightAgentColor ?? "#10b981");
  const leftLabel = loading ? "LEFT" : (config.leftAgentName ?? "LEFT");
  const rightLabel = loading ? "RIGHT" : (config.rightAgentName ?? "RIGHT");

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden"
      style={{ background: "#080810" }}
    >
      {/* Zone 1: Cerebro Bar */}
      <CerebroBar />

      {/* Zone 2: Main Grid */}
      <div className="flex-1 grid min-h-0" style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}>
        {/* Left Agent */}
        <div style={{ borderRight: "1px solid #1e1e2e" }}>
          <AgentPanel
            agent={state.leftAgent}
            color={leftColor}
            label={leftLabel}
          />
        </div>

        {/* Mastermind (center) */}
        <div style={{ borderRight: "1px solid #1e1e2e" }}>
          <MastermindPanel />
        </div>

        {/* Right Agent */}
        <div>
          <AgentPanel
            agent={state.rightAgent}
            color={rightColor}
            label={rightLabel}
          />
        </div>
      </div>

      {/* Zone 3: Log System */}
      <LogSystem />
    </div>
  );
}
