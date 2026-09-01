# ChatBoard Frontend

Next.js UI for ChatBoard. All API and WebSocket traffic goes to the Python backend.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

For production (Vercel), point these to your Render backend URL. Use `wss://` for WebSockets.

## Session

Users receive a `sessionToken` when creating or joining a room. It is stored in `sessionStorage` and required for WebSocket `JOIN_ROOM`. The room page refreshes the token on load and redirects to join if expired.

## Scripts

- `npm run dev` — start dev server on port 3000
- `npm run build` — production build
- `npm run start` — run production build
