import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { predefinedPrompts } from "../../data/prompts.js";
import { handleFlonCSSDocsRequest } from "./floncss-docs.js";

/**
 * プロンプト一覧取得リクエストのハンドラー
 * 利用可能なすべてのプロンプトの情報を返します
 */
export function handleListPromptsRequest() {
  const prompts = Object.values(predefinedPrompts).map(prompt => ({
    id: prompt.id,
    name: prompt.name,
    description: prompt.description,
  }));
  
  return { prompts };
}

/**
 * 特定のプロンプト取得リクエストのハンドラー
 * 指定されたIDのプロンプトの詳細情報を返します
 * 
 * @param promptId リクエストされたプロンプトID
 */
export function handleGetPromptRequest(promptId: string) {
  const prompt = Object.values(predefinedPrompts).find(p => p.id === promptId);
  
  if (!prompt) {
    return {
      content: [
        {
          type: "text",
          text: `Prompt not found: ${promptId}`,
        },
      ],
    };
  }
  
  return {
    content: [
      {
        type: "text",
        text: prompt.content,
      },
    ],
  };
}

/**
 * @floncsメンション処理ハンドラー
 * テキスト内の@floncss:タイプ形式のメンションを検出して対応するプロンプトを返します
 * 
 * @param text 処理対象のテキスト
 * @param server MCPサーバーインスタンス（ドキュメントツール呼び出し用）
 */
export function handleFloncssMentionRequest(text: string, server?: Server) {
  // @floncss:タイプ形式のメンションを検出
  const mentionRegex = /@floncss:(\w+)/g;
  const mentions = [...text.matchAll(mentionRegex)];
  
  if (mentions.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No @floncss: prompts found. Available prompts: @floncss:coding, @floncss:design",
        },
      ],
    };
  }
  
  // 最初のメンションを処理（複数ある場合は先頭のみ）
  const promptType = mentions[0][1]; // coding, design などの部分
  const prompt = predefinedPrompts[promptType as keyof typeof predefinedPrompts];
  
  if (!prompt) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown prompt type: ${promptType}. Available prompts: ${Object.keys(predefinedPrompts).join(', ')}`,
        },
      ],
    };
  }

  // coding プロンプトの場合、自動的にFlonCSSドキュメントを取得
  if (promptType === 'coding' && server) {
    // 主要なカテゴリのドキュメントを取得
    const docsInfo = handleFlonCSSDocsRequest(server, 'docs', 'architecture');
    const utilitiesInfo = handleFlonCSSDocsRequest(server, 'utilities', 'columns');
    const settingsInfo = handleFlonCSSDocsRequest(server, 'settings', 'colors');
    
    // ドキュメント情報とプロンプトを組み合わせる
    return {
      content: [
        {
          type: "text",
          text: `Activating FlonCSS ${promptType} mode with reference documentation.\n\n${prompt.content}\n\n## FlonCSS Reference Documentation\n\n${docsInfo.content[0].text}\n\n${utilitiesInfo.content[0].text}\n\n${settingsInfo.content[0].text}`
        },
      ],
    };
  }
  
  // 他のプロンプトタイプの場合は通常どおり処理
  return {
    content: [
      {
        type: "text",
        text: `Activating FlonCSS ${promptType} mode.\n\n${prompt.content}`,
      },
    ],
  };
}
