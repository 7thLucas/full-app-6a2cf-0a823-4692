// ─────────────────────────────────────────────────────────────────────────────
// AxonMobileApp — Root mobile layout: 4 screens + bottom tab navigation
// ─────────────────────────────────────────────────────────────────────────────

import { useAxon } from "../store";
import { useScreen } from "../screen-store";
import { BottomNav } from "./BottomNav";
import { ChatScreen } from "./screens/ChatScreen";
import { ActivityScreen } from "./screens/ActivityScreen";
import { CerebroScreen } from "./screens/CerebroScreen";
import { LogsScreen } from "./screens/LogsScreen";

export function AxonMobileApp() {
  const { state } = useAxon();
  const { activeScreen, navigate } = useScreen();

  const runningTaskCount = [state.leftAgent, state.rightAgent].filter(
    (a) => a.status === "running" || a.status === "critique",
  ).length;

  const renderScreen = () => {
    switch (activeScreen) {
      case "chat":
        return <ChatScreen />;
      case "activity":
        return <ActivityScreen />;
      case "cerebro":
        return <CerebroScreen />;
      case "logs":
        return <LogsScreen />;
    }
  };

  return (
    <div
      className="flex flex-col w-full h-screen overflow-hidden"
      style={{ background: "#080810", maxWidth: "430px", margin: "0 auto" }}
    >
      {/* Screen content — fills all available space above nav */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={navigate}
        runningTaskCount={runningTaskCount}
      />
    </div>
  );
}
