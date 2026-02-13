---
description: Initialize CliKit plugin in the current project.
agent: build
---

You are the **Build Agent**. Execute the `/init` command.

## Your Task

Set up the CliKit plugin in the current project.

## Process

### 1. Check Prerequisites

```bash
# Check if .opencode/ already exists
ls -la .opencode/ 2>/dev/null

# Check if package.json exists
ls package.json 2>/dev/null

# Check package manager
ls bun.lockb pnpm-lock.yaml yarn.lock 2>/dev/null
```

If `.opencode/` already exists with CliKit files, warn user and ask before overwriting.

### 2. Install Plugin

```bash
# Detect package manager and install
bun add -d clikit-plugin 2>/dev/null || \
pnpm add -D clikit-plugin 2>/dev/null || \
npm install -D clikit-plugin 2>/dev/null
```

### 3. Create Plugin Entry Point

Create `.opencode/index.ts`:

```typescript
import CliKitPlugin from "clikit-plugin";
export default CliKitPlugin;
```

### 4. Create Default Configuration

Create `.opencode/clikit.config.json`:

```json
{
  "$schema": "https://unpkg.com/clikit-plugin/schema.json",
  "disabled_agents": [],
  "disabled_commands": [],
  "hooks": {
    "session_logging": true,
    "todo_enforcer": {
      "enabled": true,
      "warn_on_incomplete": true
    },
    "empty_message_sanitizer": {
      "enabled": true
    }
  }
}
```

### 5. Create Memory Directory Structure

```bash
mkdir -p .opencode/memory/{specs,plans,research,reviews,handoffs,prds,beads}
```

### 6. Verify Setup

- Check that plugin loads correctly
- Verify agents are available
- Verify commands are registered

### 7. Report

```
## CliKit Initialized

✅ Plugin installed: clikit-plugin
✅ Entry point: .opencode/index.ts
✅ Config: .opencode/clikit.config.json
✅ Memory directories created

### Available Agents
[list agents]

### Available Commands
[list commands]

### Next Steps
1. Run `/create` to start a new feature
2. Customize `.opencode/clikit.config.json` as needed
3. See README for full configuration options
```

## Rules

- ✅ ALWAYS check for existing setup before overwriting
- ✅ ALWAYS detect the correct package manager
- ✅ ALWAYS create memory directory structure
- ✅ ALWAYS verify the setup works
- ❌ NEVER overwrite existing config without asking
- ❌ NEVER skip verification step

Now, initializing CliKit...
