import { createServer } from '@/src/server/index';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { NextRequest } from 'next/server';

// MCP用のサーバーインスタンスを作成
const server = createServer();

// Next.jsのApp RouterでGETリクエストハンドラー
export async function GET(req: NextRequest, { params }: { params: { transport: string } }) {
  // Content-Typeを適切に設定
  const response = await handleRequest(req, params);
  response.headers.set('Content-Type', 'application/json');
  return response;
}

// Next.jsのApp RouterでPOSTリクエストハンドラー
export async function POST(req: NextRequest, { params }: { params: { transport: string } }) {
  // Content-Typeを適切に設定
  const response = await handleRequest(req, params);
  response.headers.set('Content-Type', 'application/json');
  return response;
}

// 共通のリクエスト処理関数
async function handleRequest(req: NextRequest, params: { transport: string }) {
  const mcpHandler = createMcpHandler(
    () => server,
    {},
    {
      basePath: '/mcp',  // APIルートのベースパスを/mcpに変更
      maxDuration: 60,   // SSE接続の最大時間（秒）
      verboseLogs: true, // 詳細なログを有効化
    }
  );
  
  // MCPハンドラーを呼び出し
  return await mcpHandler(req);
}
