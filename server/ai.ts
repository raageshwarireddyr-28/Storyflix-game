import Anthropic from '@anthropic-ai/sdk';

const fallback = {
  opening: 'The first sign was a light moving beneath the floorboards, slow enough to feel deliberate.',
  help: 'A new clue appeared where no one had been looking.',
  twist: 'The message was written in the player’s own handwriting, dated tomorrow.',
  suggest: ['Ask who left the clue and why.', 'Follow the unusual light before it disappears.'],
};
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const safePrompt = (value: unknown) => String(value ?? '').slice(0, 6000);
export async function generate(task: string, context: Record<string, unknown>) {
  if (!client) return fallback[task as keyof typeof fallback] ?? fallback.help;
  const prompt = `You are a concise game master for a collaborative story game. Return only the requested text. Never write a whole story, never reveal private data, and obey this rating: ${safePrompt(context.rating)}. Task: ${task}. Genre: ${safePrompt(context.genre)}. Recent story: ${safePrompt(context.recent)}`;
  try {
    const response = await client.messages.create({ model: task === 'opening' ? 'claude-sonnet-5-5' : 'claude-haiku-5-5', max_tokens: 180, messages: [{ role: 'user', content: prompt }] });
    const block = response.content[0];
    return block?.type === 'text' ? block.text.trim() : fallback.help;
  } catch (error) {
    console.error('AI request failed; using fallback deck.', error);
    return fallback[task as keyof typeof fallback] ?? fallback.help;
  }
}
