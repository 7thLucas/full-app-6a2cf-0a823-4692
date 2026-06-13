// ─────────────────────────────────────────────────────────────────────────────
// BottomNav — Fixed bottom tab navigation for mobile
// ─────────────────────────────────────────────────────────────────────────────

import type { AxonScreen } from "../screen-store";

interface BottomNavProps {
  activeScreen: AxonScreen;
  onNavigate: (screen: AxonScreen) => void;
  runningTaskCount: number;
}

function ChatIcon({ active }: { active: boolean }) {
  const color = active ? "#00d4ff" : "#475569";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? `${color}20` : "none"}
      />
    </svg>
  );
}

function ActivityIcon({ active }: { active: boolean }) {
  const color = active ? "#00d4ff" : "#475569";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CerebroIcon({ active }: { active: boolean }) {
  const color = active ? "#00d4ff" : "#475569";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={active ? 2 : 1.5}
        fill={active ? `${color}15` : "none"}
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke={color}
        strokeWidth={active ? 2 : 1.5}
        fill={active ? color : "none"}
      />
      <line x1="12" y1="3" x2="12" y2="9" stroke={color} strokeWidth={1.5} />
      <line x1="12" y1="15" x2="12" y2="21" stroke={color} strokeWidth={1.5} />
      <line x1="3" y1="12" x2="9" y2="12" stroke={color} strokeWidth={1.5} />
      <line x1="15" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function LogsIcon({ active }: { active: boolean }) {
  const color = active ? "#00d4ff" : "#475569";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 12h6M9 8h6M9 16h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
        stroke={color}
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? `${color}15` : "none"}
      />
    </svg>
  );
}

const TABS: { id: AxonScreen; label: string }[] = [
  { id: "chat", label: "Chat" },
  { id: "activity", label: "Activity" },
  { id: "cerebro", label: "Cerebro" },
  { id: "logs", label: "Logs" },
];

export function BottomNav({ activeScreen, onNavigate, runningTaskCount }: BottomNavProps) {
  const renderIcon = (id: AxonScreen, active: boolean) => {
    switch (id) {
      case "chat": return <ChatIcon active={active} />;
      case "activity": return <ActivityIcon active={active} />;
      case "cerebro": return <CerebroIcon active={active} />;
      case "logs": return <LogsIcon active={active} />;
    }
  };

  return (
    <nav
      className="flex items-stretch w-full shrink-0"
      style={{
        height: "56px",
        background: "#080810",
        borderTop: "1px solid #1e1e2e",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {TABS.map(({ id, label }) => {
        const isActive = activeScreen === id;
        const showBadge = id === "activity" && runningTaskCount > 0;

        return (
          <button
            key={id}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all"
            style={{
              color: isActive ? "#00d4ff" : "#475569",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              minHeight: "44px",
            }}
            onClick={() => onNavigate(id)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            {/* Active indicator line at top */}
            {isActive && (
              <div
                className="absolute top-0 left-1/2"
                style={{
                  width: "32px",
                  height: "2px",
                  background: "#00d4ff",
                  transform: "translateX(-50%)",
                  boxShadow: "0 0 8px #00d4ff80",
                }}
              />
            )}

            {/* Icon + badge */}
            <div className="relative">
              {renderIcon(id, isActive)}
              {showBadge && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full"
                  style={{ background: "#00d4ff", color: "#080810" }}
                >
                  {runningTaskCount > 9 ? "9+" : runningTaskCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className="text-[10px] font-medium tracking-wide"
              style={{ color: isActive ? "#00d4ff" : "#475569" }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
