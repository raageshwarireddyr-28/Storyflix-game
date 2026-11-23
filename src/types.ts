export type GenreId = string;
export type Mode = 'game' | 'roleplay';
export type Theme = { accent: string; background: string; card: string; heading: string; font: string };
export type Genre = { id: GenreId; name: string; icon: string; hue: number; builtIn?: boolean; theme: Theme };
export type SetupState = {
  mode: Mode; players: 'solo' | 'friends' | 'pass'; genreId: GenreId;
  worldTitle: string; rating: 'general' | 'teen' | 'mature';
};
export type SavedStory = {
  id: string; title: string; genre: string; mode: Mode; world: string;
  players: string[]; turns: { authorName: string; text: string; type: string; at: number }[]; createdAt: number;
};
