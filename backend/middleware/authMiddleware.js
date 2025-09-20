import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { get } from '../db.js';

dotenv.config();
const secret = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    const user = await get('SELECT id, username, credits FROM users WHERE id = ?', [payload.id]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
