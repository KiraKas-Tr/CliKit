# CliKit

OpenCode plugin providing curated agents, commands, skills, hooks, and memory for AI-assisted development.

## Quick Start

```bash
# Install plugin
bun add -d clikit-plugin

# Create .opencode/index.ts
echo 'import CliKitPlugin from "clikit-plugin";
export default CliKitPlugin;' > .opencode/index.ts
```

## What's Included

- **10 Agents**: build, general, oracle, librarian, explore, looker, plan, review, scout, vision
- **19 Commands**: /create, /start, /plan, /ship, /verify, /review, /debug, /pr, and more
- **47 Skills**: TDD, debugging, design, UI/UX, integrations, collaboration, and more
- **13 Runtime Hooks**: git guard, security check, auto-format, typecheck gate, truncator, session notification, and more
- **Memory System**: specs, plans, research, reviews, handoffs

## Project Structure

```
.opencode/           # Plugin source
  src/               # TypeScript source
    agents/          # Agent definitions
    skills/          # Skill definitions
    commands/        # Command definitions
    hooks/           # Runtime hooks
  skill/             # Workflow skills (47)
  memory/            # Memory artifacts
    specs/           # Specifications
    plans/           # Implementation plans
    research/        # Research notes
    reviews/         # Code reviews
    handoffs/        # Session handoff state
    beads/           # Beads task artifacts
    _templates/      # Document templates
  command/           # Slash command prompts
.beads/              # Beads task management (SQLite)
```

## Configuration

See `.opencode/clikit.config.json` for project-level config.
See `.opencode/README.md` for full documentation.
