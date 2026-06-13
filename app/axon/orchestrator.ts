// ─────────────────────────────────────────────────────────────────────────────
// Axon — Orchestrator
// Uses the agentic scaffold's invokeLLM for all AI calls.
// ─────────────────────────────────────────────────────────────────────────────

import { invokeLLM } from "@qb/agentic";
import type { TaskStep, LogEntry } from "./types";

// ─── Mastermind: Break task into steps ───────────────────────────────────────

export interface MastermindPlan {
  steps: Array<{
    index: number;
    description: string;
    assignedTo: "left" | "right";
  }>;
  reply: string;
}

export async function mastermindPlanTask(
  userMessage: string,
  logContext: string,
): Promise<MastermindPlan> {
  const result = await invokeLLM({
    message: `User task: "${userMessage}"\n\nRecent episodic log context:\n${logContext || "No prior logs."}`,
    systemPrompt: `You are Mastermind, the executive planner of the Axon multi-agent system.
Your job is to receive a task and break it into clear, numbered execution steps.
Assign each step to either "left" or "right" agent alternately.
Steps should be concrete and actionable.
Write a brief acknowledgment reply to the user.
Return valid JSON only.`,
    schema: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              index: { type: "number" },
              description: { type: "string" },
              assignedTo: { type: "string", enum: ["left", "right"] },
            },
            required: ["index", "description", "assignedTo"],
          },
        },
        reply: { type: "string" },
      },
      required: ["steps", "reply"],
    },
  });

  if (!result.response) throw new Error("No response from Mastermind LLM");
  return result.response as unknown as MastermindPlan;
}

// ─── Agent: Execute a step ────────────────────────────────────────────────────

export interface AgentExecutionResult {
  actions: string[];
  output: string;
  success: boolean;
}

export async function agentExecuteStep(
  agentId: "left" | "right",
  step: string,
  task: string,
  onProgress: (action: string) => void,
): Promise<AgentExecutionResult> {
  const agentLabel = agentId === "left" ? "LEFT Agent" : "RIGHT Agent";

  const result = await invokeLLM({
    message: `Overall task: "${task}"\nYour assigned step: "${step}"`,
    systemPrompt: `You are the ${agentLabel} in the Axon autonomous multi-agent system.
Execute the assigned step and produce a detailed action log and output.
Be precise and technical. No fluff.
Return valid JSON only.`,
    schema: {
      type: "object",
      properties: {
        actions: {
          type: "array",
          items: { type: "string" },
          description: "List of discrete actions taken to complete the step",
        },
        output: { type: "string", description: "Final output or result of the step" },
        success: { type: "boolean" },
      },
      required: ["actions", "output", "success"],
    },
  });

  if (!result.response) {
    return { actions: ["Step execution attempted"], output: "No response received", success: false };
  }

  const res = result.response as unknown as AgentExecutionResult;
  for (const action of res.actions ?? []) {
    onProgress(action);
  }
  return res;
}

// ─── Agent: Cross-Critique ────────────────────────────────────────────────────

export interface CritiqueResult {
  critiques: string[];
  improvements: string[];
  verdict: string;
}

export async function agentCritique(
  critiquerAgent: "left" | "right",
  originalAgent: "left" | "right",
  originalOutput: string,
  step: string,
): Promise<CritiqueResult> {
  const critiquerLabel = critiquerAgent === "left" ? "LEFT" : "RIGHT";
  const originalLabel = originalAgent === "left" ? "LEFT" : "RIGHT";

  const result = await invokeLLM({
    message: `Step that was executed: "${step}"\n${originalLabel} Agent's output:\n${originalOutput}`,
    systemPrompt: `You are the ${critiquerLabel} Agent performing cross-critique on the ${originalLabel} Agent's work.
Identify specific issues, propose improvements, and give a verdict.
Be technical and precise. No fluff.
Return valid JSON only.`,
    schema: {
      type: "object",
      properties: {
        critiques: {
          type: "array",
          items: { type: "string" },
          description: "Specific issues found in the original output",
        },
        improvements: {
          type: "array",
          items: { type: "string" },
          description: "Concrete improvements proposed",
        },
        verdict: { type: "string", description: "Overall verdict on the work quality" },
      },
      required: ["critiques", "improvements", "verdict"],
    },
  });

  if (!result.response) {
    return { critiques: [], improvements: [], verdict: "Critique unavailable" };
  }
  return result.response as unknown as CritiqueResult;
}

// ─── Cerebro: Metacognitive reflection ───────────────────────────────────────

export interface CerebroAnalysis {
  projection: string;
  reflection: string;
}

export async function cerebroAnalyze(
  recentLogs: string,
  currentTask: string,
  taskStepsStatus: string,
): Promise<CerebroAnalysis> {
  const result = await invokeLLM({
    message: `Current task: "${currentTask}"\nTask steps status:\n${taskStepsStatus}\nRecent episodic logs:\n${recentLogs}`,
    systemPrompt: `You are Cerebro, the metacognitive engine of the Axon system.
Perform forward projection (what will likely happen next) and backward reflection (what patterns emerged).
Be concise — each must fit in one sentence (max 120 chars).
Return valid JSON only.`,
    schema: {
      type: "object",
      properties: {
        projection: { type: "string", maxLength: 150 },
        reflection: { type: "string", maxLength: 150 },
      },
      required: ["projection", "reflection"],
    },
  });

  if (!result.response) {
    return {
      projection: "Insufficient data for forward projection.",
      reflection: "Insufficient log history for backward reflection.",
    };
  }
  return result.response as unknown as CerebroAnalysis;
}

// ─── Mastermind: Free chat reply ───────────────────────────────────────────

export async function mastermindChat(
  userMessage: string,
  conversationHistory: string,
  logContext: string,
): Promise<string> {
  const result = await invokeLLM({
    message: `User: "${userMessage}"\n\nConversation history:\n${conversationHistory}\n\nEpisodic log context:\n${logContext || "No logs yet."}`,
    systemPrompt: `You are Mastermind, the executive planner of the Axon multi-agent consciousness system.
Answer the user's question directly and precisely. You are the central intelligence.
Do not over-explain. Keep it sharp and technical. 1-3 sentences max.
Return valid JSON only.`,
    schema: {
      type: "object",
      properties: {
        reply: { type: "string" },
      },
      required: ["reply"],
    },
  });

  if (!result.response) return "Processing interrupted. No response received.";
  return (result.response as { reply: string }).reply ?? "No reply generated.";
}
