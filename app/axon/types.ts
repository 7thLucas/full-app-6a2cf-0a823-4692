// ─────────────────────────────────────────────────────────────────────────────
// Axon — Core Types
// ─────────────────────────────────────────────────────────────────────────────

export type AgentStatus = "idle" | "running" | "critique" | "done" | "error";

export type LogCategory = "PREFERENCES" | "WINS" | "FAILURES" | "DECISIONS" | "GENERAL";

export interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  message: string;
  isNew?: boolean;
}

export interface TaskStep {
  id: string;
  index: number;
  description: string;
  assignedTo: "left" | "right" | "both" | null;
  status: "pending" | "running" | "done" | "failed";
}

export interface AgentState {
  id: "left" | "right";
  status: AgentStatus;
  currentTask: string;
  progress: number; // 0–100
  actionLog: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "mastermind";
  content: string;
  timestamp: string;
}

export interface CerebroState {
  projection: string;
  reflection: string;
}

export interface AxonState {
  cerebro: CerebroState;
  mastermind: {
    messages: ChatMessage[];
    taskSteps: TaskStep[];
    isProcessing: boolean;
    currentTaskDescription: string;
  };
  leftAgent: AgentState;
  rightAgent: AgentState;
  logs: LogEntry[];
  activeLogTab: LogCategory;
}
