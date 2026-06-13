// ─────────────────────────────────────────────────────────────────────────────
// CerebroScreen — Screen 3: Projection + Reflection metacognitive display
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { useAxon } from "../../store";
import { useConfigurables } from "~/modules/configurables";

// ─── Typewriter Text ─────────────────────────────────────────────────────────

function TypewriterText({ text, color }: { text: string; color: string }) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const prevTextRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    setIsComplete(false);
    setDisplayed("");

    let i = 0;
    function typeNext() {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        timerRef.current = setTimeout(typeNext, 18);
      } else {
        setIsComplete(true);
      }
    }
    typeNext();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text]);

  return (
    <span
      className={`text-base leading-relaxed ${!isComplete ? "typewriter-cursor" : ""}`}
      style={{ color }}
    >
      {displayed}
    </span>
  );
}

// ─── Causal Reasoning Display ─────────────────────────────────────────────────

function CausalDisplay({
  label,
  text,
  color,
  secondaryColor,
  glowColor,
}: {
  label: string;
  text: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
}) {
  // Parse "if X → Y" pattern from projection
  // Parse "A→B therefore C→D" pattern from reflection
  const hasForwardArrow = text.includes("→") || text.includes("->");
  const parts = text.split(/→|->/).map((p) => p.trim());

  return (
    <div
      className="flex flex-col p-5"
      style={{
        background: "#0a0a14",
        border: `1px solid ${color}30`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "4px",
        boxShadow: `0 0 24px 0 ${glowColor}12`,
      }}
    >
      {/* Section label */}
      <div
        className="text-[10px] font-semibold tracking-widest uppercase mb-3"
        style={{ color, letterSpacing: "0.2em" }}
      >
        {label}
      </div>

      {/* Main text with typewriter */}
      <div className="mb-4">
        <TypewriterText text={text} color={secondaryColor} />
      </div>

      {/* Causal chain visualization */}
      {hasForwardArrow && parts.length >= 2 && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="text-[9px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#475569" }}>
            CAUSAL CHAIN
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {parts.map((part, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-1 font-mono-axon"
                  style={{
                    background: `${color}12`,
                    border: `1px solid ${color}30`,
                    color: secondaryColor,
                    borderRadius: "3px",
                  }}
                >
                  {part}
                </span>
                {i < parts.length - 1 && (
                  <span className="text-base" style={{ color: `${color}80` }}>
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CerebroScreen() {
  const { state } = useAxon();
  const { config, loading } = useConfigurables();

  const cerebroColor = loading ? "#00d4ff" : (config.cerebroAccentColor ?? "#00d4ff");
  const appName = loading ? "Axon" : (config.appName ?? "Axon");

  const hasData =
    state.cerebro.projection !== "If the Mastermind receives a task, Left and Right agents will activate in parallel to execute sub-tasks." ||
    state.mastermind.messages.length > 0;

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto" style={{ background: "#080810" }}>
      {/* Header */}
      <div
        className="flex items-center px-4 py-3 shrink-0"
        style={{
          borderBottom: `1px solid ${cerebroColor}40`,
          boxShadow: `0 1px 16px 0 ${cerebroColor}10`,
        }}
      >
        <div>
          <div
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: cerebroColor, letterSpacing: "0.18em" }}
          >
            {appName} — CEREBRO
          </div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: "#475569" }}>
            METACOGNITIVE ENGINE
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-4 p-4">
        {/* Projection */}
        <CausalDisplay
          label="PROJECTION — Forward"
          text={state.cerebro.projection}
          color={cerebroColor}
          secondaryColor="#c7e9ff"
          glowColor={cerebroColor}
        />

        {/* Reflection */}
        <CausalDisplay
          label="REFLECTION — Backward"
          text={state.cerebro.reflection}
          color="#0066ff"
          secondaryColor="#a0c4ff"
          glowColor="#0066ff"
        />

        {/* Explanation */}
        <div
          className="px-4 py-3"
          style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: "4px" }}
        >
          <div className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#475569" }}>
            HOW THIS WORKS
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "#475569" }}>
            <span style={{ color: cerebroColor }}>Projection</span> simulates probable outcomes before committing to action ("if X → Y").{" "}
            <span style={{ color: "#0066ff" }}>Reflection</span> builds causal models from logged experience ("A→B, therefore C→D").
            Together they form Cerebro's metacognitive loop — the system grows sharper with every interaction.
          </div>
        </div>

        {/* Empty state hint */}
        {!hasData && (
          <div
            className="flex flex-col items-center justify-center py-6 gap-2 text-center"
            style={{ border: "1px dashed #1e1e2e", borderRadius: "4px" }}
          >
            <div className="text-2xl" style={{ opacity: 0.3 }}>◎</div>
            <div className="text-sm" style={{ color: "#475569" }}>
              Cerebro activates after the first task
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
