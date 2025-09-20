🚀 Overview
This project implements:
React + Redux Toolkit frontend (pixel-perfect UI with Tailwind CSS)
Node.js + Express backend with SQLite database
Features:
Sign In / Sign Up (with password hashing & JWT auth)
Protected Chat UI (left panel + chat window)
Credits counter
Notifications panel (expandable)

# Project Structure
- **frontend/**: React + Vite app (Tailwind). Key files: `src/pages/SignIn.jsx`, `src/pages/SignUp.jsx`, `src/pages/Chat.jsx`, `src/features/auth/authSlice.js`, `src/api/axios.js`.
- **backend/**: Express API + SQLite. Key files: `index.js`, `routes/auth.js`, `routes/user.js`, `routes/notifications.js`, `db.js`.

# Prerequisites
- Node 18+
- npm 9+

# Setup & Run
## Backend
1. Create a `.env` in `backend/` (optional; sensible defaults are used):
   - `PORT=4000`
   - `JWT_SECRET=<your-secret>`
   - `FRONTEND_ORIGIN=http://localhost:5173`
2. Install and run:
   - `npm install` (or `npm ci`)
   - `npm run dev`
3. The API runs at `http://localhost:4000`.

## Frontend
1. Create a `.env` in `frontend/` (optional):
   - `VITE_API_URL=http://localhost:4000`
2. Install and run:
   - `npm install` (or `npm ci`)
   - `npm run dev`
3. The app runs at `http://localhost:5173`.

# Key Features
- **Auth**
  - `POST /api/auth/signup` `{ username, password }` → `{ token }`
  - `POST /api/auth/login` `{ username, password }` → `{ token }`
  - Client stores token in `localStorage` and fetches profile via `GET /api/user/me`.
- **Chat UI**
  - Fixed top header (`AI Chat`) and left Conversations panel below it.
  - Suggestion tiles to start a conversation.
  - Enter to send; Shift+Enter for a new line.
  - Assistant mock reply: "I understand your question. Let me help you with that...".
  - Timestamp rendering for both user and assistant.
  - Conversation list persisted in `localStorage` with title, preview and Today label.
- **Notifications**
  - Backend: `GET /api/notifications`, `POST /api/notifications/:id/read`.
  - Frontend fetches notifications on mount so the unread badge appears immediately after sign-in.
  - If server returns none, two default items are shown (Welcome + Feature Update) to match the design. "Mark all read" works for both server and local defaults.

# Development Notes
- Configuration files for Vite/ESLint live in `frontend/`.
- `.gitignore` excludes environment files and SQLite DB files.
- Credits pill in header is currently static for demo; can be wired to `GET /api/user/credits`.

# Scripts
## Backend (`backend/package.json`)
- `npm run dev` → start with nodemon
- `npm start` → start Node

## Frontend (`frontend/package.json`)
- `npm run dev` → Vite dev server
- `npm run build` → production build
- `npm run preview` → preview build
