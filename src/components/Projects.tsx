"use client";

import { useState, useEffect } from "react";
import { Activity, ExternalLink, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { ErrorState } from "@/components/ui/EmptyState";

interface Project {
  name: string;
  status: string;
  href?: string;
}

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        // Transform API data to component format
        const transformed: Project[] = data.projects.map((p: any) => ({
          name: p.name,
          status: p.status === "Completed" ? "Shipped" : p.status,
          href: p.href || (p.name === "THE ATLAS" ? "/" : undefined)
        }));
        setProjects(transformed);
      } else {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case "active":
      case "in progress":
        return "bg-yellow-900 text-yellow-300";
      case "shipped":
      case "completed":
        return "bg-green-900 text-green-300";
      case "maintenance":
        return "bg-blue-900 text-blue-300";
      case "static site":
        return "bg-teal-900 text-teal-300";
      default:
        return "bg-gray-900 text-gray-300";
    }
  }

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-xl p-5" aria-label="Projects" aria-busy="true">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-green-400" aria-hidden="true" />
          <span>Projects</span>
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <SkeletonLoader variant="text" width="60%" height={14} />
              <SkeletonLoader variant="text" width={60} height={20} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-900 rounded-xl p-5" role="alert" aria-live="polite">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-green-400" aria-hidden="true" />
          <span>Projects</span>
        </h2>
        <ErrorState message={error} onRetry={fetchProjects} />
      </section>
    );
  }

  return (
    <section className="bg-gray-900 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Activity className="text-green-400" aria-hidden="true" />
          <span>Projects</span>
        </h2>
        <button
          onClick={fetchProjects}
          className="text-gray-500 hover:text-gray-300 p-1 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
          aria-label="Refresh projects"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <ul className="space-y-3">
        {projects.map((proj) => (
          <li key={proj.name} className="flex items-center justify-between">
            {proj.href ? (
              <a
                href={proj.href}
                className="flex items-center gap-2 text-blue-300 hover:text-teal-300 transition-colors flex-1"
              >
                <span>{proj.name}</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-gray-200">{proj.name}</span>
            )}
            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(proj.status)}`}>
              {proj.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}