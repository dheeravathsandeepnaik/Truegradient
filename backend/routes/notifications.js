import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { all, run } from '../db.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  const notes = await all(
    'SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ notifications: notes });
});

router.post('/:id/read', authMiddleware, async (req, res) => {
  const id = req.params.id;
  await run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
  res.json({ ok: true });
});

export default router;
