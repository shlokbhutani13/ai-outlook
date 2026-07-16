require("dotenv").config();
const https = require("node:https");
const { getHttpsServerOptions } = require("office-addin-dev-certs");
const { createApp } = require("./app");
const { createOpenRouterClient } = require("./src/openrouter");

async function start() {
  const port = Number(process.env.PORT || 5051);
  const replyClient = createOpenRouterClient({
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
  });
  const options = await getHttpsServerOptions();
  https.createServer(options, createApp({ replyClient })).listen(port, () => {
    console.log(`AI Outlook is available at https://localhost:${port}/taskpane.html`);
  });
}

start().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
