import type { Genre, Theme } from '../types';

const theme = (accent: string, background: string, card: string, heading: string, font: string): Theme =>
  ({ accent, background, card, heading, font });

export const builtInGenres: Genre[] = [
  { id: 'fantasy', name: 'Fantasy', icon: '✦', hue: 43, theme: theme('#d4a017', '#0b1a12', '#14281d', '#d4a017', 'Palatino, Georgia, serif'), builtIn: true },
  { id: 'romance', name: 'Romance', icon: '♡', hue: 340, theme: theme('#e75480', '#1f0f16', '#2d1621', '#e75480', '"Brush Script MT", cursive'), builtIn: true },
  { id: 'sci-fi', name: 'Sci-Fi', icon: '◉', hue: 188, theme: theme('#00e5ff', '#070b1a', '#0f1730', '#00e5ff', '"Courier New", monospace'), builtIn: true },
  { id: 'mystery', name: 'Mystery', icon: '⌕', hue: 32, theme: theme('#ffb347', '#121212', '#1e1e1e', '#ffb347', '"Courier New", monospace'), builtIn: true },
  { id: 'horror', name: 'Horror', icon: '☾', hue: 355, theme: theme('#c1121f', '#0a0506', '#1a0d0e', '#c1121f', 'Georgia, serif'), builtIn: true },
  { id: 'comedy', name: 'Comedy', icon: '✺', hue: 35, theme: theme('#ff9f1c', '#1a1230', '#2a1f4a', '#ff9f1c', 'Trebuchet MS, sans-serif'), builtIn: true },
  { id: 'drama', name: 'Drama', icon: '◇', hue: 249, theme: theme('#9b8cff', '#12101c', '#1d1a2e', '#9b8cff', 'Georgia, serif'), builtIn: true },
  { id: 'superhero', name: 'Superhero', icon: '⚡', hue: 4, theme: theme('#ff3b30', '#0a1428', '#14233f', '#ff3b30', 'Impact, sans-serif'), builtIn: true },
];

export const customTheme = (hue: number): Theme => ({
  accent: `hsl(${hue} 70% 55%)`, background: `hsl(${hue} 40% 7%)`,
  card: `hsl(${hue} 30% 13%)`, heading: `hsl(${hue} 70% 65%)`, font: 'Georgia, serif',
});

export const makeCustomGenre = (name: string, icon: string, hue: number): Genre => ({
  id: `custom-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
  name: name.trim(), icon, hue, theme: customTheme(hue),
});
