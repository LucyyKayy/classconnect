// src/pages/SignIn.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function findUser(name) {
  const raw = localStorage.getItem("cc_users");
  if (!raw) return null;
  const users = JSON.parse(raw);
  return users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
}

export default function SignIn() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handle = (e) => {
    e.preventDefault();
    const user = findUser(name);
    if (!user) return alert("No user found. Please sign up.");
    localStorage.setItem("cc_current", JSON.stringify(user));
    if (user.role === "teacher") navigate("/teacher"); else navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-400 p-6">
      <form onSubmit={handle} className="bg-white rounded-2xl p-6 max-w-md w-full shadow">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded mb-3"/>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Sign in</button>
      </form>
    </div>
  );
}
