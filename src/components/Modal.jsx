import React from "react";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 font-bold text-lg"
          onClick={onClose}
        >
          ✕
        </button>

        {/* Modal content */}
        {children}
      </div>
    </div>
  );
}
