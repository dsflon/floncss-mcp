import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { predefinedPrompts } from "../../data/prompts";
import { handleFlonCSSDocsRequest } from "./floncss-docs";

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
  // @floncss:タイプ形式のメンションを検出（前後の文字や改行、スペースを許容）
  const mentionRegex = /(?:^|\s|\n|[^\w])(@floncss:(\w+))(?:$|\s|\n|[^\w])/g;
  const mentions = [...text.matchAll(mentionRegex)];
  
  if (mentions.length === 0) {
    // より柔軟にマッチさせるためのフォールバック
    const simpleRegex = /@floncss:(\w+)/g;
    const simpleMatches = [...text.matchAll(simpleRegex)];
    
    if (simpleMatches.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No @floncss: prompts found. Available prompts: @floncss:coding, @floncss:refactor, @floncss:setting",
          },
        ],
      };
    }
    
    // シンプルな検出方法でメンションを見つけた場合
    const promptType = simpleMatches[0][1]; // coding, refactor などの部分
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

    // coding または refactor プロンプトの場合、自動的にFlonCSSドキュメントを取得
    if ((promptType === 'coding' || promptType === 'refactor') && server) {
      let allDocs = '';
      
      // docs カテゴリの全ドキュメント
      const docseAll = handleFlonCSSDocsRequest(server, 'docs');
      allDocs += `${docseAll.content[0].text}\n\n`;
      
      // utilities カテゴリの全ドキュメント
      const utilitiesAll = handleFlonCSSDocsRequest(server, 'utilities');
      allDocs += `${utilitiesAll.content[0].text}\n\n`;
      
      // settings カテゴリの全ドキュメント
      const settingsAll = handleFlonCSSDocsRequest(server, 'settings');
      allDocs += `${settingsAll.content[0].text}\n\n`;
      
      // ドキュメント情報とプロンプトを組み合わせる
      return {
        content: [
          {
            type: "text",
            text: `Activating FlonCSS ${promptType} mode with complete reference documentation.\n\n${prompt.content}\n\n## FlonCSS Complete Reference Documentation\n\n${allDocs}`
          },
        ],
      };
    }
    
    // setting プロンプトの場合、settings カテゴリのドキュメントのみを取得
    if (promptType === 'setting' && server) {
      // settings カテゴリのドキュメントのみ
      const settingsAll = handleFlonCSSDocsRequest(server, 'settings');
      
      // ドキュメント情報とプロンプトを組み合わせる
      return {
        content: [
          {
            type: "text",
            text: `Activating FlonCSS ${promptType} mode with settings documentation.\n\n${prompt.content}\n\n## FlonCSS Settings Documentation\n\n${settingsAll.content[0].text}`
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
  
  // 最初のメンションを処理（複数ある場合は先頭のみ）
  const promptType = mentions[0][2]; // 正規表現のキャプチャグループが変更されたため、インデックスも変更
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

  // coding または refactor プロンプトの場合、自動的にFlonCSSドキュメントを取得
  if ((promptType === 'coding' || promptType === 'refactor') && server) {
    let allDocs = '';
    
    // docs カテゴリの全ドキュメント
    const docseAll = handleFlonCSSDocsRequest(server, 'docs');
    allDocs += `${docseAll.content[0].text}\n\n`;
    
    // utilities カテゴリの全ドキュメント
    const utilitiesAll = handleFlonCSSDocsRequest(server, 'utilities');
    allDocs += `${utilitiesAll.content[0].text}\n\n`;
    
    // settings カテゴリの全ドキュメント
    const settingsAll = handleFlonCSSDocsRequest(server, 'settings');
    allDocs += `${settingsAll.content[0].text}\n\n`;
    
    // ドキュメント情報とプロンプトを組み合わせる
    return {
      content: [
        {
          type: "text",
          text: `Activating FlonCSS ${promptType} mode with complete reference documentation.\n\n${prompt.content}\n\n## FlonCSS Complete Reference Documentation\n\n${allDocs}`
        },
      ],
    };
  }
  
  // setting プロンプトの場合、settings カテゴリのドキュメントのみを取得
  if (promptType === 'setting' && server) {
    // settings カテゴリのドキュメントのみ
    const settingsAll = handleFlonCSSDocsRequest(server, 'settings');
    
    // ドキュメント情報とプロンプトを組み合わせる
    return {
      content: [
        {
          type: "text",
          text: `Activating FlonCSS ${promptType} mode with settings documentation.\n\n${prompt.content}\n\n## FlonCSS Settings Documentation\n\n${settingsAll.content[0].text}`
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
