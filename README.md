# AI Meme Generator

A full-stack AI meme generator built with React 19, Vite, Tailwind CSS, Express, and a Gemini-compatible backend.

## Features

- AI-generated top and bottom meme captions
- Built-in meme template gallery
- Custom image upload for personal templates
- Editable captions after generation
- Canvas preview with wrapped, auto-sized meme text
- PNG download with generated filenames
- Recent meme history in local storage, with reuse and clear actions
- Dark mode and responsive layout
- Backend input validation, basic rate limiting, health check, and fallback captions
- Production static serving from the Express server after `npm run build`

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy environment defaults:

```bash
copy .env.example server\.env
```

3. Add `GEMINI_API_KEY` in `server/.env` if you want live AI captions. Without a key, the app uses local fallback captions.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:5173`.

## Build and serve

```bash
npm run build
npm start
```

The production server listens on `PORT` or `5000` and serves the built client from `client/dist`.

## Environment

```bash
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
PORT=5000
RATE_LIMIT_MAX=25
RATE_LIMIT_WINDOW_MS=60000
VITE_API_TARGET=http://localhost:5000
```

## API

- `GET /api/templates` returns available meme templates.
- `GET /api/health` returns server and AI availability status.
- `POST /generate-meme` accepts `{ prompt, tone, templateId }` and returns captions, template metadata, and the caption source.
