import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";
import {
  predefinedPrompts,
  resolvePrompt,
  type PromptType,
} from "../../data/prompts.js";
import { handleFlonCSSDocsRequest } from "./floncss-docs.js";

/**
 * モードに応じてプロンプト本文とFlonCSSドキュメントを結合したテキストを生成します
 * - coding / refactor: docs, utilities, settings の全ドキュメントを同梱
 * - setting: settings カテゴリのドキュメントのみを同梱
 *
 * @param promptType モード（coding, refactor, setting）
 * @param server MCPサーバーインスタンス（ドキュメント取得時のロギング用）
 */
export function buildModeText(promptType: PromptType, server?: Server): string {
  const prompt = predefinedPrompts[promptType];

  if (promptType === "setting") {
    const settingsAll = handleFlonCSSDocsRequest(server, "settings");
    return `Activating FlonCSS ${promptType} mode with settings documentation.\n\n${prompt.content}\n\n## FlonCSS Settings Documentation\n\n${settingsAll.content[0].text}`;
  }

  // coding / refactor は全カテゴリのドキュメントを同梱
  const allDocs = ["docs", "utilities", "settings"]
    .map(category => handleFlonCSSDocsRequest(server, category).content[0].text)
    .join("\n\n");

  return `Activating FlonCSS ${promptType} mode with complete reference documentation.\n\n${prompt.content}\n\n## FlonCSS Complete Reference Documentation\n\n${allDocs}`;
}

/**
 * プロンプト一覧取得リクエストのハンドラー
 * 利用可能なすべてのプロンプトの情報を返します
 */
export function handleListPromptsRequest() {
  const prompts = Object.values(predefinedPrompts).map(prompt => ({
    name: prompt.name,
    title: prompt.title,
    description: prompt.description,
  }));

  return { prompts };
}

/**
 * 特定のプロンプト取得リクエストのハンドラー
 * 指定された名前のプロンプトを、関連ドキュメントを同梱して返します
 *
 * @param promptName リクエストされたプロンプト名（例: "floncss-coding"）
 * @param server MCPサーバーインスタンス（ドキュメント取得時のロギング用）
 */
export function handleGetPromptRequest(promptName: string, server?: Server) {
  const resolved = resolvePrompt(promptName);

  if (!resolved) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Prompt not found: ${promptName}. Available prompts: ${Object.values(predefinedPrompts).map(p => p.name).join(", ")}`
    );
  }

  return {
    description: resolved.prompt.description,
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: buildModeText(resolved.type, server),
        },
      },
    ],
  };
}

/**
 * floncssメンション処理ハンドラー
 * テキスト内のfloncss:タイプ形式のメンションを検出して対応するプロンプトを返します
 * @記号の有無に関わらず floncss:coding, floncss:refactor, floncss:setting を検出します
 *
 * @param text 処理対象のテキスト
 * @param server MCPサーバーインスタンス（ドキュメントツール呼び出し用）
 */
export function handleFloncssMentionRequest(text: string, server?: Server) {
  // floncss:タイプ形式のメンションを検出（@記号の有無に関わらず）
  const mentionRegex = /@?floncss:(coding|refactor|setting)/i;
  const match = text.match(mentionRegex);

  if (!match) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No FlonCSS mode found. Available modes: 'floncss:coding', 'floncss:refactor', 'floncss:setting'",
        },
      ],
      isError: true,
    };
  }

  const promptType = match[1].toLowerCase() as PromptType;

  return {
    content: [
      {
        type: "text" as const,
        text: buildModeText(promptType, server),
      },
    ],
  };
}
