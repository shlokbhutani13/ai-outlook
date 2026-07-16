const path = require("node:path");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { buildMessages } = require("./src/prompt");
const { PublicError, parseReplyRequest } = require("./src/reply-request");

function createApp({ replyClient, rateLimitOptions = {} }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use(express.static(path.join(__dirname, "src")));
  app.get("/health", (_request, response) => response.json({ ok: true }));
  app.post(
    "/api/replies",
    rateLimit({
      windowMs: 60_000,
      limit: 10,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      ...rateLimitOptions,
    }),
    async (request, response) => {
      try {
        const input = parseReplyRequest(request.body);
        const reply = await replyClient.generateReply(buildMessages(input));
        response.set("Cache-Control", "no-store").json({ reply });
      } catch (error) {
        const status = error instanceof PublicError ? error.status : 503;
        const message =
          error instanceof PublicError ? error.message : "Reply generation is temporarily unavailable.";
        response.status(status).json({ error: message });
      }
    },
  );
  app.use((error, _request, response, _next) => {
    if (error?.type === "entity.too.large") {
      response.status(413).json({ error: "Request is too large." });
      return;
    }
    response.status(400).json({ error: "Invalid request." });
  });
  return app;
}

module.exports = { createApp };
