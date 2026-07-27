import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { floncssDocs } from "../../data/floncss-docs.js";
import type { FlonCSSData } from "../../types/index.js";
import { sendLog } from "../logging.js";

// FlonCSSドキュメント関連の型定義
interface DocResult {
  title: string;
  url: string;
  content: string;
}

// 有効なドキュメントカテゴリ（tools/list の inputSchema.enum と対応）
export const DOC_CATEGORIES = ["docs", "settings", "utilities"] as const;

// カテゴリ内で利用可能なパス一覧をドキュメントデータから導出する
// （データ更新時に一覧が自動で追従するよう、ハードコードしない）
export function listAvailablePaths(category: string): string[] {
  const prefix = `/${category}/`;
  return Object.keys(floncssDocs)
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length));
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
  sendLog(server, "info", `Fetching documentation for category: ${category}, path: ${path || 'all'}`);

  // カテゴリに基づいてドキュメントを取得
  const docs = getDocsByCategory(floncssDocs, category, path);

  if (docs.length === 0) {
    // 呼び出し元（LLM）が正しい引数で再試行できるよう、有効な候補を返す
    const isKnownCategory = (DOC_CATEGORIES as readonly string[]).includes(category);
    const hint = isKnownCategory
      ? `Available paths in '${category}': ${listAvailablePaths(category).join(", ")}`
      : `Available categories: ${DOC_CATEGORIES.join(", ")}`;
    return {
      content: [
        {
          type: "text",
          text: `No documentation found for category: ${category}${path ? `, path: ${path}` : ''}. ${hint}`,
        },
      ],
      isError: true,
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
