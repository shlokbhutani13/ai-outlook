const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../app");

test("reply API validates requests and returns generated text", async () => {
  const app = createApp({
    replyClient: { generateReply: async () => "Draft reply" },
    rateLimitOptions: { limit: 100 },
  });
  assert.deepEqual((await request(app).get("/health")).body, { ok: true });
  assert.equal((await request(app).post("/api/replies").send({})).status, 400);
  const response = await request(app)
    .post("/api/replies")
    .send({ email: "Hello", tone: "formal" });
  assert.equal(response.status, 200);
  assert.equal(response.body.reply, "Draft reply");
  assert.equal(response.headers["cache-control"], "no-store");
});

test("reply API hides provider details", async () => {
  const app = createApp({
    replyClient: { generateReply: async () => { throw new Error("secret detail"); } },
    rateLimitOptions: { limit: 100 },
  });
  const response = await request(app)
    .post("/api/replies")
    .send({ email: "Hello", tone: "warm" });
  assert.equal(response.status, 503);
  assert.doesNotMatch(response.text, /secret detail/);
});
