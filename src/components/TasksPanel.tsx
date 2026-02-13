"use client";

import { useState, useEffect } from "react";
import { CheckSquare, Square, ChevronRight, ChevronDown, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

interface Task {
  id: string;
  section: string;
  text: string;
  checked: boolean;
  children?: Task[];
  parentId?: string;
}

interface TasksState {
  version: string;
  lastUpdated: string;
  tasks: Task[];
}

export default function TasksPanel() {
  const toast = useToast();
  const [state, setState] = useState<TasksState | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([
    "In Progress (Current Sprint)",
    "Backlog (Next)",
    "Recurring",
    "Proactive Exploration"
  ]));

  useEffect(() => {
    fetchState();
  }, []);

  async function fetchState() {
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      } else {
        console.error("Failed to fetch tasks:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(taskId: string, currentChecked: boolean) {
    setUpdating(taskId);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, checked: !currentChecked })
      });
      if (res.ok) {
        // Update local state optimistically
        setState(prev => prev ? { ...prev, lastUpdated: new Date().toISOString() } : prev);
        // Re-fetch to ensure consistency
        await fetchState();
        toast.addToast({
          type: 'success',
          title: 'Task updated',
          duration: 2000
        });
      } else {
        toast.addToast({
          type: 'error',
          title: 'Failed to update task'
        });
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
      toast.addToast({ type: 'error', title: 'Network error' });
    } finally {
      setUpdating(null);
    }
  }

  function toggleSection(section: string) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  function renderTask(task: Task, depth: number = 0) {
    const hasChildren = task.children && task.children.length > 0;
    const paddingLeft = depth * 16;

    return (
      <div key={task.id}>
        <div
          className="flex items-start gap-2 py-1.5 hover:bg-gray-800/50 rounded group focus-within:bg-gray-800/50"
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleSection(task.id)}
              className="mt-0.5 text-gray-500 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5"
              aria-label={expandedSections.has(task.id) ? 'Collapse subtasks' : 'Expand subtasks'}
            >
              {expandedSections.has(task.id) ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4 mt-0.5" />}

          <button
            onClick={() => toggleTask(task.id, task.checked)}
            disabled={updating === task.id}
            className="mt-0.5 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-0.5 disabled:opacity-50"
            aria-label={task.checked ? 'Mark task as incomplete' : 'Mark task as complete'}
          >
            {task.checked ? (
              <CheckSquare className="w-5 h-5 text-green-500" aria-hidden="true" />
            ) : (
              <Square className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <span className={`text-sm flex-1 ${task.checked ? "text-gray-500 line-through" : "text-gray-200"}`}>
            {task.text}
          </span>
        </div>

        {/* Render children if expanded */}
        {hasChildren && expandedSections.has(task.id) && (
          <div>
            {task.children!.map(child => renderTask(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm h-full flex flex-col" aria-label="Tasks" aria-busy="true">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckSquare className="text-indigo-400" aria-hidden="true" />
          <span>TASKS.md</span>
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <SkeletonLoader variant="text" width="40%" height={16} className="mb-2" />
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2 py-2">
                  <div className="w-5 h-5 rounded border-2 border-gray-700" />
                  <SkeletonLoader variant="text" width="80%" height={14} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!state) {
    return (
      <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm h-full flex flex-col" aria-label="Tasks">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <CheckSquare className="text-indigo-400" aria-hidden="true" />
          <span>TASKS.md</span>
        </h2>
        <EmptyState
          icon={<CheckSquare className="w-8 h-8 text-gray-500" />}
          title="Failed to Load Tasks"
          description="We couldn't load the tasks file. Please check that TASKS.md exists."
          action={
            <button
              onClick={fetchState}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg transition"
            >
              Retry
            </button>
          }
        />
      </section>
    );
  }

  // Group tasks by section
  const sections: Record<string, Task[]> = {};
  state.tasks.forEach(task => {
    if (!sections[task.section]) {
      sections[task.section] = [];
    }
    sections[task.section].push(task);
  });

  return (
    <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm h-full flex flex-col" aria-label="Tasks">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CheckSquare className="text-indigo-400" aria-hidden="true" />
          <span>TASKS.md</span>
        </h2>
        <button
          onClick={fetchState}
          disabled={updating !== null}
          className="text-gray-500 hover:text-gray-300 disabled:opacity-50 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Refresh tasks"
        >
          <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2" role="list" aria-label="Task list">
        {Object.entries(sections).map(([sectionName, tasks]) => (
          <div key={sectionName} role="listitem">
            <button
              onClick={() => toggleSection(sectionName)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-expanded={expandedSections.has(sectionName)}
            >
              {expandedSections.has(sectionName) ? (
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
              {sectionName}
              <span className="text-xs text-gray-500 font-normal">({tasks.length})</span>
            </button>
            {expandedSections.has(sectionName) && (
              <div className="ml-2 space-y-1" role="list">
                {tasks.map(task => renderTask(task, 0))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
        Last updated: {new Date(state.lastUpdated).toLocaleString()}
      </div>
    </section>
  );
}