import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 25);
const MAX_PROMPT_LENGTH = 280;
const allowedTones = ['funny', 'dark', 'sarcastic', 'programmer', 'corporate'];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '32kb' }));

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'local';
  const current = requestLog.get(key) || [];
  const recent = current.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
  }

  recent.push(now);
  requestLog.set(key, recent);
  next();
}

const templates = [
  { id: 'drake', name: 'Drake Hotline Bling', image: 'https://i.imgflip.com/1bij.jpg' },
  { id: 'two-buttons', name: 'Two Buttons', image: 'https://i.imgflip.com/1g8my4.jpg' },
  { id: 'this-is-fine', name: 'This Is Fine', image: 'https://i.imgflip.com/1i4b1d.jpg' },
  { id: 'expanding-brain', name: 'Expanding Brain', image: 'https://i.imgflip.com/1jwhww.jpg' },
  { id: 'surprised-pikachu', name: 'Surprised Pikachu', image: 'https://i.imgflip.com/1j2qf.jpg' },
];

app.get('/api/templates', (_req, res) => {
  res.json(templates);
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    aiEnabled: Boolean(process.env.GEMINI_API_KEY),
    templates: templates.length,
  });
});

function createFallbackCaptions(prompt, tone) {
  const cleanPrompt = prompt.trim();
  const mood = tone.toLowerCase();
  const fallbackLines = {
    funny: ['Me after the first successful deploy', 'And the coffee is still warm'],
    dark: ['When the deadline hits', 'And optimism is already gone'],
    sarcastic: ['When everyone says "that will be easy"', 'Spoiler: it was not'],
    programmer: ['When the stack trace is 300 lines long', 'And the fix is one character'],
    corporate: ['When the quarterly update is due', 'And the slide deck is somehow still late'],
  };

  const base = fallbackLines[mood] || ['When life gets weird', 'And the meme writes itself'];
  return {
    topText: cleanPrompt.slice(0, 70) || 'My topic',
    bottomText: base[0],
  };
}

function sanitizeCaption(value, fallback) {
  if (typeof value !== 'string') return fallback;
  return value.replace(/\s+/g, ' ').trim().slice(0, 90) || fallback;
}

function parseAiCaptions(raw) {
  const text = String(raw || '{}').replace(/```json|```/gi, '').trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('AI response did not contain JSON.');
  }

  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  return {
    topText: sanitizeCaption(parsed.topText, 'AI Meme'),
    bottomText: sanitizeCaption(parsed.bottomText, 'Generated for you'),
  };
}

function validateGeneratePayload(body) {
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  const tone = typeof body?.tone === 'string' ? body.tone.trim() : '';
  const templateId = typeof body?.templateId === 'string' ? body.templateId.trim() : '';

  if (!prompt) {
    return { error: 'Prompt is required.' };
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.` };
  }

  if (!allowedTones.includes(tone.toLowerCase())) {
    return { error: 'Please choose a supported tone.' };
  }

  return { prompt, tone, templateId };
}

app.post('/generate-meme', rateLimit, async (req, res) => {
  const validated = validateGeneratePayload(req.body);

  if (validated.error) {
    return res.status(400).json({ error: validated.error });
  }

  const { prompt, tone, templateId } = validated;
  const selectedTemplate = templates.find((item) => item.id === templateId) || templates[0];

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = createFallbackCaptions(prompt, tone);
      return res.json({
        topText: fallback.topText,
        bottomText: fallback.bottomText,
        template: selectedTemplate,
        source: 'fallback',
        notice: 'Set GEMINI_API_KEY to enable live AI captions.',
      });
    }

    const aiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            parts: [{ text: `Create two short meme caption lines for a ${tone} meme about: ${prompt}. Return valid JSON with keys topText and bottomText only. Keep it concise and funny.` }],
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const raw = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = parseAiCaptions(raw);

    res.json({
      topText: parsed.topText,
      bottomText: parsed.bottomText,
      template: selectedTemplate,
      source: 'ai',
    });
  } catch (error) {
    console.error(error.message);
    const fallback = createFallbackCaptions(prompt, tone);
    res.json({
      topText: fallback.topText,
      bottomText: fallback.bottomText,
      template: selectedTemplate,
      source: 'fallback',
      notice: 'AI captions were unavailable, so a local fallback was used.',
    });
  }
});

app.use(express.static(clientDistPath));

app.get('*', (_req, res, next) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (error) => {
    if (error) next();
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
