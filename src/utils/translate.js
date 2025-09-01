// src/utils/translate.js
const API_URL = "https://libretranslate.de/translate"; // public demo API

export const LANGUAGE_CODES = {
  English: "en",
  German: "de",
  French: "fr",
  Spanish: "es",
  Portuguese: "pt",
  Italian: "it",
  Dutch: "nl",
  Polish: "pl",
  Ukrainian: "uk",
  Russian: "ru",
  Arabic: "ar",
  Turkish: "tr",
  Swahili: "sw",
  "Chinese (Simplified)": "zh",
  Hindi: "hi",
};

export async function translateText(text, source = "en", target = "en") {
  if (!text) return "";
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text",
      }),
    });
    const data = await res.json();
    console.log("Translation API response:", data);
    return data.translatedText ?? "(translation failed)";
  } catch (err) {
    console.error("translateText error:", err);
    return "(translation failed)";
  }
}
