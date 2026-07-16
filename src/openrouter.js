class ProviderError extends Error {}

function createOpenRouterClient({
  apiKey,
  model = "openrouter/free",
  fetchImpl = fetch,
  timeoutMs = 25_000,
}) {
  if (!apiKey) throw new ProviderError("AI provider is not configured.");

  return {
    async generateReply(messages) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://localhost:5051",
            "X-Title": "AI Outlook",
          },
          body: JSON.stringify({ model, messages }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new ProviderError("Reply generation is temporarily unavailable.");
        const reply = data?.choices?.[0]?.message?.content?.trim();
        if (!reply) throw new ProviderError("The provider returned an empty reply.");
        return reply.slice(0, 8_000);
      } catch (error) {
        if (error instanceof ProviderError) throw error;
        throw new ProviderError("Reply generation is temporarily unavailable.");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

module.exports = { ProviderError, createOpenRouterClient };
