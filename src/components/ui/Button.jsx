
import React from "react";

export default function Button({ children, onClick, className = "", ...props }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:opacity-90 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
