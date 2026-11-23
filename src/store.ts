import { create } from 'zustand';
import { builtInGenres, makeCustomGenre } from './data/genres';
import type { Genre, SavedStory, SetupState } from './types';

type Store = {
  genres: Genre[]; screen: 'home' | 'setup'; setup: SetupState | null; stories: SavedStory[];
  goHome: () => void; startSetup: (mode: 'game' | 'roleplay') => void;
  addGenre: (name: string, icon: string, hue: number) => void; removeGenre: (id: string) => void;
  saveStory: (story: SavedStory) => void; deleteStory: (id: string) => void;
};
const saved = localStorage.getItem('storyflix-custom-genres');
const custom: Genre[] = saved ? JSON.parse(saved) as Genre[] : [];
const savedStories = localStorage.getItem('storyflix-stories');
const stories: SavedStory[] = savedStories ? JSON.parse(savedStories) as SavedStory[] : [];
export const useStore = create<Store>((set) => ({
  genres: [...builtInGenres, ...custom], screen: 'home', setup: null, stories,
  goHome: () => set({ screen: 'home', setup: null }),
  startSetup: (mode) => set({ screen: 'setup', setup: { mode, players: 'solo', genreId: 'fantasy', worldTitle: '', rating: 'general' } }),
  addGenre: (name, icon, hue) => set((state) => {
    if (!name.trim() || state.genres.some((genre) => genre.name.toLowerCase() === name.trim().toLowerCase())) return state;
    const genre = makeCustomGenre(name, icon, hue);
    const genres = [...state.genres, genre];
    localStorage.setItem('storyflix-custom-genres', JSON.stringify(genres.filter((item) => !item.builtIn)));
    return { genres };
  }),
  removeGenre: (id) => set((state) => {
    const genres = state.genres.filter((genre) => genre.id !== id || genre.builtIn);
    localStorage.setItem('storyflix-custom-genres', JSON.stringify(genres.filter((item) => !item.builtIn)));
    return { genres };
  }),
  saveStory: (story) => set((state) => {
    const stories = [story, ...state.stories.filter((item) => item.id !== story.id)];
    localStorage.setItem('storyflix-stories', JSON.stringify(stories));
    return { stories };
  }),
  deleteStory: (id) => set((state) => {
    const stories = state.stories.filter((story) => story.id !== id);
    localStorage.setItem('storyflix-stories', JSON.stringify(stories));
    return { stories };
  }),
}));
