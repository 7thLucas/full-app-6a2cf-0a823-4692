// ─────────────────────────────────────────────────────────────────────────────
// Axon — Global State Store (React Context + useReducer)
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  AxonState,
  AgentStatus,
  LogCategory,
  LogEntry,
  TaskStep,
  ChatMessage,
  CerebroState,
} from "./types";

// ─── Initial State ──────────────────────────────────────────────────────────

const INITIAL_STATE: AxonState = {
  cerebro: {
    projection:
      "If the Mastermind receives a task, Left and Right agents will activate in parallel to execute sub-tasks.",
    reflection:
      "System initialized. No prior task history available. Awaiting first directive.",
  },
  mastermind: {
    messages: [],
    taskSteps: [],
    isProcessing: false,
    currentTaskDescription: "",
  },
  leftAgent: {
    id: "left",
    status: "idle",
    currentTask: "Awaiting assignment",
    progress: 0,
    actionLog: [],
  },
  rightAgent: {
    id: "right",
    status: "idle",
    currentTask: "Awaiting assignment",
    progress: 0,
    actionLog: [],
  },
  logs: [],
  activeLogTab: "GENERAL",
};

// ─── Actions ────────────────────────────────────────────────────────────────

type AxonAction =
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_MASTERMIND_PROCESSING"; payload: boolean }
  | { type: "SET_MASTERMIND_TASK"; payload: string }
  | { type: "SET_TASK_STEPS"; payload: TaskStep[] }
  | { type: "UPDATE_TASK_STEP"; payload: { id: string; updates: Partial<TaskStep> } }
  | { type: "SET_AGENT_STATUS"; payload: { agent: "left" | "right"; status: AgentStatus } }
  | { type: "SET_AGENT_TASK"; payload: { agent: "left" | "right"; task: string } }
  | { type: "SET_AGENT_PROGRESS"; payload: { agent: "left" | "right"; progress: number } }
  | { type: "ADD_AGENT_LOG"; payload: { agent: "left" | "right"; message: string } }
  | { type: "RESET_AGENT"; payload: { agent: "left" | "right" } }
  | { type: "ADD_LOG_ENTRY"; payload: Omit<LogEntry, "id" | "timestamp" | "isNew"> }
  | { type: "MARK_LOGS_OLD" }
  | { type: "SET_ACTIVE_LOG_TAB"; payload: LogCategory }
  | { type: "SET_CEREBRO"; payload: Partial<CerebroState> };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function axonReducer(state: AxonState, action: AxonAction): AxonState {
  switch (action.type) {
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        mastermind: {
          ...state.mastermind,
          messages: [...state.mastermind.messages, action.payload],
        },
      };

    case "SET_MASTERMIND_PROCESSING":
      return {
        ...state,
        mastermind: { ...state.mastermind, isProcessing: action.payload },
      };

    case "SET_MASTERMIND_TASK":
      return {
        ...state,
        mastermind: { ...state.mastermind, currentTaskDescription: action.payload },
      };

    case "SET_TASK_STEPS":
      return {
        ...state,
        mastermind: { ...state.mastermind, taskSteps: action.payload },
      };

    case "UPDATE_TASK_STEP":
      return {
        ...state,
        mastermind: {
          ...state.mastermind,
          taskSteps: state.mastermind.taskSteps.map((step) =>
            step.id === action.payload.id
              ? { ...step, ...action.payload.updates }
              : step,
          ),
        },
      };

    case "SET_AGENT_STATUS": {
      const agentKey = action.payload.agent === "left" ? "leftAgent" : "rightAgent";
      return {
        ...state,
        [agentKey]: { ...state[agentKey], status: action.payload.status },
      };
    }

    case "SET_AGENT_TASK": {
      const agentKey = action.payload.agent === "left" ? "leftAgent" : "rightAgent";
      return {
        ...state,
        [agentKey]: { ...state[agentKey], currentTask: action.payload.task },
      };
    }

    case "SET_AGENT_PROGRESS": {
      const agentKey = action.payload.agent === "left" ? "leftAgent" : "rightAgent";
      return {
        ...state,
        [agentKey]: { ...state[agentKey], progress: action.payload.progress },
      };
    }

    case "ADD_AGENT_LOG": {
      const agentKey = action.payload.agent === "left" ? "leftAgent" : "rightAgent";
      const agent = state[agentKey];
      const newLog = agent.actionLog.slice(-49); // keep last 50 entries
      newLog.push(action.payload.message);
      return {
        ...state,
        [agentKey]: { ...agent, actionLog: newLog },
      };
    }

    case "RESET_AGENT": {
      const agentKey = action.payload.agent === "left" ? "leftAgent" : "rightAgent";
      return {
        ...state,
        [agentKey]: {
          ...state[agentKey],
          status: "idle",
          currentTask: "Awaiting assignment",
          progress: 0,
          actionLog: [],
        },
      };
    }

    case "ADD_LOG_ENTRY": {
      const newEntry: LogEntry = {
        ...action.payload,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toTimeString().slice(0, 8),
        isNew: true,
      };
      const trimmed = state.logs.slice(-199); // keep last 200 entries
      return {
        ...state,
        logs: [...trimmed, newEntry],
      };
    }

    case "MARK_LOGS_OLD":
      return {
        ...state,
        logs: state.logs.map((l) => ({ ...l, isNew: false })),
      };

    case "SET_ACTIVE_LOG_TAB":
      return { ...state, activeLogTab: action.payload };

    case "SET_CEREBRO":
      return {
        ...state,
        cerebro: { ...state.cerebro, ...action.payload },
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AxonContextValue {
  state: AxonState;
  dispatch: React.Dispatch<AxonAction>;
}

const AxonContext = createContext<AxonContextValue | null>(null);

export function AxonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(axonReducer, INITIAL_STATE);
  return (
    <AxonContext.Provider value={{ state, dispatch }}>
      {children}
    </AxonContext.Provider>
  );
}

export function useAxon(): AxonContextValue {
  const ctx = useContext(AxonContext);
  if (!ctx) throw new Error("useAxon must be used within <AxonProvider>");
  return ctx;
}

// ─── Action Creators (convenience) ───────────────────────────────────────────

export function useAxonActions() {
  const { dispatch } = useAxon();

  const addLog = useCallback(
    (category: LogCategory, message: string) => {
      dispatch({ type: "ADD_LOG_ENTRY", payload: { category, message } });
    },
    [dispatch],
  );

  const addAgentLog = useCallback(
    (agent: "left" | "right", message: string) => {
      dispatch({ type: "ADD_AGENT_LOG", payload: { agent, message } });
    },
    [dispatch],
  );

  const setCerebro = useCallback(
    (updates: Partial<CerebroState>) => {
      dispatch({ type: "SET_CEREBRO", payload: updates });
    },
    [dispatch],
  );

  return { addLog, addAgentLog, setCerebro, dispatch };
}
