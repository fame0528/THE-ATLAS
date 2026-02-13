"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Activity, Clock, MemoryStick, Zap, Bot, BookOpen, RefreshCw, Shield, Play, AlertTriangle, ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Settings, Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ErrorState } from "@/components/ui/EmptyState";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import SpawnSubagentModal from "./SpawnSubagentModal";

interface SubagentProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: { traits: string[]; communicationStyle: string };
  voice: null | string;
  memoryLayer: string;
  defaultPriority: string;
  icon: string;
}

interface ActiveInstance {
  id: string;
  profileId: string;
  name: string;
  role: string;
  description?: string;
  status: "RUNNING" | "PENDING" | "COMPLETED" | "FAILED";
  startedAt: string;
  elapsedMs: number;
  elapsed: string;
  lastHeartbeat: string | null;
  isStale: boolean;
  currentStep: string | null;
  progress: number;
  memoryLayer: string;
  error: string | null;
}

interface MemoryStats {
  totalSessions: number;
  stats: any;
  lastHeartbeat: string | null;
  currentStep: string | null;
  progress: number;
}

interface ActivityEntry {
  timestamp: string;
  taskId: string;
  profileId: string;
  action: 'spawned' | 'started' | 'heartbeat' | 'completed' | 'failed' | 'error';
  details: string;
  currentStep?: string;
  progress?: number;
  error?: string;
}

interface QueueHealth {
  totalTasks: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  oldestPending: string | null;
  maxConcurrent: number;
}

interface SubagentsResponse {
  profiles: SubagentProfile[];
  activeInstances: ActiveInstance[];
  memoryStats: Record<string, MemoryStats>;
  recentActivity: ActivityEntry[];
  queueHealth: QueueHealth;
  pendingOlderThan2min: Array<{ id: string; profileId: string; age: number }>;
  summary: { totalProfiles: number; activeCount: number };
}

export default function AgentsPanel() {
  const toast = useToast();
  const [data, setData] = useState<SubagentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(true);
  const [showActiveSessions, setShowActiveSessions] = useState(true);
  const pollInterval = 10000;

  // Quick Actions state (merged from QuickActions)
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [profiles, setProfiles] = useState<SubagentProfile[]>([]);
  const [gatewayRestarting, setGatewayRestarting] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [securityScanning, setSecurityScanning] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: "success" | "error" | "info" }>>([]);

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    async function fetchData() {
      if (!mounted) return;
      try {
        const res = await fetch("/api/subagents", { signal: AbortSignal.timeout(15000) });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        if (mounted) {
          setData(json);
          setError(null);
          retryCount = 0;
        }
      } catch (err: any) {
        console.error("Failed to fetch subagents:", err);
        if (mounted) {
          setError(err.message || "Failed to load agents");
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchData, 2000 * retryCount);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, pollInterval);
    return () => { mounted = false; clearInterval(interval); };
  }, [pollInterval]);

  const getInitials = useCallback((name: string): string => {
    return name.split(" ").map(part => part[0]).join("").toUpperCase().slice(0, 2);
  }, []);

  const profileIcon = useCallback((profileId: string): string => {
    const icons: Record<string, string> = {
      'researcher': '🔬', 'coder': '💻', 'security': '🛡️', 'general': '🤖',
      'visionary': '💡', 'project-manager': '📋', 'optimizer': '⚡', 'growth-hacker': '💰',
      'writer': '✍️', 'designer': '🎨', 'analyst': '📊', 'community-manager': '🤝', 'qa-tester': '🔍'
    };
    return icons[profileId] || '•';
  }, []);

  const formatTimeAgo = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }, []);

  const formatElapsed = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case "RUNNING": return "bg-green-900/80 text-green-300 border border-green-700/50";
      case "PENDING": return "bg-yellow-900/80 text-yellow-300 border border-yellow-700/50";
      case "COMPLETED": return "bg-blue-900/80 text-blue-300 border border-blue-700/50";
      case "FAILED": return "bg-red-900/80 text-red-300 border border-red-700/50";
      default: return "bg-gray-800/80 text-gray-300 border border-gray-700/50";
    }
  }, []);

  const getActionColor = useCallback((action: string): string => {
    switch (action) {
      case 'completed': return 'text-green-400';
      case 'failed':
      case 'error': return 'text-red-400';
      case 'heartbeat': return 'text-blue-400';
      case 'spawned':
      case 'started': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  }, []);

  const clearActivityLog = useCallback(async () => {
    if (!confirm('Clear all activity logs?')) return;
    try {
      const res = await fetch('/api/subagents/clear-log', { method: 'POST' });
      if (res.ok) {
        toast.addToast({ type: 'success', title: 'Activity log cleared' });
        window.location.reload();
      } else {
        toast.addToast({ type: 'error', title: 'Failed to clear log' });
      }
    } catch {
      toast.addToast({ type: 'error', title: 'Network error' });
    }
  }, [toast]);

  const retryFailedTask = useCallback(async (instance: ActiveInstance) => {
    if (!confirm(`Retry failed task: ${instance.description || instance.name}?`)) return;
    try {
      const res = await fetch('/api/subagents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: instance.profileId,
          taskDescription: instance.description || 'Retry failed task',
          label: `${instance.name} (retry)`
        })
      });
      if (res.ok) {
        toast.addToast({ type: 'success', title: 'Task retried', message: 'The agent will be spawned again.' });
        window.location.reload();
      } else {
        toast.addToast({ type: 'error', title: 'Retry failed' });
      }
    } catch {
      toast.addToast({ type: 'error', title: 'Error retrying task' });
    }
  }, [toast]);

  // Quick Actions: fetch profiles on modal open
  useEffect(() => {
    if (showSpawnModal) {
      fetchProfiles();
    }
  }, [showSpawnModal]);

  async function fetchProfiles() {
    try {
      const res = await fetch("/api/subagents");
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      } else {
        console.error("Failed to fetch profiles:", res.status);
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  }

  function addNotification(message: string, type: "success" | "error" | "info" = "info") {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }

  async function handleMoltbookBrowse() {
    setBrowsing(true);
    try {
      const researcher = profiles.find(p => p.id === "researcher") || profiles[0];
      if (!researcher) {
        throw new Error("No suitable profile found for browsing");
      }

      const res = await fetch("/api/subagents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: researcher.id,
          taskDescription: "Browse Moltbook hot posts, summarize trending topics, and provide insights on what's happening in the community. Check recent posts, upvote interesting content, and engage if appropriate.",
          label: `Moltbook Browse (${new Date().toLocaleTimeString()})`,
          priority: "HIGH"
        })
      });

      const data = await res.json();
      if (res.ok) {
        addNotification(`${researcher.name} spawned to browse Moltbook`, "success");
      } else {
        throw new Error(data.error || "Failed to spawn browsing agent");
      }
    } catch (err: any) {
      addNotification(`Moltbook browse failed: ${err.message}`, "error");
    } finally {
      setBrowsing(false);
    }
  }

  async function handleSecurityScan() {
    setSecurityScanning(true);
    try {
      const res = await fetch("/api/security/scan", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.scanComplete) {
        addNotification(`Security scan complete: ${data.summary.threatsDetected} threats, ${data.summary.warnings} warnings`, "success");
      } else if (data.error) {
        throw new Error(data.error || "Security scan failed");
      }
    } catch (err: any) {
      addNotification(`Security scan failed: ${err.message}`, "error");
    } finally {
      setSecurityScanning(false);
    }
  }

  async function handleCheckSecurityStatus() {
    try {
      const res = await fetch("/api/security/scan");
      const data = await res.json();
      addNotification(data.message, data.driftInstalled ? "success" : "info");
    } catch (err: any) {
      addNotification(`Security status check failed: ${err.message}`, "error");
    }
  }

  async function handleRestartGateway() {
    if (!confirm("Are you sure you want to restart the gateway? This may interrupt ongoing operations.")) {
      return;
    }

    setGatewayRestarting(true);
    try {
      const res = await fetch("/api/gateway/restart", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        addNotification("Gateway restart initiated", "success");
        setTimeout(() => {
          if (confirm("Gateway should be restarting. Refresh the dashboard?")) {
            window.location.reload();
          }
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to restart gateway");
      }
    } catch (err: any) {
      addNotification(`Gateway restart failed: ${err.message}`, "error");
    } finally {
      setGatewayRestarting(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm" aria-label="Agents" aria-busy="true">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-purple-400" aria-hidden="true" />
          <span>THE ATLAS Agents</span>
        </h2>
        <div className="space-y-4">
          <SkeletonLoader variant="text" width="60%" height={20} className="mb-4" />
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <SkeletonLoader variant="circular" width={48} height={48} />
                <div className="flex-1">
                  <SkeletonLoader variant="text" width="50%" height={16} className="mb-2" />
                  <SkeletonLoader variant="text" width="30%" height={12} />
                </div>
              </div>
              <div className="space-y-2">
                <SkeletonLoader variant="text" width="80%" height={14} />
                <SkeletonLoader variant="text" width="60%" height={14} />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm" role="alert" aria-live="assertive">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-purple-400" aria-hidden="true" />
          <span>THE ATLAS Agents</span>
        </h2>
        <ErrorState message={`Error loading agents: ${error}`} onRetry={() => window.location.reload()} />
      </section>
    );
  }

  const recentActivity = data?.recentActivity || [];
  const queueHealth = data?.queueHealth;

  return (
    <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm" aria-label="Agents">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="text-purple-400" aria-hidden="true" />
          <span>THE ATLAS</span>
          {data && <span className="text-xs font-normal text-gray-500 ml-2">({data.summary.activeCount} active)</span>}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSpawnModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
            <Bot className="w-4 h-4" /> Spawn Agent
          </button>
        </div>
      </div>

      {/* Quick Actions Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={handleMoltbookBrowse} disabled={browsing} className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors disabled:opacity-50" title="Browse Moltbook">
          <BookOpen className="w-3 h-3 text-blue-400" /> Moltbook
        </button>
        <button onClick={handleSecurityScan} disabled={securityScanning} className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors disabled:opacity-50" title="Run Security Scan">
          <Shield className="w-3 h-3 text-green-400" /> Security Scan
        </button>
        <button onClick={handleCheckSecurityStatus} className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors" title="Check Security Status">
          <AlertTriangle className="w-3 h-3 text-yellow-400" /> Security Status
        </button>
        <button onClick={handleRestartGateway} disabled={gatewayRestarting} className="flex items-center gap-1 px-2 py-1 bg-red-900/50 hover:bg-red-800/50 rounded text-xs text-red-300 transition-colors disabled:opacity-50" title="Restart Gateway">
          <RefreshCw className={`w-3 h-3 ${gatewayRestarting ? 'animate-spin' : ''}`} /> Restart
        </button>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-4 space-y-1">
          {notifications.map((note) => (
            <div key={note.id} className={`text-xs p-2 rounded ${note.type === "success" ? "bg-green-900/30 text-green-300" :
              note.type === "error" ? "bg-red-900/30 text-red-300" :
                "bg-blue-900/30 text-blue-300"
              }`}>
              {note.type === "success" ? "✓ " : note.type === "error" ? "✗ " : "• "}{note.message}
            </div>
          ))}
        </div>
      )}

      {/* Queue Status Bar */}
      {queueHealth && (
        <div className="mb-6 p-4 bg-gray-800/70 rounded-lg border border-gray-700" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-gray-400 font-medium">Queue:</span>
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1 ${queueHealth.running >= queueHealth.maxConcurrent ? "text-red-400" : "text-green-400"}`}>
                  <Activity className="w-3 h-3" aria-hidden="true" />
                  {queueHealth.running}/{queueHealth.maxConcurrent} running
                </span>
                <span className="text-yellow-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {queueHealth.pending} pending
                </span>
                <span className="text-blue-400">{queueHealth.completed} completed</span>
              </div>
            </div>
            {queueHealth.oldestPending && (
              <div className="text-gray-500 text-sm" aria-label="Oldest pending task">
                Oldest: {formatTimeAgo(queueHealth.oldestPending)}
              </div>
            )}
          </div>
          {data?.pendingOlderThan2min && data.pendingOlderThan2min.length > 0 && (
            <div className="mt-3 text-sm text-orange-400 flex items-center gap-2" role="alert">
              <Clock className="w-4 h-4" aria-hidden="true" />
              {data.pendingOlderThan2min.length} task(s) waiting &gt;2min (no worker available)
            </div>
          )}
        </div>
      )}

      {/* Active Instances — collapsible, hidden when empty */}
      {data && data.activeInstances.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowActiveSessions(!showActiveSessions)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mb-3"
            aria-expanded={showActiveSessions}
          >
            {showActiveSessions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Active Sessions
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-900/40 text-green-300">{data.activeInstances.length}</span>
          </button>
          {showActiveSessions && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.activeInstances.map((instance) => {
                const profile = data.profiles.find(p => p.id === instance.profileId) || data.profiles[0];
                const memStats = data.memoryStats[instance.profileId] || { totalSessions: 0, stats: {} };
                return (
                  <div key={instance.id} className={`bg-gray-800/60 rounded-lg p-4 border transition-all duration-300 ${instance.isStale ? 'border-orange-500/50 ring-1 ring-orange-500/30' : 'border-gray-700 hover:border-gray-600'}`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-purple-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0" title={profile.name}>
                          {getInitials(instance.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-100 truncate">{instance.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(instance.status)}`}>{instance.status.toLowerCase()}</span>
                            {instance.isStale && <span className="text-xs px-2 py-0.5 rounded bg-orange-900/80 text-orange-300 border border-orange-700/50">stale (&gt;2min)</span>}
                            {instance.currentStep && instance.status === 'RUNNING' && <span className="text-xs text-gray-400 italic truncate max-w-[200px]" title={instance.currentStep}>{instance.currentStep}</span>}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{instance.role}</p>
                          {instance.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{instance.description}</p>}
                          {instance.status === 'FAILED' && instance.error && <div className="mt-2 p-2 bg-red-900/30 border border-red-800/50 rounded text-xs text-red-300">Error: {instance.error}</div>}
                          {instance.status === 'RUNNING' && instance.progress !== undefined && (
                            <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(instance.progress, 100)}%` }} role="progressbar" aria-valuenow={instance.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress: ${instance.progress}%`} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /><span>{formatElapsed(instance.elapsedMs)}</span></div>
                        {instance.lastHeartbeat && <div className={`flex items-center gap-1 ${instance.isStale ? 'text-orange-400' : 'text-green-400'}`}><Activity className="w-3 h-3" aria-hidden="true" /><span>{formatTimeAgo(instance.lastHeartbeat)}</span></div>}
                        <div className="flex items-center gap-1 mt-1"><MemoryStick className="w-3 h-3" aria-hidden="true" /><span>{memStats.totalSessions} sessions</span></div>
                        <div className="flex items-center gap-1"><Activity className="w-3 h-3" aria-hidden="true" /><span>{memStats.stats?.completed || 0} done</span></div>
                        {instance.status === 'FAILED' && <button onClick={() => retryFailedTask(instance)} className="mt-2 px-2 py-1 text-xs bg-blue-900 hover:bg-blue-800 text-blue-200 rounded transition-colors">Retry</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Activity Log */}
      {data && (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowActivityLog(!showActivityLog)} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors" aria-expanded={showActivityLog}>
              <Activity className="w-4 h-4" aria-hidden="true" /> Activity Log <span className="text-xs text-gray-500">({recentActivity.length} entries)</span> {showActivityLog ? '▼' : '▶'}
            </button>
            {recentActivity.length > 0 && <button onClick={clearActivityLog} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear Log</button>}
          </div>

          {showActivityLog && (
            <div className="space-y-2 max-h-80 overflow-y-auto" role="log" aria-live="polite">
              {recentActivity.length === 0 ? <p className="text-gray-500 text-sm italic">No activity yet</p> : recentActivity.map((entry, idx) => {
                const actionColor = getActionColor(entry.action);
                const borderColor = entry.action === 'completed' ? 'rgb(34, 197, 94, 0.5)' : entry.action === 'failed' || entry.action === 'error' ? 'rgb(239, 68, 68, 0.5)' : entry.action === 'heartbeat' ? 'rgb(59, 130, 246, 0.5)' : 'rgb(234, 179, 8, 0.5)';
                return (
                  <div key={`${entry.timestamp}-${idx}`} className="bg-gray-800/50 rounded-lg p-3 border-l-4 hover:bg-gray-800 transition-colors" style={{ borderLeftColor: borderColor }}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0" role="img" aria-label={`${entry.action} icon`}>{profileIcon(entry.profileId)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium text-sm ${actionColor}`}>{entry.action.toUpperCase()}</span>
                          <span className="text-xs text-gray-500 font-mono" title={entry.taskId}>ID: ...{entry.taskId.slice(-8)}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(entry.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 truncate">{entry.details}</p>
                        {entry.currentStep && <p className="text-xs text-gray-400 italic mt-1">• {entry.currentStep}</p>}
                        {entry.progress !== undefined && entry.progress > 0 && (
                          <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(entry.progress, 100)}%` }} />
                          </div>
                        )}
                        {entry.error && <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-300 font-mono break-all">{entry.error}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Agent Health + Profiles */}
      {data && (
        <div className="border-t border-gray-700/50 pt-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            Agent Health
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {data.profiles.map((profile) => {
              const memStats = data.memoryStats[profile.id] || { totalSessions: 0, stats: {} };
              const activeInstance = data.activeInstances.find(i => i.profileId === profile.id);
              const isStale = activeInstance?.isStale === true;
              const isFailed = activeInstance?.status === 'FAILED';
              const isActive = !!activeInstance && !isFailed;

              const statusDot = isFailed ? 'bg-red-400' : isStale ? 'bg-orange-400' : isActive ? 'bg-green-400' : 'bg-gray-600';
              const ringColor = isFailed ? 'ring-red-500/20' : isStale ? 'ring-orange-500/20' : isActive ? 'ring-green-500/20' : 'ring-gray-600/10';

              return (
                <div
                  key={profile.id}
                  className="rounded-xl bg-gray-800/40 hover:bg-gray-800/60 transition-all duration-300 flex flex-col items-center text-center w-full px-5 py-6"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)')}
                >
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-gray-700/50 ring-2 ${ringColor} mb-3`}>
                    <span className="text-xl" role="img" aria-label={profile.name}>{profile.icon}</span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${statusDot} ring-2 ring-gray-900`} />
                  </div>

                  <h4 className="text-xs font-semibold text-gray-200 truncate w-full mb-1">{profile.name}</h4>
                  <p className="text-[10px] text-gray-500 truncate w-full mb-3">{profile.role}</p>

                  <div className="flex items-center justify-center gap-2.5 text-[10px] text-gray-500 mb-4">
                    <span className="flex items-center gap-0.5" title="Completed">
                      <CheckCircle2 className="w-2.5 h-2.5 text-green-600" />
                      {memStats.stats?.completed || 0}
                    </span>
                    <span className="text-gray-700">·</span>
                    <span className="flex items-center gap-0.5" title="Sessions">
                      <MemoryStick className="w-2.5 h-2.5" />
                      {memStats.totalSessions}
                    </span>
                  </div>

                  <div className="mt-auto w-full">

                    {activeInstance?.description ? (
                      <div className="w-full px-2 py-1.5 bg-green-900/20 rounded-md">
                        <p className="text-[10px] text-green-300 truncate" title={activeInstance.description}>⚡ {activeInstance.currentStep || 'Running'}</p>
                      </div>
                    ) : !isActive ? (
                      <button
                        onClick={() => {
                          if (!confirm(`Wake ${profile.name}?`)) return;
                          fetch('/api/subagents', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              profileId: profile.id,
                              taskDescription: `Routine check-in for ${profile.name}. Review pending tasks and report status.`,
                              label: `${profile.name} Wake (${new Date().toLocaleTimeString()})`,
                            }),
                          }).then(r => {
                            if (r.ok) toast.addToast({ type: 'success', title: `${profile.name} woken` });
                            else toast.addToast({ type: 'error', title: 'Failed to wake agent' });
                          });
                        }}
                        className="w-full text-[10px] font-medium flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-700/60 hover:bg-purple-800/40 text-gray-400 hover:text-purple-300 rounded-md transition-all duration-200"
                        title={`Wake ${profile.name}`}
                      >
                        <Play className="w-3 h-3" />
                        Wake
                      </button>
                    ) : (
                      <div className="w-full px-2 py-1.5 bg-green-900/15 rounded-md text-center">
                        <span className="text-[10px] text-green-400/70">● Active</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showSpawnModal && (
        <SpawnSubagentModal
          profiles={profiles}
          onClose={() => setShowSpawnModal(false)}
          onSuccess={() => {
            addNotification("Agent spawned successfully", "success");
            setShowSpawnModal(false);
          }}
        />
      )}
    </section>
  );
}
