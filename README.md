# AI Meme Generator

A full-stack AI meme generator built with React 19, Vite, Tailwind CSS, Express, and a Gemini-compatible backend.

## Features
- Home page with hero section
- Meme generator with prompt, tone, and template selection
- AI-generated meme captions
- Canvas-based preview and PNG download
- Recent history persisted in local storage
- Responsive UI with dark mode

## Run locally
1. Install dependencies: npm install
2. Start the app: npm run dev
3. Open http://localhost:5173

## Environment
Set a Gemini API key if you want live AI-generated captions:

```bash
set GEMINI_API_KEY=your-key-here
```

If no key is set, the app uses a built-in fallback experience.
