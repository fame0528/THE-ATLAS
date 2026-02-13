"use client";

import { ListTodo } from "lucide-react";

export default function TaskQueue() {
  return (
    <section className="bg-gray-900 rounded-xl p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ListTodo className="text-orange-400" />
        Tasks (Subagent Queue)
      </h2>
      <p className="text-gray-400 text-sm">Queue cleared. No pending tasks.</p>
      <p className="text-gray-500 text-xs mt-2">All subagent results delivered.</p>
    </section>
  );
}