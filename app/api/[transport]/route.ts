import { createMcpHandler } from '@vercel/mcp-adapter';
import { createServer } from '@/src/server/index';

const handler = createMcpHandler(
  () => {
    return createServer();
  },
  {
  },
  {
    basePath: '/api',  // APIルートのベースパス
    maxDuration: 60,   // SSE接続の最大時間（秒）
    verboseLogs: true, // 詳細なログを有効化
  }
);

export { handler as GET, handler as POST };
