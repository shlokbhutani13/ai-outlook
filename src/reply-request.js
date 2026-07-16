const TONES = new Set(["concise", "warm", "formal"]);
const MAX_EMAIL_LENGTH = 12_000;

class PublicError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function parseReplyRequest(value) {
  if (!value || typeof value !== "object") throw new PublicError("Invalid request.");
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const tone = typeof value.tone === "string" ? value.tone : "";
  if (!email) throw new PublicError("Email content is required.");
  if (email.length > MAX_EMAIL_LENGTH) throw new PublicError("Email content is too long.");
  if (!TONES.has(tone)) throw new PublicError("Choose a supported tone.");
  return { email, tone };
}

module.exports = { MAX_EMAIL_LENGTH, PublicError, TONES, parseReplyRequest };
