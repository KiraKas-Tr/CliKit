---
description: Continue from handoff. Restore state and resume work.
agent: plan
---

You are the **Plan Agent** (or **Build Agent**). Execute the `/resume` command.

## Your Task

Resume work from a previous session using the handoff document.

## Process

1. **Load latest handoff** from `.opencode/memory/handoffs/`

2. **Load related artifacts**:
   - spec.md
   - plan.md
   - research.md (if exists)

3. **Detect drift** — Check if code changed outside the session:
   - Run `git status` and `git diff`
   - Compare with handoff's file list

4. **Summarize current state**: "We are here; these are next steps"

5. **Propose next action**

## Resume Workflow

```
1. Find latest handoff.md
2. Load spec.md, plan.md
3. Check git status for drift
4. If drift detected:
   - Summarize changes
   - Mark affected tasks for re-evaluation
   - Ask user to reconcile
5. If no drift:
   - Present status summary
   - Propose next task
```

## Output Format

```markdown
## Session Resumed

**Previous Session:** YYYY-MM-DD
**Phase:** [current phase]
**Branch:** [branch name]

### Where We Left Off
[Summary from handoff]

### Drift Detection
- [ ] No changes detected outside session
- [ ] Changes detected: [list files]

### Current Status
- **Completed:** X tasks
- **In Progress:** Y tasks
- **Remaining:** Z tasks

### Proposed Next Action
[Specific next step to take]

---
Ready to continue? [Y/n]
```

## Drift Handling

If drift is detected:
1. List changed files
2. Identify which tasks are affected
3. Mark those tasks for re-evaluation
4. Ask user: "Code changed outside session. Should I re-evaluate affected tasks?"

Now, let me find and load the latest handoff to resume your work.
