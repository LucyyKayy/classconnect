import React, { useState } from "react";

export default function Payment() {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Lucy",
          lastName: "Kayy",
          email: "lucyy@example.com",
          phone: "254712345678",
          amount: 100
        })
      });

      const data = await response.json();

      if (data.invoice_url) {
        window.location.href = data.invoice_url; // Redirect to IntaSend checkout
      } else {
        alert("❌ Payment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating payment");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-2 rounded-lg shadow-lg"
    >
      {loading ? "Processing..." : "Pay with IntaSend"}
    </button>
  );
}
