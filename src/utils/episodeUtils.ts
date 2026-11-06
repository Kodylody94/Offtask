import type { Episode } from '../data/planData';

export interface OutlineGenerationInput {
  title: string;
  description?: string;
  sociologyHooks?: string;
  talkingPoints: string[];
}

export function validateEpisodeForOutline(input: OutlineGenerationInput): {
  valid: boolean;
  error?: string;
} {
  const trimmedTitle = (input.title || '').trim();
  if (!trimmedTitle) {
    return {
      valid: false,
      error: 'Please provide an episode title before generating a script outline.',
    };
  }
  const activePoints = (input.talkingPoints || [])
    .map((p) => p.trim())
    .filter(Boolean);
  if (activePoints.length === 0) {
    return {
      valid: false,
      error: 'Please add at least one talking point to generate a script outline.',
    };
  }
  return { valid: true };
}

export function buildScriptOutlinePrompt(input: OutlineGenerationInput): string {
  const cleanTitle = input.title.trim();
  const cleanDesc = (input.description || '').trim();
  const cleanHooks = (input.sociologyHooks || '').trim();
  const cleanPoints = (input.talkingPoints || [])
    .map((p) => p.trim())
    .filter(Boolean);

  return [
    `Create a detailed, ready-to-record podcast script outline for the "Off Task" podcast (a show exploring sociology, psychology, and hot topics).`,
    ``,
    `EPISODE TITLE: ${cleanTitle}`,
    cleanDesc ? `EPISODE THESIS / DESCRIPTION: ${cleanDesc}` : null,
    cleanHooks ? `SOCIOLOGY & PSYCHOLOGY HOOK: ${cleanHooks}` : null,
    `KEY TALKING POINTS:`,
    ...cleanPoints.map((pt, idx) => `${idx + 1}. ${pt}`),
    ``,
    `Structure the script outline clearly with the following sections:`,
    `1. Cold Open Hook (0:00 - 1:30): A provocative question or real-world observation to grab listeners immediately.`,
    `2. Intro & Thesis Framing (1:30 - 4:00): How to introduce the topic through a sociological and psychological lens.`,
    `3. Segment-by-Segment Deep Dive: Expand each talking point into concrete host prompts, psychological frameworks, and transition cues.`,
    `4. "Off Task" Hot Take & Clip Moment: A punchy 45-second vertical video clip moment designed for TikTok/Reels discovery.`,
    `5. Outro & Listener Call-to-Action: A thought-provoking closing question to drive comments and community discussion.`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

export function formatEpisodeExportNotes(episode: Episode): string {
  const pointsList =
    episode.talkingPoints.filter((p) => p.trim().length > 0).length > 0
      ? episode.talkingPoints
          .filter((p) => p.trim().length > 0)
          .map((p) => `- ${p}`)
          .join('\n')
      : '- (No talking points added yet)';

  const sections = [
    `EPISODE: ${episode.title}`,
    `STATUS: ${episode.status.toUpperCase()}`,
    `DESCRIPTION: ${episode.description || 'N/A'}`,
    ``,
    `TALKING POINTS:`,
    pointsList,
    ``,
    `SOCIOLOGY HOOKS:`,
    episode.sociologyHooks || 'N/A',
  ];

  if (episode.scriptOutline && episode.scriptOutline.trim().length > 0) {
    sections.push(``, `SCRIPT OUTLINE:`, episode.scriptOutline.trim());
  }

  return sections.join('\n').trim();
}
