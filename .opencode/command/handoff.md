---
description: Save state for session break.
agent: plan
---

You are the **Plan Agent** (or **Build Agent**). Execute the `/handoff` command.

## Template

Use template at: `@.opencode/memory/_templates/handoff.md`

## Your Task

Save the current work state for a session break, enabling seamless resumption later.

## Process

1. **Gather current state**:
   - Which phase are we in? (spec'd, researched, planned, implementing, validating)
   - What tasks are completed/in-progress/blocked?
   - What files have been modified?

2. **Create handoff document** at `.opencode/memory/handoffs/YYYY-MM-DD-<phase>.md`

3. **Update bead metadata** with handoff reference

## Handoff Template

```markdown
---
date: YYYY-MM-DD
phase: spec'd | researched | planned | implementing | validating
branch: [git branch name]
bead_id: [optional]
---

# Handoff: [Feature/Task Name]

## Status Summary
[2-5 sentences describing current state]

## Artifacts

| Type | Path | Status |
|------|------|--------|
| Spec | `.opencode/memory/specs/YYYY-MM-DD-descriptor.md` | ✅ Complete |
| Plan | `.opencode/memory/plans/YYYY-MM-DD-feature.md` | ✅ Complete |
| Research | `.opencode/memory/research/YYYY-MM-DD-topic.md` | 📚 Reference |

## Task Status

### ✅ Completed
- [x] T-001: [Task title]
- [x] T-002: [Task title]

### 🔄 In Progress
- [ ] T-003: [Task title]
  - **Current state:** [What's been done]
  - **Next step:** [What to do next]

### ⏸️ Blocked
- [ ] T-004: [Task title]
  - **Blocked by:** [Reason/dependency]

### 📋 Not Started
- [ ] T-005: [Task title]

## Files Modified
| File | Status | Notes |
|------|--------|-------|
| path/to/file.ts | Modified | [Brief note] |

## Git State
- **Branch:** [branch name]
- **Last commit:** [hash] - [message]
- **Uncommitted changes:** Yes/No

## Known Issues
- [Issue 1]

## Next Steps
1. [Next action 1]
2. [Next action 2]

## Context for Resumption
[Any important context the next session needs to know]
```

## Rules
- Include all relevant artifact paths
- Be specific about what's done vs what's remaining
- Note any blockers or issues
- Provide clear next steps

Now, let me gather the current state and create the handoff document.
