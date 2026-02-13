/**
 * Session Notification Hook
 *
 * Sends desktop notifications when sessions complete or go idle.
 * Uses platform-native notification commands (notify-send, osascript, powershell).
 * Runs on session.idle event.
 */

import { execSync } from "child_process";

export interface SessionNotificationConfig {
  enabled?: boolean;
  on_idle?: boolean;
  on_error?: boolean;
  title_prefix?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  urgency?: "low" | "normal" | "critical";
}

function escapeSingleQuotes(str: string): string {
  return str.replace(/'/g, "'\\''");
}

function getNotifyCommand(payload: NotificationPayload): string | null {
  const { title, body, urgency } = payload;
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedBody = body.replace(/"/g, '\\"');

  switch (process.platform) {
    case "linux":
      return `notify-send "${escapedTitle}" "${escapedBody}" --urgency=${urgency || "normal"}`;

    case "darwin":
      return `osascript -e 'display notification "${escapedBody}" with title "${escapedTitle}"'`;

    case "win32":
      return `powershell -command "[void] [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, '${escapeSingleQuotes(title)}', '${escapeSingleQuotes(body)}', [System.Windows.Forms.ToolTipIcon]::Info)"`;

    default:
      return null;
  }
}

export function sendNotification(payload: NotificationPayload): boolean {
  const cmd = getNotifyCommand(payload);
  if (!cmd) return false;

  try {
    execSync(cmd, { timeout: 5000, stdio: ["pipe", "pipe", "pipe"] });
    return true;
  } catch {
    // WSL fallback: try wsl-notify-send or powershell.exe
    if (process.platform === "linux") {
      try {
        const wslTitle = escapeSingleQuotes(payload.title);
        const wslBody = escapeSingleQuotes(payload.body);
        const wslCmd = `powershell.exe -command "[void] [System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, '${wslTitle}', '${wslBody}', [System.Windows.Forms.ToolTipIcon]::Info)"`;
        execSync(wslCmd, { timeout: 5000, stdio: ["pipe", "pipe", "pipe"] });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

export function buildIdleNotification(
  sessionId?: string,
  prefix?: string
): NotificationPayload {
  const titlePrefix = prefix || "OpenCode";
  return {
    title: `${titlePrefix} — Task Complete`,
    body: sessionId
      ? `Session ${sessionId.substring(0, 8)} is idle and waiting for input.`
      : "Session is idle and waiting for input.",
    urgency: "normal",
  };
}

export function buildErrorNotification(
  error: string,
  sessionId?: string,
  prefix?: string
): NotificationPayload {
  const titlePrefix = prefix || "OpenCode";
  return {
    title: `${titlePrefix} — Error`,
    body: sessionId
      ? `Session ${sessionId.substring(0, 8)}: ${error.substring(0, 100)}`
      : error.substring(0, 120),
    urgency: "critical",
  };
}

export function formatNotificationLog(payload: NotificationPayload, sent: boolean): string {
  return sent
    ? `[CliKit:notification] Sent: "${payload.title}"`
    : `[CliKit:notification] Failed to send notification (platform: ${process.platform})`;
}
