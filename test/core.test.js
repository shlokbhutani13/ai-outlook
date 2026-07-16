const test = require("node:test");
const assert = require("node:assert/strict");

const { parseReplyRequest } = require("../src/reply-request");
const { buildMessages } = require("../src/prompt");
const { createOpenRouterClient } = require("../src/openrouter");
const { createOfficeAdapter } = require("../src/office-adapter");

test("reply requests enforce email and tone limits", () => {
  assert.deepEqual(parseReplyRequest({ email: "  Hello  ", tone: "warm" }), {
    email: "Hello",
    tone: "warm",
  });
  assert.throws(() => parseReplyRequest({ email: "", tone: "warm" }), /email/i);
  assert.throws(() => parseReplyRequest({ email: "Hello", tone: "casual" }), /tone/i);
  assert.throws(() => parseReplyRequest({ email: "x".repeat(12001), tone: "formal" }), /long/i);
});

test("prompts describe the selected tone without inventing facts", () => {
  const messages = buildMessages({ email: "Can we meet Tuesday?", tone: "concise" });
  assert.equal(messages.length, 2);
  assert.match(messages[0].content, /do not invent/i);
  assert.match(messages[1].content, /concise/i);
  assert.match(messages[1].content, /Can we meet Tuesday/);
});

test("OpenRouter client sends the free model and returns reply text", async () => {
  let request;
  const client = createOpenRouterClient({
    apiKey: "test-key",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "Thanks for the note." } }] }),
      };
    },
  });

  const reply = await client.generateReply([{ role: "user", content: "Hello" }]);
  assert.equal(reply, "Thanks for the note.");
  assert.equal(JSON.parse(request.options.body).model, "openrouter/free");
  assert.equal(request.options.headers.Authorization, "Bearer test-key");
});

test("OpenRouter client returns stable provider errors", async () => {
  const client = createOpenRouterClient({
    apiKey: "test-key",
    fetchImpl: async () => ({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "internal provider detail" } }),
    }),
  });
  await assert.rejects(() => client.generateReply([]), /temporarily unavailable/i);
});

test("Office adapter reads text and opens an asynchronous reply form", async () => {
  let opened;
  const office = {
    CoercionType: { Text: "text" },
    AsyncResultStatus: { Succeeded: "succeeded" },
    context: {
      mailbox: {
        item: {
          body: {
            getAsync(type, callback) {
              assert.equal(type, "text");
              callback({ status: "succeeded", value: "Message body" });
            },
          },
          displayReplyFormAsync(text, callback) {
            opened = text;
            callback({ status: "succeeded" });
          },
        },
      },
    },
  };
  const adapter = createOfficeAdapter(office);
  assert.equal(await adapter.readMessageText(), "Message body");
  await adapter.openReply("Draft reply");
  assert.equal(opened, "Draft reply");
});

test("Office adapter rejects oversized reply drafts", async () => {
  const adapter = createOfficeAdapter({ context: { mailbox: { item: {} } } });
  await assert.rejects(() => adapter.openReply("x".repeat(32769)), /long/i);
});
