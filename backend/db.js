import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcrypt';

const DB_PATH = path.join(process.cwd(), 'app.db');
const db = new sqlite3.Database(DB_PATH);

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    credits INTEGER DEFAULT 1250
  )`);
  await run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const user = await get(`SELECT * FROM users WHERE username = ?`, ['testuser']);
  if (!user) {
    const hashed = await bcrypt.hash('password123', 10);
    await run(`INSERT INTO users (username, password, credits) VALUES (?, ?, ?)`, [
      'testuser',
      hashed,
      1250
    ]);
    await run(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`, [
      1,
      'Welcome to the app!'
    ]);
  }
}

export { db, run, all, get, init };
