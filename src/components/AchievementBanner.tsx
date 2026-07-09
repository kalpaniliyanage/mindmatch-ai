import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Achievement } from '../types';
import { audio } from '../utils/audio';

interface AchievementBannerProps {
  unlockedQueue: Achievement[];
  onDismiss: (id: string) => void;
}

export default function AchievementBanner({ unlockedQueue, onDismiss }: AchievementBannerProps) {
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    if (unlockedQueue.length > 0 && !current) {
      const nextAchievement = unlockedQueue[0];
      setCurrent(nextAchievement);
      audio.playAchievement();

      // Automatically dismiss after 4 seconds
      const timer = setTimeout(() => {
        onDismiss(nextAchievement.id);
        setCurrent(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [unlockedQueue, current, onDismiss]);

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="pointer-events-auto bg-neutral-900/95 border border-amber-500/30 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl flex items-center gap-4 glow-indigo"
          >
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-3xl border border-amber-500/20 shrink-0">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Achievement Unlocked!
              </span>
              <h4 className="font-display font-bold text-sm text-neutral-100 truncate mt-0.5">
                {current.title}
              </h4>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                {current.description}
              </p>
            </div>
            <button
              onClick={() => {
                onDismiss(current.id);
                setCurrent(null);
              }}
              className="text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer self-start p-1"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
