export type Player = { id: string; name: string; isAi?: boolean; tokens: number };
export type StoryTurn = {
  id: string; authorId: string; authorName: string; text: string;
  type: 'opening' | 'player' | 'ai' | 'help' | 'twist' | 'notice'; at: number;
};
export type GameConfig = {
  genre: string; world: string; rating: 'general' | 'teen' | 'mature';
  turnSeconds: number; wordLimit: number; randomOrder: boolean;
};
export type GameState = {
  phase: 'playing' | 'ended'; players: Player[]; order: string[];
  currentIndex: number; deadline: number | null; config: GameConfig;
  turns: StoryTurn[]; lastPlayerId: string | null; error: string | null;
};
export type GameAction =
  | { type: 'submit'; playerId: string; text: string; now?: number }
  | { type: 'pass'; playerId: string; now?: number }
  | { type: 'help'; playerId: string; text?: string; now?: number }
  | { type: 'twist'; playerId: string; text?: string; now?: number }
  | { type: 'timeout'; now?: number }
  | { type: 'end'; now?: number };

export const openingDeck: Record<string, string[]> = {
  Fantasy: ['The moon fell silent above the kingdom just as the first dragon woke beneath the city.'],
  Romance: ['The letter arrived three years late, carrying a name Rowan had promised never to remember.'],
  'Sci-Fi': ['At 04:17, every star on the observatory screens blinked out except one that was moving closer.'],
  Mystery: ['The locked room was empty, except for a warm cup of tea and a note addressed to the detective.'],
  Horror: ['The house had been empty for fifty years, but tonight someone inside whispered the visitor’s name.'],
};
const fallbackHelp = ['A forgotten door opened nearby.', 'Someone recognized the truth.'];
const fallbackTwists = ['A second moon rose, revealing a message written across its surface.', 'The one thing everyone trusted began counting down.'];

const words = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
const nextIndex = (state: GameState) => {
  if (state.order.length < 2) return 0;
  if (!state.config.randomOrder) return (state.currentIndex + 1) % state.order.length;
  const choices = state.order.map((_, index) => index).filter((index) => state.order[index] !== state.lastPlayerId);
  return choices[Math.floor(Math.random() * choices.length)] ?? 0;
};
const addTurn = (state: GameState, authorId: string, text: string, type: StoryTurn['type'], now: number): GameState => {
  const player = state.players.find((item) => item.id === authorId);
  if (!player) return { ...state, error: 'That player is not in this game.' };
  const index = state.order.indexOf(authorId);
  return {
    ...state, currentIndex: index < 0 ? state.currentIndex : index,
    deadline: state.config.turnSeconds ? now + state.config.turnSeconds * 1000 : null,
    lastPlayerId: authorId, error: null,
    turns: [...state.turns, { id: `${now}-${state.turns.length}`, authorId, authorName: player.name, text, type, at: now }],
  };
};
const advance = (state: GameState, now: number, notice?: string): GameState => {
  const index = nextIndex(state);
  const turns = notice ? [...state.turns, { id: `${now}-notice`, authorId: 'system', authorName: 'Game Master', text: notice, type: 'notice' as const, at: now }] : state.turns;
  return { ...state, currentIndex: index, deadline: state.config.turnSeconds ? now + state.config.turnSeconds * 1000 : null, turns, error: null };
};
export function createGame(config: GameConfig, players: Player[], opening?: string, now = Date.now()): GameState {
  const first = players[0]?.id ?? '';
  return {
    phase: 'playing', players, order: players.map((player) => player.id), currentIndex: 0,
    deadline: config.turnSeconds ? now + config.turnSeconds * 1000 : null, config,
    turns: [{ id: `${now}-opening`, authorId: 'gm', authorName: 'Game Master', text: opening ?? openingDeck[config.genre]?.[0] ?? 'The story begins with a door that should not exist.', type: 'opening', at: now }],
    lastPlayerId: first, error: null,
  };
}
export function currentPlayer(state: GameState) { return state.players[state.currentIndex]; }
export function wordCount(text: string) { return words(text); }
export function reduceGame(state: GameState, action: GameAction): GameState {
  if (state.phase === 'ended' && action.type !== 'end') return state;
  const now = action.now ?? Date.now();
  if (action.type === 'end') return { ...state, phase: 'ended', deadline: null };
  if (action.type === 'timeout') return advance(state, now, 'Time is up — the turn passes to the next storyteller.');
  const current = currentPlayer(state);
  if (!current || action.playerId !== current.id) return { ...state, error: 'It is not your turn.' };
  if (action.type === 'pass') return advance(state, now, `${current.name} passed this turn.`);
  if (action.type === 'submit' || action.type === 'help' || action.type === 'twist') {
    const text = action.text?.trim() ?? (action.type === 'help' ? fallbackHelp[state.turns.length % fallbackHelp.length] : fallbackTwists[state.turns.length % fallbackTwists.length]);
    if (!text) return { ...state, error: 'Write a sentence before submitting.' };
    if (words(text) > state.config.wordLimit) return { ...state, error: `Keep this turn to ${state.config.wordLimit} words or fewer.` };
    if ((action.type === 'help' || action.type === 'twist') && current.tokens < 1) return { ...state, error: 'You have no AI help tokens left.' };
    const type = action.type === 'submit' ? (current.isAi ? 'ai' : 'player') : action.type;
    const updated = addTurn(state, action.playerId, text, type, now);
    const players = updated.players.map((player) => player.id === current.id && action.type !== 'submit' ? { ...player, tokens: player.tokens - 1 } : player);
    return advance({ ...updated, players }, now);
  }
  return state;
}
