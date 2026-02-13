"use client";

import { useState, useEffect } from "react";

export default function BriefPanel() {
  const [content, setContent] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [configStatus, setConfigStatus] = useState<{hasDiscord: boolean, briefChannel?: string} | null>(null);

  useEffect(() => {
    fetch('/api/system/config/status')
      .then(r => r.json())
      .then(data => { if (data.ok) setConfigStatus(data.config); })
      .catch(() => {});
  }, []);

  const loadBrief = async (targetDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brief/today?date=${targetDate}`);
      const data = await res.json();
      setContent(data.content);
    } catch (e) {
      console.error(e);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrief(date); }, [date]);

  const generateBrief = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/brief/today', { method: 'POST' });
      const data = await res.json();
      if (data.success || data.generated) {
        loadBrief(date);
      } else {
        alert('Generation failed: ' + (data.message || data.error || 'unknown error'));
      }
    } catch (e) {
      alert('Failed to generate brief');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Morning Brief</h2>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        />
        <button onClick={() => loadBrief(date)} className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">Refresh</button>
        <button onClick={generateBrief} disabled={generating} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm disabled:opacity-50">
          {generating ? 'Generating...' : 'Generate Now'}
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading brief...</div>
      ) : content ? (
        <div className="bg-gray-900 p-4 rounded border border-gray-800 whitespace-pre-wrap font-mono text-sm">{content}</div>
      ) : (
        <div className="text-gray-500">No brief available for this date.</div>
      )}
    </div>
  );
}
