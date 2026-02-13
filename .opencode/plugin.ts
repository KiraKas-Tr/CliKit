/**
 * CliKit Plugin Entry Point
 *
 * This file is the standard entry point for OpenCode plugin loading.
 * Place this in your project's .opencode/plugin/ directory or use via npm.
 *
 * Usage:
 * 1. Via npm: `bun add -d clikit-plugin` then import in .opencode/index.ts
 * 2. Direct: Copy this file to .opencode/plugin/clikit.ts
 */

import CliKitPlugin from "./src/index";

export default CliKitPlugin;

// Re-export everything for advanced usage
export * from "./src/index";
