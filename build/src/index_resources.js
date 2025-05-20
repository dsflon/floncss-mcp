// VSCode では現在 Resources は提供されていない
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { floncssDocs } from "./data/floncss-docs.js";
// サーバーインスタンスの初期化
const server = new Server({
    name: "floncss-docs",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {},
        logging: {},
    },
});
// TypeScriptモジュールからFlonCSSデータを取得
let flonCSSData = floncssDocs;
try {
    // console.log("FlonCSS documentation loaded successfully");
}
catch (error) {
    console.error(`Failed to load FlonCSS documentation: ${error}`);
    process.exit(1);
}
// リソースのカテゴリを準備
const resourceCategories = {
    "docs": "FlonCSS general documentation",
    "settings": "FlonCSS settings and configuration",
    "utilities": "FlonCSS utility classes",
};
// リソース一覧を返すハンドラ
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = [];
    // メインカテゴリをリソースとして登録
    for (const category in resourceCategories) {
        resources.push({
            id: category,
            name: category,
            description: resourceCategories[category],
        });
    }
    // 個別のドキュメントページもリソースとして登録
    for (const key in flonCSSData) {
        const pathParts = key.split('/').filter(part => part);
        if (pathParts.length >= 2) {
            const category = pathParts[0];
            const subPath = pathParts.slice(1).join('/');
            const data = flonCSSData[key];
            resources.push({
                id: `${category}/${subPath}`,
                name: data.title || subPath,
                description: `FlonCSS ${category} documentation for ${subPath}`,
                parentId: category,
            });
        }
    }
    return { resources };
});
// 個別のリソース内容を返すハンドラ
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resourceId = request.params.id;
    // メインカテゴリのリソースなら、そのカテゴリの概要を返す
    if (Object.prototype.hasOwnProperty.call(resourceCategories, resourceId)) {
        const categoryDocs = [];
        for (const key in flonCSSData) {
            if (key.startsWith(`/${resourceId}/`)) {
                const data = flonCSSData[key];
                categoryDocs.push({
                    title: data.title || key.split('/').pop(),
                    url: data.url || `https://floncss.dsflon.net${key}`,
                    summary: data.content?.substring(0, 150) + '...' || '',
                });
            }
        }
        return {
            content: [
                {
                    type: "text",
                    text: `# ${resourceId.toUpperCase()} Documentation\n\n` +
                        `${resourceCategories[resourceId]}\n\n` +
                        `Available documentation pages:\n\n` +
                        categoryDocs.map(doc => `- **${doc.title}**: ${doc.summary}`).join('\n\n'),
                },
            ],
        };
    }
    // 個別のドキュメントページを返す
    const pathParts = resourceId.split('/');
    const category = pathParts[0];
    const subPath = pathParts.slice(1).join('/');
    const key = `/${category}/${subPath}`;
    if (Object.prototype.hasOwnProperty.call(flonCSSData, key)) {
        const data = flonCSSData[key];
        return {
            content: [
                {
                    type: "text",
                    text: `# ${data.title || subPath}\n\n` +
                        `URL: ${data.url || `https://floncss.dsflon.net${key}`}\n\n` +
                        `${data.content || 'No content available.'}`,
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: `Resource not found: ${resourceId}`,
            },
        ],
    };
});
// サーバーを接続
const transport = new StdioServerTransport();
await server.connect(transport);
server.sendLoggingMessage({
    level: "info",
    data: "FlonCSS documentation server started successfully",
});
