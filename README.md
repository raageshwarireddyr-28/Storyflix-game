# StoryFlix

StoryFlix is a turn-based multiplayer story game with an AI game master. The client is React + TypeScript + Vite; the server is Express + TypeScript.

## Run locally

```powershell
npm install
npm run dev
```

Development uses Vite at `http://localhost:5173` and the API at `http://localhost:3000`. Copy `.env.example` to `.env` and configure one AI provider:

- `AI_PROVIDER=anthropic` — set `ANTHROPIC_API_KEY` to enable Anthropic.
- `AI_PROVIDER=gemini` — set `GEMINI_API_KEY` to enable Google's official Gemini API.

If no key is set for the selected provider, StoryFlix automatically uses the existing no-AI fallback lines.

## Production

```powershell
npm run build
npm start
```

The compiled Express server serves `dist` and falls back to `index.html` for client routes. It listens on `0.0.0.0` and uses `PORT` (default `3000`). WebSockets use the page origin automatically (`ws://` locally or `wss://` behind HTTPS).

## Milestones

## Current implementation

- Dark cinematic home/setup flow with built-in and custom genre themes and SVG scenes.
- Story Game reducer and UI: opening line, turn order, timer countdown, word limits, pass, AI-help tokens, twists, solo AI turns, results, print, and saved stories.
- Role Play scene: character name/private secret field, narration, dialogue/action posts, and reactive fallback narration.
- Local My Stories library with search and delete.
- Express health/API server, fallback AI endpoints, room creation/lookup, and a WebSocket lobby protocol at `/ws`.

The room protocol is intentionally small at this stage; production deployment should add authentication/session reconnect tokens, rate limiting, full server-side gameplay reducer integration, and privacy-filtered room payloads before inviting real users.
