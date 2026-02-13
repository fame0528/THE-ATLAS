"use client";

import { useState, useEffect } from "react";

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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tasks (TASKS.md)</h2>
      {loading ? (
        <div className="text-gray-500">Loading tasks...</div>
      ) : (
        <div className="space-y-6">
          {tasks.map(section => (
            <div key={section.id}>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">{section.section}</h3>
              <ul className="space-y-1">
                {section.children.length === 0 ? (
                  <li className="flex items-center">
                    <input
                      type="checkbox"
                      checked={section.checked}
                      onChange={() => toggleTask(section)}
                      className="mr-2"
                    />
                    <span className={section.checked ? 'line-through text-gray-500' : 'text-gray-200'}>{section.text}</span>
                  </li>
                ) : (
                  <>
                    <li className="flex items-center">
                      <input
                        type="checkbox"
                        checked={section.checked}
                        onChange={() => toggleTask(section)}
                        className="mr-2"
                      />
                      <span className={section.checked ? 'line-through text-gray-500' : 'text-gray-200'}>{section.text}</span>
                    </li>
                    {section.children.map(child => (
                      <li key={child.id} className="ml-6 flex items-center">
                        <input
                          type="checkbox"
                          checked={child.checked}
                          onChange={() => toggleChild(section.id, child)}
                          className="mr-2"
                        />
                        <span className={child.checked ? 'line-through text-gray-500' : 'text-gray-200'}>{child.text}</span>
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
