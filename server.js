// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const INTASEND_SECRET_KEY = process.env.INTASEND_SECRET_KEY;
const INTASEND_PUBLISHABLE_KEY = process.env.INTASEND_PUBLISHABLE_KEY;

// Health check
app.get("/", (req, res) => {
  res.send("✅ IntaSend API is running");
});

// Create Payment
app.post("/api/pay", async (req, res) => {
  try {
    const response = await fetch("https://payment.intasend.com/api/v1/payment/collections/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${INTASEND_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        public_key: INTASEND_PUBLISHABLE_KEY,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        phone_number: req.body.phone,
        amount: req.body.amount,
        currency: "KES", // or USD
        redirect_url: "https://classconnect-navy.vercel.app/payment-success"
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment request failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
