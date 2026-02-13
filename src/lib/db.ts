import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
import { mkdirSync, existsSync } from 'fs';
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const dbPath = join(dataDir, 'agent-dashboard.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    score REAL,
    star_count INTEGER DEFAULT 0,
    tags JSON,
    category TEXT,
    posted_at DATETIME,
    scraped_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source, source_id)
  );

  CREATE INDEX IF NOT EXISTS idx_opportunities_source ON opportunities(source);
  CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(score);
  CREATE INDEX IF NOT EXISTS idx_opportunities_posted_at ON opportunities(posted_at);

  -- Documents vault (Second Brain)
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags JSON,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url)
  );

  CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);

  -- Morning briefs index (content stored in files)
  CREATE TABLE IF NOT EXISTS morning_briefs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    generated_at DATETIME,
    word_count INTEGER,
    has_news BOOLEAN,
    has_ideas BOOLEAN,
    has_tasks BOOLEAN,
    has_joint_tasks BOOLEAN
  );

  CREATE INDEX IF NOT EXISTS idx_morning_briefs_date ON morning_briefs(date);

  -- Content factory pipeline tracking
  CREATE TABLE IF NOT EXISTS content_factory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_type TEXT NOT NULL, -- 'research', 'script', 'thumbnail'
    channel_id TEXT NOT NULL,
    last_message_id TEXT,
    last_output_preview TEXT,
    last_run_at DATETIME,
    status TEXT, -- 'idle', 'running', 'error'
    error_message TEXT,
    UNIQUE(agent_type, channel_id)
  );

  CREATE INDEX IF NOT EXISTS idx_content_factory_agent ON content_factory(agent_type);
`);

// Helper functions
interface CountResult {
  total: number;
}

export function getAllOpportunities() {
  return db.prepare('SELECT * FROM opportunities ORDER BY created_at DESC').all();
}

export function getOpportunityById(id: number) {
  return db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
}

export function insertOpportunity(opportunity: {
  source: string;
  source_id: string;
  title: string;
  url: string;
  description?: string;
  score?: number;
  star_count?: number;
  tags?: any;
  category?: string;
  posted_at?: string;
  scraped_at?: string;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO opportunities (source, source_id, title, url, description, score, star_count, tags, category, posted_at, scraped_at)
    VALUES (@source, @source_id, @title, @url, @description, @score, @star_count, @tags, @category, @posted_at, @scraped_at)
  `);
  return stmt.run(opportunity);
}

export function updateOpportunity(id: number, updates: Partial<{
  source: string;
  title: string;
  url: string;
  description: string;
  score: number;
  star_count: number;
  tags: any;
  category: string;
  posted_at: string;
  scraped_at: string;
}>) {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;
  
  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const stmt = db.prepare(`UPDATE opportunities SET ${setClause} WHERE id = @id`);
  return stmt.run({ ...updates, id });
}

export function deleteOpportunity(id: number) {
  return db.prepare('DELETE FROM opportunities WHERE id = ?').run(id);
}

export function countOpportunities(filter?: {
  source?: string;
  minScore?: number;
  tag?: string;
  category?: string;
}) {
  let query = 'SELECT COUNT(*) as total FROM opportunities WHERE 1=1';
  const params: any[] = [];
  
  if (filter?.source) {
    query += ' AND source = ?';
    params.push(filter.source);
  }
  if (filter?.minScore !== undefined) {
    query += ' AND score >= ?';
    params.push(filter.minScore);
  }
  if (filter?.category) {
    query += ' AND category = ?';
    params.push(filter.category);
  }
  
  const result = db.prepare(query).get(...params) as CountResult;
  return result.total;
}

// --- Documents (Second Brain) ---
export function getAllDocuments() {
  return db.prepare('SELECT * FROM documents ORDER BY added_at DESC').all();
}

export function getDocumentById(id: number) {
  return db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
}

export function insertDocument(doc: {
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: any;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO documents (title, url, description, category, tags)
    VALUES (@title, @url, @description, @category, @tags)
  `);
  return stmt.run(doc);
}

export function updateDocument(id: number, updates: Partial<{
  title: string;
  url: string;
  description: string;
  category: string;
  tags: any;
}>) {
  const fields = Object.keys(updates);
  if (fields.length === 0) return;
  const setClause = fields.map(f => `${f} = @${f}`).join(', ');
  const stmt = db.prepare(`UPDATE documents SET ${setClause} WHERE id = @id`);
  return stmt.run({ ...updates, id });
}

export function deleteDocument(id: number) {
  return db.prepare('DELETE FROM documents WHERE id = ?').run(id);
}

// --- Morning Briefs ---
export function getMorningBriefByDate(dateStr: string) {
  return db.prepare('SELECT * FROM morning_briefs WHERE date = ?').get(dateStr);
}

export function insertMorningBrief(brief: {
  date: string;
  file_path: string;
  generated_at?: string;
  word_count?: number;
  has_news?: boolean;
  has_ideas?: boolean;
  has_tasks?: boolean;
  has_joint_tasks?: boolean;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO morning_briefs (date, file_path, generated_at, word_count, has_news, has_ideas, has_tasks, has_joint_tasks)
    VALUES (@date, @file_path, @generated_at, @word_count, @has_news, @has_ideas, @has_tasks, @has_joint_tasks)
  `);
  return stmt.run(brief);
}

export function listMorningBriefs(limit: number = 30) {
  return db.prepare('SELECT * FROM morning_briefs ORDER BY date DESC LIMIT ?').all(limit);
}

// --- Content Factory ---
export function getContentFactoryState(agentType?: string) {
  if (agentType) {
    return db.prepare('SELECT * FROM content_factory WHERE agent_type = ?').get(agentType);
  }
  return db.prepare('SELECT * FROM content_factory').all();
}

export function upsertContentFactoryState(state: {
  agent_type: string;
  channel_id: string;
  last_message_id?: string;
  last_output_preview?: string;
  last_run_at?: string;
  status?: string;
  error_message?: string;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO content_factory (agent_type, channel_id, last_message_id, last_output_preview, last_run_at, status, error_message)
    VALUES (@agent_type, @channel_id, @last_message_id, @last_output_preview, @last_run_at, @status, @error_message)
  `);
  return stmt.run(state);
}

// Export db instance for direct queries if needed
export { db };
