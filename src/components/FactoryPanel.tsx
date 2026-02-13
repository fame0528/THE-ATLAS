"use client";

import { useState, useEffect } from "react";

interface FactoryState {
  agent_type: string;
  channel_id: string;
  last_message_id?: string;
  last_output_preview?: string;
  last_run_at?: string;
  status?: string;
  error_message?: string;
}

export default function FactoryPanel() {
  const [state, setState] = useState<FactoryState[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string>('');
  const [configStatus, setConfigStatus] = useState<{hasDiscord: boolean, researchChannel?: string, briefChannel?: string} | null>(null);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/system/config/status');
      const data = await res.json();
      if (data.ok) setConfigStatus(data.config);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => { 
    loadState();
    loadConfig();
  }, []);

  const runResearch = async () => {
    setRunning(true);
    setLog('Starting research agent...');
    try {
      const researchRes = await fetch('/api/factory/research/run', { method: 'POST' });
      if (!researchRes.ok) {
        const err = await researchRes.json();
        throw new Error(err.error || 'Research failed');
      }
      setLog('Research complete!');
      setTimeout(loadState, 1000);
    } catch (e: any) {
      setLog(`Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Content Factory</h2>
      
      {configStatus && (!configStatus.hasDiscord || !configStatus.researchChannel) && (
        <div className="bg-yellow-900 border border-yellow-700 text-yellow-100 p-3 rounded mb-4 text-sm">
          ⚠️ Discord integration not fully configured. {!configStatus.hasDiscord && 'Missing Discord token. '}
          {!configStatus.researchChannel && 'Missing research channel ID. '}
          Set DISCORD_RESEARCH_CHANNEL_ID in environment or openclaw.json to enable auto-posting.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button 
          onClick={runResearch} 
          disabled={running}
          className={`${running ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} px-3 py-1 rounded text-sm`}
        >
          {running ? 'Running...' : 'Run Research'}
        </button>
        <button 
          onClick={loadState}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>
      {log && <div className="text-sm text-gray-300 mb-4">{log}</div>}
      {loading ? (
        <div className="text-gray-500">Loading factory state...</div>
      ) : state.length === 0 ? (
        <div className="text-gray-500">No factory agents configured yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {state.map(agent => (
            <div key={agent.agent_type} className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-lg font-semibold capitalize mb-2">{agent.agent_type} Agent</h3>
              <div className="text-sm text-gray-400 mb-1">Status: <span className={agent.status === 'idle' ? 'text-green-400' : agent.status === 'running' ? 'text-yellow-400' : agent.status === 'error' ? 'text-red-400' : 'text-gray-400'}>{agent.status || 'unknown'}</span></div>
              <div className="text-sm text-gray-400 mb-1">Last run: {agent.last_run_at ? new Date(agent.last_run_at).toLocaleString() : 'never'}</div>
              <div className="text-sm text-gray-400 mb-2 truncate" title={agent.last_output_preview || ''}>Preview: {(() => {
                try {
                  const parsed = agent.last_output_preview ? JSON.parse(agent.last_output_preview) : null;
                  if (parsed?.stories) return `Last: ${parsed.stories.length} stories`;
                  if (parsed?.script_preview) return `Script: ${parsed.script_preview.substring(0, 60)}...`;
                } catch {}
                return agent.last_output_preview || 'No output yet';
              })()}</div>
              {agent.error_message && <div className="text-red-400 text-sm mb-2">Error: {agent.error_message}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
