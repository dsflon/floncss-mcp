import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { handleFlonCSSDocsRequest } from "./tools/floncss-docs.js";
import { handleFloncssMentionRequest, handleGetPromptRequest, handleListPromptsRequest } from "./tools/prompts.js";
// サーバー設定
const serverConfig = {
    name: "floncss-docs",
    version: "1.0.0",
};
// サーバーインスタンスの初期化
export function createServer() {
    const server = new Server(serverConfig, {
        capabilities: {
            tools: {},
            prompts: {}, // Promptsケイパビリティを追加
            logging: {},
        },
    });
    try {
        // データが正常にロードされたことを確認
        // console.info("FlonCSS documentation loaded successfully");
    }
    catch (error) {
        // 接続前はconsole.errorを使用
        console.error(`Failed to load FlonCSS documentation: ${error}`);
        process.exit(1); // 読み込みに失敗した場合はプロセスを終了
    }
    // 利用可能なToolの一覧を返すハンドラを設定
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                {
                    name: "handle_floncss_mention",
                    description: "Handle @floncss: mentions in text",
                    inputSchema: {
                        type: "object",
                        properties: {
                            text: {
                                type: "string",
                                description: "Text containing @floncss: mentions",
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
        return handleGetPromptRequest(request.params.id);
    });
    // Toolの利用リクエストを処理するハンドラを設定
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "handle_floncss_mention") {
            const { text } = request.params.arguments;
            return handleFloncssMentionRequest(text, server);
        }
        else if (request.params.name === "get_floncss_docs") {
            const { category, path } = request.params.arguments;
            return handleFlonCSSDocsRequest(server, category, path);
        }
        throw new Error(`Unknown tool: ${request.params.name}`);
    });
    return server;
}
