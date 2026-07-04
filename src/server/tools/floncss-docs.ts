import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { floncssDocs } from "../../data/floncss-docs.js";
import type { FlonCSSData } from "../../types/index.js";

// FlonCSSドキュメント関連の型定義
interface DocResult {
  title: string;
  url: string;
  content: string;
}

// 指定されたカテゴリに一致するドキュメントを取得する関数
export function getDocsByCategory(
  flonCSSData: FlonCSSData,
  category: string,
  specificPath?: string
): DocResult[] {
  const results: DocResult[] = [];
  
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
export function handleFlonCSSDocsRequest(
  server: Server | undefined,
  category: string,
  path?: string
) {
  // ロギングは接続済みサーバーがある場合のみ（未接続時の例外でリクエストを落とさない）
  try {
    server?.sendLoggingMessage({
      level: "info",
      data: `Fetching documentation for category: ${category}, path: ${path || 'all'}`,
    });
  } catch {
    // ロギング失敗はドキュメント取得の結果に影響させない
  }

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
