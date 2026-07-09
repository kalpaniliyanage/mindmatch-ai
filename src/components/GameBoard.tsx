import React from 'react';
import { Card, GameDifficulty, GameTheme } from '../types';
import { THEME_STYLING } from '../utils/gameUtils';
import { audio } from '../utils/audio';

interface GameBoardProps {
  cards: Card[];
  onCardClick: (index: number) => void;
  difficulty: GameDifficulty;
  theme: GameTheme;
  isInteractionDisabled: boolean;
}

export default function GameBoard({
  cards,
  onCardClick,
  difficulty,
  theme,
  isInteractionDisabled
}: GameBoardProps) {
  
  const styling = THEME_STYLING[theme];

  // Set standard grid column classes based on difficulty
  const getGridColsClass = () => {
    if (difficulty === 'easy') {
      return 'grid-cols-4 max-w-xl mx-auto';
    }
    if (difficulty === 'medium') {
      return 'grid-cols-4 max-w-2xl mx-auto';
    }
    return 'grid-cols-6 max-w-3xl mx-auto'; // Hard has 36 cards, so 6 columns is perfect
  };

  const handleCardPress = (index: number, card: Card) => {
    if (isInteractionDisabled || card.isFlipped || card.isMatched) return;
    audio.playFlip();
    onCardClick(index);
  };

  return (
    <div className="w-full select-none py-2">
      <div className={`grid ${getGridColsClass()} gap-3 sm:gap-4 px-2`}>
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardPress(idx, card)}
              className={`perspective-1000 aspect-[3/4] cursor-pointer transition-all duration-300 ${
                card.isMatched ? 'opacity-80 scale-95 hover:scale-95' : 'hover:scale-105 hover:-translate-y-0.5'
              }`}
              style={{
                // Tiny entrance transition delay per card for cool ripple effect
                animation: 'cardEntrance 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                animationDelay: `${idx * 20}ms`
              }}
            >
              {/* Inner card with 3D rotation */}
              <div
                className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
                  isRevealed ? 'rotate-y-180' : ''
                }`}
              >
                {/* CARD BACK SIDE (Face Down) */}
                <div
                  className={`absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center rounded-xl border-2 font-display font-black text-2xl sm:text-3xl select-none transition-colors duration-300 ${styling.cardBack}`}
                >
                  {/* Futuristic visual tech decorations */}
                  <span className="opacity-40 font-semibold select-none text-base sm:text-lg">
                    ?
                  </span>
                  
                  {/* Subtle technical corner marks */}
                  <span className="absolute top-1.5 left-1.5 w-1 h-1 bg-white/30 rounded-full" />
                  <span className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-white/30 rounded-full" />
                </div>

                {/* CARD FRONT SIDE (Face Up / Revealed) */}
                <div
                  className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex items-center justify-center rounded-xl border-2 text-3xl sm:text-4xl md:text-5xl shadow-md transition-all ${
                    styling.cardFront
                  } ${card.isMatched ? 'bg-indigo-50/10 dark:bg-indigo-950/20' : ''}`}
                >
                  <span className={`transform transition-transform duration-300 ${card.isMatched ? 'scale-110' : 'scale-100 animate-zoom-in'}`}>
                    {card.value}
                  </span>

                  {/* Corner indicator if matched */}
                  {card.isMatched && (
                    <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes cardEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes zoom-in {
          0% { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
        .animate-zoom-in {
          animation: zoom-in 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
