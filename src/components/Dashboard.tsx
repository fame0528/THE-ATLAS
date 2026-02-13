"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { SettingsModal, useAppSettings } from "@/components/ui/SettingsModal";
import AgentsPanel from "@/components/AgentsPanel";
import OpportunitiesPanel from "@/components/OpportunitiesPanel";
import TasksPanel from "@/components/TasksPanel";
import RecentContext from "@/components/RecentContext";
import QuickActions from "@/components/QuickActions";
import SystemMetrics from "@/components/SystemMetrics";
import MemoriesPanel from "@/components/MemoriesPanel";
import DocumentsPanel from "@/components/DocumentsPanel";
import TasksBrainPanel from "@/components/TasksBrainPanel";
import BriefPanel from "@/components/BriefPanel";

export default function Dashboard() {
  const toast = useToast();
  const settings = useAppSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'memories' | 'documents' | 'tasks' | 'brief'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          {(['dashboard','memories','documents','tasks','brief'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t ${activeTab === tab ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <div className="ml-auto">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:text-gray-400"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            <SystemMetrics />
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", alignItems: "stretch" }}>
              <TasksPanel />
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <QuickActions />
                <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <RecentContext />
                </div>
              </div>
            </div>
            <AgentsPanel />
            <OpportunitiesPanel />
          </>
        )}

        {activeTab === 'memories' && <MemoriesPanel />}

        {activeTab === 'documents' && <DocumentsPanel />}

        {activeTab === 'tasks' && <TasksBrainPanel />}

        {activeTab === 'brief' && <BriefPanel />}

      </div>

      <footer className="max-w-[1600px] mx-auto mt-6 pt-4 border-t border-gray-800 text-center text-xs text-gray-600 flex justify-between items-center">
        <p>THE ATLAS • Operational Dashboard v0.2 • Built with OpenClaw</p>
      </footer>

      {showSettings && (
        <SettingsModal
          open={showSettings}
          onClose={() => {
            setShowSettings(false);
            toast.addToast({ type: "success", title: "Settings closed" });
          }}
        />
      )}
    </div>
  );
}
