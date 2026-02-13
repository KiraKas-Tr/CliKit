/**
 * TypeCheck Gate Hook
 *
 * Runs TypeScript type checking after .ts/.tsx file edits.
 * Reports type errors inline so agents can fix them immediately.
 * Runs on tool.execute.after for edit/write tools.
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

export interface TypeCheckConfig {
  enabled?: boolean;
  tsconfig?: string;
  log?: boolean;
  block_on_error?: boolean;
}

export interface TypeDiagnostic {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

export interface TypeCheckResult {
  clean: boolean;
  errors: TypeDiagnostic[];
  checkedFile: string;
}

const TS_EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];

export function isTypeScriptFile(filePath: string): boolean {
  return TS_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

export function findTsConfig(projectDir: string, override?: string): string | undefined {
  if (override) {
    const overridePath = path.resolve(projectDir, override);
    return fs.existsSync(overridePath) ? overridePath : undefined;
  }

  const candidates = ["tsconfig.json", "tsconfig.build.json"];
  for (const candidate of candidates) {
    const fullPath = path.join(projectDir, candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return undefined;
}

export function hasTscInstalled(projectDir: string): boolean {
  try {
    execSync("npx tsc --version", {
      cwd: projectDir,
      timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

export function runTypeCheck(
  filePath: string,
  projectDir: string,
  config?: TypeCheckConfig
): TypeCheckResult {
  const tsConfig = findTsConfig(projectDir, config?.tsconfig);

  if (!tsConfig) {
    return { clean: true, errors: [], checkedFile: filePath };
  }

  try {
    const tscCmd = `npx tsc --noEmit --pretty false -p "${tsConfig}"`;

    execSync(tscCmd, {
      cwd: projectDir,
      timeout: 30_000,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
    });

    return { clean: true, errors: [], checkedFile: filePath };
  } catch (err) {
    const output = err instanceof Error && "stdout" in err
      ? String((err as { stdout: unknown }).stdout)
      : "";

    const errors = parseTscOutput(output, filePath);

    return {
      clean: errors.length === 0,
      errors,
      checkedFile: filePath,
    };
  }
}

function parseTscOutput(output: string, filterFile?: string): TypeDiagnostic[] {
  const diagnostics: TypeDiagnostic[] = [];
  const lines = output.split("\n");

  // tsc output format: file(line,col): error TSxxxx: message
  const pattern = /^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/;

  for (const line of lines) {
    const match = line.match(pattern);
    if (match) {
      const [, file, lineNum, col, code, message] = match;
      const diagnostic: TypeDiagnostic = {
        file: file.trim(),
        line: parseInt(lineNum, 10),
        column: parseInt(col, 10),
        code,
        message: message.trim(),
      };

      // If filtering, only include errors in the edited file
      if (filterFile) {
        const normalizedFilter = path.resolve(filterFile);
        const normalizedDiag = path.resolve(diagnostic.file);
        if (normalizedDiag === normalizedFilter) {
          diagnostics.push(diagnostic);
        }
      } else {
        diagnostics.push(diagnostic);
      }
    }
  }

  return diagnostics;
}

export function formatTypeCheckWarning(result: TypeCheckResult): string {
  if (result.clean) {
    return `[CliKit:typecheck] ${result.checkedFile} — no type errors`;
  }

  const lines = [`[CliKit:typecheck] ${result.errors.length} type error(s) in ${result.checkedFile}:`];
  for (const err of result.errors.slice(0, 10)) {
    lines.push(`  ${err.file}:${err.line}:${err.column} ${err.code}: ${err.message}`);
  }

  if (result.errors.length > 10) {
    lines.push(`  ... and ${result.errors.length - 10} more`);
  }

  return lines.join("\n");
}
