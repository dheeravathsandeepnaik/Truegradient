import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { init } from './db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import notifications from './routes/notifications.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notifications);


// simple chat stub
app.post('/api/chat/send', (req, res) => {
  const { message } = req.body;
  res.json({ message: `Echo: ${message}`, createdAt: new Date() });
});
app.get('/', (req, res) => {
  res.send('Backend is running ');
});

const PORT = process.env.PORT || 4000;
init().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

