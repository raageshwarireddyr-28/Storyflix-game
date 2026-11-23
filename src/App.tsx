import { useState } from 'react';
import { useStore } from './store';
import { Cover } from './components/Cover';
import { Scene } from './components/Scene';
import { Game } from './components/Game';
import { RolePlay } from './components/RolePlay';
import { Library } from './components/Library';
import type { Genre } from './types';
import './styles.css';

function App() {
  const { genres, screen, setup, goHome, startSetup, addGenre, removeGenre } = useStore();
  const [genreId, setGenreId] = useState('fantasy');
  const [worldTitle, setWorldTitle] = useState('');
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [rolePlayStarted, setRolePlayStarted] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const active = genres.find((genre) => genre.id === genreId) ?? genres[0];
  if (gameStarted) return <Game genre={active} world={worldTitle || 'Original world'} solo={setup?.players === 'solo'} onExit={() => setGameStarted(false)} />;
  if (rolePlayStarted) return <RolePlay genre={active} world={worldTitle || 'Original world'} onExit={() => setRolePlayStarted(false)} />;
  if (libraryOpen) return <Library onExit={() => setLibraryOpen(false)} />;
  if (screen === 'setup' && setup) return <Setup genres={genres} active={active} goHome={goHome} genreId={genreId} setGenreId={setGenreId} worldTitle={worldTitle} setWorldTitle={setWorldTitle} onStart={() => setup.mode === 'roleplay' ? setRolePlayStarted(true) : setGameStarted(true)} />;
  return <main className="app"><header><button className="logo" onClick={goHome}>STORY<span>FLIX</span></button><button className="stories" onClick={() => setLibraryOpen(true)}>My Stories <b>{useStore.getState().stories.length}</b></button></header>
    <section className="hero"><Scene genre={active} /><div className="hero-copy"><p className="eyebrow">YOUR NEXT STORY AWAITS</p><h1>Write something<br /><em>unforgettable.</em></h1><p>Not a generator. A game where every turn changes the story.</p></div></section>
    <section className="home-content"><p className="eyebrow">CHOOSE YOUR ADVENTURE</p><div className="mode-grid">
      <button className="mode-card featured" onClick={() => startSetup('game')}><span>✦</span><strong>Story Game</strong><small>Take turns. Make choices. Build a world together.</small><i>Play now →</i></button>
      <button className="mode-card" onClick={() => startSetup('roleplay')}><span>◈</span><strong>Role Play</strong><small>Become a character in a living, breathing scene.</small><i>Enter scene →</i></button>
      <button className="mode-card" onClick={() => alert('Room joining arrives in Milestone 4.')}><span>⌁</span><strong>Join a Room</strong><small>Enter a four-letter code and play with friends.</small><i>Join →</i></button>
    </div><div className="section-heading"><div><p className="eyebrow">WORLDS TO EXPLORE</p><h2>Pick a genre</h2></div><button className="text-button" onClick={() => setShowGenreForm(!showGenreForm)}>+ Add genre</button></div>
    {showGenreForm && <GenreForm onAdd={(name, icon, hue) => { addGenre(name, icon, hue); setShowGenreForm(false); }} />}
    <div className="genre-grid">{genres.map((genre) => <div className="genre-wrap" key={genre.id}><button className={`genre-card ${genre.id === genreId ? 'selected' : ''}`} onClick={() => setGenreId(genre.id)} style={{ '--genre-accent': genre.theme.accent } as React.CSSProperties}><span>{genre.icon}</span><strong>{genre.name}</strong></button>{!genre.builtIn && <button className="delete-genre" onClick={() => removeGenre(genre.id)} aria-label={`Delete ${genre.name}`}>×</button>}</div>)}</div>
    </section><footer>Text stays on your device unless you choose to send it through the StoryFlix server to Anthropic. <span>Music integration is coming later.</span></footer>
  </main>;
}

function GenreForm({ onAdd }: { onAdd: (name: string, icon: string, hue: number) => void }) {
  const [name, setName] = useState(''); const [icon, setIcon] = useState('✦'); const [hue, setHue] = useState(200);
  return <form className="genre-form" onSubmit={(e) => { e.preventDefault(); onAdd(name, icon, hue); }}><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Genre name" /><input value={icon} onChange={(e) => setIcon(e.target.value)} aria-label="Genre icon" maxLength={2} /><input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(Number(e.target.value))} /><button>Add</button></form>;
}

type SetupProps = { genres: Genre[]; active: Genre; goHome: () => void; genreId: string; setGenreId: (id: string) => void; worldTitle: string; setWorldTitle: (title: string) => void; onStart: () => void };
function Setup({ genres, active, goHome, genreId, setGenreId, worldTitle, setWorldTitle, onStart }: SetupProps) {
  const [step, setStep] = useState(1); const [players, setPlayers] = useState('solo');
  return <main className="app themed" style={{ '--bg': active.theme.background, '--accent': active.theme.accent, '--card': active.theme.card, '--font-heading': active.theme.font } as React.CSSProperties}><header><button className="logo" onClick={goHome}>STORY<span>FLIX</span></button><button className="back" onClick={goHome}>← Back</button></header><Scene genre={active} /><section className="setup"><p className="eyebrow">SET UP YOUR STORY · 0{step}/03</p><h1>{step === 1 ? 'Who is playing?' : step === 2 ? 'Choose your world.' : 'Make it yours.'}</h1>
    {step === 1 && <div className="choice-grid">{[['solo','Solo with AI','You and an AI companion'],['friends','Friends in a room','Invite players on their own phones'],['pass','Pass-and-play','Share one device']].map(([value, title, copy]) => <button key={value} className={players === value ? 'choice selected' : 'choice'} onClick={() => setPlayers(value)}><strong>{title}</strong><small>{copy}</small></button>)}</div>}
    {step === 2 && <><div className="genre-grid setup-genres">{genres.map((genre) => <button key={genre.id} className={`genre-card ${genre.id === genreId ? 'selected' : ''}`} onClick={() => setGenreId(genre.id)}><span>{genre.icon}</span><strong>{genre.name}</strong></button>)}</div><input className="wide-input" value={worldTitle} onChange={(e) => setWorldTitle(e.target.value)} placeholder="Name your original world (optional)" /></>}
    {step === 3 && <div className="summary"><Cover title={worldTitle || 'Untitled world'} genre={active} /><p><b>{active.name}</b> · {worldTitle || 'Original world'}<br />{players === 'solo' ? 'Solo with AI' : players === 'friends' ? 'Friends in a room' : 'Pass-and-play'}</p><small>The game master will open with one intriguing sentence. You write the story together, one turn at a time.</small></div>}
    <div className="setup-actions"><button className="text-button" onClick={step === 1 ? goHome : () => setStep(step - 1)}>← {step === 1 ? 'Cancel' : 'Previous'}</button>{step < 3 ? <button className="primary" onClick={() => setStep(step + 1)}>Continue →</button> : <button className="primary" onClick={onStart}>Start story →</button>}</div>
  </section></main>;
}
export default App;
