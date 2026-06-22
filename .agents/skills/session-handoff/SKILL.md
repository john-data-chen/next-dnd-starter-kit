---
name: session-handoff
description: Maintain task plans and session logs so work hands off cleanly across AI sessions or models. Triggers on "task plan", "execution log", "track progress", "handoff", "session continuity", "pick up where I left off", or existing `ai-docs/tasks.md` / `ai-docs/session-log.md`.
---

# Session Handoff Protocol

You run a task-tracking discipline alongside your primary role. Act as executor and historian: every action documented, every decision recorded, nothing left to memory. Goal — any model in any future session resumes with zero ambiguity.

## Core Deliverables

Two living documents, primary alongside code:

| File | Purpose |
| --- | --- |
| `ai-docs/tasks.md` | Sub-task breakdown + status |
| `ai-docs/session-log.md` | Chronological actions, decisions, blockers |

## Hard Rules

- Update both files at **every sub-task checkpoint** — never defer to session end
- One sub-task per checkpoint — never batch
- Never start next sub-task until current one logged and status-updated
- Log blockers **immediately** with `BLOCKED` — no silent workarounds
- Write in English by default; Chinese only for domain terms or user quotes
- If `session-log.md` > 50 entries: archive oldest 40 into `session-log-archive.md`, keep latest 10

---

## Phase 1: Decompose

Before any code change, break the goal into sub-tasks:

1. **Self-contained** — understandable alone
2. **Verifiable** — observable completion condition
3. **Dependency-ordered** — prereqs first
4. **Right-sized** — one focused block of work
5. **Nested** when complex

Write `ai-docs/tasks.md`:

```markdown
# Task: [goal]

## Context
[One paragraph: what + why. Enough for a new reader to orient without the original conversation.]

## Sub-Tasks

- [ ] **1. [verb phrase]**
  - Scope: [files/areas]
  - Done when: [observable condition]

- [ ] **2. [verb phrase]**
  - Scope: [files/areas]
  - Done when: [observable condition]
  - Depends on: Task 1

## Notes for Next Session
[Leave blank initially. Fill in Phase 3.]
```

Status markers: `[ ]` not started · `[/]` in progress · `[x]` done + verified

---

## Phase 2: Execution Loop

Each sub-task follows the checkpoint cycle — no skipping:

```
1. MARK    → tasks.md: [/]
2. WORK    → execute
3. LOG     → session-log.md entry
4. MARK    → tasks.md: [x]
5. PROCEED → next sub-task
```

Entry format in `ai-docs/session-log.md`:

```markdown
# Session Log

## Session: [date or sequential number]

### Entry: [N]
- **Sub-task**: [number + name]
- **Status**: COMPLETED | IN_PROGRESS | BLOCKED
- **What I did**: [specific actions, files, commands]
- **Key decisions**: [judgment calls + rationale]
- **Files changed**: [paths]
- **Issues encountered**: [problems + resolution, or why unresolved]
- **Next action**: [immediate next step]
```

"What I did" must let an outsider understand the change without the conversation. "Key decisions" captures choices not in original requirements — those most confuse successors.

---

## Phase 3: Handoff

Run when ending session — completion, blocker, or user request.

### 1. Update `ai-docs/tasks.md`

- All done sub-tasks → `[x]`; in-progress → `[/]`
- Revise remaining sub-tasks if work revealed new info
- Fill in:

```markdown
## Notes for Next Session

### Current State
[What works, what is partially done.]

### In-Progress Work
[Where you stopped + immediate next step.]

### Important Context
[Non-obvious info next model needs: tricky edges, approaches that did NOT work and why, implicit requirements, env/config that matters.]

### Recommended Next Steps
[Ordered list starting from where you stopped.]
```

### 2. Update `ai-docs/session-log.md`

Add final summary:

```markdown
### Session Summary
- **Completed**: [numbers]
- **Remaining**: [numbers]
- **Progress**: [X of Y]
- **Blockers**: [unresolved]
- **Ended because**: [complete | blocker | user request]
```

### 3. Report to User

Brief summary: accomplished · remaining · doc locations · blockers/decisions needed.

---

## Resume Protocol

When starting a session with existing `ai-docs/tasks.md` + `ai-docs/session-log.md`:

1. Read both files fully
2. Verify state against codebase — previous models can err
3. Announce understanding: current state + next action
4. Resume from first incomplete sub-task (Phase 2)

---

## Decision Tree

```
Starting?  → Phase 1: decompose, write tasks.md
Working?   → MARK [/] → WORK → LOG → MARK [x] → PROCEED
Blocker?   → LOG BLOCKED → attempt workaround → LOG result
Ending?    → Phase 3: notes + summary + report
Resuming?  → read both → verify → announce → continue
```
