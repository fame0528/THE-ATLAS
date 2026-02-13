"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Activity,
    HardDrive,
    AlertTriangle,
    RefreshCw,
    BarChart3,
    Layers,
} from "lucide-react";

interface Metrics {
    gateway: { status: string; pid: number | null; uptime: string | null };
    dashboard: { status: string };
    sessions: { active: number; total: number; stale: number };
    queue: { pending: number; running: number; completed: number; failed: number };
    memory: { logCount: number; latestLog: string | null; alertCount: number };
    context: { usage: string; percentage: number };
    lastUpdated: string;
}

interface Alert {
    timestamp: string;
    severity: string;
    message: string;
}

export default function SystemMetrics() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAlerts, setShowAlerts] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [metricsRes, alertsRes] = await Promise.all([
                fetch("/api/system/metrics"),
                fetch("/api/system/alerts"),
            ]);

            if (metricsRes.ok) setMetrics(await metricsRes.json());
            if (alertsRes.ok) {
                const data = await alertsRes.json();
                setAlerts(data.alerts || []);
            }
        } catch (err) {
            console.error("Failed to fetch metrics:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, [fetchAll]);

    if (loading) {
        return (
            <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    System Metrics
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="h-[76px] bg-gray-800/50 rounded-md animate-pulse" />
                    <div className="h-[76px] bg-gray-800/50 rounded-md animate-pulse" />
                    <div className="h-[76px] bg-gray-800/50 rounded-md animate-pulse" />
                    <div className="h-[76px] bg-gray-800/50 rounded-md animate-pulse" />
                </div>
            </section>
        );
    }

    const statusDotColor = (status: string) =>
        status === "running"
            ? "bg-green-400 shadow-[0_0_6px] shadow-green-400/50"
            : status === "down"
                ? "bg-red-400 shadow-[0_0_6px] shadow-red-400/50"
                : "bg-yellow-400 shadow-[0_0_6px] shadow-yellow-400/50";

    const ctxPct = metrics?.context?.percentage ?? 0;
    const ctxBarColor =
        ctxPct > 80
            ? "bg-gradient-to-r from-red-500 to-red-400"
            : ctxPct > 50
                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                : "bg-gradient-to-r from-cyan-500 to-blue-400";

    return (
        <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    System Metrics
                </h2>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${statusDotColor(metrics?.gateway.status || "unknown")}`} />
                            Gateway
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className={`inline-block w-2 h-2 rounded-full ${statusDotColor(metrics?.dashboard.status || "unknown")}`} />
                            Dashboard
                        </span>
                    </div>
                    <button
                        onClick={fetchAll}
                        className="p-1 text-gray-500 hover:text-cyan-400 rounded transition-colors"
                        title="Refresh metrics"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 4-Column Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }} className="mb-4">
                {/* Active Sessions */}
                <div className="bg-gray-800/50 rounded-md px-3 py-2.5 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">Active Sessions</span>
                    </div>
                    <div className="text-xl font-bold text-gray-100">{metrics?.sessions.active ?? 0}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                        {metrics?.sessions.total ?? 0} total
                        {(metrics?.sessions.stale ?? 0) > 0 && ` · ${metrics?.sessions.stale} stale`}
                    </div>
                </div>

                {/* Queue Depth */}
                <div className="bg-gray-800/50 rounded-md px-3 py-2.5 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">Queue Depth</span>
                    </div>
                    <div className="text-xl font-bold text-gray-100">{metrics?.queue.pending ?? 0}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                        {metrics?.queue.running ?? 0} running · {metrics?.queue.completed ?? 0} done
                    </div>
                </div>

                {/* Memory Logs */}
                <div className="bg-gray-800/50 rounded-md px-3 py-2.5 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">Memory Logs</span>
                    </div>
                    <div className="text-xl font-bold text-gray-100">{metrics?.memory.logCount ?? 0}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                        {metrics?.memory.latestLog ? `Latest: ${metrics.memory.latestLog.replace(".md", "")}` : "No logs"}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-gray-800/50 rounded-md px-3 py-2.5 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-3.5 h-3.5 ${(metrics?.memory.alertCount ?? 0) > 5 ? "text-red-400" : "text-cyan-400"}`} />
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider">Alerts</span>
                    </div>
                    <div className="text-xl font-bold text-gray-100">{metrics?.memory.alertCount ?? 0}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                        {alerts.length > 0 ? `Last: ${alerts[0]?.severity}` : "All clear"}
                    </div>
                </div>
            </div>

            {/* Context Usage Bar */}
            {metrics?.context && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                        <span>Context Usage</span>
                        <span>{metrics.context.usage} ({metrics.context.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${ctxBarColor}`}
                            style={{ width: `${Math.max(ctxPct, 2)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Recent Alerts Expandable */}
            <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 pt-1"
            >
                <span>{showAlerts ? "▾" : "▸"}</span>
                <span>{showAlerts ? "Hide" : "Show"} recent alerts ({alerts.length})</span>
            </button>

            {showAlerts && alerts.length > 0 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {alerts.slice(0, 10).map((alert, i) => (
                        <div
                            key={i}
                            className={`text-[11px] px-2.5 py-1.5 rounded flex items-start gap-2 ${alert.severity === "CRITICAL"
                                    ? "bg-red-900/20 text-red-300"
                                    : alert.severity === "WARNING"
                                        ? "bg-yellow-900/20 text-yellow-300"
                                        : "bg-gray-800/50 text-gray-400"
                                }`}
                        >
                            <span className="shrink-0 opacity-60">
                                {new Date(alert.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                            <span>{alert.message}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Last updated */}
            <div className="text-[10px] text-gray-600 mt-2 text-right">
                Updated {new Date(metrics?.lastUpdated || "").toLocaleTimeString()}
            </div>
        </section>
    );
}
