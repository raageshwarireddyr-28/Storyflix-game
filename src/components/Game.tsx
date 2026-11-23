import { useEffect, useMemo, useState } from 'react';
import { createGame, currentPlayer, reduceGame, wordCount, type GameConfig, type GameState } from '../game/engine';
import { useStore } from '../store';
import type { Genre } from '../types';
import { Scene } from './Scene';

type Props = { genre: Genre; world: string; solo: boolean; onExit: () => void };
export function Game({ genre, world, solo, onExit }: Props) {
  const saveStory = useStore((state) => state.saveStory);
  const [game, setGame] = useState<GameState>(() => {
    const players = solo ? [{ id: 'you', name: 'You', tokens: 2 }, { id: 'ai', name: 'Maya', isAi: true, tokens: 99 }] : [
      { id: 'you', name: 'Player 1', tokens: 2 }, { id: 'friend', name: 'Player 2', tokens: 2 },
    ];
    const config: GameConfig = { genre: genre.name, world, rating: 'general', turnSeconds: 60, wordLimit: 50, randomOrder: true };
    return createGame(config, players);
  });
  const [draft, setDraft] = useState('');
  const [remaining, setRemaining] = useState(game.deadline ? Math.ceil((game.deadline - Date.now()) / 1000) : 0);
  const current = currentPlayer(game);
  const isYourTurn = current?.id === 'you';
  const story = useMemo(() => game.turns.filter((turn) => turn.type !== 'notice'), [game.turns]);
  useEffect(() => {
    if (!game.deadline || game.phase !== 'playing') return;
    const timer = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((game.deadline! - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setGame((state) => reduceGame(state, { type: 'timeout' }));
    }, 250);
    return () => window.clearInterval(timer);
  }, [game.deadline, game.phase]);
  useEffect(() => {
    if (solo && current?.isAi && game.phase === 'playing') {
      const timer = window.setTimeout(() => setGame((state) => reduceGame(state, { type: 'submit', playerId: 'ai', text: 'Maya noticed the clue had been planted recently, and somewhere nearby a clock began to count backward.' })), 700);
      return () => window.clearTimeout(timer);
    }
  }, [current?.id, game.phase, solo]);
  const act = (action: Parameters<typeof reduceGame>[1]) => { setGame((state) => reduceGame(state, action)); setDraft(''); };
  const finish = () => { saveStory({ id: `story-${Date.now()}`, title: `${genre.name} story`, genre: genre.name, mode: 'game', world, players: game.players.map((player) => player.name), turns: game.turns.map((turn) => ({ authorName: turn.authorName, text: turn.text, type: turn.type, at: turn.at })), createdAt: Date.now() }); };
  return <main className="app themed game-screen" style={{ '--bg': genre.theme.background, '--accent': genre.theme.accent, '--card': genre.theme.card, '--font-heading': genre.theme.font } as React.CSSProperties}>
    <header><button className="logo" onClick={onExit}>STORY<span>FLIX</span></button><button className="back" onClick={onExit}>← Exit game</button></header><Scene genre={genre} />
    <section className="game-layout"><div className="game-top"><div><p className="eyebrow">{genre.name.toUpperCase()} · {world}</p><h1>{game.phase === 'ended' ? 'The story is complete.' : 'The story so far'}</h1></div><div className="turn-badge">{game.phase === 'ended' ? 'RESULTS' : `${current?.name ?? '—'}’S TURN`}<b>{game.phase === 'playing' && game.deadline ? `${remaining}s` : ''}</b></div></div>
      <article className="story-panel">{story.map((turn) => <div className={`story-line ${turn.type}`} key={turn.id}><small>{turn.authorName}{turn.type === 'twist' ? ' · ⚡ twist' : turn.type === 'help' ? ' · AI help' : ''}</small><p>{turn.text}</p></div>)}{game.turns.filter((turn) => turn.type === 'notice').map((turn) => <div className="notice" key={turn.id}>{turn.text}</div>)}</article>
      {game.phase === 'playing' ? <div className="composer">{isYourTurn ? <><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write the next sentence…" aria-label="Your story turn" /><div className={`word-count ${wordCount(draft) > game.config.wordLimit ? 'over' : ''}`}>{wordCount(draft)} / {game.config.wordLimit} words</div><div className="composer-actions"><button className="text-button" onClick={() => act({ type: 'pass', playerId: 'you' })}>Pass</button><button className="secondary" onClick={() => act({ type: 'help', playerId: 'you' })}>✦ AI help ({game.players[0].tokens})</button><button className="secondary" onClick={() => act({ type: 'twist', playerId: 'you' })}>⚡ Twist</button><button className="primary" disabled={!draft.trim() || wordCount(draft) > game.config.wordLimit} onClick={() => act({ type: 'submit', playerId: 'you', text: draft })}>Submit turn →</button></div></> : <div className="waiting"><span className="pulse" /> {current?.name} is writing…</div>}</div> : <div className="results-actions"><button className="primary" onClick={() => { finish(); window.print(); }}>Save & print story</button><button className="secondary" onClick={onExit}>Back home</button></div>}
      {game.error && <div className="error">{game.error}</div>}
    </section>
  </main>;
}
