import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

const db = new Database(dbPath);

// For this schema update, we drop the table and recreate it
db.exec(`DROP TABLE IF EXISTS users;`);

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent',
    status TEXT NOT NULL DEFAULT 'active',
    recovery_email TEXT,
    requires_password_change INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed default admin
const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');

if (!existingAdmin) {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('1234', salt);
  const id = Math.random().toString(36).substring(2, 15);
  
  db.prepare(`
    INSERT INTO users (id, name, username, email, password_hash, role, status, recovery_email, requires_password_change)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, 'Administrador do Sistema', 'admin', 'admin@support.com', passwordHash, 'admin', 'active', 'jpcampioloalmeida@gmail.com', 0);
  console.log('Admin default user created: admin / 1234');
}

export default db;
