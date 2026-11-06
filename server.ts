import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  validateEpisodeForOutline,
  buildScriptOutlinePrompt,
} from './src/utils/episodeUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/episodes/generate-outline', async (req, res) => {
    try {
      const { title, description, sociologyHooks, talkingPoints } = req.body ?? {};
      const validation = validateEpisodeForOutline({
        title: typeof title === 'string' ? title : '',
        description: typeof description === 'string' ? description : '',
        sociologyHooks: typeof sociologyHooks === 'string' ? sociologyHooks : '',
        talkingPoints: Array.isArray(talkingPoints) ? talkingPoints : [],
      });

      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({
          error:
            'GEMINI_API_KEY is not configured. Please check the API key in the Settings > Secrets panel.',
        });
        return;
      }

      const ai = getGenAIClient();
      const prompt = buildScriptOutlinePrompt({
        title,
        description,
        sociologyHooks,
        talkingPoints,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert podcast producer and behavioral science writer for the "Off Task" podcast, which blends sociology, psychology, and hot topics. Write clear, engaging, structured podcast script outlines in plain text with clean section headings and bullet points. Keep the outline concise, practical for beginner hosts, and under 450 words.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const outline = (response.text ?? '').trim();
      if (!outline) {
        res.status(502).json({
          error: 'The AI model returned an empty outline. Please try again.',
        });
        return;
      }

      res.json({ scriptOutline: outline });
    } catch (error: unknown) {
      console.error('Error generating script outline:', error);
      const errMessage =
        error instanceof Error ? error.message : 'Unexpected server error';

      if (
        errMessage.includes('PERMISSION_DENIED') ||
        errMessage.includes('API_KEY_INVALID') ||
        errMessage.includes('403') ||
        errMessage.includes('API key not valid')
      ) {
        res.status(403).json({
          error:
            'API key error: Please check your Gemini API key in the Settings > Secrets panel.',
        });
        return;
      }

      if (errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('429')) {
        res.status(429).json({
          error:
            'Rate limit or quota reached. Upgrading to a paid tier in Settings > Secrets increases your quota.',
        });
        return;
      }

      res.status(500).json({
        error: `Failed to generate script outline: ${errMessage}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
