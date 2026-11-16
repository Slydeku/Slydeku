'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_DIR = path.join(__dirname, '..', 'db');
const DEFAULT_PATH = path.join(__dirname, '..', 'data', 'wine-and-art.db');

function resolverRuta(p) {
  if (!p) return DEFAULT_PATH;
  return path.isAbsolute(p) ? p : path.resolve(__dirname, '..', p);
}

function openDb(dbPath) {
  const file = resolverRuta(dbPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  const vacia = !db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='paquetes'").get();
  if (vacia) {
    db.exec(fs.readFileSync(path.join(DB_DIR, 'schema.sql'), 'utf8'));
    db.exec(fs.readFileSync(path.join(DB_DIR, 'seed.sql'), 'utf8'));
    db.pragma('foreign_keys = ON');
  }
  try { fs.chmodSync(file, 0o600); } catch (_) { /* best effort */ }
  return db;
}

module.exports = { openDb, resolverRuta };
