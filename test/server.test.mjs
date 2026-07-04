import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../build/server/index.js";

async function connectClient() {
  const server = createServer();
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}

test("tools/list returns both tools", async () => {
  const client = await connectClient();
  const { tools } = await client.listTools();
  const names = tools.map(t => t.name).sort();
  assert.deepEqual(names, ["get_floncss_docs", "handle_floncss_mention"]);
});

test("prompts/list returns spec-compliant prompt names", async () => {
  const client = await connectClient();
  const { prompts } = await client.listPrompts();
  const names = prompts.map(p => p.name).sort();
  assert.deepEqual(names, ["floncss-coding", "floncss-refactor", "floncss-setting"]);
});

test("prompts/get returns messages with embedded documentation", async () => {
  const client = await connectClient();
  const result = await client.getPrompt({ name: "floncss-coding" });
  assert.ok(Array.isArray(result.messages) && result.messages.length === 1);
  const text = result.messages[0].content.text;
  assert.match(text, /FlonCSSのエキスパート/);
  assert.match(text, /Complete Reference Documentation/);
});

test("prompts/get for setting mode embeds settings docs only", async () => {
  const client = await connectClient();
  const result = await client.getPrompt({ name: "floncss-setting" });
  const text = result.messages[0].content.text;
  assert.match(text, /Settings Documentation/);
});

test("prompts/get rejects unknown prompt", async () => {
  const client = await connectClient();
  await assert.rejects(
    client.getPrompt({ name: "unknown-prompt" }),
    /Prompt not found/
  );
});

test("handle_floncss_mention activates coding mode with docs", async () => {
  const client = await connectClient();
  const result = await client.callTool({
    name: "handle_floncss_mention",
    arguments: { text: "floncss:coding モードでお願いします" },
  });
  assert.ok(!result.isError);
  assert.match(result.content[0].text, /Activating FlonCSS coding mode/);
  assert.match(result.content[0].text, /Complete Reference Documentation/);
});

test("handle_floncss_mention flags unknown mode as error", async () => {
  const client = await connectClient();
  const result = await client.callTool({
    name: "handle_floncss_mention",
    arguments: { text: "no mode here" },
  });
  assert.equal(result.isError, true);
});

test("get_floncss_docs returns docs for a category and path", async () => {
  const client = await connectClient();
  const all = await client.callTool({
    name: "get_floncss_docs",
    arguments: { category: "utilities" },
  });
  assert.match(all.content[0].text, /URL: https:\/\/floncss\.dsflon\.net\/utilities\//);

  const single = await client.callTool({
    name: "get_floncss_docs",
    arguments: { category: "settings", path: "colors" },
  });
  assert.match(single.content[0].text, /settings\/colors/);
});

test("get_floncss_docs reports missing documentation", async () => {
  const client = await connectClient();
  const result = await client.callTool({
    name: "get_floncss_docs",
    arguments: { category: "docs", path: "does-not-exist" },
  });
  assert.match(result.content[0].text, /No documentation found/);
});

test("calling an unknown tool returns an error", async () => {
  const client = await connectClient();
  await assert.rejects(
    client.callTool({ name: "nonexistent_tool", arguments: {} }),
    /Unknown tool/
  );
});
