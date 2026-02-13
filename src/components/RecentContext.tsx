"use client";

import { useState, useEffect } from "react";
import { Clock, RefreshCw, FileText } from "lucide-react";

interface ContextItem {
  date: string;
  label: string;
  entries: string[];
}

/** Strip markdown bold/italic markers and clean up raw text */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")   // **bold** → bold
    .replace(/\*(.*?)\*/g, "$1")       // *italic* → italic
    .replace(/__(.*?)__/g, "$1")       // __bold__ → bold
    .replace(/_(.*?)_/g, "$1")         // _italic_ → italic
    .replace(/`(.*?)`/g, "$1")         // `code` → code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/#{1,6}\s*/g, "")         // headers
    .trim();
}

/** Parse memory file content into clean bullet entries */
function parseMemoryContent(raw: string): string[] {
  const lines = raw.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  const entries: string[] = [];
  for (const line of lines) {
    const cleaned = stripMarkdown(line.replace(/^[-*•]\s*/, "").trim());
    if (cleaned.length > 10) {
      entries.push(cleaned.length > 160 ? cleaned.slice(0, 157) + "…" : cleaned);
    }
  }
  return entries.slice(0, 5); // max 5 entries per day
}

export default function RecentContext() {
  const [contexts, setContexts] = useState<ContextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContext();
  }, []);

  async function fetchContext() {
    setLoading(true);
    try {
      const res = await fetch("/api/context");
      if (res.ok) {
        const data = await res.json();
        const items: ContextItem[] = (data.contexts || []).map((c: any) => {
          const date = new Date(c.date + "T12:00:00");
          const now = new Date();
          const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          );

          let label: string;
          if (diffDays === 0) label = "Today";
          else if (diffDays === 1) label = "Yesterday";
          else
            label = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

          return {
            date: c.date,
            label,
            entries: parseMemoryContent(c.preview || c.content || ""),
          };
        });
        setContexts(items);
      } else {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch context:", err);
      setError(err.message || "Failed to load context");
    } finally {
      setLoading(false);
    }
  }

  // Consistent card shell
  const Shell = ({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) => (
    <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Recent Context
        </h2>
        {extra}
      </div>
      {children}
    </section>
  );

  if (loading) {
    return (
      <Shell>
        <div className="space-y-3 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-16 bg-gray-800 rounded mb-2" />
              <div className="h-3 w-full bg-gray-800 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="text-red-400 text-sm flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      extra={
        <button
          onClick={fetchContext}
          className="text-gray-500 hover:text-gray-300 p-1 rounded transition-colors"
          aria-label="Refresh context"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      }
    >
      {/* Table layout */}
      <div className="overflow-hidden rounded-md border border-gray-800 flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/60 text-gray-400 text-xs uppercase tracking-wider">
              <th className="text-left px-3 py-2 w-24">Date</th>
              <th className="text-left px-3 py-2">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {contexts.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-gray-500">
                  <FileText className="w-5 h-5 mx-auto mb-1 opacity-40" />
                  No memory logs yet
                </td>
              </tr>
            ) : (
              contexts.map((item) => (
                <tr
                  key={item.date}
                  className="hover:bg-gray-800/30 transition-colors align-top"
                >
                  <td className="px-3 py-2.5">
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${item.label === "Today"
                        ? "bg-purple-500/20 text-purple-300"
                        : item.label === "Yesterday"
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-gray-700/50 text-gray-400"
                      }`}>
                      {item.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <ul className="space-y-1">
                      {item.entries.map((entry, i) => (
                        <li
                          key={i}
                          className="text-gray-300 text-xs leading-relaxed flex gap-1.5"
                        >
                          <span className="text-gray-600 select-none mt-0.5">•</span>
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}