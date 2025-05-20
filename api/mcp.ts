import createMcpRouteHandler from '@vercel/mcp-adapter/dist/next';
import { createServer } from '../src/server/index.js';

const handler = createMcpRouteHandler(
  () => createServer(),
  
  {
    capabilities: {
      tools: {},
      prompts: {},
      logging: {},
    },
  },
  
  {
    streamableHttpEndpoint: '/api/mcp',
    sseEndpoint: '/api/sse',
    sseMessageEndpoint: '/api/message',
    basePath: '/api/mcp',
  }
);

export { handler as GET, handler as POST };
