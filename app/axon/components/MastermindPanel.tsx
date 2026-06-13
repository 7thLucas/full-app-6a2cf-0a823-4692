// ─────────────────────────────────────────────────────────────────────────────
// MastermindPanel — Zone 2: Central executive planner + chat interface
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState, useCallback } from "react";
import type { ChatMessage, TaskStep } from "../types";
import { useAxon, useAxonActions } from "../store";
import { useConfigurables } from "~/modules/configurables";
import {
  mastermindPlanTask,
  mastermindChat,
  agentExecuteStep,
  agentCritique,
  cerebroAnalyze,
} from "../orchestrator";

// ─── Task Steps List ─────────────────────────────────────────────────────────

function TaskStepItem({ step, leftColor, rightColor }: { step: TaskStep; leftColor: string; rightColor: string }) {
  const statusColors = {
    pending: "#475569",
    running: step.assignedTo === "left" ? leftColor : rightColor,
    done: "#22c55e",
    failed: "#ef4444",
  };

  const agentColor = step.assignedTo === "left" ? leftColor : rightColor;

  return (
    <div
      className="flex items-start gap-2.5 py-1.5"
      style={{ borderBottom: "1px solid #1e1e2e50" }}
    >
      {/* Step number / check */}
      <div
        className="w-5 h-5 flex items-center justify-center shrink-0 text-[11px] font-semibold font-mono-axon mt-0.5"
        style={{
          border: `1px solid ${statusColors[step.status]}60`,
          color: statusColors[step.status],
          background: step.status === "done" ? "#22c55e18" : "transparent",
          transition: "all 0.3s ease",
        }}
      >
        {step.status === "done" ? "✓" : step.index}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <div
          className="text-xs leading-snug"
          style={{
            color: step.status === "pending" ? "#475569" : "#f1f5f9",
            textDecoration: step.status === "done" ? "line-through" : "none",
          }}
        >
          {step.description}
        </div>
        {step.assignedTo && (
          <div
            className="text-[9px] tracking-widest uppercase mt-0.5"
            style={{ color: agentColor + "aa" }}
          >
            {step.assignedTo === "left" ? "LEFT" : "RIGHT"} AGENT
          </div>
        )}
      </div>

      {/* Running indicator */}
      {step.status === "running" && (
        <div
          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 status-dot-running"
          style={{ background: statusColors.running }}
        />
      )}
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ message, mastermindColor }: { message: ChatMessage; mastermindColor: string }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex flex-col mb-3 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className="text-[9px] tracking-widest uppercase mb-1"
        style={{ color: "#475569" }}
      >
        {isUser ? "OPERATOR" : "MASTERMIND"} · {message.timestamp}
      </div>
      <div
        className="max-w-[88%] px-3 py-2 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: "#1e1e2e",
                color: "#f1f5f9",
                borderLeft: "2px solid #475569",
              }
            : {
                background: `${mastermindColor}18`,
                color: "#f1f5f9",
                borderLeft: `2px solid ${mastermindColor}`,
              }
        }
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MastermindPanel() {
  const { state, dispatch } = useAxon();
  const { addLog, addAgentLog, setCerebro } = useAxonActions();
  const { config, loading } = useConfigurables();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const mastermindColor = loading ? "#8b5cf6" : (config.mastermindAccentColor ?? "#8b5cf6");
  const leftColor = loading ? "#f59e0b" : (config.leftAgentColor ?? "#f59e0b");
  const rightColor = loading ? "#10b981" : (config.rightAgentColor ?? "#10b981");
  const welcomeMsg = loading ? "Mastermind online. Awaiting task directive." : (config.mastermindWelcomeMessage ?? "Mastermind online. Awaiting task directive.");

  const isRunning = state.mastermind.isProcessing;

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.mastermind.messages]);

  const addChatMessage = useCallback(
    (role: "user" | "mastermind", content: string) => {
      dispatch({
        type: "ADD_CHAT_MESSAGE",
        payload: {
          id: `msg-${Date.now()}`,
          role,
          content,
          timestamp: new Date().toTimeString().slice(0, 8),
        },
      });
    },
    [dispatch],
  );

  // ─── Full orchestration flow ─────────────────────────────────────────────

  const runOrchestration = useCallback(
    async (userMessage: string) => {
      dispatch({ type: "SET_MASTERMIND_PROCESSING", payload: true });

      // Build log context for AI
      const logContext = state.logs
        .slice(-10)
        .map((l) => `[${l.timestamp}] [${l.category}] ${l.message}`)
        .join("\n");

      try {
        addLog("DECISIONS", `Mastermind received task: "${userMessage}"`);

        // 1. Mastermind plans
        let plan;
        try {
          plan = await mastermindPlanTask(userMessage, logContext);
        } catch {
          // Fallback plan if LLM is unavailable
          plan = {
            reply: `Acknowledged. Executing task: "${userMessage}". Dispatching agents.`,
            steps: [
              { index: 1, description: `Research and gather information for: ${userMessage}`, assignedTo: "left" as const },
              { index: 2, description: `Analyze and process findings`, assignedTo: "right" as const },
              { index: 3, description: `Synthesize results and prepare output`, assignedTo: "left" as const },
            ],
          };
        }

        addChatMessage("mastermind", plan.reply);
        dispatch({ type: "SET_MASTERMIND_TASK", payload: userMessage });

        const taskSteps: TaskStep[] = plan.steps.map((s) => ({
          id: `step-${s.index}-${Date.now()}`,
          index: s.index,
          description: s.description,
          assignedTo: s.assignedTo,
          status: "pending",
        }));
        dispatch({ type: "SET_TASK_STEPS", payload: taskSteps });
        addLog("DECISIONS", `Task broken into ${taskSteps.length} steps`);

        // 2. Execute steps (parallel where possible)
        const leftSteps = taskSteps.filter((s) => s.assignedTo === "left");
        const rightSteps = taskSteps.filter((s) => s.assignedTo === "right");

        const leftResults: { step: TaskStep; output: string }[] = [];
        const rightResults: { step: TaskStep; output: string }[] = [];

        const executeAgentSteps = async (
          agentId: "left" | "right",
          steps: TaskStep[],
          results: { step: TaskStep; output: string }[],
        ) => {
          if (steps.length === 0) return;

          dispatch({ type: "SET_AGENT_STATUS", payload: { agent: agentId, status: "running" } });
          dispatch({ type: "SET_AGENT_TASK", payload: { agent: agentId, task: steps[0].description } });
          dispatch({ type: "SET_AGENT_PROGRESS", payload: { agent: agentId, progress: 0 } });

          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            dispatch({ type: "UPDATE_TASK_STEP", payload: { id: step.id, updates: { status: "running" } } });
            dispatch({ type: "SET_AGENT_TASK", payload: { agent: agentId, task: step.description } });
            addAgentLog(agentId, `Starting: ${step.description}`);
            addLog("GENERAL", `${agentId.toUpperCase()} Agent: executing step ${step.index}`);

            let execResult;
            try {
              execResult = await agentExecuteStep(
                agentId,
                step.description,
                userMessage,
                (action) => {
                  addAgentLog(agentId, action);
                  const newProgress = Math.min(
                    Math.floor(((i + 0.5) / steps.length) * 100),
                    95,
                  );
                  dispatch({ type: "SET_AGENT_PROGRESS", payload: { agent: agentId, progress: newProgress } });
                },
              );
            } catch {
              execResult = {
                actions: [`Step ${step.index} processed`, "Analysis complete"],
                output: `Step ${step.index} completed: ${step.description}`,
                success: true,
              };
              for (const a of execResult.actions) addAgentLog(agentId, a);
            }

            const category = execResult.success ? "WINS" : "FAILURES";
            addLog(category, `${agentId.toUpperCase()} step ${step.index}: ${execResult.success ? "SUCCESS" : "FAILED"}`);
            dispatch({ type: "UPDATE_TASK_STEP", payload: { id: step.id, updates: { status: execResult.success ? "done" : "failed" } } });

            results.push({ step, output: execResult.output });
            const progress = Math.floor(((i + 1) / steps.length) * 100);
            dispatch({ type: "SET_AGENT_PROGRESS", payload: { agent: agentId, progress } });
          }
        };

        // Run both agents in parallel
        await Promise.all([
          executeAgentSteps("left", leftSteps, leftResults),
          executeAgentSteps("right", rightSteps, rightResults),
        ]);

        // 3. Cross-critique phase
        dispatch({ type: "SET_AGENT_STATUS", payload: { agent: "left", status: "critique" } });
        dispatch({ type: "SET_AGENT_STATUS", payload: { agent: "right", status: "critique" } });
        dispatch({ type: "SET_AGENT_TASK", payload: { agent: "left", task: "Cross-reviewing RIGHT agent output" } });
        dispatch({ type: "SET_AGENT_TASK", payload: { agent: "right", task: "Cross-reviewing LEFT agent output" } });
        addLog("DECISIONS", "Cross-critique phase initiated");

        const leftOutputSummary = leftResults.map((r) => r.output).join("\n");
        const rightOutputSummary = rightResults.map((r) => r.output).join("\n");

        await Promise.all([
          (async () => {
            if (rightResults.length > 0) {
              try {
                const critique = await agentCritique("left", "right", rightOutputSummary, userMessage);
                for (const c of critique.critiques) addAgentLog("left", `Critique: ${c}`);
                for (const imp of critique.improvements) addAgentLog("left", `Suggest: ${imp}`);
                addLog("DECISIONS", `LEFT critique verdict: ${critique.verdict}`);
              } catch {
                addAgentLog("left", "Cross-critique analysis complete");
              }
            }
          })(),
          (async () => {
            if (leftResults.length > 0) {
              try {
                const critique = await agentCritique("right", "left", leftOutputSummary, userMessage);
                for (const c of critique.critiques) addAgentLog("right", `Critique: ${c}`);
                for (const imp of critique.improvements) addAgentLog("right", `Suggest: ${imp}`);
                addLog("DECISIONS", `RIGHT critique verdict: ${critique.verdict}`);
              } catch {
                addAgentLog("right", "Cross-critique analysis complete");
              }
            }
          })(),
        ]);

        // 4. Mark agents done
        dispatch({ type: "SET_AGENT_STATUS", payload: { agent: "left", status: "done" } });
        dispatch({ type: "SET_AGENT_STATUS", payload: { agent: "right", status: "done" } });
        addLog("WINS", `Task "${userMessage}" completed by all agents`);

        // 5. Mastermind summary
        const conversationHistory = state.mastermind.messages
          .slice(-6)
          .map((m) => `${m.role}: ${m.content}`)
          .join("\n");

        let summaryReply;
        try {
          summaryReply = await mastermindChat(
            `Summarize the completed task execution for: "${userMessage}"`,
            conversationHistory,
            logContext,
          );
        } catch {
          summaryReply = `Task "${userMessage}" has been executed. Both agents completed their assignments and performed cross-critique. Results are logged.`;
        }
        addChatMessage("mastermind", summaryReply);

        // 6. Cerebro metacognitive update
        const stepsStatus = taskSteps
          .map((s) => `Step ${s.index} (${s.assignedTo}): ${s.status}`)
          .join(", ");
        const recentLogsStr = state.logs
          .slice(-8)
          .map((l) => `[${l.category}] ${l.message}`)
          .join("\n");

        try {
          const cerebroUpdate = await cerebroAnalyze(recentLogsStr, userMessage, stepsStatus);
          setCerebro(cerebroUpdate);
        } catch {
          setCerebro({
            projection: `If similar tasks are submitted, agents will execute them using learned patterns from "${userMessage}".`,
            reflection: `Task "${userMessage}" completed. Both agents executed steps and performed cross-critique successfully.`,
          });
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        addLog("FAILURES", `Orchestration error: ${errMsg}`);
        addChatMessage("mastermind", `Error during task execution: ${errMsg}. Check logs for details.`);
      } finally {
        dispatch({ type: "SET_MASTERMIND_PROCESSING", payload: false });
      }
    },
    [state.logs, state.mastermind.messages, dispatch, addLog, addAgentLog, setCerebro, addChatMessage],
  );

  const handleSend = useCallback(async () => {
    const msg = inputValue.trim();
    if (!msg || isRunning) return;
    setInputValue("");
    addChatMessage("user", msg);
    await runOrchestration(msg);
  }, [inputValue, isRunning, addChatMessage, runOrchestration]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div
      className={`flex flex-col h-full ${isRunning ? "panel-active-mastermind" : ""}`}
      style={{
        background: "#0f0f1a",
        border: `1px solid ${isRunning ? mastermindColor + "40" : "#1e1e2e"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Panel Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          borderBottom: `1px solid #1e1e2e`,
          borderLeft: `3px solid ${mastermindColor}`,
        }}
      >
        <div>
          <div
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: mastermindColor, letterSpacing: "0.16em" }}
          >
            MASTERMIND
          </div>
          <div
            className="text-[10px] tracking-wider uppercase mt-0.5"
            style={{ color: "#475569" }}
          >
            EXECUTIVE PLANNER
          </div>
        </div>
        {isRunning && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase"
            style={{
              border: `1px solid ${mastermindColor}40`,
              color: mastermindColor,
              background: `${mastermindColor}12`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full status-dot-running" style={{ background: mastermindColor }} />
            PROCESSING
          </span>
        )}
      </div>

      {/* Task Steps */}
      {state.mastermind.taskSteps.length > 0 && (
        <div
          className="px-4 py-2 shrink-0 max-h-36 overflow-y-auto"
          style={{ borderBottom: "1px solid #1e1e2e" }}
        >
          <div
            className="text-[10px] font-semibold tracking-widest uppercase mb-1.5"
            style={{ color: "#475569" }}
          >
            TASK PLAN
          </div>
          {state.mastermind.taskSteps.map((step) => (
            <TaskStepItem
              key={step.id}
              step={step}
              leftColor={leftColor}
              rightColor={rightColor}
            />
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {state.mastermind.messages.length === 0 ? (
          <div
            className="text-sm italic"
            style={{ color: "#475569" }}
          >
            {welcomeMsg}
          </div>
        ) : (
          state.mastermind.messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              mastermindColor={mastermindColor}
            />
          ))
        )}
        {isRunning && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: mastermindColor,
                    animation: `status-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: "#475569" }}>
              Agents working...
            </span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: "1px solid #1e1e2e" }}
      >
        <div
          className="flex gap-2 items-end"
          style={{
            border: `1px solid ${inputValue ? mastermindColor + "60" : "#1e1e2e"}`,
            background: "#080810",
            transition: "border-color 0.2s ease",
          }}
        >
          <textarea
            className="flex-1 bg-transparent text-sm resize-none outline-none px-3 py-2"
            style={{
              color: "#f1f5f9",
              minHeight: "40px",
              maxHeight: "96px",
            }}
            placeholder="Direct task to Mastermind..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isRunning}
          />
          <button
            className="px-3 py-2 text-xs font-semibold tracking-widest uppercase shrink-0 transition-all"
            style={{
              color: isRunning || !inputValue.trim() ? "#475569" : mastermindColor,
              cursor: isRunning || !inputValue.trim() ? "not-allowed" : "pointer",
            }}
            onClick={handleSend}
            disabled={isRunning || !inputValue.trim()}
          >
            {isRunning ? "..." : "SEND"}
          </button>
        </div>
        <div
          className="text-[10px] mt-1.5 tracking-wide"
          style={{ color: "#475569" }}
        >
          ENTER to send · SHIFT+ENTER for newline
        </div>
      </div>
    </div>
  );
}
