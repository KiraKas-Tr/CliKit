import type { Plugin } from "@opencode-ai/plugin";
import { getBuiltinAgents } from "./agents";
import { getBuiltinCommands } from "./commands";
import { getBuiltinSkills, findSkill } from "./skills";
import {
  loadCliKitConfig,
  filterAgents,
  filterCommands,
  type CliKitConfig,
  type LspServerConfig,
  type HooksConfig,
} from "./config";
import {
  // Todo Enforcer
  checkTodoCompletion,
  formatIncompleteWarning,
  // Empty Message Sanitizer
  isEmptyContent,
  sanitizeContent,
  // Git Guard
  checkDangerousCommand,
  formatBlockedWarning,
  // Security Check
  scanContentForSecrets,
  isSensitiveFile,
  formatSecurityWarning,
  // Subagent Question Blocker
  containsQuestion,
  isSubagentTool,
  formatBlockerWarning,
  // Comment Checker
  checkCommentDensity,
  hasExcessiveAIComments,
  formatCommentWarning,
  // Environment Context
  collectEnvInfo,
  buildEnvBlock,
  formatEnvSummary,
  // Auto-Format
  shouldFormat,
  runFormatter,
  formatAutoFormatLog,
  // TypeCheck Gate
  isTypeScriptFile,
  runTypeCheck,
  formatTypeCheckWarning,
  // Session Notification
  sendNotification,
  buildIdleNotification,
  buildErrorNotification,
  formatNotificationLog,
  // Truncator
  shouldTruncate,
  truncateOutput,
  formatTruncationLog,
  // Compaction
  collectCompactionPayload,
  buildCompactionBlock,
  formatCompactionLog,
} from "./hooks";

const CliKitPlugin: Plugin = async (ctx) => {
  const pluginConfig = loadCliKitConfig(ctx.directory);

  const builtinAgents = getBuiltinAgents();
  const builtinCommands = getBuiltinCommands();

  const filteredAgents = filterAgents(builtinAgents, pluginConfig);
  const filteredCommands = filterCommands(builtinCommands, pluginConfig);

  console.log(
    `[CliKit] Loaded ${Object.keys(filteredAgents).length}/${Object.keys(builtinAgents).length} agents`
  );
  console.log(
    `[CliKit] Loaded ${Object.keys(filteredCommands).length}/${Object.keys(builtinCommands).length} commands`
  );

  if (pluginConfig.disabled_agents?.length) {
    console.log(`[CliKit] Disabled agents: ${pluginConfig.disabled_agents.join(", ")}`);
  }
  if (pluginConfig.disabled_commands?.length) {
    console.log(`[CliKit] Disabled commands: ${pluginConfig.disabled_commands.join(", ")}`);
  }

  return {
    config: async (config) => {
      config.agent = {
        ...filteredAgents,
        ...config.agent,
      };

      config.command = {
        ...filteredCommands,
        ...config.command,
      };

      if (pluginConfig.lsp && Object.keys(pluginConfig.lsp).length > 0) {
        const enabledLsp: Record<string, LspServerConfig> = {};
        for (const [name, lspConfig] of Object.entries(pluginConfig.lsp)) {
          if (!lspConfig.disabled) {
            enabledLsp[name] = lspConfig;
          }
        }

        if (Object.keys(enabledLsp).length > 0) {
          config.lsp = {
            ...enabledLsp,
            ...(config.lsp || {}),
          };
          console.log(`[CliKit] Injected ${Object.keys(enabledLsp).length} LSP server(s)`);
        }
      }
    },

    event: async (input) => {
      const { event } = input;
      const props = event.properties as Record<string, unknown> | undefined;

      // --- Session Created ---
      if (event.type === "session.created") {
        if (pluginConfig.hooks?.session_logging) {
          const info = props?.info as { id?: string; title?: string } | undefined;
          console.log(`[CliKit] Session created: ${info?.id || "unknown"}`);
        }

        // Environment Context: inject env info
        if (pluginConfig.hooks?.env_context?.enabled !== false) {
          const envConfig = pluginConfig.hooks?.env_context;
          const envInfo = collectEnvInfo(ctx.directory, envConfig);
          const envBlock = buildEnvBlock(envInfo);
          console.log(formatEnvSummary(envInfo));
          (input as Record<string, unknown>).__envBlock = envBlock;
        }
      }

      // --- Session Error ---
      if (event.type === "session.error") {
        const error = props?.error;

        if (pluginConfig.hooks?.session_logging) {
          console.error(`[CliKit] Session error:`, error);
        }

        // Session Notification: notify on error
        if (pluginConfig.hooks?.session_notification?.enabled !== false &&
            pluginConfig.hooks?.session_notification?.on_error !== false) {
          const notifConfig = pluginConfig.hooks?.session_notification;
          const sessionId = props?.sessionID as string | undefined;
          const errorMsg = typeof error === "string" ? error : "An error occurred";
          const payload = buildErrorNotification(errorMsg, sessionId, notifConfig?.title_prefix);
          const sent = sendNotification(payload);
          console.log(formatNotificationLog(payload, sent));
        }
      }

      // --- Session Idle ---
      if (event.type === "session.idle") {
        const sessionID = props?.sessionID as string | undefined;

        if (pluginConfig.hooks?.session_logging) {
          console.log(`[CliKit] Session idle: ${sessionID || "unknown"}`);
        }

        // Todo Enforcer: check on session idle
        const todoConfig = pluginConfig.hooks?.todo_enforcer;
        if (todoConfig?.enabled !== false) {
          const todos = props?.todos as Array<{
            id: string;
            content: string;
            status: "todo" | "in-progress" | "completed";
          }> | undefined;

          if (todos && todos.length > 0) {
            const result = checkTodoCompletion(todos);

            if (!result.complete && todoConfig?.warn_on_incomplete !== false) {
              console.warn(formatIncompleteWarning(result, sessionID));
            }
          }
        }

        // Session Notification: notify on idle
        if (pluginConfig.hooks?.session_notification?.enabled !== false &&
            pluginConfig.hooks?.session_notification?.on_idle !== false) {
          const notifConfig = pluginConfig.hooks?.session_notification;
          const payload = buildIdleNotification(sessionID, notifConfig?.title_prefix);
          const sent = sendNotification(payload);
          console.log(formatNotificationLog(payload, sent));
        }

        // Compaction: inject state when nearing compaction
        if (pluginConfig.hooks?.compaction?.enabled !== false) {
          const compConfig = pluginConfig.hooks?.compaction;
          const compPayload = collectCompactionPayload(ctx.directory, compConfig);

          // Add todo state if available
          if (compConfig?.include_todo_state !== false && props?.todos) {
            compPayload.todos = props.todos as Array<{ id: string; content: string; status: string }>;
          }

          const block = buildCompactionBlock(compPayload, compConfig?.max_state_chars);
          console.log(formatCompactionLog(compPayload));
          (input as Record<string, unknown>).__compactionBlock = block;
        }
      }
    },

    "tool.execute.before": async (input, _output) => {
      const toolName = input.tool;
      const toolInput = (input as unknown as Record<string, unknown>).input as Record<string, unknown> | undefined ?? {};

      if (pluginConfig.hooks?.tool_logging) {
        console.log(`[CliKit] Tool executing: ${toolName}`);
      }

      // Git Guard: block dangerous git commands
      if (pluginConfig.hooks?.git_guard?.enabled !== false) {
        if (toolName === "bash" || toolName === "Bash") {
          const command = toolInput.command as string | undefined;
          if (command) {
            const allowForceWithLease = pluginConfig.hooks?.git_guard?.allow_force_with_lease !== false;
            const result = checkDangerousCommand(command, allowForceWithLease);
            if (result.blocked) {
              console.warn(formatBlockedWarning(result));
              (input as Record<string, unknown>).__blocked = true;
              (input as Record<string, unknown>).__blockReason = result.reason;
            }
          }
        }
      }

      // Security Check: scan for secrets before git commit
      if (pluginConfig.hooks?.security_check?.enabled !== false) {
        if (toolName === "bash" || toolName === "Bash") {
          const command = toolInput.command as string | undefined;
          if (command && /git\s+(commit|add)/.test(command)) {
            const secConfig = pluginConfig.hooks?.security_check;
            let shouldBlock = false;
            
            const files = toolInput.files as string[] | undefined;
            if (files) {
              for (const file of files) {
                if (isSensitiveFile(file)) {
                  console.warn(`[CliKit:security] Sensitive file staged: ${file}`);
                  shouldBlock = true;
                }
              }
            }
            
            const content = toolInput.content as string | undefined;
            if (content) {
              const scanResult = scanContentForSecrets(content);
              if (!scanResult.safe) {
                console.warn(formatSecurityWarning(scanResult));
                shouldBlock = true;
              }
            }
            
            if (shouldBlock && secConfig?.block_commits) {
              (input as Record<string, unknown>).__blocked = true;
              (input as Record<string, unknown>).__blockReason = "Sensitive data detected in commit";
            }
          }
        }
      }

      // Subagent Question Blocker: prevent subagents from asking questions
      if (pluginConfig.hooks?.subagent_question_blocker?.enabled !== false) {
        if (isSubagentTool(toolName)) {
          const prompt = toolInput.prompt as string | undefined;
          if (prompt && containsQuestion(prompt)) {
            console.warn(formatBlockerWarning());
            (input as Record<string, unknown>).__blocked = true;
            (input as Record<string, unknown>).__blockReason = "Subagents should not ask questions";
          }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      const toolName = input.tool;
      const toolInput = (input as unknown as Record<string, unknown>).input as Record<string, unknown> | undefined ?? {};
      const toolOutput = output as unknown as { content?: unknown };

      if (pluginConfig.hooks?.tool_logging) {
        console.log(`[CliKit] Tool completed: ${toolName} -> ${output.title}`);
      }

      // Empty Message Sanitizer
      const sanitizerConfig = pluginConfig.hooks?.empty_message_sanitizer;
      if (sanitizerConfig?.enabled !== false) {
        if (toolOutput.content !== undefined && isEmptyContent(toolOutput.content)) {
          const placeholder = sanitizerConfig?.placeholder || "(No output)";

          if (sanitizerConfig?.log_empty !== false) {
            console.log(`[CliKit] Empty output detected for tool: ${toolName}`);
          }

          toolOutput.content = sanitizeContent(toolOutput.content, placeholder);
        }
      }

      // Comment Checker: detect excessive AI comments in written/edited files
      if (pluginConfig.hooks?.comment_checker?.enabled !== false) {
        if (toolName === "edit" || toolName === "Edit" || toolName === "write" || toolName === "Write") {
          const content = toolOutput.content;
          if (typeof content === "string" && content.length > 100) {
            const threshold = pluginConfig.hooks?.comment_checker?.threshold ?? 0.3;
            const densityResult = checkCommentDensity(content, threshold);
            if (densityResult.excessive) {
              console.warn(formatCommentWarning(densityResult));
            }
            if (hasExcessiveAIComments(content)) {
              console.warn("[CliKit:comment-checker] Detected AI-style boilerplate comments. Remove unnecessary comments.");
            }
          }
        }
      }

      // Truncator: trim large outputs
      if (pluginConfig.hooks?.truncator?.enabled !== false) {
        if (typeof toolOutput.content === "string" && shouldTruncate(toolOutput.content, pluginConfig.hooks?.truncator)) {
          const result = truncateOutput(toolOutput.content, pluginConfig.hooks?.truncator);
          if (result.truncated) {
            toolOutput.content = result.content;
            if (pluginConfig.hooks?.truncator?.log !== false) {
              console.log(formatTruncationLog(result));
            }
          }
        }
      }

      // Auto-Format: run formatter after file edits
      if (pluginConfig.hooks?.auto_format?.enabled) {
        if (toolName === "edit" || toolName === "Edit" || toolName === "write" || toolName === "Write") {
          const filePath = toolInput.filePath as string | undefined;
          if (filePath) {
            const fmtConfig = pluginConfig.hooks.auto_format;
            if (shouldFormat(filePath, fmtConfig?.extensions)) {
              const result = runFormatter(filePath, ctx.directory, fmtConfig?.formatter);
              if (fmtConfig?.log !== false) {
                console.log(formatAutoFormatLog(result));
              }
            }
          }
        }
      }

      // TypeCheck Gate: run tsc after TypeScript edits
      if (pluginConfig.hooks?.typecheck_gate?.enabled) {
        if (toolName === "edit" || toolName === "Edit" || toolName === "write" || toolName === "Write") {
          const filePath = toolInput.filePath as string | undefined;
          if (filePath && isTypeScriptFile(filePath)) {
            const tcConfig = pluginConfig.hooks.typecheck_gate;
            const result = runTypeCheck(filePath, ctx.directory, tcConfig);
            if (!result.clean) {
              console.warn(formatTypeCheckWarning(result));
              if (tcConfig?.block_on_error) {
                (input as Record<string, unknown>).__blocked = true;
                (input as Record<string, unknown>).__blockReason = `Type errors in ${filePath}`;
              }
            } else if (tcConfig?.log !== false) {
              console.log(formatTypeCheckWarning(result));
            }
          }
        }
      }
    },
  };
};

export default CliKitPlugin;

// Re-export utilities for advanced usage
export { getBuiltinAgents } from "./agents";
export { getBuiltinCommands } from "./commands";
export { getBuiltinSkills, findSkill } from "./skills";
export type { SkillConfig } from "./skills";
export { loadCliKitConfig, filterAgents, filterCommands } from "./config";
export type { CliKitConfig, AgentOverride, LspServerConfig, HooksConfig } from "./config";
export type { AgentConfig, CommandConfig } from "./types";

// Re-export hooks
export {
  checkTodoCompletion, formatIncompleteWarning,
  isEmptyContent, sanitizeContent,
  checkDangerousCommand, formatBlockedWarning,
  scanContentForSecrets, isSensitiveFile, formatSecurityWarning,
  containsQuestion, isSubagentTool, formatBlockerWarning,
  checkCommentDensity, hasExcessiveAIComments, formatCommentWarning,
  collectEnvInfo, buildEnvBlock, formatEnvSummary,
  shouldFormat, runFormatter, formatAutoFormatLog,
  isTypeScriptFile, runTypeCheck, formatTypeCheckWarning,
  sendNotification, buildIdleNotification, buildErrorNotification, formatNotificationLog,
  shouldTruncate, truncateOutput, formatTruncationLog,
  collectCompactionPayload, buildCompactionBlock, formatCompactionLog,
} from "./hooks";

// Re-export tools
export {
  // Memory Tools
  memoryRead,
  memorySearch,
  memoryGet,
  memoryTimeline,
  memoryUpdate,
  memoryAdmin,
  type MemorySearchParams,
  type MemorySearchResult,
  type MemoryObservation,
  type MemoryUpdateParams,
  type MemoryTimelineParams,
  type MemoryAdminParams,
  type MemoryAdminResult,
  // Observation Tool
  createObservation,
  getObservationsByType,
  getObservationsByBead,
  linkObservations,
  type ObservationParams,
  type ObservationResult,
  // Swarm Tool
  swarm,
  type SwarmParams,
  type SwarmTask,
  type SwarmResult,
  // Custom Tools (wrappers/optimizations)
  beadsMemorySync,
  type BeadsMemorySyncParams,
  type BeadsMemorySyncResult,
  quickResearch,
  type QuickResearchParams,
  type QuickResearchResult,
  contextSummary,
  type ContextSummaryParams,
  type ContextSummaryResult,
} from "./tools";
