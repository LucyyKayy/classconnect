// src/utils/pdf.js
import jsPDF from "jspdf";

/**
 * Download dual-language transcript PDF
 * @param {{studentName?:string, lines: Array<{ts:string, original:string, translated:string}>}} payload
 */
export function downloadTranscriptPDF(payload = {}) {
  const { studentName = "Student", lines = [] } = payload;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(16);
  doc.text(`ClassConnect - Transcript (${studentName})`, 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 12;

  lines.forEach((l, i) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.text(`[${l.ts}] Original: ${l.original}`, 14, y);
    y += 6;
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(9);
    doc.text(`    Translated: ${l.translated}`, 14, y);
    y += 10;
  });
  doc.save("classconnect_transcript.pdf");
}

/**
 * Download exercises PDF (expects {targetLangName, cloze, prompts})
 */
export function downloadExercisesPDF(payload = {}) {
  const { targetLangName = "Target", cloze = [], prompts = [] } = payload;
  const doc = new jsPDF();
  let y = 20;
  doc.setFontSize(16);
  doc.text(`ClassConnect - Homework (${targetLangName})`, 14, y);
  y += 12;
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
  y += 12;

  doc.setFontSize(13);
  doc.text("A) Cloze (fill-in-the-blank)", 14, y);
  y += 10;
  doc.setFontSize(11);
  if (cloze.length === 0) {
    doc.text("No exercises available.", 14, y);
    y += 10;
  } else {
    cloze.forEach((c, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text(`${i + 1}. ${c.blanked}`, 14, y); y += 8;
      doc.setTextColor(120);
      doc.text(`Answer: ${c.answer}`, 20, y); y += 10;
      doc.setTextColor(0);
    });
  }

  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFontSize(13);
  doc.text("B) Prompts", 14, y);
  y += 10;
  doc.setFontSize(11);
  prompts.forEach((p, i) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.text(`${i + 1}. ${p}`, 14, y); y += 8;
  });

  doc.save("classconnect_homework.pdf");
}
