"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Bot,
  BookOpen,
  RefreshCw,
  Shield,
  Mail,
  CheckSquare,
  Play,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import SpawnSubagentModal from "./SpawnSubagentModal";

interface Profile {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  defaultPriority: string;
}

export default function QuickActions() {
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [gatewayRestarting, setGatewayRestarting] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [securityScanning, setSecurityScanning] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Fetch profiles when modal opens
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
      }
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  }

  function addNotification(message: string, type: "success" | "error" | "info" = "info") {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, `${type === "success" ? "✓" : type === "error" ? "✗" : "•"} ${message}`]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => !n.includes(id)));
    }, 5000);
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
        // Wait a bit and then refresh the page or show countdown
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

  async function handleMoltbookBrowse() {
    setBrowsing(true);
    try {
      // Find the researcher profile
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

  return (
    <section className="bg-gray-900 rounded-lg p-4 border border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Zap className="text-yellow-400" />
          Quick Actions
        </h2>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-4 space-y-1">
          {notifications.map((note, idx) => (
            <div key={idx} className={`text-xs p-2 rounded ${note.includes("✓") ? "bg-green-900/30 text-green-300" :
                note.includes("✗") ? "bg-red-900/30 text-red-300" :
                  "bg-blue-900/30 text-blue-300"
              }`}>
              {note}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => setShowSpawnModal(true)}
          className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-400" />
            Spawn Orchestrated Agent
          </div>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleMoltbookBrowse}
          disabled={browsing || profiles.length === 0}
          className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center justify-between transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Moltbook Browse Now
          </div>
          {browsing ? (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <div className="border-t border-gray-800 my-2" />

        <button
          onClick={handleSecurityScan}
          disabled={securityScanning}
          className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center justify-between transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            Run Security Scan
          </div>
          {securityScanning ? (
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={handleCheckSecurityStatus}
          className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Check Security Status
        </button>

        <div className="border-t border-gray-800 my-2" />

        <button
          onClick={handleRestartGateway}
          disabled={gatewayRestarting}
          className="w-full text-left px-3 py-2 bg-red-900/50 hover:bg-red-800/50 rounded text-sm text-red-200 flex items-center justify-between transition-colors disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Restart Gateway
          </div>
          {gatewayRestarting ? (
            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>→</span>
          )}
        </button>
      </div>

      {/* Spawn Modal */}
      {showSpawnModal && (
        <SpawnSubagentModal
          profiles={profiles}
          onClose={() => setShowSpawnModal(false)}
          onSuccess={() => {
            addNotification("Agent spawned successfully", "success");
          }}
        />
      )}
    </section>
  );
}
