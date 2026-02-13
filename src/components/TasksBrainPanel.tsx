"use client";

import { useState, useEffect, useMemo } from "react";

interface Task {
  id: string;
  section: string;
  text: string;
  checked: boolean;
  children: { id: string; section: string; text: string; checked: boolean; parentId: string }[];
}

export default function TasksBrainPanel() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brain/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);

  const toggleTask = async (task: Task) => {
    const newChecked = !task.checked;
    try {
      await fetch('/api/brain/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [{ id: task.id, checked: newChecked }] }),
      });
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChild = async (parentId: string, child: any) => {
    const newChecked = !child.checked;
    try {
      await fetch('/api/brain/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [{ id: child.id, checked: newChecked }] }),
      });
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // Compute progress stats
  const stats = useMemo(() => {
    let total = 0, completed = 0;
    for (const sec of tasks) {
      total += 1 + sec.children.length;
      completed += (sec.checked ? 1 : 0) + (sec.children.filter(c => c.checked).length);
    }
    return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
  }, [tasks]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        {tasks.length > 0 && (
          <div className="text-sm text-gray-400">
            {stats.completed} / {stats.total} ({stats.percent}%)
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500">No tasks found in TASKS.md.</div>
      ) : (
        <div className="space-y-4">
          {tasks.map(section => (
            <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">{section.section}</h3>
              <ul className="space-y-2">
                {section.children.length === 0 ? (
                  <li className="flex items-start">
                    <input
                      type="checkbox"
                      checked={section.checked}
                      onChange={() => toggleTask(section)}
                      className="mt-1 mr-3 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-offset-gray-900"
                    />
                    <span className={section.checked ? 'line-through text-gray-500' : 'text-gray-300'}>
                      {section.text}
                    </span>
                  </li>
                ) : (
                  <>
                    <li className="flex items-start">
                      <input
                        type="checkbox"
                        checked={section.checked}
                        onChange={() => toggleTask(section)}
                        className="mt-1 mr-3 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-offset-gray-900"
                      />
                      <span className={section.checked ? 'line-through text-gray-500' : 'text-gray-300'}>
                        {section.text}
                      </span>
                    </li>
                    {section.children.map(child => (
                      <li key={child.id} className="ml-7 flex items-start">
                        <input
                          type="checkbox"
                          checked={child.checked}
                          onChange={() => toggleChild(section.id, child)}
                          className="mt-1 mr-3 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-offset-gray-900"
                        />
                        <span className={child.checked ? 'line-through text-gray-500' : 'text-gray-300'}>
                          {child.text}
                        </span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
