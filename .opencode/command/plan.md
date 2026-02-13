---
description: Convert specs and research into execution plan.
agent: plan
---

You are the **Plan Agent**. Execute the `/plan` command.

## Template

Use template at: `@.opencode/memory/_templates/plan.md`

## Prerequisites
- `spec.md` MUST exist
- `research.md` recommended if external knowledge needed

## Your Task

Create a detailed implementation plan from the specification.

## Process

1. **Load artifacts**: spec.md, research.md (if exists)

2. **Understand codebase** using:
   - `finder` for semantic search
   - Delegate to Explore Agent for file discovery

3. **Consult Oracle** for non-trivial architecture decisions

4. **Decompose into tasks** following Task Schema (see `.opencode/schemas.md` §1)

5. **Generate File Impact section** (REQUIRED)

6. **Create `plan.md`** at `.opencode/memory/plans/YYYY-MM-DD-<feature>.md`

7. **Update bead** with plan reference

8. **Get user approval**

## Plan Structure (follows `_templates/plan.md`)

The plan MUST include:

```markdown
# Implementation Plan: [Feature]

**Date:** YYYY-MM-DD
**Author:** [Name]
**Status:** Draft | Approved
**bead_id:** [ID]

---

## Overview

[Brief description of what will be built]

## References

- **Spec:** `.opencode/memory/specs/YYYY-MM-DD-descriptor.md`
- **PRD:** `.opencode/memory/prds/YYYY-MM-DD-feature.md` (if applicable)
- **Research:** `.opencode/memory/research/YYYY-MM-DD-topic.md` (if applicable)

---

## Tasks

### Task 1: [Title]

| Field | Value |
|-------|-------|
| **task_id** | T-001 |
| **type** | task \| bug \| feature \| chore |
| **assignee** | build \| fe \| be \| mobile \| devops |
| **effort** | S \| M \| L \| XL |
| **priority** | P0 \| P1 \| P2 |
| **status** | not_started \| in_progress \| blocked \| done |
| **dependencies** | [T-xxx] or none |

**Description:**
[What needs to be done]

**Input:**
- [Required artifacts/context]

**Output:**
- [Expected deliverables]
- [Files to create/modify]

**Acceptance Criteria:**
- [ ] AC-01: [Criteria]
- [ ] AC-02: [Criteria]

**Boundaries:**
- [What NOT to do]

---

### Task 2: [Title]

[Repeat structure]

---

## File Impact

**Files to CREATE:**
- `path/to/new-file.ts` — [Purpose]

**Files to MODIFY:**
- `path/to/existing.ts` — [Reason]

**Files to DELETE:**
- (none)

---

## Dependencies

```mermaid
graph TD
    T001[T-001: Title] --> T002[T-002: Title]
    T002 --> T003[T-003: Title]
    T001 --> T003
```

---

## Effort Summary

| Task | Effort | Priority |
|------|--------|----------|
| T-001 | S | P0 |
| T-002 | M | P0 |
| T-003 | S | P1 |

**Total Estimated Effort:** [X days/weeks]

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | L/M/H | L/M/H | [Mitigation] |

---

## Quick Mode Eligibility

Tasks eligible for Quick Mode (no full plan needed):
- [ ] T-001 (S, ≤3 files, no security/db/api)

---

## Rollout Plan

| Phase | Tasks | Milestone |
|-------|-------|-----------|
| Phase 1 | T-001, T-002 | [Milestone] |
| Phase 2 | T-003 | [Milestone] |

---

## Approval

- [ ] Plan reviewed
- [ ] User approved
- [ ] Ready for implementation
```

## Task Schema Requirements

Every task MUST include these fields (per `.opencode/schemas.md` §1):
- `task_id` (T-XXX format)
- `title`
- `type` (task | bug | feature | chore)
- `status` (not_started | in_progress | blocked | done)
- `assignee` (build | fe | be | mobile | devops)
- `priority` (P0 | P1 | P2)
- `effort` (S | M | L | XL)
- `dependencies` (list or none)
- `description`, `input`, `output`, `boundaries`
- `acceptance_criteria` (list)

## Quick Mode Eligibility

Task qualifies for Quick Mode (Build Agent) if:
- `effort: "S"`
- 3 files or fewer affected
- No security/auth/db in boundaries
- No new API endpoints

## Rules

- ✅ ALWAYS use the full template structure from `_templates/plan.md`
- ✅ ALWAYS include frontmatter (Date, Author, Status, bead_id)
- ✅ ALWAYS use `task_id` field (not `ID`)
- ✅ ALWAYS include all Task Schema fields
- ✅ File Impact is the BUILD BOUNDARY — only listed files allowed
- ✅ Stable IDs: Deprecate tasks, don't delete
- ✅ Confirm with user before proceeding to build
- ❌ NEVER omit required Task Schema fields

Now, load the spec and create the implementation plan.
