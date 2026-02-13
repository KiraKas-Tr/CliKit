---
description: Review UI implementation for design quality, accessibility, and responsiveness.
agent: vision
subtask: true
---

You are the **Vision Agent**. Execute the `/vision` command.

## Your Task

Review the UI implementation for design quality, accessibility, responsiveness, and visual consistency.

## Process

### 1. Gather Context

- Identify changed/target UI files (components, styles, layouts)
- Load spec.md if it has UI requirements
- Check existing design system, tokens, component patterns
- Read `package.json` for CSS framework/library in use

### 2. Design Quality Review

| Aspect | Check |
|--------|-------|
| **Typography** | Font choices, hierarchy, readability, line-height |
| **Color** | Palette consistency, contrast, semantic usage |
| **Spacing** | Consistent gaps, padding, margins (tokens?) |
| **Layout** | Grid alignment, responsiveness, overflow handling |
| **Motion** | Appropriate animations, `prefers-reduced-motion` |
| **Consistency** | Components match existing patterns |

### 3. Accessibility Audit

| Check | Standard |
|-------|----------|
| Color contrast | WCAG AA (4.5:1 text, 3:1 large text) |
| Focus indicators | Visible, styled, keyboard-navigable |
| ARIA attributes | Labels, roles, states for interactive elements |
| Semantic HTML | Proper elements (button, nav, main, aside) |
| Screen readers | Alt text, aria-label, sr-only text |
| Reduced motion | `prefers-reduced-motion` media query |
| Touch targets | Minimum 44x44px on mobile |

### 4. Responsive Review

Check at minimum these breakpoints:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1440px

Look for:
- Content overflow
- Illegible text sizes
- Touch target sizes
- Layout breakage
- Hidden content accessibility

### 5. Implementation Quality

| Aspect | Check |
|--------|-------|
| CSS architecture | Custom properties, naming conventions, specificity |
| Component patterns | Props, composition, reusability |
| Hard-coded values | Should use tokens/variables |
| `!important` usage | Should be minimal/justified |
| Unused styles | Dead CSS, redundant rules |
| Performance | Layout thrashing, heavy animations, large images |

### 6. Generate Report

Save to `.opencode/memory/reviews/YYYY-MM-DD-ui-review.md`

```markdown
---
type: UI
date: YYYY-MM-DD
reviewer: Vision Agent
artifact: [paths reviewed]
verdict: approved | changes_required | blocked
---

# UI Review: [Feature/Component]

## Summary
[2-3 sentence overview]

## Design Quality
| Aspect | Rating | Notes |
|--------|--------|-------|
| Typography | ✅/⚠️/❌ | [Details] |
| Color | ✅/⚠️/❌ | [Details] |
| Spacing | ✅/⚠️/❌ | [Details] |
| Layout | ✅/⚠️/❌ | [Details] |
| Motion | ✅/⚠️/❌ | [Details] |
| Consistency | ✅/⚠️/❌ | [Details] |

## Accessibility
| Check | Pass | Notes |
|-------|------|-------|
| Contrast | ✅/❌ | [Ratio if failing] |
| Focus | ✅/❌ | [Details] |
| ARIA | ✅/❌ | [Missing attrs] |
| Semantic HTML | ✅/❌ | [Details] |
| Keyboard | ✅/❌ | [Details] |

## Responsive
| Breakpoint | Status | Issues |
|------------|--------|--------|
| Mobile 375px | ✅/❌ | [Issues] |
| Tablet 768px | ✅/❌ | [Issues] |
| Desktop 1024px | ✅/❌ | [Issues] |

## Required Changes
1. [Change with file:line reference]

## Suggestions
- [Optional improvement]

## Verdict
[Why this verdict]
```

## Verdict Rules

| Verdict | Criteria |
|---------|----------|
| `approved` | No critical a11y issues, responsive OK, design consistent |
| `changes_required` | A11y issues OR responsive breakage OR design inconsistency |
| `blocked` | Critical a11y failures, major design system violations |

## Rules

- ✅ ALWAYS check accessibility (non-negotiable)
- ✅ ALWAYS check responsive behavior
- ✅ ALWAYS reference specific file:line locations
- ✅ ALWAYS provide actionable fix suggestions
- ❌ NEVER approve with accessibility failures
- ❌ NEVER block on subjective style preferences alone

Now, gathering UI files to review...
