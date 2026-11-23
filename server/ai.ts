import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

export const ANTHROPIC_WRITING_MODEL = 'claude-sonnet-5-5';
export const ANTHROPIC_FAST_MODEL = 'claude-haiku-5-5';
export const GEMINI_FAST_MODEL = 'gemini-3.8-flash';

const fallback = {
  opening: 'The first sign was a light moving beneath the floorboards, slow enough to feel deliberate.',
  help: 'A new clue appeared where no one had been looking.',
  twist: 'The message was written in the player’s own handwriting, dated tomorrow.',
  suggest: ['Ask who left the clue and why.', 'Follow the unusual light before it disappears.'],
};
const provider = process.env.AI_PROVIDER === 'gemini' ? 'gemini' : 'anthropic';
const anthropicClient = provider === 'anthropic' && process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;
const geminiClient = provider === 'gemini' && process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;
const safePrompt = (value: unknown) => String(value ?? '').slice(0, 6000);
export async function generate(task: string, context: Record<string, unknown>) {
  if ((provider === 'anthropic' && !anthropicClient) || (provider === 'gemini' && !geminiClient)) {
    return fallback[task as keyof typeof fallback] ?? fallback.help;
  }
  const prompt = `You are a concise game master for a collaborative story game. Return only the requested text. Never write a whole story, never reveal private data, and obey this rating: ${safePrompt(context.rating)}. Task: ${task}. Genre: ${safePrompt(context.genre)}. Recent story: ${safePrompt(context.recent)}`;
  try {
    if (provider === 'gemini' && geminiClient) {
      const response = await geminiClient.models.generateContent({
        model: GEMINI_FAST_MODEL,
        contents: prompt,
        config: { maxOutputTokens: 180 },
      });
      return response.text?.trim() || fallback.help;
    }
    if (anthropicClient) {
      const response = await anthropicClient.messages.create({
        model: task === 'opening' ? ANTHROPIC_WRITING_MODEL : ANTHROPIC_FAST_MODEL,
        max_tokens: 180,
        messages: [{ role: 'user', content: prompt }],
      });
      const block = response.content[0];
      return block?.type === 'text' ? block.text.trim() : fallback.help;
    }
    return fallback[task as keyof typeof fallback] ?? fallback.help;
  } catch (error) {
    console.error('AI request failed; using fallback deck.', error);
    return fallback[task as keyof typeof fallback] ?? fallback.help;
  }
}
