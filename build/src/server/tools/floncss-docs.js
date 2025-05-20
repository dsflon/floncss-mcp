import { floncssDocs } from "../../data/floncss-docs.js";
// 指定されたカテゴリに一致するドキュメントを取得する関数
export function getDocsByCategory(flonCSSData, category, specificPath) {
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
// FlonCSS ドキュメントツールの実装
export function handleFlonCSSDocsRequest(server, category, path) {
    // サーバーが接続されている状態でのみ使用可能
    server.sendLoggingMessage({
        level: "info",
        data: `Fetching documentation for category: ${category}, path: ${path || 'all'}`,
    });
    // カテゴリに基づいてドキュメントを取得
    const docs = getDocsByCategory(floncssDocs, category, path);
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
}
