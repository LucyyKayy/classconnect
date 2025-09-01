import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [homeLang, setHomeLang] = useState("English");
  const [classLang, setClassLang] = useState("German");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ name, role, homeLang, classLang }));
    navigate("/dashboard");
  };

  const languages = ["English", "German", "French", "Spanish", "Arabic", "Swahili", "Ukrainian"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-400 to-pink-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-purple-600">ClassConnect</h1>
        
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-2"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <select
          value={homeLang}
          onChange={(e) => setHomeLang(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          {languages.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>

        <select
          value={classLang}
          onChange={(e) => setClassLang(e.target.value)}
          className="w-full border rounded-lg p-2"
        >
          {languages.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-purple-500 text-white rounded-lg py-2 hover:bg-purple-600"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
