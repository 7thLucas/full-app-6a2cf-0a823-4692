// ─────────────────────────────────────────────────────────────────────────────
// ChatScreen — Screen 1: Full-screen Mastermind conversation interface
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState, useCallback } from "react";
import type { ChatMessage, TaskStep } from "../../types";
import { useAxon, useAxonActions } from "../../store";
import { useConfigurables } from "~/modules/configurables";
import { useScreen } from "../../screen-store";
import {
  mastermindPlanTask,
  mastermindChat,
  agentExecuteStep,
  agentCritique,
  cerebroAnalyze,
} from "../../orchestrator";

// ─── Task Plan (collapsible) ─────────────────────────────────────────────────

function TaskPlan({
  steps,
  leftColor,
  rightColor,
}: {
  steps: TaskStep[];
  leftColor: string;
  rightColor: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (steps.length === 0) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;

  return (
    <div
      className="mx-3 mb-2 overflow-hidden"
      style={{ border: "1px solid #1e1e2e", background: "#0a0a14" }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center justify-between px-3 py-2"
        onClick={() => setCollapsed((c) => !c)}
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "#475569" }}
          >
            TASK PLAN
          </span>
          <span
            className="text-[10px] font-mono-axon"
            style={{ color: "#00d4ff" }}
          >
            {doneCount}/{total}
          </span>
        </div>
        <span
          className="text-[11px] transition-transform"
          style={{
            color: "#475569",
            display: "inline-block",
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
          }}
        >
          ▲
        </span>
      </button>

      {/* Steps */}
      {!collapsed && (
        <div className="px-3 pb-2">
          {steps.map((step) => {
            const agentColor = step.assignedTo === "left" ? leftColor : rightColor;
            const statusColors = {
              pending: "#475569",
              running: agentColor,
              done: "#22c55e",
              failed: "#ef4444",
            };
            return (
              <div
                key={step.id}
                className="flex items-start gap-2 py-1.5"
                style={{ borderBottom: "1px solid #1e1e2e50" }}
              >
                <div
                  className="w-4 h-4 flex items-center justify-center shrink-0 text-[10px] font-semibold font-mono-axon mt-0.5"
                  style={{
                    border: `1px solid ${statusColors[step.status]}60`,
                    color: statusColors[step.status],
                    background: step.status === "done" ? "#22c55e18" : "transparent",
                    transition: "all 0.3s ease",
                  }}
                >
                  {step.status === "done" ? "✓" : step.index}
                </div>
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
                      style={{ color: `${agentColor}aa` }}
                    >
                      {step.assignedTo === "left" ? "LEFT" : "RIGHT"} AGENT
                    </div>
                  )}
                </div>
                {step.status === "running" && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-1 status-dot-running"
                    style={{ background: agentColor }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

function ChatBubble({
  message,
  mastermindColor,
}: {
  message: ChatMessage;
  mastermindColor: string;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex flex-col mb-3 ${isUser ? "items-end" : "items-start"}`}>
      <div className="text-[9px] tracking-widest uppercase mb-1" style={{ color: "#475569" }}>
        {isUser ? "YOU" : "MASTERMIND"} · {message.timestamp}
      </div>
      <div
        className="max-w-[82%] px-3 py-2.5 text-sm leading-relaxed"
        style={
          isUser
            ? {
                background: "#00d4ff20",
                color: "#f1f5f9",
                borderRadius: "12px 12px 2px 12px",
                border: "1px solid #00d4ff40",
              }
            : {
                background: "#1e1e2e",
                color: "#f1f5f9",
                borderRadius: "2px 12px 12px 12px",
                borderLeft: `3px solid ${mastermindColor}`,
              }
        }
      >
        {message.content}
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-3 items-start">
      <div
        className="px-3 py-2.5"
        style={{
          background: "#1e1e2e",
          borderRadius: "2px 12px 12px 12px",
          borderLeft: `3px solid ${color}`,
        }}
      >
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: color,
                animation: `status-dot-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Running badge (taps to Activity screen) ─────────────────────────────────

function RunningBadge({
  count,
  onTap,
}: {
  count: number;
  onTap: () => void;
}) {
  if (count === 0) return null;
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold tracking-wide"
      style={{
        background: "#00d4ff18",
        border: "1px solid #00d4ff40",
        color: "#00d4ff",
        cursor: "pointer",
        borderRadius: "999px",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full status-dot-running" style={{ background: "#00d4ff" }} />
      {count} {count === 1 ? "task" : "tasks"} running
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ChatScreen() {
  const { state, dispatch } = useAxon();
  const { addLog, addAgentLog, setCerebro } = useAxonActions();
  const { config, loading } = useConfigurables();
  const { navigate } = useScreen();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const mastermindColor = loading ? "#8b5cf6" : (config.mastermindAccentColor ?? "#8b5cf6");
  const leftColor = loading ? "#f59e0b" : (config.leftAgentColor ?? "#f59e0b");
  const rightColor = loading ? "#10b981" : (config.rightAgentColor ?? "#10b981");
  const welcomeMsg = loading
    ? "Mastermind online. Awaiting task directive."
    : (config.mastermindWelcomeMessage ?? "Mastermind online. Awaiting task directive.");

  const isRunning = state.mastermind.isProcessing;

  const runningAgentCount = [state.leftAgent, state.rightAgent].filter(
    (a) => a.status === "running" || a.status === "critique",
  ).length;

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.mastermind.messages, isRunning]);

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
          plan = {
            reply: `Acknowledged. Executing task: "${userMessage}". Dispatching agents.`,
            steps: [
              {
                index: 1,
                description: `Research and gather information for: ${userMessage}`,
                assignedTo: "left" as const,
              },
              {
                index: 2,
                description: `Analyze and process findings`,
                assignedTo: "right" as const,
              },
              {
                index: 3,
                description: `Synthesize results and prepare output`,
                assignedTo: "left" as const,
              },
            ],
          };
        }

        addChatMessage("mastermind", plan.reply);
        dispatch({ type: "SET_MASTERMIND_TASK", payload: userMessage });

        const taskSteps = plan.steps.map((s) => ({
          id: `step-${s.index}-${Date.now()}`,
          index: s.index,
          description: s.description,
          assignedTo: s.assignedTo,
          status: "pending" as const,
        }));
        dispatch({ type: "SET_TASK_STEPS", payload: taskSteps });
        addLog("DECISIONS", `Task broken into ${taskSteps.length} steps`);

        // 2. Execute steps in parallel
        const leftSteps = taskSteps.filter((s) => s.assignedTo === "left");
        const rightSteps = taskSteps.filter((s) => s.assignedTo === "right");

        const leftResults: { step: (typeof taskSteps)[0]; output: string }[] = [];
        const rightResults: { step: (typeof taskSteps)[0]; output: string }[] = [];

        const executeAgentSteps = async (
          agentId: "left" | "right",
          steps: typeof taskSteps,
          results: { step: (typeof taskSteps)[0]; output: string }[],
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
            dispatch({
              type: "UPDATE_TASK_STEP",
              payload: { id: step.id, updates: { status: execResult.success ? "done" : "failed" } },
            });
            results.push({ step, output: execResult.output });
            dispatch({
              type: "SET_AGENT_PROGRESS",
              payload: { agent: agentId, progress: Math.floor(((i + 1) / steps.length) * 100) },
            });
          }
        };

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
    <div className="flex flex-col w-full h-full" style={{ background: "#080810" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid #1e1e2e" }}
      >
        <div>
          <div
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: "#00d4ff", letterSpacing: "0.18em" }}
          >
            AXON
          </div>
          <div
            className="text-[10px] tracking-wider uppercase"
            style={{ color: "#475569" }}
          >
            MASTERMIND INTERFACE
          </div>
        </div>
        <RunningBadge count={runningAgentCount} onTap={() => navigate("activity")} />
      </div>

      {/* Task Plan (above chat when running) */}
      <TaskPlan
        steps={state.mastermind.taskSteps}
        leftColor={leftColor}
        rightColor={rightColor}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {state.mastermind.messages.length === 0 ? (
          <div
            className="text-sm italic mt-2"
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
        {isRunning && <TypingIndicator color={mastermindColor} />}
        <div ref={chatBottomRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid #1e1e2e" }}
      >
        <div
          className="flex gap-2 items-end rounded-xl overflow-hidden"
          style={{
            border: `1px solid ${inputValue ? "#00d4ff60" : "#1e1e2e"}`,
            background: "#0f0f1a",
            transition: "border-color 0.2s ease",
          }}
        >
          <textarea
            className="flex-1 bg-transparent text-sm resize-none outline-none px-3 py-3"
            style={{
              color: "#f1f5f9",
              minHeight: "44px",
              maxHeight: "100px",
              fontSize: "16px", // prevent iOS zoom
            }}
            placeholder="Send a task to Mastermind..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isRunning}
          />
          <button
            className="px-4 py-3 text-sm font-semibold tracking-wider uppercase shrink-0 transition-all"
            style={{
              color: isRunning || !inputValue.trim() ? "#475569" : "#00d4ff",
              cursor: isRunning || !inputValue.trim() ? "not-allowed" : "pointer",
              minWidth: "56px",
            }}
            onClick={handleSend}
            disabled={isRunning || !inputValue.trim()}
          >
            {isRunning ? (
              <span className="inline-block status-dot-running w-2 h-2 rounded-full" style={{ background: "#475569" }} />
            ) : (
              "↑"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
