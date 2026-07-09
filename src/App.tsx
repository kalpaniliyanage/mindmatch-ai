import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Card,
  GameDifficulty,
  GameTheme,
  GameMode,
  ActivePlayer,
  PlayerProfile,
  Achievement,
  GameStats,
  AIMemory
} from './types';
import {
  generateCards,
  getAIChoice,
  updateAIMemory,
  decayAIMemory,
  evaluateAchievements,
  INITIAL_ACHIEVEMENTS,
  INITIAL_PROFILE,
  THEME_STYLING
} from './utils/gameUtils';
import { audio } from './utils/audio';

import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import AIPanel from './components/AIPanel';
import ProfileView from './components/ProfileView';
import ThemeSelector from './components/ThemeSelector';
import DifficultySelector from './components/DifficultySelector';
import AchievementBanner from './components/AchievementBanner';

import {
  Brain,
  Award,
  Volume2,
  VolumeX,
  Play,
  Trophy,
  History,
  TrendingUp,
  Flame,
  ArrowLeft,
  ChevronRight,
  User,
  Heart,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Game Setup States
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'game-over'>('menu');
  const [mode, setMode] = useState<GameMode>('solo');
  const [theme, setTheme] = useState<GameTheme>('animals');
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium');

  // Interactive Game States
  const [cards, setCards] = useState<Card[]>([]);
  const [firstFlippedIndex, setFirstFlippedIndex] = useState<number | null>(null);
  const [secondFlippedIndex, setSecondFlippedIndex] = useState<number | null>(null);
  const [isInteractionDisabled, setIsInteractionDisabled] = useState(false);
  const [activePlayer, setActivePlayer] = useState<ActivePlayer>('player');

  // Stats Counters
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    streak: 0,
    accuracy: 100
  });

  const [aiStats, setAiStats] = useState<GameStats>({
    score: 0,
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    streak: 0,
    accuracy: 100
  });

  // AI Cognitive States
  const [aiMemory, setAiMemory] = useState<AIMemory>({});
  const [aiStatus, setAiStatus] = useState<string>('RESTING');
  const [aiTurnCounter, setAiTurnCounter] = useState<number>(0);

  // Persistence States
  const [profile, setProfile] = useState<PlayerProfile>(INITIAL_PROFILE);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [unlockedQueue, setUnlockedQueue] = useState<Achievement[]>([]);
  const [soundMuted, setSoundMuted] = useState(false);

  // Active view tab in Profile Modal/Sidebar
  const [showProfileDashboard, setShowProfileDashboard] = useState(false);

  // Timers Reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('mindmatch_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
      }

      const storedAchievements = localStorage.getItem('mindmatch_achievements');
      if (storedAchievements) {
        const parsed = JSON.parse(storedAchievements);
        // Map saved unlock states to initial achievements list to preserve description changes if any
        const updated = INITIAL_ACHIEVEMENTS.map(initial => {
          const saved = parsed.find((p: any) => p.id === initial.id);
          return saved ? { ...initial, isUnlocked: saved.isUnlocked } : initial;
        });
        setAchievements(updated);
      }

      const storedMute = localStorage.getItem('mindmatch_mute');
      if (storedMute) {
        const isMuted = JSON.parse(storedMute);
        setSoundMuted(isMuted);
        audio.setMute(isMuted);
      }
    } catch (e) {
      console.warn('LocalStorage load failed', e);
    }
  }, []);

  // 2. Timer System (Only ticks when game is active)
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // 3. AI Turn Processing Machine (Asynchronous Step Runner)
  useEffect(() => {
    if (gameState !== 'playing' || mode !== 'vs-ai' || activePlayer !== 'ai') return;

    let isCancelled = false;

    const runAiTurn = async () => {
      setIsInteractionDisabled(true);

      // AI is pondering
      setAiStatus('ANALYZING SHUFFLE PATTERNS...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (isCancelled) return;

      // Make first choice
      const firstIdx = getAIChoice(cards, aiMemory, difficulty, null);
      if (firstIdx === -1) {
        // Safe fall back
        setActivePlayer('player');
        setIsInteractionDisabled(false);
        return;
      }

      // Flip first card
      setCards(prev => {
        const next = [...prev];
        next[firstIdx] = { ...next[firstIdx], isFlipped: true };
        return next;
      });
      audio.playFlip();

      const firstVal = cards[firstIdx].value;
      
      // Update Memory & Status
      setAiMemory(prev => updateAIMemory(prev, firstIdx, firstVal, difficulty));
      setAiStatus(`RECALLED ${firstVal} AT CARD ${firstIdx + 1}`);

      await new Promise(resolve => setTimeout(resolve, 1100));
      if (isCancelled) return;

      // Make second choice (takes into account the already flipped card)
      const mockCards = cards.map((c, i) => i === firstIdx ? { ...c, isFlipped: true } : c);
      const secondIdx = getAIChoice(mockCards, aiMemory, difficulty, firstIdx);

      if (secondIdx === -1 || secondIdx === firstIdx) {
        // Fall back
        setCards(prev => {
          const next = [...prev];
          next[firstIdx] = { ...next[firstIdx], isFlipped: false };
          return next;
        });
        setActivePlayer('player');
        setIsInteractionDisabled(false);
        return;
      }

      // Flip second card
      setCards(prev => {
        const next = [...prev];
        next[secondIdx] = { ...next[secondIdx], isFlipped: true };
        return next;
      });
      audio.playFlip();

      const secondVal = cards[secondIdx].value;
      setAiMemory(prev => updateAIMemory(prev, secondIdx, secondVal, difficulty));
      setAiStatus(`MATCHING ${secondVal} AT CARD ${secondIdx + 1}`);

      await new Promise(resolve => setTimeout(resolve, 1200));
      if (isCancelled) return;

      // Evaluate Match
      const isMatch = firstVal === secondVal;

      if (isMatch) {
        audio.playMatch();
        setAiStatus('OPTIMAL MATCH DETECTED! ✅');

        setCards(prev => {
          const next = [...prev];
          next[firstIdx] = { ...next[firstIdx], isMatched: true, isFlipped: false };
          next[secondIdx] = { ...next[secondIdx], isMatched: true, isFlipped: false };
          return next;
        });

        setAiStats(prev => {
          const matches = prev.matches + 1;
          const score = prev.score + 10 + (prev.streak * 5); // streak bonus
          return {
            ...prev,
            moves: prev.moves + 1,
            matches,
            score,
            streak: prev.streak + 1
          };
        });

        // Small break to celebrate match
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (isCancelled) return;

        // Check if game complete
        setCards(currentCards => {
          const allMatched = currentCards.every(c => c.isMatched);
          if (allMatched) {
            triggerGameOver(currentCards, true); // Completed by AI match
          } else {
            // AI keeps turn because of match! Increment turn counter to re-trigger useEffect
            setAiTurnCounter(prev => prev + 1);
          }
          return currentCards;
        });

      } else {
        // Mismatch
        audio.playMismatch();
        setAiStatus('MISMATCH ENCOUNTERED. CLEARING.');

        await new Promise(resolve => setTimeout(resolve, 1200));
        if (isCancelled) return;

        // Flip both back
        setCards(prev => {
          const next = [...prev];
          next[firstIdx] = { ...next[firstIdx], isFlipped: false };
          next[secondIdx] = { ...next[secondIdx], isFlipped: false };
          return next;
        });

        setAiStats(prev => ({
          ...prev,
          moves: prev.moves + 1,
          streak: 0,
          score: Math.max(0, prev.score - 2)
        }));

        // Memory decay
        setAiMemory(prev => decayAIMemory(prev, difficulty));

        // Yield Turn to human
        setActivePlayer('player');
        setIsInteractionDisabled(false);
        setAiStatus('WAITING FOR PLAYER...');
      }
    };

    runAiTurn();

    return () => {
      isCancelled = true;
    };
  }, [activePlayer, gameState, aiTurnCounter]);

  // 4. Start New Mission Launcher
  const handleStartGame = () => {
    audio.playClick();
    
    // Generate new deck
    const newCards = generateCards(theme, difficulty);
    setCards(newCards);

    // Reset selectors
    setFirstFlippedIndex(null);
    setSecondFlippedIndex(null);
    setIsInteractionDisabled(false);
    setActivePlayer('player');

    // Reset scores/stats
    setStats({
      score: 0,
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      streak: 0,
      accuracy: 100
    });

    setAiStats({
      score: 0,
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      streak: 0,
      accuracy: 100
    });

    setAiMemory({});
    setAiStatus('WAITING FOR PLAYER...');
    setGameState('playing');
  };

  // 5. Handle Human Flip Selection
  const handlePlayerCardClick = (index: number) => {
    if (isInteractionDisabled || activePlayer !== 'player') return;

    // Reveal Card
    const flippedCardVal = cards[index].value;
    
    // Immediately teach the AI (it observes everything, even human mistakes!)
    setAiMemory(prev => updateAIMemory(prev, index, flippedCardVal, difficulty));

    // Case 1: First Card Selection
    if (firstFlippedIndex === null) {
      setFirstFlippedIndex(index);
      setCards(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isFlipped: true };
        return next;
      });
      return;
    }

    // Case 2: Second Card Selection (prevents picking the same card)
    if (secondFlippedIndex === null && index !== firstFlippedIndex) {
      setSecondFlippedIndex(index);
      setCards(prev => {
        const next = [...prev];
        next[index] = { ...next[index], isFlipped: true };
        return next;
      });
      setIsInteractionDisabled(true);

      const firstCardVal = cards[firstFlippedIndex].value;
      const secondCardVal = flippedCardVal;

      const isMatch = firstCardVal === secondCardVal;

      setTimeout(() => {
        if (isMatch) {
          // MATCH FOUND
          audio.playMatch();

          setCards(prev => {
            const next = [...prev];
            next[firstFlippedIndex] = { ...next[firstFlippedIndex], isMatched: true, isFlipped: false };
            next[index] = { ...next[index], isMatched: true, isFlipped: false };
            return next;
          });

          // Calculate bonus score (base 10 points + streak bonus + fast match bonus)
          const newMoves = stats.moves + 1;
          const newMatches = stats.matches + 1;
          const currentStreak = stats.streak + 1;
          const streakPoints = (currentStreak - 1) * 5;
          const matchPoints = 10 + streakPoints;

          setStats(prev => ({
            ...prev,
            moves: newMoves,
            matches: newMatches,
            streak: currentStreak,
            score: prev.score + matchPoints,
            accuracy: Math.round((newMatches / newMoves) * 100)
          }));

          // Clear flip cache
          setFirstFlippedIndex(null);
          setSecondFlippedIndex(null);
          setIsInteractionDisabled(false);

          // Check if all cards are solved
          setCards(currentCards => {
            const allMatched = currentCards.every(c => c.isMatched);
            if (allMatched) {
              triggerGameOver(currentCards, false);
            }
            return currentCards;
          });

        } else {
          // MISMATCH
          audio.playMismatch();

          const newMoves = stats.moves + 1;
          setStats(prev => ({
            ...prev,
            moves: newMoves,
            streak: 0,
            score: Math.max(0, prev.score - 2),
            accuracy: Math.round((prev.matches / newMoves) * 100)
          }));

          setTimeout(() => {
            // Flip back
            setCards(prev => {
              const next = [...prev];
              next[firstFlippedIndex] = { ...next[firstFlippedIndex], isFlipped: false };
              next[index] = { ...next[index], isFlipped: false };
              return next;
            });

            setFirstFlippedIndex(null);
            setSecondFlippedIndex(null);

            if (mode === 'vs-ai') {
              // Swap turn to AI
              setActivePlayer('ai');
              setAiTurnCounter(prev => prev + 1);
            } else {
              // Keep playing in Solo Mode
              setIsInteractionDisabled(false);
            }
          }, 1000);
        }
      }, 500);
    }
  };

  // 6. Complete and Save Game State (Win Condition)
  const triggerGameOver = (currentCards: Card[], finishedByAiMatch = false) => {
    setGameState('game-over');
    audio.playWin();

    // Final calculations
    const timeTaken = stats.timeElapsed;
    const finalScore = mode === 'solo' 
      ? stats.score + Math.max(0, 300 - timeTaken) // speed bonus
      : stats.score;

    // Update state stats with final calculations
    setStats(prev => ({
      ...prev,
      score: finalScore
    }));

    // Local Storage Synchronization & Achievements Checking
    const isPlayerWin = mode === 'solo' || stats.score > aiStats.score;

    const updatedProfile: PlayerProfile = {
      ...profile,
      gamesPlayed: profile.gamesPlayed + 1,
      gamesWon: profile.gamesWon + (isPlayerWin && mode === 'vs-ai' ? 1 : 0),
      gamesLost: profile.gamesLost + (!isPlayerWin && mode === 'vs-ai' ? 1 : 0),
      bestScoreSolo: mode === 'solo' ? Math.max(profile.bestScoreSolo, finalScore) : profile.bestScoreSolo,
      bestScoreVsAi: mode === 'vs-ai' && isPlayerWin ? Math.max(profile.bestScoreVsAi, stats.score) : profile.bestScoreVsAi,
      unlockedAchievements: [...profile.unlockedAchievements]
    };

    // Calculate accuracy for stats check
    const finalAccuracy = Math.round((stats.matches / Math.max(1, stats.moves)) * 100);
    const evaluationStats: GameStats = {
      ...stats,
      score: finalScore,
      accuracy: finalAccuracy
    };

    const newUnlockIds = evaluateAchievements(
      updatedProfile,
      evaluationStats,
      mode,
      difficulty,
      mode === 'vs-ai' ? aiStats.score : null
    );

    if (newUnlockIds.length > 0) {
      // Add to unlocked queue for visual banner trigger
      const newlyUnlockedAchievements = achievements.filter(ach => newUnlockIds.includes(ach.id));
      setUnlockedQueue(prev => [...prev, ...newlyUnlockedAchievements]);

      // Update unlock state of achievements in list
      setAchievements(prev => {
        const next = prev.map(a => newUnlockIds.includes(a.id) ? { ...a, isUnlocked: true } : a);
        localStorage.setItem('mindmatch_achievements', JSON.stringify(next));
        return next;
      });

      updatedProfile.unlockedAchievements = [...updatedProfile.unlockedAchievements, ...newUnlockIds];
    }

    setProfile(updatedProfile);
    localStorage.setItem('mindmatch_profile', JSON.stringify(updatedProfile));
  };

  // 7. Profile Updates
  const handleUpdateProfile = (name: string, avatar: string) => {
    const next = { ...profile, name, avatar };
    setProfile(next);
    localStorage.setItem('mindmatch_profile', JSON.stringify(next));
  };

  // 8. Dismiss Achievement Banner
  const handleDismissAchievement = (id: string) => {
    setUnlockedQueue(prev => prev.filter(x => x.id !== id));
  };

  // 9. Sound Toggles
  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    audio.setMute(nextMuted);
    localStorage.setItem('mindmatch_mute', JSON.stringify(nextMuted));
  };

  // Dynamic Styles
  const currentThemeStyling = THEME_STYLING[theme];
  const totalPairs = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 8 : 18;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentThemeStyling.bg} text-neutral-800 dark:text-neutral-100 flex flex-col transition-colors duration-500 font-sans`}>
      
      {/* Floating Notifications */}
      <AchievementBanner unlockedQueue={unlockedQueue} onDismiss={handleDismissAchievement} />

      {/* HEADER BAR */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center z-10 shrink-0">
        <button
          onClick={() => {
            audio.playClick();
            setGameState('menu');
          }}
          className="flex items-center gap-2 cursor-pointer group"
          id="btn-brand-header"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-widest text-neutral-900 dark:text-neutral-50 leading-none">
              MINDMATCH AI
            </h1>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mt-0.5">
              Cognitive Card Engine
            </span>
          </div>
        </button>

        {/* Global Toolbar buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Button */}
          <button
            onClick={handleToggleSound}
            className="w-10 h-10 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-neutral-200/50 dark:border-zinc-800/50 backdrop-blur-md flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            title={soundMuted ? 'Unmute game sounds' : 'Mute game sounds'}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Profile Modal toggle */}
          <button
            onClick={() => {
              audio.playClick();
              setShowProfileDashboard(!showProfileDashboard);
            }}
            className={`px-4 h-10 rounded-xl border flex items-center gap-2 font-mono text-xs font-semibold cursor-pointer transition-all ${
              showProfileDashboard
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-white/60 dark:bg-zinc-900/60 border-neutral-200/50 dark:border-zinc-800/50 backdrop-blur-md hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-700 dark:text-neutral-200'
            }`}
          >
            <span className="text-sm leading-none">{profile.avatar}</span>
            <span className="hidden sm:inline">{profile.name}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-center items-center z-10">
        <AnimatePresence mode="wait">
          
          {/* PROFILE DASHBOARD OVERLAY VIEW */}
          {showProfileDashboard ? (
            <motion.div
              key="profile-overlay"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-3xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => {
                    audio.playClick();
                    setShowProfileDashboard(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-zinc-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-display font-bold text-base text-neutral-800 dark:text-neutral-200">
                  Return to Main Menu
                </h2>
              </div>
              <ProfileView
                profile={profile}
                achievements={achievements}
                onUpdateProfile={handleUpdateProfile}
              />
            </motion.div>
          ) : gameState === 'menu' ? (
            
            /* 1. START MENU SCREEN */
            <motion.div
              key="menu-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl flex flex-col gap-6"
            >
              
              {/* Promo Banner / Intro */}
              <div className="text-center max-w-2xl mx-auto my-4">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full uppercase">
                  Brain Hack & Match Puzzle
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-3">
                  Match Memory Cards.<br />
                  Defeat the Cognitive AI.
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto mt-4 leading-relaxed">
                  Train your brain in single-player speed runs or compete against an intelligent heuristic AI opponent that adapts to your choices.
                </p>
              </div>

              {/* Grid of Selectors (Main Config Bento Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">
                
                {/* Left side: Configuration Panel */}
                <div className="md:col-span-8 flex flex-col gap-6 bg-white/70 dark:bg-zinc-900/70 border border-neutral-200/50 dark:border-zinc-800/50 backdrop-blur-md p-6 rounded-2xl shadow-sm">
                  
                  {/* Mode Selector */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
                      Choose Mission Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Solo Mode */}
                      <button
                        onClick={() => {
                          audio.playClick();
                          setMode('solo');
                        }}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          mode === 'solo'
                            ? 'bg-neutral-900 border-indigo-500 text-white shadow-md'
                            : 'bg-white dark:bg-zinc-950/50 border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Trophy size={16} className={mode === 'solo' ? 'text-indigo-400' : 'text-neutral-400'} />
                          <span className="font-display font-bold text-sm">Solo Speedrunner</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
                          Find pairs as fast as possible. Track speed records and point bonuses.
                        </p>
                      </button>

                      {/* VS AI Mode */}
                      <button
                        onClick={() => {
                          audio.playClick();
                          setMode('vs-ai');
                        }}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                          mode === 'vs-ai'
                            ? 'bg-neutral-900 border-indigo-500 text-white shadow-md'
                            : 'bg-white dark:bg-zinc-950/50 border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Brain size={16} className={mode === 'vs-ai' ? 'text-indigo-400' : 'text-neutral-400'} />
                          <span className="font-display font-bold text-sm">Versus Cognitive AI</span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
                          Compete with an AI that observes your moves, memorizes card positions, and reacts.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Difficulty selector component */}
                  <DifficultySelector selectedDifficulty={difficulty} onChange={setDifficulty} />

                  {/* Theme selector component */}
                  <ThemeSelector selectedTheme={theme} onChange={setTheme} />

                  {/* Play Trigger */}
                  <button
                    onClick={handleStartGame}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-display font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Game Mission</span>
                  </button>
                </div>

                {/* Right side: Summary Dashboard Column */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  {/* Quick Player Info Block */}
                  <div className="bg-white/70 dark:bg-zinc-900/70 border border-neutral-200/50 dark:border-zinc-800/50 backdrop-blur-md p-5 rounded-2xl shadow-sm flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                          Player Record
                        </span>
                        <span className="text-xs">🏆</span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shrink-0">
                          {profile.avatar}
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-neutral-800 dark:text-neutral-100">
                            {profile.name}
                          </h3>
                          <p className="text-[10px] font-mono text-neutral-400 leading-none mt-1">
                            Played {profile.gamesPlayed} Matches
                          </p>
                        </div>
                      </div>

                      {/* Best record rows */}
                      <div className="flex flex-col gap-2 border-t border-neutral-100 dark:border-zinc-800/60 pt-3">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-neutral-400">Best Solo Score:</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {profile.bestScoreSolo} PTS
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-neutral-400">VS AI Record:</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {profile.gamesWon}W - {profile.gamesLost}L
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        audio.playClick();
                        setShowProfileDashboard(true);
                      }}
                      className="w-full mt-4 py-2 text-center text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl border border-indigo-500/10 cursor-pointer transition-colors"
                    >
                      View Medal Hall 🎖️
                    </button>
                  </div>

                  {/* Small Info Widget */}
                  <div className="bg-neutral-900/10 dark:bg-zinc-950/20 border border-neutral-200/20 dark:border-zinc-800/20 p-4 rounded-2xl text-xs flex gap-3 items-start">
                    <span className="text-xl shrink-0">💡</span>
                    <p className="text-neutral-500 dark:text-neutral-400 leading-normal">
                      <strong>Pro tip:</strong> When the AI plays, watch its sector scanner grid! Keeping an eye on what the AI remembers will help you plan your moves ahead of time.
                    </p>
                  </div>
                </div>

              </div>

            </motion.div>
          ) : gameState === 'playing' ? (
            
            /* 2. ACTIVE GAMEPLAY SCREEN */
            <motion.div
              key="gameplay-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Back navigation */}
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => {
                    audio.playClick();
                    setGameState('menu');
                  }}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Quit Mission</span>
                </button>

                <div className="text-xs font-mono font-bold uppercase px-3 py-1 bg-white/60 dark:bg-zinc-900/60 border border-neutral-200/50 dark:border-zinc-800/50 rounded-lg">
                  Mode: {mode === 'solo' ? 'Solo Practice' : `VS AI (${difficulty.toUpperCase()})`}
                </div>
              </div>

              {/* Game Playboard Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                
                {/* Left Side: Main score board & layout */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  {/* Scoreboard controls */}
                  <ScoreBoard
                    mode={mode}
                    stats={stats}
                    aiStats={mode === 'vs-ai' ? aiStats : undefined}
                    activePlayer={activePlayer}
                    totalPairs={totalPairs}
                    bestScore={mode === 'solo' ? profile.bestScoreSolo : profile.bestScoreVsAi}
                    onReset={handleStartGame}
                  />

                  {/* Active playing grid cards */}
                  <GameBoard
                    cards={cards}
                    onCardClick={handlePlayerCardClick}
                    difficulty={difficulty}
                    theme={theme}
                    isInteractionDisabled={isInteractionDisabled}
                  />
                </div>

                {/* Right Side: AI Mental Panel (Only in VS AI mode) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  {mode === 'vs-ai' ? (
                    <AIPanel
                      memory={aiMemory}
                      difficulty={difficulty}
                      isAiTurn={activePlayer === 'ai'}
                      aiStatus={aiStatus}
                      totalCards={cards.length}
                    />
                  ) : (
                    /* In Solo mode, show custom details and checklist stats instead */
                    <div className="bg-white/80 dark:bg-zinc-900/80 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm font-mono text-xs flex flex-col gap-4">
                      <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-800/60 pb-3">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-display font-bold text-sm text-neutral-800 dark:text-neutral-100 uppercase tracking-widest">
                          Mission Checklist
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center bg-neutral-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40">
                          <span className="text-neutral-500">Current Score:</span>
                          <span className="font-bold font-display text-sm text-indigo-600 dark:text-indigo-400">
                            {stats.score} PTS
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-neutral-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40">
                          <span className="text-neutral-500">Solve Accuracy:</span>
                          <span className="font-bold font-display text-sm text-neutral-800 dark:text-neutral-100">
                            {stats.accuracy}%
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-neutral-50 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40">
                          <span className="text-neutral-500">Flipped Items:</span>
                          <span className="font-bold font-display text-sm text-neutral-800 dark:text-neutral-100">
                            {stats.moves * 2} Cards
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-500/15 rounded-xl text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400 mt-2">
                        💡 <strong>Bonus points:</strong> Complete solo matches quickly! Every second below 5 minutes (300s) grants you bonus score points upon solving all pairs.
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          ) : (
            
            /* 3. GAME OVER RESULTS SCREEN */
            <motion.div
              key="gameover-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden"
            >
              
              {/* Confetti decoration */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500" />
              
              <div className="text-5xl sm:text-6xl mb-4">🏆</div>

              <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase block mb-2">
                Mission Complete
              </span>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 dark:text-neutral-50 leading-tight">
                {mode === 'solo' ? (
                  <span>Phenomenal Memory!</span>
                ) : stats.score > aiStats.score ? (
                  <span className="text-indigo-600 dark:text-indigo-400">AI Defeated! Victory is Yours!</span>
                ) : stats.score === aiStats.score ? (
                  <span>Tactical Draw! Perfect Balance!</span>
                ) : (
                  <span className="text-rose-500">MindMatch AI Wins! Try Again!</span>
                )}
              </h2>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-2 leading-relaxed">
                {mode === 'solo'
                  ? 'You have successfully paired all hidden cards on the deck and completed the matching trials.'
                  : 'The Head-to-Head cognitive match has closed. Compare your memory and solve scores below.'}
              </p>

              {/* Stats Score Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto my-6">
                
                {/* Player Final Results */}
                <div className="bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/15">
                  <div className="text-2xl mb-1">{profile.avatar}</div>
                  <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 block">
                    Your Score
                  </span>
                  <span className="text-3xl font-display font-black text-indigo-600 dark:text-indigo-400 leading-tight mt-1 block">
                    {stats.score}
                  </span>
                  <div className="flex justify-center gap-4 text-[10px] font-mono text-neutral-500 mt-2 border-t border-indigo-500/10 pt-2">
                    <span>Moves: {stats.moves}</span>
                    <span>Time: {stats.timeElapsed}s</span>
                  </div>
                </div>

                {/* AI / High Record comparison card */}
                {mode === 'vs-ai' ? (
                  <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/15">
                    <div className="text-2xl mb-1">🤖</div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 block">
                      AI Score
                    </span>
                    <span className="text-3xl font-display font-black text-rose-500 leading-tight mt-1 block">
                      {aiStats.score}
                    </span>
                    <div className="flex justify-center gap-4 text-[10px] font-mono text-neutral-500 mt-2 border-t border-rose-500/10 pt-2">
                      <span>Moves: {aiStats.moves}</span>
                      <span>Matches: {aiStats.matches}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15">
                    <div className="text-2xl mb-1">⭐</div>
                    <span className="text-[10px] font-mono font-semibold uppercase text-neutral-400 block">
                      Previous Personal Best
                    </span>
                    <span className="text-3xl font-display font-black text-amber-500 leading-tight mt-1 block">
                      {profile.bestScoreSolo}
                    </span>
                    <div className="text-[10px] font-mono text-neutral-500 mt-2 border-t border-amber-500/10 pt-2">
                      Accuracy rate: {stats.accuracy}%
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Grid */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                <button
                  onClick={handleStartGame}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    audio.playClick();
                    setGameState('menu');
                  }}
                  className="flex-1 py-3 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-200 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Return to Menu
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-4 text-[10px] font-mono text-neutral-500/60 z-10 select-none shrink-0 border-t border-neutral-100/10 mt-auto">
        MindMatch AI • Version 2.0.0 • React & TypeScript • Web Audio Synthesizer
      </footer>
    </div>
  );
}
