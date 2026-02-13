"use client";

import { useState, useEffect } from "react";

interface Document {
  id: number;
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: any;
  added_at: string;
}

export default function DocumentsPanel() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', description: '', category: '', tags: '' });

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brain/documents');
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/brain/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: form.tags ? JSON.parse(form.tags) : null }),
    });
    setShowForm(false);
    setForm({ title: '', url: '', description: '', category: '', tags: '' });
    loadDocs();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/brain/documents/${id}`, { method: 'DELETE' });
    loadDocs();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Documents Vault</h2>
      <div className="mb-4 flex justify-between items-center">
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
          {showForm ? 'Cancel' : '+ Add Document'}
        </button>
        <span className="text-sm text-gray-400">{docs.length} documents</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-4 rounded border border-gray-800 mb-4 space-y-3">
          <input required className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <input required className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1" placeholder="URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <input className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1" placeholder="Category (optional)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <textarea className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          <input className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1" placeholder='Tags as JSON (e.g., ["dev","reference"])' value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <button type="submit" className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">Save</button>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : docs.length === 0 ? (
        <div className="text-gray-500">No documents saved yet.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="py-2">Title</th>
              <th className="py-2">Category</th>
              <th className="py-2">Added</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => (
              <tr key={doc.id} className="border-b border-gray-800">
                <td className="py-2">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{doc.title}</a>
                </td>
                <td className="py-2 text-gray-400">{doc.category || '-'}</td>
                <td className="py-2 text-gray-400">{new Date(doc.added_at).toLocaleDateString()}</td>
                <td className="py-2">
                  <button onClick={() => handleDelete(doc.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
