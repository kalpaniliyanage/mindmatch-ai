import React from 'react';
import { GameDifficulty } from '../types';
import { audio } from '../utils/audio';

interface DifficultySelectorProps {
  selectedDifficulty: GameDifficulty;
  onChange: (difficulty: GameDifficulty) => void;
}

export default function DifficultySelector({ selectedDifficulty, onChange }: DifficultySelectorProps) {
  const options: {
    id: GameDifficulty;
    label: string;
    grid: string;
    cardsCount: number;
    description: string;
    aiStrength: string;
    colorClass: string;
  }[] = [
    {
      id: 'easy',
      label: 'Easy',
      grid: '4 × 2 Grid',
      cardsCount: 8,
      description: 'Quick match. Perfect for training.',
      aiStrength: 'Forgetful AI (40% memory)',
      colorClass: 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      id: 'medium',
      label: 'Medium',
      grid: '4 × 4 Grid',
      cardsCount: 16,
      description: 'Standard game size. Moderate challenge.',
      aiStrength: 'Smart AI (70% memory)',
      colorClass: 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    },
    {
      id: 'hard',
      label: 'Hard',
      grid: '6 × 6 Grid',
      cardsCount: 36,
      description: 'Extensive challenge. Extreme memory test.',
      aiStrength: 'Genius AI (98% memory)',
      colorClass: 'border-rose-500/20 text-rose-600 dark:text-rose-400'
    }
  ];

  const handleSelect = (diff: GameDifficulty) => {
    audio.playClick();
    onChange(diff);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
        Select Game Difficulty
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const isActive = selectedDifficulty === opt.id;
          
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-300 relative group cursor-pointer ${
                isActive
                  ? 'bg-neutral-900 border-indigo-500 shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-zinc-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-display font-bold text-sm ${isActive ? 'text-neutral-100' : 'text-neutral-800 dark:text-neutral-200'}`}>
                  {opt.label}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-semibold ${opt.colorClass} bg-neutral-50 dark:bg-zinc-950`}>
                  {opt.grid}
                </span>
              </div>
              
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight mb-3">
                {opt.description}
              </p>

              <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-zinc-700 group-hover:bg-indigo-400 transition-colors" />
                <span>{opt.aiStrength}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
