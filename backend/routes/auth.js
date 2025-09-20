import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { run, get } from '../db.js';

dotenv.config();
const secret = process.env.JWT_SECRET;
const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await run(`INSERT INTO users (username, password) VALUES (?, ?)`, [
      username,
      hashed
    ]);
    const id = result.lastID;
    const token = jwt.sign({ id }, secret, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '7d' });
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
