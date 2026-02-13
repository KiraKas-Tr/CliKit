/**
 * Todo Continuation Enforcer Hook
 *
 * Ensures agents complete all todos before finishing a session.
 * Checks on session idle and warns when todos are incomplete.
 */

export interface TodoItem {
  id: string;
  content: string;
  status: "todo" | "in-progress" | "completed";
}

export interface TodoCheckResult {
  complete: boolean;
  incomplete: TodoItem[];
  inProgress: TodoItem[];
}

export function checkTodoCompletion(todos: TodoItem[]): TodoCheckResult {
  const incomplete = todos.filter((t) => t.status === "todo");
  const inProgress = todos.filter((t) => t.status === "in-progress");

  return {
    complete: incomplete.length === 0 && inProgress.length === 0,
    incomplete,
    inProgress,
  };
}

export function formatIncompleteWarning(
  result: TodoCheckResult,
  sessionId?: string
): string {
  const lines: string[] = [];
  
  if (sessionId) {
    lines.push(`[CliKit] Incomplete todos in session ${sessionId}:`);
  } else {
    lines.push("[CliKit] Incomplete todos detected:");
  }

  if (result.inProgress.length > 0) {
    lines.push("  In Progress:");
    result.inProgress.forEach((t) => lines.push(`    - [${t.id}] ${t.content}`));
  }

  if (result.incomplete.length > 0) {
    lines.push("  Not Started:");
    result.incomplete.forEach((t) => lines.push(`    - [${t.id}] ${t.content}`));
  }

  lines.push("");
  lines.push("  Complete all todos before finishing.");

  return lines.join("\n");
}
