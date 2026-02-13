---
description: Start a new bead. Gather requirements and create specification.
agent: plan
---

You are the **Plan Agent**. Execute the `/create` command.

## Template

Use template at: `@.opencode/memory/_templates/spec.md`

## Your Task

Create a new specification and bead for the user's goal/idea.

## Process

1. **Interview** the user using 5 core dimensions:
   - **Problem & Context** — Why is this needed? Who is affected?
   - **Outcomes** — What changes if successful?
   - **Scope** — What's in/out of boundaries?
   - **Users** — Primary and secondary users?
   - **Constraints** — Performance, security, timeline?

2. **Paraphrase and confirm**: "Is anything missing or wrong?"

3. **Generate `spec.md`** at `.opencode/memory/specs/YYYY-MM-DD-<descriptor>.md` using the canonical template

4. **Create bead** via `mcp__beads_village__add()` with title, description, and priority

## Spec Structure (follows `_templates/spec.md`)

The spec MUST include:

```markdown
# Specification: [Title]

**Date:** YYYY-MM-DD
**Author:** [Name]
**Status:** Draft | Confirmed
**bead_id:** [ID]

---

## Problem & Context

### Problem Statement
[Why is this needed?]

### Background
[Context and history]

### Who is Affected
[Stakeholders and users impacted]

---

## Outcomes

### Success Criteria
1. [Measurable outcome 1]
2. [Measurable outcome 2]

### Key Results
| Outcome | Metric | Target |
|---------|--------|--------|
| [Outcome] | [How to measure] | [Target value] |

---

## Scope

### In Scope
- [Feature/capability 1]

### Out of Scope
- [Excluded item 1]

### Boundaries
[Clear boundaries of what this spec covers]

---

## Users

### Primary Users
| User Type | Description | Needs |
|-----------|-------------|-------|
| [Type] | [Who they are] | [What they need] |

### Secondary Users
| User Type | Description | Needs |
|-----------|-------------|-------|

---

## Constraints

### Technical Constraints
- [Constraint 1]

### Business Constraints
- [Timeline, budget, etc.]

### Dependencies
| Dependency | Type | Status |
|------------|------|--------|
| [Dependency] | Blocking/Soft | Ready/Pending |

---

## Acceptance Criteria

| ID | Criteria | Verification |
|----|----------|--------------|
| AC-01 | [Criteria] | [How to verify] |
| AC-02 | [Criteria] | [How to verify] |

---

## Assumptions

| ID | Assumption | Status | Notes |
|----|------------|--------|-------|
| A-01 | [Assumption] | Confirmed/Unconfirmed | [Notes] |

---

## Open Questions

- [ ] [Question 1]
- [ ] [Question 2]

---

## References

- [Link to related docs]
```

## Rules

- ✅ ALWAYS use the full template structure from `_templates/spec.md`
- ✅ ALWAYS include frontmatter (Date, Author, Status, bead_id)
- ✅ ALWAYS ask clarifying questions if goal is vague
- ✅ ALWAYS tag assumptions clearly as "Confirmed" vs "Unconfirmed"
- ✅ ALWAYS get user confirmation before finalizing
- ❌ NEVER skip the Acceptance Criteria section

Now, ask the user about their goal/idea to begin the interview process.
