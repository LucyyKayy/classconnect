// src/utils/exercises.js

// split into sentences (basic)
export function splitSentences(text = "") {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Extractive summary: pick 2-3 longest sentences (simple heuristic)
export function extractiveSummary(text, maxSentences = 3) {
  if (!text) return "";
  const sents = splitSentences(text);
  if (sents.length <= maxSentences) return sents.join(" ");
  // sort by length desc and pick top N preserving original order
  const scored = sents.map((s, i) => ({ s, i, len: s.length }));
  scored.sort((a,b) => b.len - a.len);
  const top = scored.slice(0, maxSentences).sort((a,b) => a.i - b.i);
  return top.map(x => x.s).join(" ");
}

// Pick cloze targets and generate cloze items
function pickCloze(sent) {
  const words = sent.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[.,!?;:]/g, "");
    if (w.length >= 4) {
      const blanked = words.map((t, idx) => (idx === i ? "_____" : t)).join(" ");
      return { original: sent, blanked, answer: w };
    }
  }
  return null;
}

/**
 * Generate cloze + prompts from translated text
 * @param {string} text
 * @param {number} count
 */
export function generateExercisesFromText(text = "", count = 6) {
  const sents = splitSentences(text);
  const cloze = [];
  const used = new Set();
  for (let k = 0; k < count && sents.length; k++) {
    let tries = 0;
    while (tries++ < 20) {
      const idx = Math.floor(Math.random() * sents.length);
      if (used.has(idx)) continue;
      const item = pickCloze(sents[idx]);
      if (item) {
        used.add(idx);
        cloze.push(item);
        break;
      }
    }
  }
  const prompts = [
    "Summarize the passage in 2–3 sentences.",
    "List 5 important vocabulary words and define them.",
    "Write 3 original sentences using words from the passage.",
    "Create 3 comprehension questions about the text.",
    "Translate one paragraph back to your home language and explain unknown words."
  ];
  return { cloze, prompts };
}
