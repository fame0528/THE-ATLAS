"use client";

import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface Settings {
  refreshInterval: number; // in seconds
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  showActivityFeed: boolean;
  defaultView: 'dashboard' | 'agents' | 'tasks';
}

const DEFAULT_SETTINGS: Settings = {
  refreshInterval: 30,
  notificationsEnabled: true,
  soundEnabled: true,
  showActivityFeed: true,
  defaultView: 'dashboard'
};

const SETTINGS_STORAGE_KEY = 'the-atlas-settings';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      // Load settings from localStorage
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setSaved(false);
      setHasChanges(false);
    }
  }, [open]);

  const handleChange = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setHasChanges(false);
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('the-atlas-settings-changed', { 
        detail: settings 
      }));
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings');
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    setSaved(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Data & Refresh */}
          <section>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Data & Refresh</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="refreshInterval" className="block text-sm font-medium text-gray-300 mb-2">
                  Auto-refresh interval
                </label>
                <select
                  id="refreshInterval"
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                  <option value={0}>Disabled (manual only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  How often the dashboard polls for updated data.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="showActivityFeed" className="font-medium text-gray-300">
                    Show activity feed by default
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Expand the activity log when viewing agents.
                  </p>
                </div>
                <button
                  id="showActivityFeed"
                  role="switch"
                  aria-checked={settings.showActivityFeed}
                  onClick={() => handleChange('showActivityFeed', !settings.showActivityFeed)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showActivityFeed ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showActivityFeed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="notificationsEnabled" className="font-medium text-gray-300">
                  Enable notifications
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Show toast notifications for agent events, errors, and updates.
                </p>
              </div>
              <button
                id="notificationsEnabled"
                role="switch"
                aria-checked={settings.notificationsEnabled}
                onClick={() => handleChange('notificationsEnabled', !settings.notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <label htmlFor="soundEnabled" className="font-medium text-gray-300">
                  Enable sound alerts
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Play a gentle chime on agent completion or error.
                </p>
              </div>
              <button
                id="soundEnabled"
                role="switch"
                aria-checked={settings.soundEnabled}
                onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Display */}
          <section>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Display</h3>
            
            <div>
              <label htmlFor="defaultView" className="block text-sm font-medium text-gray-300 mb-2">
                Default view on load
              </label>
              <select
                id="defaultView"
                value={settings.defaultView}
                onChange={(e) => handleChange('defaultView', e.target.value as Settings['defaultView'])}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="dashboard">Dashboard (overview)</option>
                <option value="agents">Agents panel</option>
                <option value="tasks">Tasks panel</option>
              </select>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-lg font-semibold text-gray-100 mb-4">About</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p><strong>THE ATLAS</strong> v0.1.0</p>
              <p>Atlas Operational Dashboard with orchestrated subagents.</p>
              <p className="text-xs text-gray-500 mt-2">
                Settings are stored locally in your browser.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm flex items-center gap-2 rounded-lg transition ${
                hasChanges
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to read settings (used by components to respect user preferences)
export function useAppSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (err) {
        console.error('Failed to parse settings:', err);
      }
    }

    // Listen for settings changes
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSettings(prev => ({ ...prev, ...customEvent.detail }));
      }
    };

    window.addEventListener('the-atlas-settings-changed', handler);
    return () => window.removeEventListener('the-atlas-settings-changed', handler);
  }, []);

  return settings;
}
