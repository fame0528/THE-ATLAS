import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ==================== TYPES ====================

interface Session {
  taskId: string;
  startedAt: string;
  description: string;
  status: string;
  completedAt?: string;
  result?: any;
}

interface MemoryData {
  profileId?: string;
  sessions: Session[];  // NEW format: top-level sessions
  lastHeartbeat?: string;
  currentStep?: string;
  progress: number;
  stats: Record<string, number>;
}

interface ActivityEntry {
  timestamp: string;
  taskId: string;
  profileId: string;
  action: string;
  details: string;
  currentStep?: string;
  progress?: number;
  error?: string;
}

interface ActivityLog {
  entries: ActivityEntry[];
}

interface QueueTask {
  id: string;
  profileId: string;
  label: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  ctx: any;
}

interface QueueData {
  tasks: QueueTask[];
  runningSessions: string[];
  stats: { totalEnqueued: number; totalCompleted: number; totalFailed: number };
  config?: { maxConcurrent: number };
}

// ==================== PATHS ====================

const cwd = process.cwd();
const workspaceRoot = path.resolve(cwd, '..');
const profilesPath = path.join(workspaceRoot, 'subagent-profiles.json');
const queuePath = path.join(workspaceRoot, 'skills', 'subagent-system', 'task-queue.json');
const memoryDir = path.join(workspaceRoot, 'memory', 'subagents');
const activityLogPath = path.join(memoryDir, 'activity-log.json');

if (!fs.existsSync(memoryDir)) fs.mkdirSync(memoryDir, { recursive: true });

// ==================== MEMORY MANAGER ====================

const memoryManager = {
  getMemoryPath: (profileId: string): string => path.join(memoryDir, `${profileId}.json`),

  createSession: (profileId: string, taskId: string, description: string): MemoryData => {
    const memPath = memoryManager.getMemoryPath(profileId);
    let data: MemoryData;
    if (fs.existsSync(memPath)) {
      data = JSON.parse(fs.readFileSync(memPath, 'utf-8'));
      // Migrate old format if needed
      if (data.memory && !data.sessions) {
        data.sessions = data.memory.sessions || [];
        delete data.memory;
      }
    } else {
      data = { profileId, sessions: [], stats: { totalSessions: 0, completed: 0, failed: 0, running: 0 }, progress: 0 };
    }
    data.sessions.push({ taskId, startedAt: new Date().toISOString(), description, status: 'PENDING' });
    fs.writeFileSync(memPath, JSON.stringify(data, null, 2));
    return data;
  },

  incrementStats: (profileId: string, status: string): void => {
    const memPath = memoryManager.getMemoryPath(profileId);
    if (!fs.existsSync(memPath)) return;
    let data: MemoryData = JSON.parse(fs.readFileSync(memPath, 'utf-8'));
    // Migrate old format if needed
    if (data.memory && !data.sessions) {
      data.sessions = data.memory.sessions || [];
      delete data.memory;
    }
    if (!data.stats) data.stats = { totalSessions: 0, completed: 0, failed: 0, running: 0 };
    data.stats.totalSessions = (data.stats.totalSessions || 0) + 1;
    if (status === 'COMPLETED') data.stats.completed = (data.stats.completed || 0) + 1;
    if (status === 'FAILED') data.stats.failed = (data.stats.failed || 0) + 1;
    if (status === 'RUNNING') data.stats.running = (data.stats.running || 0) + 1;
    if (status === 'COMPLETED' || status === 'FAILED') data.stats.running = Math.max(0, (data.stats.running || 0) - 1);
    fs.writeFileSync(memPath, JSON.stringify(data, null, 2));
  }
};

// ==================== ACTIVITY LOGGER ====================

function logActivity(entry: Omit<ActivityEntry, 'timestamp'>): void {
  try {
    let log: ActivityLog = { entries: [] };
    if (fs.existsSync(activityLogPath)) log = JSON.parse(fs.readFileSync(activityLogPath, 'utf-8'));
    log.entries.push({ ...entry, timestamp: new Date().toISOString() } as ActivityEntry);
    if (log.entries.length > 100) log.entries = log.entries.slice(-100);
    fs.writeFileSync(activityLogPath, JSON.stringify(log, null, 2));
  } catch (e) {
    console.error('Activity log error:', e);
  }
}

// ==================== QUEUE HELPERS ====================

function loadQueue(): QueueData {
  return fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf-8')) : { tasks: [], runningSessions: [], stats: { totalEnqueued: 0, totalCompleted: 0, totalFailed: 0 } };
}

function saveQueue(queue: QueueData): void {
  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
}

// ==================== HELPERS ====================

function getMemoryStats(profileId: string) {
  const memPath = path.join(memoryDir, `${profileId}.json`);
  if (!fs.existsSync(memPath)) return { totalSessions: 0, stats: {}, lastHeartbeat: null, currentStep: null, progress: 0 };
  try {
    const data: MemoryData = JSON.parse(fs.readFileSync(memPath, 'utf-8'));
    // Migrate old format if needed
    if (data.memory && !data.sessions) {
      data.sessions = data.memory.sessions || [];
      delete data.memory;
    }
    const sessions = data.sessions || [];
    return {
      totalSessions: sessions.length,
      stats: data.stats || {},
      lastHeartbeat: data.lastHeartbeat || null,
      currentStep: data.currentStep || null,
      progress: data.progress || 0
    };
  } catch {
    return { totalSessions: 0, stats: {}, lastHeartbeat: null, currentStep: null, progress: 0 };
  }
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

// ==================== API ====================

export async function GET() {
  try {
    const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
    const queue = loadQueue();

    const activeTasks = queue.tasks.filter((t: any) => t.status === 'RUNNING' || t.status === 'PENDING');
    const activeInstances = activeTasks.map((task: any) => {
      const profile = profiles.profiles.find((p: any) => p.id === task.profileId) || profiles.profiles[0];
      const elapsedMs = Date.now() - new Date(task.createdAt).getTime();
      const memStats = getMemoryStats(profile.id);
      return {
        id: task.id,
        profileId: task.profileId,
        name: task.label || profile.name,
        role: profile.role,
        description: task.ctx?.taskDescription || task.ctx?.task,
        status: task.status as any,
        startedAt: task.startedAt,
        elapsedMs,
        elapsed: formatElapsed(elapsedMs),
        lastHeartbeat: memStats.lastHeartbeat,
        isStale: memStats.lastHeartbeat ? (Date.now() - new Date(memStats.lastHeartbeat).getTime()) > 120000 : false,
        currentStep: memStats.currentStep,
        progress: memStats.progress,
        memoryLayer: (profile as any).memoryLayer,
        error: task.error || null
      };
    });

    let recentActivity: ActivityEntry[] = [];
    if (fs.existsSync(activityLogPath)) {
      const log: ActivityLog = JSON.parse(fs.readFileSync(activityLogPath, 'utf-8'));
      recentActivity = (log.entries || []).slice(-20).reverse();
    }

    const pendingTasks = queue.tasks.filter(t => t.status === 'PENDING');
    const oldestPending = pendingTasks.length > 0 ? pendingTasks.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0].createdAt : null;
    const pendingOlderThan2min = pendingTasks
      .filter((t: any) => {
        const age = Date.now() - new Date(t.createdAt).getTime();
        return age > 120000;
      })
      .map((t: any) => ({
        id: t.id,
        profileId: t.profileId,
        age: Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 60000)
      }));

    const memoryStats: Record<string, any> = {};
    for (const profile of profiles.profiles) {
      memoryStats[profile.id] = getMemoryStats(profile.id);
    }

    return NextResponse.json({
      profiles: profiles.profiles,
      activeInstances,
      memoryStats,
      recentActivity,
      queueHealth: {
        totalTasks: queue.tasks.length,
        pending: pendingTasks.length,
        running: activeInstances.filter(i => i.status === 'RUNNING').length,
        completed: queue.tasks.filter(t => t.status === 'COMPLETED').length,
        failed: queue.tasks.filter(t => t.status === 'FAILED').length,
        oldestPending,
        maxConcurrent: queue.config?.maxConcurrent || 7
      },
      pendingOlderThan2min,
      summary: { totalProfiles: profiles.profiles.length, activeCount: activeInstances.length }
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subagents", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, taskDescription, label, priority } = body as { profileId: string; taskDescription: string; label?: string; priority?: string };
    if (!profileId || !taskDescription) {
      return NextResponse.json({ error: "Missing required fields: profileId, taskDescription" }, { status: 400 });
    }

const profiles = JSON.parse(fs.readFileSync(profilesPath, 'utf-8'));
    const profile = profiles.profiles.find((p: any) => p.id === profileId);
    if (!profile) {
      // Try common aliases
      const aliasMap: Record<string, string> = {
        'data-analyst': 'analyst',
        'idea-guy': 'visionary',
        'creative': 'creative-director',
        'pm': 'project-manager',
        'security-sentinel': 'security'
      };
      const canonicalId = aliasMap[profileId];
      if (canonicalId) {
        const canonicalProfile = profiles.profiles.find((p: any) => p.id === canonicalId);
        if (canonicalProfile) {
          // Use canonical profile but keep original label intent
          profile = canonicalProfile;
        }
      }
    }
    if (!profile) {
      return NextResponse.json({ error: `Profile with id ${profileId} not found` }, { status: 404 });
    }

    const queue = loadQueue();
    const newTask: QueueTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileId,
      label: label || profile.name,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      ctx: { task: taskDescription, taskDescription, profileId, priority: priority || profile.defaultPriority || "NORMAL" }
    };

    queue.tasks.push(newTask);
    queue.stats.totalEnqueued = (queue.stats.totalEnqueued || 0) + 1;
    saveQueue(queue);

    memoryManager.createSession(profileId, newTask.id, taskDescription);
    logActivity({ taskId: newTask.id, profileId, action: 'spawned', details: taskDescription });

    try {
      const { exec } = require('child_process');
      const scriptPath = path.join(workspaceRoot, 'subagent-heartbeat.js');
      // Fire and forget - don't await
      exec(`node "${scriptPath}"`, { windowsHide: true }, (error: Error | null) => {
        if (error) console.error(`[Auto-Heartbeat] Failed to trigger: ${error.message}`);
      });
    } catch (e) {
      console.error('[Auto-Heartbeat] Failed to spawn process:', e);
    }

    return NextResponse.json({ success: true, task: newTask, message: `Subagent ${profile.name} spawned & heartbeat triggered` });
  } catch (error) {
    console.error("Spawn error:", error);
    return NextResponse.json({ error: "Failed to spawn subagent", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(activityLogPath)) fs.unlinkSync(activityLogPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear log:", error);
    return NextResponse.json({ error: "Failed to clear log", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
