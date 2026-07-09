import React from 'react';
import { ActivePlayer, GameMode, GameStats } from '../types';
import { Sparkles, Trophy, RotateCcw, Timer, Flame, Layers } from 'lucide-react';
import { audio } from '../utils/audio';

interface ScoreBoardProps {
  mode: GameMode;
  stats: GameStats;
  aiStats?: GameStats;
  activePlayer: ActivePlayer;
  totalPairs: number;
  bestScore: number;
  onReset: () => void;
}

export default function ScoreBoard({
  mode,
  stats,
  aiStats,
  activePlayer,
  totalPairs,
  bestScore,
  onReset
}: ScoreBoardProps) {
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    audio.playClick();
    onReset();
  };

  const matchPercent = Math.min(100, Math.round((stats.matches / totalPairs) * 100));
  const aiMatchPercent = aiStats ? Math.min(100, Math.round((aiStats.matches / totalPairs) * 100)) : 0;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm">
      {/* Turn indicator / Header for Versus Mode */}
      {mode === 'vs-ai' && (
        <div className="flex gap-4 items-center justify-between border-b border-neutral-100 dark:border-zinc-800 pb-4 mb-4">
          {/* Player stats */}
          <div className={`flex-1 flex flex-col p-3 rounded-xl transition-all duration-300 ${
            activePlayer === 'player'
              ? 'bg-indigo-500/10 border border-indigo-500/20 glow-indigo'
              : 'border border-transparent opacity-60'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                You (Player)
              </span>
              {activePlayer === 'player' && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping ml-auto" />
              )}
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-display font-black text-neutral-800 dark:text-neutral-100">
                {stats.score} <span className="text-xs font-normal text-neutral-400">PTS</span>
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Matches: {stats.matches}/{totalPairs}
              </span>
            </div>
          </div>

          <div className="font-display font-bold text-neutral-400 select-none text-center px-1">
            VS
          </div>

          {/* AI stats */}
          <div className={`flex-1 flex flex-col p-3 rounded-xl transition-all duration-300 ${
            activePlayer === 'ai'
              ? 'bg-rose-500/10 border border-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
              : 'border border-transparent opacity-60'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                MindMatch AI
              </span>
              {activePlayer === 'ai' && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping ml-auto" />
              )}
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-2xl font-display font-black text-neutral-800 dark:text-neutral-100">
                {aiStats?.score || 0} <span className="text-xs font-normal text-neutral-400">PTS</span>
              </span>
              <span className="text-xs font-mono text-neutral-500">
                Matches: {aiStats?.matches || 0}/{totalPairs}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Rows */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Timer */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-zinc-950/50 rounded-xl border border-neutral-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center text-neutral-500 shrink-0">
            <Timer size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Time Elapsed</div>
            <div className="text-lg font-mono font-bold text-neutral-800 dark:text-neutral-100 leading-none mt-0.5">
              {formatTime(stats.timeElapsed)}
            </div>
          </div>
        </div>

        {/* Moves Count */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-zinc-950/50 rounded-xl border border-neutral-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center text-neutral-500 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Moves</div>
            <div className="text-lg font-mono font-bold text-neutral-800 dark:text-neutral-100 leading-none mt-0.5">
              {stats.moves}
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-zinc-950/50 rounded-xl border border-neutral-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center text-neutral-500 shrink-0">
            <Flame size={18} className={stats.streak > 1 ? 'text-amber-500 animate-pulse' : 'text-neutral-400'} />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Match Streak</div>
            <div className="text-lg font-mono font-bold text-neutral-800 dark:text-neutral-100 leading-none mt-0.5 flex items-center gap-1">
              <span>{stats.streak}</span>
              {stats.streak >= 3 && <Sparkles size={14} className="text-amber-500" />}
            </div>
          </div>
        </div>

        {/* High Score / Solo Score */}
        <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-zinc-950/50 rounded-xl border border-neutral-100 dark:border-zinc-800/50">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-zinc-900 flex items-center justify-center text-neutral-500 shrink-0">
            <Trophy size={18} className="text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              {mode === 'solo' ? 'Your Score' : 'Best Record'}
            </div>
            <div className="text-lg font-mono font-bold text-neutral-800 dark:text-neutral-100 leading-none mt-0.5">
              {mode === 'solo' ? stats.score : bestScore}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bars for Matching */}
      <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-zinc-800/50 flex flex-col gap-2">
        <div className="flex justify-between text-xs font-mono text-neutral-500">
          <span>Overall Match Progress</span>
          <span>{Math.round(((stats.matches + (aiStats?.matches || 0)) / totalPairs) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${matchPercent}%` }}
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          />
          {aiStats && (
            <div
              style={{ width: `${aiMatchPercent}%` }}
              className="h-full bg-rose-500 transition-all duration-500 ease-out border-l border-neutral-900/10"
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-100 dark:border-zinc-800/50">
        <div className="text-xs text-neutral-400">
          {mode === 'solo' ? (
            <p>Find matches to gain points. Mismatches lose points.</p>
          ) : (
            <p>If you find a match, you keep your turn!</p>
          )}
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
        >
          <RotateCcw size={13} />
          <span>Restart Game</span>
        </button>
      </div>
    </div>
  );
}
