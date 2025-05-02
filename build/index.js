import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from 'url';
// [1] サーバーインスタンスの初期化
const server = new Server({
    name: "floncss-docs",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        logging: {},
    },
});
// FlonCSSのドキュメントデータを読み込む
// ESモジュール対応のパス解決
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const flonCSSDataPath = path.resolve(__dirname, '../src/docs/floncss-dsflon-net.json');
let flonCSSData = {};
try {
    const jsonContent = fs.readFileSync(flonCSSDataPath, 'utf8');
    flonCSSData = JSON.parse(jsonContent);
    // 接続前はconsole.logを使用
    console.log("FlonCSS documentation loaded successfully");
    console.log(`Loaded from path: ${flonCSSDataPath}`);
}
catch (error) {
    // 接続前はconsole.errorを使用
    console.error(`Failed to load FlonCSS documentation: ${error}`);
    console.error(`Attempted to load from path: ${flonCSSDataPath}`);
    process.exit(1); // 読み込みに失敗した場合はプロセスを終了
}
// [2] 利用可能なToolの一覧を返す
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
        ],
    };
});
// 指定されたカテゴリに一致するドキュメントを取得する関数
function getDocsByCategory(category, specificPath) {
    const results = [];
    for (const key in flonCSSData) {
        // キーが指定されたカテゴリで始まり、特定のパスが指定されている場合はそのパスも含むかをチェック
        if (key.startsWith(`/${category}/`) && (!specificPath || key === `/${category}/${specificPath}`)) {
            const data = flonCSSData[key];
            results.push({
                title: data.title || 'FlonCSS',
                url: data.url || `https://floncss.dsflon.net${key}`,
                content: data.content || '',
            });
        }
    }
    return results;
}
// [3] Toolの利用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "get_floncss_docs") {
        throw new Error("Unknown tool");
    }
    const { category, path } = request.params.arguments;
    // サーバーが接続されている状態でのみ使用可能
    server.sendLoggingMessage({
        level: "info",
        data: `Fetching documentation for category: ${category}, path: ${path || 'all'}`,
    });
    // カテゴリに基づいてドキュメントを取得
    const docs = getDocsByCategory(category, path);
    if (docs.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No documentation found for category: ${category}${path ? `, path: ${path}` : ''}`,
                },
            ],
        };
    }
    // 結果をフォーマット
    const formattedDocs = docs.map(doc => {
        return [
            `# ${doc.title}`,
            `URL: ${doc.url}`,
            "",
            doc.content,
            "---"
        ].join("\n");
    });
    return {
        content: [
            {
                type: "text",
                text: formattedDocs.join("\n\n"),
            },
        ],
    };
});
// サーバーを接続
const transport = new StdioServerTransport();
await server.connect(transport);
// 接続後のみsendLoggingMessageを使用
server.sendLoggingMessage({
    level: "info",
    data: "FlonCSS documentation server started successfully",
});
