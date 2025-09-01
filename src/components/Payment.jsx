// src/components/Payment.jsx
import React, { useEffect } from "react";

export default function Payment() {
  useEffect(() => {
    if (!window.IntaSend) return;

    // Initialize IntaSend (sandbox mode)
    new window.IntaSend({
      publicAPIKey: import.meta.env.VITE_INTASEND_API_KEY,
      live: false, // sandbox
    })
      .on("COMPLETE", (resp) => console.log("Payment Complete:", resp))
      .on("FAILED", (err) => console.error("Payment Failed:", err))
      .on("IN-PROGRESS", () => console.log("Payment In Progress"));
  }, []);

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <button
        className="intaSendPayButton bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        data-amount="10"   // KES
        data-currency="KES"
        data-email="student@classconnect.com"
      >
        Pay KES 10
      </button>
    </div>
  );
}
