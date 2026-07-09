import React from 'react';
import { AIMemory, GameDifficulty } from '../types';
import { Cpu, Brain, Database, Flame, Zap } from 'lucide-react';

interface AIPanelProps {
  memory: AIMemory;
  difficulty: GameDifficulty;
  isAiTurn: boolean;
  aiStatus: string;
  totalCards: number;
}

export default function AIPanel({
  memory,
  difficulty,
  isAiTurn,
  aiStatus,
  totalCards
}: AIPanelProps) {
  
  // Get capacities
  const getCapacity = () => {
    if (difficulty === 'easy') return 4;
    if (difficulty === 'medium') return 10;
    return 36; // hard / infinite
  };

  const getForgettingRateText = () => {
    if (difficulty === 'easy') return 'High (35% decay)';
    if (difficulty === 'medium') return 'Medium (15% decay)';
    return 'Zero (Persistent)';
  };

  const memoryCount = Object.keys(memory).length;
  const capacity = getCapacity();
  const usagePercentage = Math.min(100, Math.round((memoryCount / capacity) * 100));

  // Generate a list of indexes up to totalCards to draw a futuristic memory map
  const cardIndexes = Array.from({ length: totalCards }, (_, i) => i);

  return (
    <div className="bg-neutral-950 text-neutral-200 border border-neutral-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden font-mono text-xs">
      {/* Circuit background aesthetic */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${isAiTurn ? 'text-rose-400 animate-spin' : 'text-indigo-400'}`} style={{ animationDuration: '3s' }} />
          <span className="font-display font-bold text-sm tracking-widest text-neutral-100 uppercase">
            AI Brain Interface
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${isAiTurn ? 'bg-rose-500 animate-pulse' : 'bg-neutral-600'}`} />
          <span className={isAiTurn ? 'text-rose-400 font-bold' : 'text-neutral-400'}>
            {isAiTurn ? 'ACTIVE PROCESSING' : 'STANDBY IDLE'}
          </span>
        </div>
      </div>

      {/* AI Current Action Status */}
      <div className="mb-4 bg-neutral-900/60 border border-neutral-800/40 rounded-xl p-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Core State</span>
          <span className={`text-sm font-bold tracking-wide ${isAiTurn ? 'text-rose-400' : 'text-indigo-300'}`}>
            {aiStatus}
          </span>
        </div>
        <Brain className={`w-5 h-5 ${isAiTurn ? 'text-rose-400 animate-brain-pulse' : 'text-neutral-700'}`} />
      </div>

      {/* Memory Specifications Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/20">
          <div className="text-[9px] text-neutral-500 uppercase">RAM Capacity</div>
          <div className="text-sm font-bold text-neutral-100 mt-0.5 flex items-baseline gap-1">
            <span>{memoryCount}</span>
            <span className="text-xs text-neutral-500 font-normal">/ {capacity} Cards</span>
          </div>
          <div className="w-full bg-neutral-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              style={{ width: `${usagePercentage}%` }}
              className={`h-full transition-all duration-500 ${
                difficulty === 'easy' ? 'bg-emerald-500' : difficulty === 'medium' ? 'bg-indigo-500' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        <div className="bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-800/20">
          <div className="text-[9px] text-neutral-500 uppercase">Forgetting Decay</div>
          <div className="text-xs font-bold text-neutral-100 mt-1">
            {getForgettingRateText()}
          </div>
        </div>
      </div>

      {/* Memory Matrix Visualization */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-2">
          <span className="flex items-center gap-1"><Database className="w-3 h-3" /> MEMORY SECTORS MAP</span>
          <span>{memoryCount} LOCS CACHED</span>
        </div>
        
        {/* Vector Grid Map */}
        <div className="grid grid-cols-6 gap-1 bg-neutral-900/30 p-2 rounded-xl border border-neutral-800/30">
          {cardIndexes.map((idx) => {
            const rememberedItem = memory[idx];
            const isRemembered = !!rememberedItem;
            
            return (
              <div
                key={idx}
                className={`aspect-square rounded flex items-center justify-center border text-[10px] transition-all duration-300 relative group ${
                  isRemembered
                    ? 'bg-rose-950/20 border-rose-800 text-rose-300 shadow-[inset_0_0_4px_rgba(239,68,68,0.2)]'
                    : 'bg-neutral-950 border-neutral-900 text-neutral-700'
                }`}
                title={isRemembered ? `Card ${idx + 1}: ${rememberedItem.value}` : `Sector ${idx + 1} Empty`}
              >
                {isRemembered ? (
                  <span className="scale-90 animate-fade-in">{rememberedItem.value}</span>
                ) : (
                  <span className="opacity-30">{idx + 1}</span>
                )}
                
                {/* Micro corner accent for tech vibe */}
                <span className="absolute top-0 left-0 w-1 h-1 bg-neutral-800/20 rounded-tl" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-900 pt-2.5">
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500" /> Neural Mode: {difficulty.toUpperCase()}
        </span>
        <span>SYS.OK</span>
      </div>
    </div>
  );
}
