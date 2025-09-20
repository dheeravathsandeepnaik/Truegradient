import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { get, run } from '../db.js';

const router = Router();

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

router.get('/credits', authMiddleware, async (req, res) => {
  const user = await get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
  res.json({ credits: user.credits });
});

router.post('/credits/add', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  await run('UPDATE users SET credits = credits + ? WHERE id = ?', [amount, req.user.id]);
  const updated = await get('SELECT credits FROM users WHERE id = ?', [req.user.id]);
  res.json({ credits: updated.credits });
});

export default router;
