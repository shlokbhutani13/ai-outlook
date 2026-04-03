const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server running");
});

app.post("/ai-reply", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "No email content provided" });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "Missing OPENROUTER_API_KEY in .env" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5051",
        "X-Title": "Gmail AI Reply Extension"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "system",
            content:
              "You are an email assistant. Write a short, polite, professional email reply. Keep it clear and natural."
          },
          {
            role: "user",
            content: `Write a reply to this email:\n\n${email}`
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter request failed"
      });
    }

    return res.json({
      reply: data.choices?.[0]?.message?.content || "No reply generated"
    });
  } catch (error) {
    console.error("AI route error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(5051, () => {
  console.log("Server running on http://localhost:5051");
});