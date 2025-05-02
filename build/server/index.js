import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { handleCodingGuidelinesRequest } from "./tools/coding-guidelines.js";
import { handleFlonCSSDocsRequest } from "./tools/floncss-docs.js";
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
            logging: {},
        },
    });
    try {
        // データが正常にロードされたことを確認
        console.log("FlonCSS documentation loaded successfully");
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
                {
                    name: "get_coding_guidelines",
                    description: "Get coding guidelines for FlonCSS implementation",
                    inputSchema: {
                        type: "object",
                        properties: {
                            category: {
                                type: "string",
                                description: "Optional guideline category (html, css, assets)",
                                enum: ["html", "css", "assets", "js", "general", "all"],
                            },
                        },
                        required: [],
                    },
                },
            ],
        };
    });
    // Toolの利用リクエストを処理するハンドラを設定
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        if (request.params.name === "get_floncss_docs") {
            const { category, path } = request.params.arguments;
            return handleFlonCSSDocsRequest(server, category, path);
        }
        else if (request.params.name === "get_coding_guidelines") {
            const { category } = request.params.arguments;
            return handleCodingGuidelinesRequest(server, category);
        }
        throw new Error(`Unknown tool: ${request.params.name}`);
    });
    return server;
}
