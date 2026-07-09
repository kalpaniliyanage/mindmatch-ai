import React from 'react';
import { GameTheme } from '../types';
import { THEME_STYLING, THEME_VALUES } from '../utils/gameUtils';
import { audio } from '../utils/audio';

interface ThemeSelectorProps {
  selectedTheme: GameTheme;
  onChange: (theme: GameTheme) => void;
}

export default function ThemeSelector({ selectedTheme, onChange }: ThemeSelectorProps) {
  const themes: { id: GameTheme; label: string; description: string; preview: string[] }[] = [
    {
      id: 'animals',
      label: 'Animals',
      description: 'Cute creatures and wildlife pairs',
      preview: ['🐶', '🐱', '🦁', '🐼']
    },
    {
      id: 'programming',
      label: 'Developer',
      description: 'Tech tags, gears, and codelogos',
      preview: ['💻', '🐍', '🦀', '🚀']
    },
    {
      id: 'space',
      label: 'Cosmic Space',
      description: 'Distant planets, aliens, and stars',
      preview: ['🚀', '🌎', '👽', '🪐']
    }
  ];

  const handleSelect = (theme: GameTheme) => {
    audio.playClick();
    onChange(theme);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
        Choose Cards Theme
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {themes.map((theme) => {
          const isActive = selectedTheme === theme.id;
          const styling = THEME_STYLING[theme.id];
          
          return (
            <button
              key={theme.id}
              onClick={() => handleSelect(theme.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 border-indigo-500 shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Background accent glow when active */}
              {isActive && (
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
              )}
              
              <div className="flex justify-between items-center mb-1">
                <span className={`font-display font-bold text-sm leading-none ${isActive ? 'text-neutral-100' : 'text-neutral-800 dark:text-neutral-200'}`}>
                  {theme.label}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight mb-3">
                {theme.description}
              </p>

              {/* Card Previews */}
              <div className="flex gap-1">
                {theme.preview.map((emoji, idx) => (
                  <span
                    key={idx}
                    className="w-7 h-7 rounded-md bg-neutral-100 dark:bg-zinc-800 border border-neutral-200/50 dark:border-zinc-700/50 flex items-center justify-center text-sm shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{ transitionDelay: `${idx * 40}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
