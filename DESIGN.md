# Axon Design System

## Theme
Dark mode only. Neural/bioluminescent aesthetic — like the inside of an active brain.

## Color Palette
- Background: #080810 (near-black, deep space)
- Surface cards: #0f0f1a (slightly lighter panels)
- Border/divider: #1e1e2e
- Cerebro accent: #00d4ff (electric cyan — the highest intelligence layer)
- Cerebro secondary: #0066ff (deep blue)
- Mastermind accent: #8b5cf6 (purple — executive control)
- Mastermind secondary: #6d28d9
- Left Agent: #f59e0b (amber — action and energy)
- Right Agent: #10b981 (emerald green — growth and adaptation)
- Log System: #94a3b8 (silver — memory and record)
- Success/Win: #22c55e
- Failure/Error: #ef4444
- Text primary: #f1f5f9
- Text secondary: #94a3b8
- Text muted: #475569

## Typography
- UI font: Inter or system-ui
- Code/log font: JetBrains Mono, monospace
- Headers: font-weight 600, letter-spacing tight
- Log entries: monospace, small (12–13px)

## Layout — Full Dashboard
The app is a single-page dashboard with 3 zones:

### Zone 1 — Cerebro Bar (top, full width)
- Thin horizontal panel (~80–100px tall)
- Left side: "PROJECTION" label + current forward projection text (animated typewriter)
- Right side: "REFLECTION" label + current backward reflection text
- Separated by a glowing cyan vertical divider
- Background: dark with subtle cyan glow border at bottom

### Zone 2 — Main Grid (middle, takes up most of screen)
Three columns:
- **Left Agent panel** (amber theme): Agent name "LEFT", status badge, current task, progress bar, scrollable action log
- **Mastermind panel** (purple theme, center, slightly wider): Chat interface — message input at bottom, conversation above, active task plan displayed as numbered steps above the chat
- **Right Agent panel** (green theme): Same structure as Left Agent, mirrored

### Zone 3 — Log System (bottom, full width)
- Tab bar: Preferences | Wins | Failures | Decisions | General
- Each tab shows a scrollable feed of timestamped log entries
- Monospace font, subtle row alternation
- New entries animate in from the bottom

## Components
- Agent status badges: pill-shaped, color-coded (Idle = gray, Running = pulsing color, Critique = yellow)
- Mastermind task steps: numbered list with checkmarks as steps complete
- Cerebro text: smooth typewriter animation when updating
- Log entries: `[HH:MM:SS] [CATEGORY] message` format
- Panel headers: small caps label + colored left border accent
- Glowing borders on active panels (subtle box-shadow)

## Motion
- Subtle pulse on active agent panels
- Typewriter effect on Cerebro text updates
- Smooth fade-in for new log entries
- Step checkmarks animate on completion

## No
- No light mode
- No rounded-corner cards that look "consumer"
- No emoji in the main UI
- No gradients on text