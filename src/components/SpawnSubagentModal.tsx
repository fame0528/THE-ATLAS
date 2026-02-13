"use client";

import { useState } from "react";
import { X, Play, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  defaultPriority: string;
}

interface SpawnSubagentModalProps {
  profiles: Profile[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function SpawnSubagentModal({ profiles, onClose, onSuccess }: SpawnSubagentModalProps) {
  const [profileId, setProfileId] = useState<string>("");
  const [label, setLabel] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId || !taskDescription) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subagents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          label: label || profiles.find(p => p.id === profileId)?.name,
          taskDescription,
          priority: "NORMAL"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to spawn subagent");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Spawn Orchestrated Agent
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Agent Profile <span className="text-red-400">*</span>
            </label>
            <select
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a profile...</option>
              {profiles.map(profile => (
                <option key={profile.id} value={profile.id}>
                  {profile.icon} {profile.name} — {profile.role}
                </option>
              ))}
            </select>
          </div>

          {/* Name Override */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Agent Name (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Custom name (defaults to profile name)"
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Task Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the task for the subagent..."
              rows={4}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded text-sm flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Spawning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Spawn Agent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
