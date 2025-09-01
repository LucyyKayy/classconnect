// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ----------------------
// Mock Payment Route
// ----------------------
app.post("/api/mock-payment", (req, res) => {
  const { email, phone, amount } = req.body;

  // Simple mock response
  res.json({
    status: "success",
    payment: {
      id: Math.floor(Math.random() * 1000000),
      email,
      phone,
      amount,
      date: new Date(),
    },
  });
});

// ----------------------
// Translate Route (proxy to LibreTranslate)
// ----------------------
app.post("/api/translate", async (req, res) => {
  const { text, source, target } = req.body;

  if (!text || !target) {
    return res.status(400).json({ error: "Text and target language required" });
  }

  try {
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: source || "auto",
        target,
        format: "text",
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Translation error:", err);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
