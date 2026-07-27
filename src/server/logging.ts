import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { LoggingLevel } from "@modelcontextprotocol/sdk/types.js";

// RFC 5424 準拠の重大度順（低 → 高）
const LEVELS: readonly LoggingLevel[] = [
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
  "alert",
  "emergency",
];

// クライアントが logging/setLevel で指定した最小レベル（サーバーインスタンスごとに保持）
const minLevelByServer = new WeakMap<Server, LoggingLevel>();

export function setLogLevel(server: Server, level: LoggingLevel): void {
  minLevelByServer.set(server, level);
}

/**
 * ロギング通知を安全に送信します。
 * - クライアントが logging/setLevel で指定したレベル未満のメッセージは送信しません
 * - 未接続時などの送信失敗は握りつぶし、呼び出し元の処理に影響させません
 *   （sendLoggingMessage は async のため、try/catch ではなく .catch() で拒否を処理する必要があります）
 */
export function sendLog(
  server: Server | undefined,
  level: LoggingLevel,
  data: unknown,
): void {
  if (!server) return;

  const min = minLevelByServer.get(server);
  if (min && LEVELS.indexOf(level) < LEVELS.indexOf(min)) return;

  try {
    server.sendLoggingMessage({ level, data }).catch(() => {
      // 送信失敗（未接続・切断済みなど）は無視する
    });
  } catch {
    // 同期的な失敗も同様に無視する
  }
}
