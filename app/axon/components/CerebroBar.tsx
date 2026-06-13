// ─────────────────────────────────────────────────────────────────────────────
// CerebroBar — Zone 1: Full-width metacognitive status bar
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import { useAxon } from "../store";
import { useConfigurables } from "~/modules/configurables";

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
      className={`text-sm leading-relaxed ${!isComplete ? "typewriter-cursor" : ""}`}
      style={{ color }}
    >
      {displayed}
    </span>
  );
}

export function CerebroBar() {
  const { state } = useAxon();
  const { config, loading } = useConfigurables();

  const cerebroColor = loading ? "#00d4ff" : (config.cerebroAccentColor ?? "#00d4ff");
  const appName = loading ? "Axon" : (config.appName ?? "Axon");

  return (
    <div
      className="flex items-stretch w-full shrink-0"
      style={{
        height: "88px",
        background: "#080810",
        borderBottom: `1px solid ${cerebroColor}40`,
        boxShadow: `0 1px 16px 0 ${cerebroColor}18`,
      }}
    >
      {/* App identity */}
      <div
        className="flex items-center px-5 shrink-0"
        style={{ borderRight: `1px solid #1e1e2e`, minWidth: "140px" }}
      >
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: cerebroColor, letterSpacing: "0.18em" }}
          >
            {appName}
          </div>
          <div
            className="text-[10px] tracking-widest uppercase mt-0.5"
            style={{ color: "#475569", letterSpacing: "0.14em" }}
          >
            CEREBRO
          </div>
        </div>
      </div>

      {/* Projection */}
      <div className="flex-1 flex flex-col justify-center px-6 min-w-0">
        <div
          className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
          style={{ color: cerebroColor, letterSpacing: "0.18em" }}
        >
          PROJECTION
        </div>
        <TypewriterText text={state.cerebro.projection} color="#c7e9ff" />
      </div>

      {/* Divider */}
      <div
        className="w-px self-stretch mx-1"
        style={{
          background: `linear-gradient(to bottom, transparent, ${cerebroColor}80, transparent)`,
        }}
      />

      {/* Reflection */}
      <div className="flex-1 flex flex-col justify-center px-6 min-w-0">
        <div
          className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
          style={{ color: "#0066ff", letterSpacing: "0.18em" }}
        >
          REFLECTION
        </div>
        <TypewriterText text={state.cerebro.reflection} color="#a0c4ff" />
      </div>
    </div>
  );
}
