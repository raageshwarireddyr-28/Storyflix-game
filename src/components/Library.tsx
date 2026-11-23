import { useState } from 'react';
import { useStore } from '../store';

export function Library({ onExit }: { onExit: () => void }) {
  const { stories, deleteStory } = useStore();
  const [query, setQuery] = useState('');
  const visible = stories.filter((story) => `${story.title} ${story.genre} ${story.world}`.toLowerCase().includes(query.toLowerCase()));
  return <main className="app library"><header><button className="logo" onClick={onExit}>STORY<span>FLIX</span></button><button className="back" onClick={onExit}>← Back</button></header><section className="library-content"><p className="eyebrow">YOUR COLLECTION</p><h1>My Stories</h1><input className="wide-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your stories…" />{visible.length === 0 ? <div className="empty-state"><span>✦</span><h2>No stories yet</h2><p>Finish a game and save it here.</p></div> : <div className="story-shelf">{visible.map((story) => <article className="saved-story" key={story.id}><div className="saved-cover">✦</div><div><p className="eyebrow">{story.genre} · {story.mode === 'game' ? 'STORY GAME' : 'ROLE PLAY'}</p><h2>{story.title}</h2><small>{new Date(story.createdAt).toLocaleDateString()} · {story.turns.length} turns</small><p>{story.turns.find((turn) => turn.type !== 'opening')?.text ?? 'An untold story.'}</p><button className="text-button" onClick={() => deleteStory(story.id)}>Delete</button></div></article>)}</div>}</section></main>;
}
