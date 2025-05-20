import { createMcpHandler } from '@vercel/mcp-adapter';
import { createServer } from '../src/server/index.js';
// MCPサーバーインスタンスを作成
const handler = createMcpHandler((server) => {
    // サーバー初期化ロジックはここですでにcreateServerに含まれているため、
    // 単純にcreateServerが返すインスタンスを使用
    return createServer();
}, {
// サーバーオプション
}, {
    // Vercel設定
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: true
});
// エクスポート - Next.js形式で必要
export { handler as GET, handler as POST };
