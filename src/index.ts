import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server/index.js";

/**
 * FlonCSS MCPサーバーのメインエントリーポイント
 * 以下の機能を提供します：
 * - FlonCSSドキュメントへのアクセス
 * - コーディングガイドラインへのアクセス
 */

// サーバーの作成
const server = createServer();

// サーバーをStdio経由で接続
const transport = new StdioServerTransport();
await server.connect(transport);

// 接続後のみsendLoggingMessageを使用
server.sendLoggingMessage({
  level: "info",
  data: "FlonCSS documentation server started successfully",
});
