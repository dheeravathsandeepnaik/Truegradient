import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { run, all } from '../db.js';

const router = Router();

// POST /api/chat/send
// Purpose: Save the user's message, generate a simple echo reply (demo behavior),
// store the reply, and return it to the client.
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user's message
    await run(
      'INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)',
      [req.user.id, 'user', message]
    );

    // Existing behavior: Echo back the message as a reply
    const reply = `Echo: ${message}`;

    // Save assistant reply
    await run(
      'INSERT INTO messages (user_id, role, content) VALUES (?, ?, ?)',
      [req.user.id, 'assistant', reply]
    );

    return res.json({ message: reply, createdAt: new Date() });
  } catch (err) {
    console.error('Error in /api/chat/send:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/history
// Purpose: Return all messages (user and assistant) for the current user,
// ordered by creation time.
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const messages = await all(
      'SELECT id, role, content, created_at FROM messages WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );
    return res.json({ messages });
  } catch (err) {
    console.error('Error in /api/chat/history:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
