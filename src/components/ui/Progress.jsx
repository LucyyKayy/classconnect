import React from "react";


export default function Progress({ value = 0 }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
