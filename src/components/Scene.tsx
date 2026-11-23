import type { Genre } from '../types';
export function Scene({ genre }: { genre: Genre }) {
  return <div className="scene" aria-hidden="true">
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice">
      <circle cx="300" cy="72" r="44" fill="var(--accent)" opacity=".55" />
      <path d="M0 220 80 130 145 210 230 105 330 220 400 150V300H0Z" fill="var(--accent)" opacity=".3" />
      <path d="M0 245 95 185 170 245 265 165 400 245V300H0Z" fill="#050508" opacity=".8" />
      <path d="M155 245V175h90v70m-105 0v-85h18v-22h20v22h18v-22h20v22h18v85" fill="#050508" />
      <path d="M175 245v-45h18v45m36 0v-45h18v45" stroke="var(--accent)" strokeWidth="4" opacity=".7" />
      <text x="20" y="280" fill="var(--accent)" opacity=".7" fontSize="10" letterSpacing="3">{genre.name.toUpperCase()} WORLD</text>
    </svg>
  </div>;
}
