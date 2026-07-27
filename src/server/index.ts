import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  McpError,
  SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import type { ServerConfig } from "../types/index.js";
import { setLogLevel } from "./logging.js";
import {
  DOC_CATEGORIES,
  handleFlonCSSDocsRequest,
  listAvailablePaths,
} from "./tools/floncss-docs.js";
import {
  handleFloncssMentionRequest,
  handleGetPromptRequest,
  handleListPromptsRequest
} from "./tools/prompts.js";

// package.json からバージョンを取得（ビルド後は build/server/ から見て2階層上）
const require = createRequire(import.meta.url);
const { version } = require("../../package.json") as { version: string };

// サーバー設定
const serverConfig: ServerConfig = {
  name: "floncss-docs",
  version,
};

// クライアント（LLM）向けのサーバー利用ガイド。initialize 応答で通知される
const SERVER_INSTRUCTIONS = [
  "This server provides documentation and coding modes for FlonCSS, a hybrid CSS framework that combines minimal utility-first CSS with ITCSS-based architecture (https://floncss.dsflon.net/).",
  "- Use the `get_floncss_docs` tool to fetch reference documentation by category ('docs' | 'settings' | 'utilities') and an optional page path.",
  "- Use the `handle_floncss_mention` tool with 'floncss:coding', 'floncss:refactor', or 'floncss:setting' (or the floncss-coding / floncss-refactor / floncss-setting prompts) to activate a mode whose response embeds the relevant documentation.",
  "The bundled documentation reflects FlonCSS v3.",
].join("\n");

// サーバーインスタンスの初期化
export function createServer(): Server {
  const server = new Server(
    serverConfig,
    {
      capabilities: {
        tools: {},
        prompts: {},
        logging: {},
      },
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  // logging capability を宣言している以上、logging/setLevel に応答する必要がある
  server.setRequestHandler(SetLevelRequestSchema, async (request) => {
    setLogLevel(server, request.params.level);
    return {};
  });

  // 利用可能なToolの一覧を返すハンドラを設定
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // 利用可能なパス一覧をデータから動的に生成（ドキュメント追加時に自動追従）
    const pathHints = DOC_CATEGORIES
      .map((category) => `${category}: ${listAvailablePaths(category).join(", ")}`)
      .join(" / ");

    return {
      tools: [
        {
          name: "handle_floncss_mention",
          description: "Activate FlonCSS coding modes with comprehensive documentation. Use 'floncss:coding' for general coding assistance, 'floncss:refactor' for code refactoring, or 'floncss:setting' for configuring CSS variables. This tool automatically loads relevant FlonCSS documentation and provides mode-specific guidance.",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The FlonCSS mode to activate. Use one of: 'floncss:coding' (for general FlonCSS coding assistance with full documentation), 'floncss:refactor' (for refactoring existing code to follow FlonCSS best practices), or 'floncss:setting' (for configuring FlonCSS settings and CSS variables based on design specifications).",
              },
            },
            required: ["text"],
          },
          annotations: {
            title: "Activate FlonCSS Mode",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
          },
        },
        {
          name: "get_floncss_docs",
          description: "Get FlonCSS documentation content by category, optionally narrowed to a specific page.",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Documentation category (docs, settings, utilities)",
                enum: [...DOC_CATEGORIES],
              },
              path: {
                type: "string",
                description: `Optional page path within the category. Available pages — ${pathHints}`,
              },
            },
            required: ["category"],
          },
          annotations: {
            title: "Get FlonCSS Documentation",
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: false,
          },
        },
      ],
    };
  });

  // プロンプト一覧を返すハンドラー
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return handleListPromptsRequest();
  });

  // 特定のプロンプトを返すハンドラー
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return handleGetPromptRequest(request.params.name, server);
  });

  // Toolの利用リクエストを処理するハンドラを設定
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments ?? {};

    if (request.params.name === "handle_floncss_mention") {
      const text = args.text;
      if (typeof text !== "string") {
        throw new McpError(ErrorCode.InvalidParams, "Missing required argument: text");
      }
      return handleFloncssMentionRequest(text, server);
    }

    if (request.params.name === "get_floncss_docs") {
      const { category, path } = args as { category?: unknown; path?: unknown };
      if (typeof category !== "string") {
        throw new McpError(ErrorCode.InvalidParams, "Missing required argument: category");
      }
      return handleFlonCSSDocsRequest(server, category, typeof path === "string" ? path : undefined);
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  });

  return server;
}
