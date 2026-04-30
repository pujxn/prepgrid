# PrepGrid — Status

## What's built

### Core flow
- **Job description input** — textarea with character count, 50-char minimum, "Edit job description" takes you back with the textarea pre-filled
- **Question generation** — calls Groq API, returns 12–15 questions grouped into Technical, Behavioral, and Role-specific categories as structured JSON
- **Question list** — cards grouped by category with color-coded headers (blue / violet / amber); answered questions show a score badge and a checkmark; progress bar fills as questions are evaluated
- **Answer input** — textarea with ⌘ Enter shortcut to submit; prev/next navigation with question counter in the header; Skip button to jump to the next question without answering
- **AI evaluation** — score out of 10 (color-coded green/yellow/red), 2–3 strengths, 2–3 weaknesses, suggested answer
- **Follow-up questions** — after evaluation, a button generates a probing follow-up question; user can answer it and get a short coaching response
- **Session summary** — accessible from the question list once at least one question is evaluated; shows overall avg score, readiness verdict, best/worst category breakdown, and a per-question score list

### Timer mode
- Selectable per session from the question list: No timer / 1 min / 2 min / 3 min / 5 min
- Progress bar shifts green → yellow → red as time runs out
- Auto-submits on expiry if the answer is long enough

### Polish
- **Dark mode by default** — outline and ghost buttons have correct text color in dark mode

### Developer experience
- **Mock mode** — runs without an API key; returns canned questions and evaluations with simulated delays; amber banner shown at the bottom when active
- **Keyboard shortcuts** — Escape to go back, ⌘ Enter to submit
- **Edge states** — malformed API JSON caught with descriptive errors; empty question list shows a retry screen

## Stack
React + TypeScript + Vite · Tailwind CSS v3 · shadcn/ui (manual) · TanStack Query · Groq API via openai client (`llama-3.3-70b-versatile`)

## What's not built yet
- LocalStorage session persistence (reload loses progress)
- Voice input
- Export to PDF
- Company-specific question mode
