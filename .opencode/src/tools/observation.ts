import * as path from "path";
import * as fs from "fs";
import { Database } from "bun:sqlite";

const MEMORY_DIR = path.join(process.cwd(), ".opencode", "memory");
const MEMORY_DB = path.join(MEMORY_DIR, "memory.db");

export interface ObservationParams {
  type: "learning" | "decision" | "blocker" | "progress" | "handoff";
  narrative: string;
  facts?: string[];
  confidence?: number;
  files_read?: string[];
  files_modified?: string[];
  bead_id?: string;
  concepts?: string[];
  expires_at?: string;
}

export interface ObservationResult {
  id: number;
  type: string;
  narrative: string;
  facts: string[];
  confidence: number;
  files_read: string[];
  files_modified: string[];
  concepts: string[];
  bead_id?: string;
  created_at: string;
}

function getDb(): Database {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
  
  const db = new Database(MEMORY_DB);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      narrative TEXT NOT NULL,
      facts TEXT DEFAULT '[]',
      confidence REAL DEFAULT 1.0,
      files_read TEXT DEFAULT '[]',
      files_modified TEXT DEFAULT '[]',
      concepts TEXT DEFAULT '[]',
      bead_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
    CREATE INDEX IF NOT EXISTS idx_observations_bead_id ON observations(bead_id);
    CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at);
  `);
  
  return db;
}

export function createObservation(params: ObservationParams): ObservationResult {
  const db = getDb();
  
  const sql = `
    INSERT INTO observations (type, narrative, facts, confidence, files_read, files_modified, concepts, bead_id, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const result = db.prepare(sql).run(
    params.type,
    params.narrative,
    JSON.stringify(params.facts || []),
    params.confidence || 1.0,
    JSON.stringify(params.files_read || []),
    JSON.stringify(params.files_modified || []),
    JSON.stringify(params.concepts || []),
    params.bead_id || null,
    params.expires_at || null
  );
  
  return {
    id: result.lastInsertRowid as number,
    type: params.type,
    narrative: params.narrative,
    facts: params.facts || [],
    confidence: params.confidence || 1.0,
    files_read: params.files_read || [],
    files_modified: params.files_modified || [],
    concepts: params.concepts || [],
    bead_id: params.bead_id,
    created_at: new Date().toISOString(),
  };
}

export function getObservationsByType(type: string, limit = 10): ObservationResult[] {
  const db = getDb();
  
  const sql = `SELECT * FROM observations WHERE type = ? ORDER BY created_at DESC LIMIT ?`;
  const rows = db.prepare(sql).all(type, limit) as any[];
  
  return rows.map((row) => ({
    ...row,
    facts: JSON.parse(row.facts || "[]"),
    files_read: JSON.parse(row.files_read || "[]"),
    files_modified: JSON.parse(row.files_modified || "[]"),
    concepts: JSON.parse(row.concepts || "[]"),
  }));
}

export function getObservationsByBead(beadId: string): ObservationResult[] {
  const db = getDb();
  
  const sql = `SELECT * FROM observations WHERE bead_id = ? ORDER BY created_at DESC`;
  const rows = db.prepare(sql).all(beadId) as any[];
  
  return rows.map((row) => ({
    ...row,
    facts: JSON.parse(row.facts || "[]"),
    files_read: JSON.parse(row.files_read || "[]"),
    files_modified: JSON.parse(row.files_modified || "[]"),
    concepts: JSON.parse(row.concepts || "[]"),
  }));
}

export function linkObservations(observationId: number, concept: string): void {
  const db = getDb();
  
  const row = db.prepare("SELECT concepts FROM observations WHERE id = ?").get(observationId) as { concepts: string } | undefined;
  
  if (row) {
    const concepts: string[] = JSON.parse(row.concepts || "[]");
    if (!concepts.includes(concept)) {
      concepts.push(concept);
      db.prepare("UPDATE observations SET concepts = ? WHERE id = ?").run(JSON.stringify(concepts), observationId);
    }
  }
}
