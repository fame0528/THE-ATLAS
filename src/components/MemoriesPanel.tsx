"use client";

import { useState, useEffect } from "react";

export default function MemoriesPanel() {
  const [facts, setFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadFacts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (category) params.append('category', category);
        if (query) params.append('q', query);
        const res = await fetch(`/api/brain/memories?${params.toString()}`);
        const data = await res.json();
        setFacts(data.facts || []);
      } catch (e) {
        console.error(e);
        setFacts([]);
      } finally {
        setLoading(false);
      }
    };
    loadFacts();
  }, [date, category, query]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Memories</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
        />
        <input
          type="text"
          placeholder="Category filter (decisions, preferences...)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm flex-1"
        />
        <input
          type="text"
          placeholder="Search query..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm flex-1"
        />
      </div>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : facts.length === 0 ? (
        <div className="text-gray-500">No facts found.</div>
      ) : (
        <div className="space-y-3">
          {facts.map((fact, idx) => (
            <div key={fact.id || idx} className="bg-gray-900 p-3 rounded border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">{new Date(fact.timestamp).toLocaleString()} • {fact.category || 'uncategorized'}</div>
              <div className="text-gray-200">{fact.fact}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
