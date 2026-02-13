"use client";

import { useState, useEffect } from "react";
import { ExternalLink, TrendingUp, Filter, RefreshCw, Loader2 } from "lucide-react";

interface Opportunity {
  id: string;
  source: string;
  source_id: string;
  title: string;
  description: string;
  url: string;
  contact_info: any;
  tags: string[];
  category: string | null;
  posted_at: string;
  scraped_at: string;
  star_count: number;
  score: number;
  score_components: any;
  metadata: any;
}

export default function OpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sourceFilter) params.append('source', sourceFilter);
      params.append('limit', '20');
      params.append('sortBy', 'score');
      params.append('sortOrder', 'desc');
      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setOpportunities(data.opportunities);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [refreshKey, sourceFilter]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'moltbook': return '📘';
      case 'reddit': return '🤖';
      case 'github': return '💾';
      default: return '🌐';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 100) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Opportunities
          <span className="text-sm font-normal text-gray-400">({total} total)</span>
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 text-sm border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-green-500"
          >
            <option value="">All Sources</option>
            <option value="moltbook">Moltbook</option>
            <option value="reddit">Reddit</option>
            <option value="github">GitHub</option>
          </select>
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-green-400 disabled:opacity-50"
            title="Refresh"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-2">Error: {error}</div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {loading && opportunities.length === 0 ? (
          <div className="text-gray-500 text-sm">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="text-gray-500 text-sm">No opportunities found.</div>
        ) : (
          opportunities.map(opp => (
            <div
              key={`${opp.source}-${opp.source_id}`}
              className="bg-gray-800 rounded p-3 border border-gray-700 hover:border-green-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getSourceIcon(opp.source)}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{opp.source}</span>
                    {opp.category && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {opp.category}
                      </span>
                    )}
                  </div>
                  <a
                    href={opp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-400 hover:underline line-clamp-2"
                  >
                    {opp.title}
                  </a>
                  {opp.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{opp.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>⭐ {Math.round(opp.score)}</span>
                    <span>▲ {opp.star_count}</span>
                    <span>💬 {opp.metadata?.comment_count || opp.metadata?.num_comments || 0}</span>
                    {opp.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400"
                  title="Open"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {total > 20 && (
        <div className="mt-3 text-center text-xs text-gray-500">
          Showing top {opportunities.length} of {total} opportunities.
        </div>
      )}
    </div>
  );
}
