import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

const dbPath = path.join(process.cwd(), 'playground.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      api_key TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
  `);
}

// Initialize database on import
initDatabase();

// Hash password
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// User operations
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  api_key: string | null;
  created_at: string;
}

export function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): User {
  const id = crypto.randomUUID();
  const passwordHash = hashPassword(password);

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, first_name, last_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, email, passwordHash, firstName, lastName);

  return getUserById(id)!;
}

export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare(`
    SELECT id, email, first_name, last_name, api_key, created_at
    FROM users
    WHERE email = ?
  `);

  return stmt.get(email) as User | null;
}

export function getUserById(id: string): User | null {
  const stmt = db.prepare(`
    SELECT id, email, first_name, last_name, api_key, created_at
    FROM users
    WHERE id = ?
  `);

  return stmt.get(id) as User | null;
}

export function verifyPassword(email: string, password: string): User | null {
  const passwordHash = hashPassword(password);

  const stmt = db.prepare(`
    SELECT id, email, first_name, last_name, api_key, created_at
    FROM users
    WHERE email = ? AND password_hash = ?
  `);

  return stmt.get(email, passwordHash) as User | null;
}

export function updateUserApiKey(userId: string, apiKey: string): void {
  const stmt = db.prepare(`
    UPDATE users
    SET api_key = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(apiKey, userId);
}

export default db;
