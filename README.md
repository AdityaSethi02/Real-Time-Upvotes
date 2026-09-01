# ChatBoard

A real-time chat application with upvoting, built with **Python (FastAPI)** on the backend and **Next.js** on the frontend.

## Features

- **Admin Room Management**: Create chat rooms with cooldown and vote threshold settings
- **User Engagement**: Join rooms, send messages, and upvote
- **Priority Sections**: Configurable trending/hot vote thresholds per room
- **Admin Alerts**: Hot messages notify the room creator (single admin per room)
- **Real-time Communication**: WebSockets with session tokens, chat history, and reconnect

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, WebSockets (Render)
- **Frontend**: Next.js 15, React, Tailwind CSS (Vercel)
- **Database**: PostgreSQL (Neon)

## Installation & Setup

### Backend

```bash
cd chat-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Optional schema patches: alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

### Frontend

```bash
cd chat-frontend
npm install
cp .env.example .env
npm run dev
```

### Environment Variables

**Backend (`chat-backend/.env`)**

```
DATABASE_URL=postgresql://...
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
PORT=8080
SESSION_TOKEN_TTL_HOURS=24
MAX_MESSAGE_LENGTH=500
LOG_LEVEL=INFO
RATE_LIMIT_PER_MINUTE=30
WS_RATE_LIMIT_PER_MINUTE=60
```

**Frontend (`chat-frontend/.env`)**

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin` | Create room and admin (returns `sessionToken`) |
| GET | `/api/admin?roomId=` | Get room admin |
| POST | `/api/user` | Join a room (returns `sessionToken`) |
| GET | `/api/room?roomId=` | Room details + vote thresholds |
| POST | `/api/session/refresh` | Rotate session token |
| POST | `/api/session/logout` | Invalidate session |
| WS | `/` | Real-time chat (requires `sessionToken` on `JOIN_ROOM`) |

### WebSocket message types

**Incoming:** `JOIN_ROOM`, `SEND_MESSAGE`, `UPVOTE_MESSAGE`, `DISMISS_CHAT` (admin)

**Outgoing:** `CHAT_HISTORY`, `ADD_CHAT`, `UPDATE_CHAT`, `DISMISS_CHAT`, `ERROR`

## Database

- Tables are bootstrapped on startup (`create_all` + column patches).
- For production migrations, run `alembic upgrade head` from `chat-backend/`.
- Each room has **one admin** (the creator). Multi-admin is not supported.

## Notes

- Users must **create or join** after deploy to obtain a `sessionToken`.
- Votes before the `Upvote` table migration may show as 0 in history.
- Restart backend after deploy so new tables (`Upvote`, `SessionToken`) are created.

## Deployment

- **Frontend**: Vercel — set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` (use `wss://` in production)
- **Backend**: Render — `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
