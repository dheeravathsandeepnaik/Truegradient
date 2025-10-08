import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { get } from '../db.js';

dotenv.config();
const secret = process.env.JWT_SECRET;

// Authentication middleware
// - Looks for an Authorization header like: "Bearer <JWT>"
// - Verifies the token using our secret
// - Loads the user from the database and attaches it to req.user
// - If anything fails, responds with 401 (Unauthorized)
export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing auth header' });

  const token = header.split(' ')[1];
  try {
    // Verify the token using our secret
    const payload = jwt.verify(token, secret);
    // Load the user from the database
    const user = await get('SELECT id, username, credits FROM users WHERE id = ?', [payload.id]);
    if (!user) return res.status(401).json({ error: 'User not found' });
    // Attach the user to the request
    req.user = user;
    // Continue with the request
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

