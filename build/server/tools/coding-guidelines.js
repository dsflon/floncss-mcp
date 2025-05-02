import { codingGuidelines } from "../../data/coding-guidelines.js";
// コーディングガイドラインツールの実装
export function handleCodingGuidelinesRequest(server, category) {
    server.sendLoggingMessage({
        level: "info",
        data: `Fetching coding guidelines for category: ${category || 'all'}`,
    });
    let guidelineText = "";
    // カテゴリが指定されていない場合または「all」の場合は全てのガイドラインを返す
    if (!category || category === "all") {
        for (const [cat, guidelines] of Object.entries(codingGuidelines)) {
            guidelineText += `# ${cat.toUpperCase()} ガイドライン\n`;
            guidelineText += guidelines.map((g, i) => `${i + 1}. ${g}`).join('\n');
            guidelineText += '\n\n';
        }
    }
    else {
        // 特定のカテゴリのガイドラインを返す
        if (codingGuidelines[category]) {
            guidelineText = `# ${category.toUpperCase()} ガイドライン\n`;
            guidelineText += codingGuidelines[category].map((g, i) => `${i + 1}. ${g}`).join('\n');
        }
        else {
            guidelineText = `指定されたカテゴリ '${category}' のガイドラインは見つかりませんでした。`;
        }
    }
    return {
        content: [
            {
                type: "text",
                text: guidelineText,
            },
        ],
    };
}
