#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server/index.js";
import { sendLog } from "./server/logging.js";

/**
 * FlonCSS MCPサーバーのメインエントリーポイント
 * 以下の機能を提供します：
 * - FlonCSSドキュメントへのアクセス
 * - コーディングガイドラインへのアクセス
 * - FlonCSS関連のプロンプト機能
 */

// サーバーの作成
const server = createServer();

// サーバーをStdio経由で接続
const transport = new StdioServerTransport();
await server.connect(transport);

// 接続後のみロギング通知を送信（sendLog は送信失敗を握りつぶす）
sendLog(server, "info", "FlonCSS documentation server with prompts started successfully");
