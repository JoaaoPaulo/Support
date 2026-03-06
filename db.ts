import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(path.join(dataDir, 'sqlite.db'));

// Setup tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'agent')),
    is_first_login INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT
  );
`);

// Insert default users if they don't exist
const insertUser = db.prepare(`
  INSERT OR IGNORE INTO users (id, username, password, role, is_first_login)
  VALUES (?, ?, ?, ?, ?)
`);

// admin
insertUser.run('1', 'jp.admin', '12345', 'admin', 0); // is_first_login = false for admin (0)

// agent
insertUser.run('2', 'jp.agente', '12345', 'agent', 1); // is_first_login = true for agent (1)
