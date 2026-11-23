import type { Genre } from '../types';
export function Cover({ title, genre }: { title: string; genre: Genre }) {
  return <div className="cover" style={{ '--cover-accent': genre.theme.accent } as React.CSSProperties}>
    <div className="cover-title">{title}</div><div className="cover-scene">{genre.icon}</div>
  </div>;
}
