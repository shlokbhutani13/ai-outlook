const TONE_GUIDANCE = {
  concise: "Keep the reply concise and direct.",
  warm: "Use a warm, considerate tone.",
  formal: "Use a formal, professional tone.",
};

function buildMessages({ email, tone }) {
  return [
    {
      role: "system",
      content:
        "Draft an email reply using only facts present in the message. Do not invent commitments, dates, names, or details. Return only the reply body.",
    },
    {
      role: "user",
      content: `${TONE_GUIDANCE[tone]}\n\nMessage:\n${email}`,
    },
  ];
}

module.exports = { buildMessages };
