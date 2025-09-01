import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Progress from "../components/ui/Progress";

// Dummy translator (replace with API later)
async function translateText(text, targetLang = "en") {
  return `[${targetLang}] ${text}`;
}

export default function TeacherDashboard() {
  const [lesson, setLesson] = useState("");
  const [translatedLesson, setTranslatedLesson] = useState("");
  const [progress, setProgress] = useState(65);

  const handleTranslate = async () => {
    if (!lesson.trim()) return;
    const result = await translateText(lesson, "fr");
    setTranslatedLesson(result);
    setProgress((prev) => Math.min(prev + 5, 100));
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [`Lesson:\n${lesson}\n\nTranslated:\n${translatedLesson}`],
      { type: "text/plain" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "teacher_lesson.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-green-400 flex flex-col items-center p-6 text-white">
      <h1 className="text-4xl font-bold mb-6">👩‍🏫 Teacher Dashboard</h1>

      <Card className="w-full max-w-2xl">
        <textarea
          className="w-full p-3 rounded-lg text-black"
          rows="5"
          placeholder="Enter lesson or instructions..."
          value={lesson}
          onChange={(e) => setLesson(e.target.value)}
        />
        <div className="flex space-x-3 mt-3">
          <Button onClick={handleTranslate}>Translate Lesson</Button>
          <Button onClick={handleDownload}>⬇️ Download</Button>
        </div>
        {translatedLesson && (
          <p className="mt-4 bg-white text-black p-3 rounded-xl">
            {translatedLesson}
          </p>
        )}
      </Card>

      <div className="mt-6 w-full max-w-md">
        <Progress value={progress} />
        <p className="text-center mt-2">Class Progress</p>
      </div>

      <Button className="mt-8 bg-red-500">Logout</Button>
    </div>
  );
}
