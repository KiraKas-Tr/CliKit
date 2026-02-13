#!/usr/bin/env bun
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const PLUGIN_NAME = "clikit-plugin";
const VERSION = "0.1.0";

function getUserConfigDir(): string {
  if (process.platform === "win32") {
    return process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  }
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
}

function getCwd(): string {
  return process.cwd();
}

async function install() {
  const cwd = getCwd();
  const opencodeDir = path.join(cwd, ".opencode");
  
  console.log("🚀 Installing CliKit...\n");
  
  // Create .opencode directory if not exists
  if (!fs.existsSync(opencodeDir)) {
    fs.mkdirSync(opencodeDir, { recursive: true });
    console.log("✅ Created .opencode directory");
  }
  
  // Create index.ts
  const indexPath = path.join(opencodeDir, "index.ts");
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, `import CliKitPlugin from "clikit-plugin";\nexport default CliKitPlugin;\n`);
    console.log("✅ Created .opencode/index.ts");
  } else {
    console.log("ℹ️  .opencode/index.ts already exists");
  }
  
  // Create clikit.config.json
  const configPath = path.join(opencodeDir, "clikit.config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({
      "$schema": "https://unpkg.com/clikit-plugin/schema.json",
      "disabled_agents": [],
      "disabled_commands": [],
      "agents": {},
      "hooks": {}
    }, null, 2));
    console.log("✅ Created .opencode/clikit.config.json");
  } else {
    console.log("ℹ️  .opencode/clikit.config.json already exists");
  }
  
  // Create memory directories
  const memoryDir = path.join(opencodeDir, "memory");
  const memorySubdirs = ["specs", "plans", "research", "reviews", "handoffs", "beads", "prds"];
  
  for (const subdir of memorySubdirs) {
    const dir = path.join(memoryDir, subdir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created .opencode/memory/${subdir}/`);
    }
  }
  
  console.log("\n✅ CliKit installed successfully!");
  console.log("\nNext steps:");
  console.log("  1. Run: bun add -d clikit-plugin");
  console.log("  2. Restart OpenCode");
  console.log("\nAvailable commands: /create, /start, /plan, /ship, /verify, /review, /debug, /pr");
}

function help() {
  console.log(`
CliKit - OpenCode Plugin

Usage:
  clikit <command>

Commands:
  install     Install CliKit in current project
  help        Show this help message
  version     Show version

Examples:
  bunx clikit install
`);
}

function version() {
  console.log(`clikit-plugin v${VERSION}`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  
  switch (command) {
    case "install":
    case "i":
      await install();
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
      process.exit(1);
  }
}

main().catch(console.error);
