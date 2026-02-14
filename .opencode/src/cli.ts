#!/usr/bin/env bun
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const PLUGIN_NAME = "clikit-plugin";
const VERSION = "0.1.4";

function getConfigDir(): string {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "opencode");
  }
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "opencode");
}

function getConfigPath(): string {
  const configDir = getConfigDir();
  const jsonPath = path.join(configDir, "opencode.json");
  const jsoncPath = path.join(configDir, "opencode.jsonc");
  
  if (fs.existsSync(jsonPath)) return jsonPath;
  if (fs.existsSync(jsoncPath)) return jsoncPath;
  return jsonPath;
}

function ensureConfigDir(): void {
  const configDir = getConfigDir();
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

function parseConfig(configPath: string): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }
    const content = fs.readFileSync(configPath, "utf-8");
    // Remove JSONC comments (simple version)
    const cleaned = content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

function writeConfig(configPath: string, config: Record<string, unknown>): void {
  ensureConfigDir();
  const tmpPath = `${configPath}.tmp`;
  const content = JSON.stringify(config, null, 2) + "\n";
  fs.writeFileSync(tmpPath, content);
  fs.renameSync(tmpPath, configPath);
}

async function install(): Promise<number> {
  console.log("\n  CliKit Installer\n  ================\n");

  // Step 1: Add plugin to OpenCode config
  console.log("[1/3] Adding CliKit plugin to OpenCode config...");
  
  try {
    ensureConfigDir();
  } catch (err) {
    console.error(`✗ Failed to create config directory: ${err}`);
    return 1;
  }

  const configPath = getConfigPath();
  
  try {
    const config = parseConfig(configPath) || {};
    const plugins = (config.plugin as string[]) || [];
    
    // Remove existing clikit-plugin entries
    const filteredPlugins = plugins.filter(
      (p) => p !== PLUGIN_NAME && !p.startsWith(`${PLUGIN_NAME}@`)
    );
    
    // Add current version
    filteredPlugins.push(PLUGIN_NAME);
    config.plugin = filteredPlugins;
    
    writeConfig(configPath, config);
    console.log(`✓ Plugin added to ${configPath}`);
  } catch (err) {
    console.error(`✗ Failed to update OpenCode config: ${err}`);
    return 1;
  }

  // Step 2: Create global memory directories
  console.log("\n[2/3] Creating memory directories...");
  
  const memoryDir = path.join(getConfigDir(), "memory");
  const memorySubdirs = ["specs", "plans", "research", "reviews", "handoffs", "beads", "prds"];
  
  for (const subdir of memorySubdirs) {
    const dir = path.join(memoryDir, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  console.log(`✓ Memory directories created in ${memoryDir}`);

  // Step 3: Create default clikit config
  console.log("\n[3/3] Creating CliKit config...");
  
  const clikitConfigPath = path.join(getConfigDir(), "clikit.config.json");
  if (!fs.existsSync(clikitConfigPath)) {
    const defaultConfig = {
      "$schema": `https://unpkg.com/${PLUGIN_NAME}@latest/schema.json`,
      "disabled_agents": [],
      "disabled_commands": [],
      "agents": {},
      "hooks": {}
    };
    writeConfig(clikitConfigPath, defaultConfig);
    console.log(`✓ Config created at ${clikitConfigPath}`);
  } else {
    console.log(`✓ Config already exists at ${clikitConfigPath}`);
  }

  console.log("\n✓ CliKit installed successfully!\n");
  console.log("Available commands:");
  console.log("  /create   - Start new task with specification");
  console.log("  /start    - Begin implementing from plan");
  console.log("  /plan     - Create implementation plan");
  console.log("  /verify   - Run verification suite");
  console.log("  /ship     - Commit, PR, and cleanup");
  console.log("  /review   - Request code review");
  console.log("  /debug    - Debug issues");
  console.log("\nRestart OpenCode to use CliKit.\n");

  return 0;
}

function help(): void {
  console.log(`
CliKit - OpenCode Plugin

Usage:
  bun x clikit-plugin <command>

Commands:
  install     Install CliKit globally for OpenCode
  help        Show this help message
  version     Show version

Examples:
  bun x clikit-plugin install
`);
}

function version(): void {
  console.log(`clikit-plugin v${VERSION}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  let exitCode = 0;

  switch (command) {
    case "install":
    case "i":
      exitCode = await install();
      break;
    case "help":
    case "-h":
    case "--help":
      help();
      break;
    case "version":
    case "-v":
    case "--version":
      version();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      help();
      exitCode = 1;
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
