import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEpisodeForOutline,
  buildScriptOutlinePrompt,
  formatEpisodeExportNotes,
} from './episodeUtils';

test('validateEpisodeForOutline rejects empty title or empty talking points', () => {
  const emptyTitle = validateEpisodeForOutline({
    title: '   ',
    talkingPoints: ['Point 1'],
  });
  assert.equal(emptyTitle.valid, false);
  assert.ok(emptyTitle.error?.includes('episode title'));

  const noPoints = validateEpisodeForOutline({
    title: 'The Psychology of Ghosting',
    talkingPoints: ['   ', ''],
  });
  assert.equal(noPoints.valid, false);
  assert.ok(noPoints.error?.includes('talking point'));

  const validResult = validateEpisodeForOutline({
    title: 'The Psychology of Ghosting',
    talkingPoints: ['Attachment styles in online dating'],
  });
  assert.equal(validResult.valid, true);
});

test('buildScriptOutlinePrompt includes title, hooks, and numbered talking points', () => {
  const prompt = buildScriptOutlinePrompt({
    title: 'The Psychology of Ghosting',
    description: 'Why people vanish online',
    sociologyHooks: 'Empathy decay in digital spaces',
    talkingPoints: ['Weak ties theory', 'Avoidant attachment triggers'],
  });

  assert.ok(prompt.includes('EPISODE TITLE: The Psychology of Ghosting'));
  assert.ok(prompt.includes('SOCIOLOGY & PSYCHOLOGY HOOK: Empathy decay in digital spaces'));
  assert.ok(prompt.includes('1. Weak ties theory'));
  assert.ok(prompt.includes('2. Avoidant attachment triggers'));
});

test('formatEpisodeExportNotes includes scriptOutline when present', () => {
  const exported = formatEpisodeExportNotes({
    id: 'e1',
    title: 'The Psychology of Ghosting',
    description: 'Digital disappearance explained.',
    talkingPoints: ['Attachment styles'],
    sociologyHooks: 'Platform design',
    status: 'ready',
    scriptOutline: '1. Cold Open: Have you ever been ghosted?',
  });

  assert.ok(exported.includes('EPISODE: The Psychology of Ghosting'));
  assert.ok(exported.includes('- Attachment styles'));
  assert.ok(exported.includes('SCRIPT OUTLINE:\n1. Cold Open: Have you ever been ghosted?'));
});
