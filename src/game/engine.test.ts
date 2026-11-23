import { describe, expect, it } from 'vitest';
import { createGame, reduceGame, wordCount } from './engine';

const config = { genre: 'Mystery', world: 'Original', rating: 'general' as const, turnSeconds: 30, wordLimit: 5, randomOrder: false };
const players = [{ id: 'a', name: 'A', tokens: 2 }, { id: 'b', name: 'B', tokens: 2 }];
it('counts words and rejects over-limit turns', () => {
  expect(wordCount('one two three')).toBe(3);
  const game = createGame(config, players, 'Open.');
  expect(reduceGame(game, { type: 'submit', playerId: 'a', text: 'one two three four five six', now: 1 }).error).toContain('5 words');
});
it('advances after submit, pass, and timeout', () => {
  const game = createGame(config, players, 'Open.', 0);
  const next = reduceGame(game, { type: 'submit', playerId: 'a', text: 'A clue appears.', now: 100 });
  expect(next.currentIndex).toBe(1);
  expect(reduceGame(next, { type: 'pass', playerId: 'b', now: 200 }).turns.at(-1)?.type).toBe('notice');
  expect(reduceGame(next, { type: 'timeout', now: 300 }).turns.at(-1)?.type).toBe('notice');
});
it('spends a token on help and twist', () => {
  const game = createGame(config, players, 'Open.');
  const helped = reduceGame(game, { type: 'help', playerId: 'a', now: 1 });
  expect(helped.players[0].tokens).toBe(1);
  expect(helped.turns.at(-1)?.type).toBe('help');
});
