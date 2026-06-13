// ─────────────────────────────────────────────────────────────────────────────
// Axon — Screen Navigation Store
// Manages which of the 4 mobile screens is currently visible
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, type ReactNode } from "react";

export type AxonScreen = "chat" | "activity" | "cerebro" | "logs";

interface ScreenContextValue {
  activeScreen: AxonScreen;
  navigate: (screen: AxonScreen) => void;
}

const ScreenContext = createContext<ScreenContextValue | null>(null);

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [activeScreen, setActiveScreen] = useState<AxonScreen>("chat");

  return (
    <ScreenContext.Provider value={{ activeScreen, navigate: setActiveScreen }}>
      {children}
    </ScreenContext.Provider>
  );
}

export function useScreen(): ScreenContextValue {
  const ctx = useContext(ScreenContext);
  if (!ctx) throw new Error("useScreen must be used within <ScreenProvider>");
  return ctx;
}
