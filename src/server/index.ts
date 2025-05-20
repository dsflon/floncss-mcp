import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { handleFlonCSSDocsRequest } from "./tools/floncss-docs";
import {
  handleFloncssMentionRequest,
  handleGetPromptRequest,
  handleListPromptsRequest
} from "./tools/prompts";

const serverConfig = {
  name: "floncss-docs",
  version: "1.0.0",
};

export function createServer(): Server {
  const server = new Server(
    serverConfig,
    {
      capabilities: {
        tools: {},
        prompts: {}, // Promptsケイパビリティを追加
        logging: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "handle_floncss_mention",
          description: "Handle @floncss: mentions in text",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Text containing @floncss: mentions",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "get_floncss_docs",
          description: "Get FlonCSS documentation content",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Documentation category (docs, settings, utilities)",
              },
              path: {
                type: "string",
                description: "Optional specific path within the category (e.g. 'colors', 'installation')",
              },
            },
            required: ["category"],
          },
        },
      ],
    };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return handleListPromptsRequest();
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return handleGetPromptRequest(request.params.id as string);
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "handle_floncss_mention") {
      const { text } = request.params.arguments as {
        text: string;
      };
      
      return handleFloncssMentionRequest(text, server);
    } else if (request.params.name === "get_floncss_docs") {
      const { category, path } = request.params.arguments as {
        category: string;
        path?: string;
      };
      
      return handleFlonCSSDocsRequest(server, category, path);
    } 

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}
