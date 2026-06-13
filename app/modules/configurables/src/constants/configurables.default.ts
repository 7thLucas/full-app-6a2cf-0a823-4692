/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TLogTabLabels = {
  preferences: string;
  wins: string;
  failures: string;
  decisions: string;
  general: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  cerebroAccentColor?: string;
  mastermindAccentColor?: string;
  leftAgentColor?: string;
  rightAgentColor?: string;
  dashboardTagline?: string;
  mastermindWelcomeMessage?: string;
  leftAgentName?: string;
  rightAgentName?: string;
  logTabLabels?: TLogTabLabels;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Axon",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#8b5cf6",
    secondary: "#00d4ff",
    accent: "#f59e0b",
  },
  cerebroAccentColor: "#00d4ff",
  mastermindAccentColor: "#8b5cf6",
  leftAgentColor: "#f59e0b",
  rightAgentColor: "#10b981",
  dashboardTagline: "Omni-Agent Consciousness System",
  mastermindWelcomeMessage: "Mastermind online. Awaiting task directive.",
  leftAgentName: "LEFT",
  rightAgentName: "RIGHT",
  logTabLabels: {
    preferences: "Preferences",
    wins: "Wins",
    failures: "Failures",
    decisions: "Decisions",
    general: "General",
  },
};
