// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-pink-500 to-yellow-400 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/90 rounded-2xl p-8 shadow-lg">
        <h1 className="text-4xl font-extrabold mb-4 text-indigo-700">ClassConnect</h1>
        <p className="mb-6 text-gray-700"> Classrooms without Borders. Welcome Students!!.</p>
        <div className="flex gap-3">
          <Link to="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded">Sign up</Link>
          <Link to="/signin" className="px-4 py-2 bg-gray-200 rounded">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
