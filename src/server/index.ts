import { createRequire } from "node:module";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import type { ServerConfig } from "../types/index.js";
import { handleFlonCSSDocsRequest } from "./tools/floncss-docs.js";
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
    },
  );

  // 利用可能なToolの一覧を返すハンドラを設定
  server.setRequestHandler(ListToolsRequestSchema, async () => {
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
        },
        {
          name: "get_floncss_docs",
          description: "Get FlonCSS documentation content",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Documentation category (docs, settings, utilities)",
                enum: ["docs", "settings", "utilities"]
              },
              path: {
                type: "string",
                description: "Optional specific path within the category (e.g. 'colors', 'installation')",
              },
            },
            required: ["category"],
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
