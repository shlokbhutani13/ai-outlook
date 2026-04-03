const express = require("express");
const cors = require("cors");

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

    return res.json({
      reply:
        "Thanks for your email. I appreciate the update. I will review this and get back to you shortly."
    });
  } catch (error) {
    console.error("AI route error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.listen(5051, () => {
  console.log("Server running on http://localhost:5051");
});