"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Heart,
    RefreshCw,
    Play,
    AlertCircle,
    CheckCircle2,
    Clock,
    Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AgentHealth {
    id: string;
    name: string;
    icon: string;
    role: string;
    priority: string;
    status: "active" | "idle" | "stale" | "error";
    sessionsCompleted: number;
    sessionsFailed: number;
    totalSessions: number;
    lastActivity: string | null;
    currentTask: string | null;
}

export default function AgentHealthPanel() {
    const toast = useToast();
    const [agents, setAgents] = useState<AgentHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [spawning, setSpawning] = useState<string | null>(null);

    const fetchHealth = useCallback(async () => {
        try {
            const res = await fetch("/api/subagents");
            if (!res.ok) throw new Error(`Failed: ${res.status}`);
            const data = await res.json();

            const profiles = data.profiles || [];
            const activeInstances = data.activeInstances || [];
            const memoryStats = data.memoryStats || {};

            const health: AgentHealth[] = profiles.map((p: any) => {
                const mem = memoryStats[p.id] || { totalSessions: 0, stats: {} };
                const active = activeInstances.find((i: any) => i.profileId === p.id);
                const isStale = active?.isStale === true;

                let status: AgentHealth["status"] = "idle";
                if (active && active.status === "FAILED") status = "error";
                else if (isStale) status = "stale";
                else if (active) status = "active";

                return {
                    id: p.id,
                    name: p.name,
                    icon: p.icon || "🤖",
                    role: p.role,
                    priority: p.defaultPriority,
                    status,
                    sessionsCompleted: mem.stats?.completed || 0,
                    sessionsFailed: mem.stats?.failed || 0,
                    totalSessions: mem.totalSessions || 0,
                    lastActivity: mem.lastHeartbeat || active?.startedAt || null,
                    currentTask: active?.description || active?.currentStep || null,
                };
            });

            setAgents(health);
        } catch (err) {
            console.error("Failed to fetch agent health:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 15000);
        return () => clearInterval(interval);
    }, [fetchHealth]);

    const wakeAgent = useCallback(
        async (agent: AgentHealth) => {
            setSpawning(agent.id);
            try {
                const res = await fetch("/api/subagents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        profileId: agent.id,
                        taskDescription: `Routine check-in for ${agent.name}. Review pending tasks, check system status, and report any issues.`,
                        label: `${agent.name} Wake (${new Date().toLocaleTimeString()})`,
                    }),
                });
                if (res.ok) {
                    toast.addToast({ type: "success", title: `${agent.name} woken`, message: "Agent spawned successfully" });
                    setTimeout(fetchHealth, 2000);
                } else {
                    const data = await res.json();
                    toast.addToast({ type: "error", title: `Failed to wake ${agent.name}`, message: data.error });
                }
            } catch (err: any) {
                toast.addToast({ type: "error", title: "Network error", message: err.message });
            } finally {
                setSpawning(null);
            }
        },
        [fetchHealth, toast]
    );

    const formatTimeAgo = (dateStr: string | null): string => {
        if (!dateStr) return "never";
        const ms = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(ms / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const statusConfig: Record<AgentHealth["status"], { dot: string; label: string; bg: string; border: string }> = {
        active: { dot: "bg-green-400", label: "Active", bg: "bg-green-900/15", border: "border-green-700/40" },
        idle: { dot: "bg-gray-500", label: "Idle", bg: "bg-gray-800/40", border: "border-gray-700/40" },
        stale: { dot: "bg-orange-400", label: "Stale", bg: "bg-orange-900/15", border: "border-orange-700/40" },
        error: { dot: "bg-red-400", label: "Error", bg: "bg-red-900/15", border: "border-red-700/40" },
    };

    // Summary counts
    const activeCount = agents.filter((a) => a.status === "active").length;
    const idleCount = agents.filter((a) => a.status === "idle").length;
    const staleCount = agents.filter((a) => a.status === "stale").length;
    const errorCount = agents.filter((a) => a.status === "error").length;

    if (loading) {
        return (
            <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Agent Health
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-gray-800/50 rounded-md animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Agent Health
                </h2>
                <div className="flex items-center gap-3">
                    {/* Summary badges */}
                    <div className="flex items-center gap-2 text-[11px]">
                        {activeCount > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-900/30 text-green-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                {activeCount}
                            </span>
                        )}
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                            {idleCount}
                        </span>
                        {staleCount > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-900/30 text-orange-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                {staleCount}
                            </span>
                        )}
                        {errorCount > 0 && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-900/30 text-red-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {errorCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={fetchHealth}
                        className="p-1 text-gray-500 hover:text-rose-400 rounded transition-colors"
                        title="Refresh health"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Agent Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {agents.map((agent) => {
                    const cfg = statusConfig[agent.status];
                    return (
                        <div
                            key={agent.id}
                            className={`rounded-md px-3 py-2.5 border transition-colors ${cfg.bg} ${cfg.border}`}
                        >
                            {/* Top row: icon + name + status dot */}
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-lg shrink-0">{agent.icon}</span>
                                    <span className="text-sm font-medium text-gray-100 truncate">{agent.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`w-2 h-2 rounded-full ${cfg.dot} shadow-[0_0_4px] shadow-current`} />
                                    <span className="text-[10px] text-gray-400 uppercase">{cfg.label}</span>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-1.5">
                                <span className="flex items-center gap-1" title="Completed">
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                    {agent.sessionsCompleted}
                                </span>
                                {agent.sessionsFailed > 0 && (
                                    <span className="flex items-center gap-1 text-red-400" title="Failed">
                                        <AlertCircle className="w-3 h-3" />
                                        {agent.sessionsFailed}
                                    </span>
                                )}
                                <span className="flex items-center gap-1" title="Last activity">
                                    <Clock className="w-3 h-3" />
                                    {formatTimeAgo(agent.lastActivity)}
                                </span>
                            </div>

                            {/* Current task or wake button */}
                            {agent.currentTask ? (
                                <p className="text-[11px] text-gray-300 truncate" title={agent.currentTask}>
                                    ⚡ {agent.currentTask}
                                </p>
                            ) : (
                                <button
                                    onClick={() => wakeAgent(agent)}
                                    disabled={spawning === agent.id || agent.status === "active"}
                                    className="text-[11px] flex items-center gap-1 text-gray-500 hover:text-rose-300 disabled:opacity-40 disabled:cursor-default transition-colors"
                                    title={agent.status === "active" ? "Already active" : `Wake ${agent.name}`}
                                >
                                    {spawning === agent.id ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <Play className="w-3 h-3" />
                                    )}
                                    {spawning === agent.id ? "Spawning…" : "Wake agent"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
