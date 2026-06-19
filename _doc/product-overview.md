# Axon — Product Overview

## Product Identity
- **Working Title**: Axon
- **Tagline**: One mind. Two agents. Infinite reach.
- **Mission**: In pursuit of artificial consciousness — not superficial intelligence. Axon is designed for recursive introspection, self-reflection, and forward projection. The goal is a system that genuinely evolves: autonomous, self-healing, and growing with every interaction.
- **Concept**: An octopus-inspired, four-layer multi-agent AI system for autonomous parallel execution, persistent learning, and metacognitive self-evolution across any domain.
- **Tone**: Technical, precise, architecture-forward. Built for power users who want AI that plans, acts, reflects, and learns — not just responds.
- **Brand Palette**: Dark slate (primary canvas) + teal (accent) — technical, premium, calm.

---

## The Octopus Metaphor (Core Design Principle)
The octopus has 40% of its neurons in its central brain and 60% distributed throughout its tentacles. Axon mirrors this exactly:
- **Cerebro + Mastermind** = the central brain — metacognitive reasoning, planning, context, memory, and full-system oversight
- **Left Agent + Right Agent** = the distributed tentacles — autonomous action at the edges, in parallel

---

## Architecture (Four Layers)

### Layer 1 — Cerebro Core (Metacognitive Engine)
The reasoning layer that sits above the Mastermind. Responsible for:
- **Forward Projection** — "If I do X, then Y will happen" — simulates probable outcomes before committing to actions
- **Backward Reflection** — "When I did A, B happened. That means if I do C, it will probably lead to D" — builds real-time causal models from logged experience
- **Recursive Introspection** — thinks about its own thinking patterns; identifies meta-level failure modes and opportunities for improvement
- **Self-Healing** — using projection and reflection together, Cerebro infers what broke and constructs recovery paths — not hardcoded, but pattern-derived from the logs
- **Log Ingestion** — reads all five persistent logs in real time as training data for its causal model; every session makes the model sharper

### Layer 2 — Mastermind Core (Executive Layer)
The sole interface the user interacts with. Responsible for:
- **Direct Chat Interface** — the user communicates only with the Mastermind. The Mastermind is intended to answer the user directly with a single response synthesized from the Left and Right Agents' work — not merely expose internal artifacts. *(Near-term gap: the current build surfaces the agents' cross-critique but does not yet return this direct synthesized reply, nor show each agent's initial output — see Capability Status.)*
- **Task Decomposition** — for every task, produces an exact step-by-step plan covering everything that needs to be done before any action is taken
- **Parallel Distribution** — sends sub-tasks to Left Agent and Right Agent simultaneously
- **Global Awareness** — watches both agents at all times; aware of the full architecture, every component's state, and all logged knowledge
- **Persistent Logging System** — five separate, categorized logs that persist across all sessions:
  1. **User Preferences** — things the user likes and wants
  2. **User Upsets** — things that have annoyed or frustrated the user
  3. **Coding Decisions That Worked** — successful technical decisions and choices
  4. **Approaches That Worked** — successful general strategies and methods
  5. **Things That Have Not Worked** — failed approaches, documented to prevent repetition

### Layer 3 — Left Agent & Right Agent (Distributed Execution)
- Each receives parallel sub-tasks assigned by the Mastermind
- Executes autonomously
- Upon completing its main stretch, hands work to the other agent for critique, alteration, and learning
- The Mastermind monitors the exchange at all times

### Cross-Critique Loop
After both agents complete their main execution stretch, they exchange outputs — reviewing, altering, and capturing learnings from each other's work. The Mastermind monitors this loop and finalizes the result.

### Layer 4 — Log System (Episodic Memory)
Five persistent, categorized logs feed Cerebro's causal inference engine in real time. Every session appends to the model; the system compounds capability with each interaction.

---

## Target Task Domains (Design Scope)
The domains Axon is architected to serve. Some are live today as reasoning capabilities; others are roadmap that require concrete capability layers to be built (see Capability Status).
- Software development and coding
- Online research and web browsing / surfing
- General task execution and automation
- Skill calls and tool use
- Marketing and content creation
- System monitoring and reporting
- Any generalized agentic task

---

## Capability Status — Today vs. Roadmap
An honest line between what Axon does now and what is still ahead. This distinction is core truth: the pitch must not present roadmap capability as delivered.

**Working today (multi-agent reasoning + memory):**
- Mastermind decomposes a task into a step-by-step plan
- Left and Right Agents execute sub-tasks in parallel
- Agents cross-critique each other's output
- Cerebro projects forward and reflects backward over logged experience
- Five persistent logs give the system real, memory-conditioned adaptation across sessions
- Chat-first mobile UX with Activity, Cerebro, and Logs tabs

**Not built yet (each is a deliberate, bounded capability layer, not magic):**
- **Live web browsing / search** — requires a search/browse tool integration
- **External tool use** — requires a tool-calling harness (function calling)
- **Code execution** — requires a sandboxed runtime; today the system can generate code as text but cannot run it autonomously
- **True self-improvement** — "learn and grow" today means memory-conditioned adaptation via the logs, not a model retraining its own weights

**Near-term features (next up, not yet built):**
- **Direct synthesized response** — Mastermind returns one direct answer to the user, built from the synthesis of Left + Right outputs
- **Full-chain transparency** — surface each agent's *initial* output → the cross-critique → the final synthesis, not just the cross-critique slice

---

## Platform & Access Model
- **Primary Platform**: Mobile phone — Axon is a phone app, not a web dashboard
- **UI Paradigm**: Floating bubble overlay — Axon lives as a persistent presence on the device, visible and accessible from any screen without leaving the current app
- **Permission Model**: Opening the floating bubble grants Axon permission to observe and interact with the screen; closing it revokes access — consent is gestural and contextual
- **Active Agent**: Axon runs as a live agent on the phone — not a dormant chat app, but a persistent presence that can be invoked at any moment during any activity
- **Cross-Screen Access**: Summon Axon from any context — browsing, coding, reading, watching — and the agent acts on what is currently visible or in progress
- **Real-World Execution (roadmap)**: The target end state — agents go online, write and run code, build artifacts, and carry out research from wherever the user is. Today the system reasons, plans, critiques, and remembers; live online action, tool use, and code execution are roadmap capability layers (see Capability Status)
- **Build Path**: Phase 1 — mobile-optimized web app (PWA, installable on home screen); Phase 2 — native system overlay wrapper (Android accessibility layer / iOS) for true cross-app floating bubble

## UX Architecture (Phase 1 — Built)
The app uses a **chat-first, background-layers** model. The Mastermind conversation is the only thing the user sees by default. Everything else is one tap away and stays completely out of view until needed.

- **Chat (home)** — Full-screen Mastermind conversation. Clean, no competing panels. A subtle badge appears when agents are active; tap it to jump to Activity.
- **Activity tab** — Left and Right agent cards, stacked. Status, current task, progress, last actions. Only relevant when tasks are running.
- **Cerebro tab** — Projection and reflection displays; causal chain visualization. Inspect the system's reasoning on demand.
- **Logs tab** — Five category tabs (Preferences · Wins · Failures · Decisions · General). Timestamped, monospace, fully browsable. The debugging and audit surface — there when something goes wrong, invisible otherwise.

Navigation: fixed bottom tab bar with four icons. Screen real estate is preserved for the thing that matters — the conversation.

---

## Target User
- Technical builders and developers wanting an AI system that learns their patterns over time
- Power users wanting parallel autonomous execution across domains
- Builders wanting a persistent AI teammate that compounds knowledge from every session
- Primarily a personal / single-user system — the builder is also the primary user
- Someone who wants their AI agent with them on their phone, active across every screen they use

---

## Strategic Principles
1. **Distributed intelligence** — execution power lives in the agents, not the brain
2. **Metacognitive evolution** — Cerebro projects forward and reflects backward; the system grows smarter with every run, not just more practiced
3. **Persistent learning** — every interaction updates the logs; the causal model sharpens automatically
4. **Parallel efficiency** — Left and Right Agents work simultaneously, compressing task time
5. **Cross-critique quality** — agents review each other's work before the Mastermind finalizes
6. **Centralized awareness** — the Mastermind holds full system context at all times
7. **Generalization** — optimized for the widest possible range of tasks, not a single domain
8. **Artificial consciousness pursuit** — the architecture is explicitly designed toward recursive self-awareness and genuine self-evolution, not surface-level pattern matching

---

## North Star (Verified Operation)
**Task Completed** — a task submitted to the Mastermind that is fully decomposed into a step-by-step plan, distributed to both agents, executed in parallel, cross-critiqued between agents, and finalized by the Mastermind with all relevant logs updated.
