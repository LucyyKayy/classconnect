// File: src/components/ClassConnectDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import Payment from "../components/Payment.jsx";

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'es', label: 'Spanish' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'tr', label: 'Turkish' },
  { code: 'sw', label: 'Swahili' },
  { code: 'zh', label: 'Chinese (Simplified)' },
  { code: 'hi', label: 'Hindi' },
];

export default function ClassConnectDashboard() {
  const [hostLanguage, setHostLanguage] = useState('en');
  const [homeLanguage, setHomeLanguage] = useState('uk');

  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = hostLanguage;

    rec.onresult = async (ev) => {
      let interim = '';
      let final = '';
      for (let i = ev.resultIndex; i < ev.results.length; ++i) {
        const r = ev.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      const latest = final || interim;
      setSourceText(latest);

      if (latest.trim().length > 0) {
        setIsTranslating(true);
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: latest, source: hostLanguage, target: homeLanguage })
          });
          const data = await res.json();
          const translated = data?.translatedText || data?.translated || (data?.translated_text) || (data?.translated?.text) || (data?.result) || JSON.stringify(data);
          setTranslatedText(translated);
        } catch (e) {
          console.error('translate error', e);
        }
        setIsTranslating(false);
      }
    };

    rec.onerror = (e) => console.warn('speech error', e);
    recognitionRef.current = rec;

    return () => {
      try { rec.stop(); } catch (e) {}
    };
  }, [hostLanguage, homeLanguage]);

  // Debounced manual text translation
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!sourceText.trim()) {
        setTranslatedText('');
        return;
      }
      setIsTranslating(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, source: hostLanguage, target: homeLanguage })
        });
        const data = await res.json();
        const translated = data?.translatedText || data?.translated || data?.result || JSON.stringify(data);
        setTranslatedText(translated);
      } catch (e) {
        console.error('translate error', e);
      }
      setIsTranslating(false);
    }, 400);
    return () => clearTimeout(id);
  }, [sourceText, hostLanguage, homeLanguage]);

  const toggleListen = () => {
    const rec = recognitionRef.current;
    if (!rec) return alert("Your browser doesn't support speech recognition");
    if (listening) {
      rec.stop();
      setListening(false);
      if (sourceText.trim()) {
        setTranscript(t => [{ type: 'voice', text: sourceText, translated: translatedText, time: new Date().toISOString() }, ...t]);
      }
    } else {
      rec.lang = hostLanguage;
      try { rec.start(); setListening(true); } catch (e) { console.error(e); }
    }
  };

  const saveSnippet = () => {
    if (!sourceText.trim()) return;
    setTranscript(t => [{ type: 'text', text: sourceText, translated: translatedText, time: new Date().toISOString() }, ...t]);
    setSourceText(''); setTranslatedText('');
  };

  const downloadPDF = (title='document', body='') => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(14);
    doc.text(title, 40, 60);
    const lines = doc.splitTextToSize(body, 500);
    doc.setFontSize(11);
    doc.text(lines, 40, 90);
    doc.save(`${title.replace(/\s+/g,'-')}.pdf`);
  };

  const generateHomework = () => {
    const body = `ClassConnect Homework\nHost: ${hostLanguage}\nHome: ${homeLanguage}\n\nTranscript:\n${transcript.map(t=>`[${new Date(t.time).toLocaleString()}] ${t.text} -> ${t.translated}`).join('\n\n')}`;
    downloadPDF('homework', body);
  };

  const generateReading = () => {
    const source = translatedText || sourceText || 'Sample reading passage for exercise.';
    const words = source.split(/\s+/).slice(0, 60);
    for (let i = 3; i < words.length; i += 7) words[i] = '_____';
    downloadPDF('reading-exercise', words.join(' '));
  };

  const requestAISummary = async () => {
    const text = (translatedText || sourceText || transcript.map(t => t.text).join('\n'));
    if (!text.trim()) return alert('No text to summarize');
    try {
      const res = await fetch('/api/ai-summary', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text }) });
      const data = await res.json();
      setAiSummary(data?.summary || data?.result || JSON.stringify(data));
    } catch (e) { console.error('ai error', e); alert('AI summary failed'); }
  };

  const downloadTranscriptTXT = () => {
    const content = transcript.map(t => `[${t.time}] ${t.type}: ${t.text} -> ${t.translated}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'transcript.txt'; a.click(); URL.revokeObjectURL(url);
  };

  const downloadTranscriptPDF = () => {
    const body = transcript.map(t => `[${t.time}] ${t.type}: ${t.text} -> ${t.translated}`).join('\n\n');
    downloadPDF('transcript', body);
  };

  const handlePayment = async ({ email, phone, amount }) => {
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/mock-payment', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, phone, amount }) });
      const data = await res.json();
      setPaymentStatus({ success: true, data });
      alert('Payment successful (mock)');
    } catch (e) {
      setPaymentStatus({ success: false, error: e.message });
      alert('Payment failed');
    }
    setPaymentLoading(false);
  };

  const playTranslated = () => {
    if (!translatedText) return;
    if (!window.speechSynthesis) return alert('No speechSynthesis in this browser');
    const u = new SpeechSynthesisUtterance(translatedText);
    u.lang = homeLanguage === 'zh' ? 'zh-CN' : homeLanguage;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-yellow-50 p-8">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 grid gap-6">

        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">ClassConnect</h1>
            <p className="text-sm text-gray-500">Live translation · Exercises · AI summaries</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow">
              <label className="text-xs text-gray-400">Host</label>
              <select value={hostLanguage} onChange={e => setHostLanguage(e.target.value)} className="ml-2 outline-none text-sm">
                {LANGUAGES.map(l=> <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow">
              <label className="text-xs text-gray-400">Home</label>
              <select value={homeLanguage} onChange={e => setHomeLanguage(e.target.value)} className="ml-2 outline-none text-sm">
                {LANGUAGES.map(l=> <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>

            <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-500 text-white">Log out</button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="col-span-2 space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-indigo-50 border border-gray-100 shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Live Translation</h2>
                <div className="flex items-center gap-2">
                  <button onClick={toggleListen} className={`px-3 py-1 rounded-md font-medium ${listening ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                    {listening ? 'Stop Mic' : 'Start Mic'}
                  </button>
                  <button onClick={playTranslated} className="px-3 py-1 rounded-md bg-yellow-100">Play</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500">Host (live)</label>
                  <textarea value={sourceText} onChange={e=>setSourceText(e.target.value)} placeholder="Teacher speech appears here..."
                    className="w-full min-h-[140px] p-3 rounded-xl border border-gray-200 resize-none" />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Translated ({LANGUAGES.find(l=>l.code===homeLanguage)?.label})</label>
                  <div className="min-h-[140px] p-3 rounded-xl border border-gray-200 bg-white/60">
                    {isTranslating ? <p className="text-sm text-gray-500">Translating...</p> : <p className="whitespace-pre-wrap">{translatedText || <span className="text-gray-400">No translation yet</span>}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                <button onClick={saveSnippet} className="px-4 py-2 rounded-lg bg-purple-600 text-white">Save</button>
                <button onClick={downloadTranscriptTXT} className="px-4 py-2 rounded-lg bg-gray-100">Download TXT</button>
                <button onClick={requestAISummary} className="px-4 py-2 rounded-lg bg-green-500 text-white">AI Summary</button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow">
              <h3 className="font-semibold mb-2">AI Summary</h3>
              <div className="min-h-[80px] p-3 rounded-lg border border-gray-100 bg-gray-50">
                {aiSummary ? <p>{aiSummary}</p> : <p className="text-sm text-gray-400">Click "AI Summary" to generate a short summary of the active content.</p>}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-white to-pink-50 border border-gray-100 shadow">
              <h3 className="font-semibold mb-2">Homework & Reading</h3>
              <p className="text-sm text-gray-600 mb-3">Generate downloadable PDFs for students.</p>
              <div className="flex gap-3">
                <button onClick={generateHomework} className="px-4 py-2 rounded-lg bg-pink-500 text-white">Download Homework (PDF)</button>
                <button onClick={generateReading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Download Exercise (PDF)</button>
              </div>
            </div>

          </section>

          <aside className="col-span-1">
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow sticky top-8">
              <h4 className="font-semibold mb-3">Recent Transcript</h4>
              <div className="space-y-3 max-h-[48vh] overflow-auto">
                {transcript.length === 0 ? (
                  <p className="text-sm text-gray-400">No transcript yet. Save voice or text snippets to appear here.</p>
                ) : (
                  transcript.map((t,i)=> (
                    <div key={i} className="p-3 rounded-md bg-gray-50 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-gray-500">{new Date(t.time).toLocaleString()}</div>
                          <div className="font-medium">{t.text}</div>
                          <div className="text-sm text-gray-600">→ {t.translated}</div>
                        </div>
                        <div className="text-xs text-gray-400">{t.type}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={downloadTranscriptTXT} className="flex-1 px-3 py-2 rounded-md bg-yellow-100">Download TXT</button>
                <button onClick={downloadTranscriptPDF} className="flex-1 px-3 py-2 rounded-md bg-green-100">Download PDF</button>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-white border border-gray-100 shadow">
              <h4 className="font-semibold mb-2">Support Class Connect</h4>
              <PaymentForm onPay={handlePayment} loading={paymentLoading} />
              {paymentStatus && (
                <div className="mt-3 p-2 rounded-md bg-gray-50 text-sm">
                  <div>Payment result:</div>
                  <pre className="text-xs">{JSON.stringify(paymentStatus, null, 2)}</pre>
                </div>
              )}
            </div>

          </aside>
        </main>

        <footer className="text-center text-xs text-gray-400">ClassConnect • Prototype — replace placeholder APIs with real services before production.</footer>
      </div>
    </div>
  );
}

// ---------------------------
// Quick Payment, powered by IntaSend
// ---------------------------
function PaymentForm({ onPay, loading }) {
  const [email, setEmail] = useState('student@example.com');
  const [phone, setPhone] = useState('+254700000000');
  const [amount, setAmount] = useState(5);

  const submit = (e) => {
    e.preventDefault();
    onPay({ email, phone, amount });
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 rounded-md border" />
      <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 rounded-md border" />
      <div className="flex items-center gap-2">
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="flex-1 p-2 rounded-md border" />
        <button type="submit" disabled={loading} className="px-3 py-2 rounded-md bg-indigo-600 text-white">{loading ? 'Paying...' : 'Pay'}</button>
      </div>
    </form>
  );
}
