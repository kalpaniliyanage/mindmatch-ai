import { Card, GameDifficulty, GameTheme, GameMode, AIMemory, PlayerProfile, GameStats, Achievement } from '../types';

// Card values for each theme
export const THEME_VALUES: Record<GameTheme, string[]> = {
  animals: [
    '🐶', '🐱', '🦁', '🐼', '🐸', '🦊', '🐨', '🐯',
    '🐷', '🐻', '🐵', '🐙', '🦋', '🦄', '🐝', '🦉',
    '🦖', '🐳', '🦀', '🐧', '🐘', '🦒', '🦈', '🐹'
  ],
  programming: [
    '💻', '🐍', '☕', '💎', '🦀', '🐘', '🐹', '🚀',
    '📄', '🌐', '📦', '💾', '🔌', '⚙️', '🔑', '📊',
    '🛠️', '🛡️', '⚡', '💡', '🤖', '👾', '📡', '🔍'
  ],
  space: [
    '🚀', '🌎', '⭐', '👽', '🪐', '☄️', '🛰️', '🛸',
    '🌌', '☀️', '🌙', '🧑‍🚀', '🔭', '📡', '🧭', '🔮',
    '☄️', '☄️', '🛸', '🛰️', '🌟', '🌑', '🌞', '🌌'
  ]
};

// Unique background styling colors for themes
export const THEME_STYLING: Record<GameTheme, {
  bg: string;
  cardBack: string;
  cardFront: string;
  accent: string;
  text: string;
  border: string;
}> = {
  animals: {
    bg: 'from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900',
    cardBack: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white',
    cardFront: 'bg-white dark:bg-zinc-900 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    accent: 'emerald',
    text: 'text-emerald-800 dark:text-emerald-200',
    border: 'border-emerald-300'
  },
  programming: {
    bg: 'from-slate-100 to-indigo-100 dark:from-slate-950 dark:to-indigo-950',
    cardBack: 'bg-indigo-600 hover:bg-indigo-500 border-indigo-400 text-white',
    cardFront: 'bg-white dark:bg-zinc-900 border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300',
    accent: 'indigo',
    text: 'text-indigo-800 dark:text-indigo-200',
    border: 'border-indigo-300'
  },
  space: {
    bg: 'from-violet-950 via-slate-900 to-black',
    cardBack: 'bg-violet-800 hover:bg-violet-700 border-violet-500 text-white',
    cardFront: 'bg-zinc-900 border-violet-700 text-violet-300',
    accent: 'violet',
    text: 'text-violet-300 dark:text-violet-200',
    border: 'border-violet-700'
  }
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win a game in any mode',
    icon: '🏆',
    conditionType: 'versus',
    conditionValue: 1,
    isUnlocked: false
  },
  {
    id: 'memory_master',
    title: 'Memory Master',
    description: 'Complete Hard difficulty',
    icon: '🧠',
    conditionType: 'difficulty',
    conditionValue: 3, // Hard
    isUnlocked: false
  },
  {
    id: 'speed_demon',
    title: 'Speed Player',
    description: 'Finish solo in under 60 seconds',
    icon: '⚡',
    conditionType: 'time',
    conditionValue: 60,
    isUnlocked: false
  },
  {
    id: 'ai_slayer',
    title: 'AI Slayer',
    description: 'Defeat the AI on Hard difficulty',
    icon: '🤖',
    conditionType: 'versus',
    conditionValue: 3, // Hard AI defeated
    isUnlocked: false
  },
  {
    id: 'streak_king',
    title: 'Perfect Rhythm',
    description: 'Get a match streak of 4 or more',
    icon: '🔥',
    conditionType: 'streak',
    conditionValue: 4,
    isUnlocked: false
  },
  {
    id: 'perfect_accuracy',
    title: 'Sniper Focus',
    description: 'Achieve at least 80% accuracy',
    icon: '🎯',
    conditionType: 'score',
    conditionValue: 80, // 80%
    isUnlocked: false
  }
];

export const INITIAL_PROFILE: PlayerProfile = {
  name: 'Memory Scout',
  avatar: '👤',
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  bestScoreSolo: 0,
  bestScoreVsAi: 0,
  unlockedAchievements: []
};

// Generates cards based on difficulty and theme
export function generateCards(theme: GameTheme, difficulty: GameDifficulty): Card[] {
  let pairsCount = 4; // easy default (8 cards)
  if (difficulty === 'medium') pairsCount = 8; // (16 cards)
  if (difficulty === 'hard') pairsCount = 18; // (36 cards)

  const themeValues = THEME_VALUES[theme];
  // Slice to the required number of pairs
  const selectedValues = themeValues.slice(0, pairsCount);
  
  // Duplicate the values to create matching pairs
  const valuesWithPairs = [...selectedValues, ...selectedValues];

  // Shuffle using Fisher-Yates
  const shuffledValues = shuffle(valuesWithPairs);

  return shuffledValues.map((value, idx) => ({
    id: idx,
    value,
    isFlipped: false,
    isMatched: false,
    theme
  }));
}

// Fisher-Yates Shuffle
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// AI choice heuristic logic
// Returns index of the first card to flip, or second card to flip
export function getAIChoice(
  cards: Card[],
  memory: AIMemory,
  difficulty: GameDifficulty,
  firstFlippedIndex: number | null = null
): number {
  // Available card indices (unmatched, and unflipped if first selection)
  const availableIndices = cards
    .map((card, idx) => ({ card, idx }))
    .filter(({ card, idx }) => !card.isMatched && !card.isFlipped && idx !== firstFlippedIndex)
    .map(({ idx }) => idx);

  if (availableIndices.length === 0) return -1;

  // Set memory scanning chance based on AI difficulty
  let recallChance = 0.4; // Easy AI: 40% memory check accuracy
  if (difficulty === 'medium') recallChance = 0.7; // Medium AI: 70% accuracy
  if (difficulty === 'hard') recallChance = 0.98; // Hard AI: virtually perfect

  const willRecall = Math.random() < recallChance;

  // Let's filter our memory elements to only include unmatched cards
  const memoryList = Object.keys(memory)
    .map(Number)
    .filter(idx => !cards[idx].isMatched && idx !== firstFlippedIndex && memory[idx]);

  // PHASE 1: FIRST CARD SELECTION
  if (firstFlippedIndex === null) {
    if (willRecall && memoryList.length > 1) {
      // Look for any complete matching pair within memory
      for (let i = 0; i < memoryList.length; i++) {
        const idxA = memoryList[i];
        const valA = memory[idxA].value;

        for (let j = i + 1; j < memoryList.length; j++) {
          const idxB = memoryList[j];
          const valB = memory[idxB].value;

          if (valA === valB) {
            // Found a known matching pair! Pick one of them
            return idxA;
          }
        }
      }
    }

    // No known matching pairs in memory, pick a random card
    const randomIdx = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomIdx];
  }

  // PHASE 2: SECOND CARD SELECTION (first card is already flipped)
  const firstCardVal = cards[firstFlippedIndex].value;

  if (willRecall) {
    // Check if the match for firstCardVal is in our memory
    const knownMatchIndex = memoryList.find(idx => memory[idx].value === firstCardVal);
    if (knownMatchIndex !== undefined) {
      return knownMatchIndex;
    }
  }

  // No known match in memory, choose a random card from remaining available indices
  const randomIdx = Math.floor(Math.random() * availableIndices.length);
  return availableIndices[randomIdx];
}

// Cleans memory item depending on memory size capacity
export function updateAIMemory(
  memory: AIMemory,
  index: number,
  value: string,
  difficulty: GameDifficulty
): AIMemory {
  const newMemory = { ...memory };
  newMemory[index] = {
    value,
    index,
    rememberedAt: Date.now(),
    confidence: 1.0
  };

  // Enforce memory capacity based on difficulty
  let maxCapacity = 4;
  if (difficulty === 'medium') maxCapacity = 10;
  if (difficulty === 'hard') maxCapacity = 40; // Essentially remembers everything

  const memoryKeys = Object.keys(newMemory).map(Number);
  if (memoryKeys.length > maxCapacity) {
    // Forget the oldest entry
    const oldestKey = memoryKeys.reduce((oldest, key) => {
      return newMemory[key].rememberedAt < newMemory[oldest].rememberedAt ? key : oldest;
    }, memoryKeys[0]);
    delete newMemory[oldestKey];
  }

  return newMemory;
}

// Decays AI memory (AI forgets cards over time, especially on easier levels)
export function decayAIMemory(memory: AIMemory, difficulty: GameDifficulty): AIMemory {
  if (difficulty === 'hard') return memory; // No memory decay on Hard

  const newMemory = { ...memory };
  const forgetChance = difficulty === 'easy' ? 0.35 : 0.15; // Easy has a 35% chance to forget an entry on each turn change

  Object.keys(newMemory).forEach((keyStr) => {
    const key = Number(keyStr);
    if (Math.random() < forgetChance) {
      delete newMemory[key];
    }
  });

  return newMemory;
}

// Check achievements and return newly unlocked IDs
export function evaluateAchievements(
  profile: PlayerProfile,
  stats: GameStats,
  mode: GameMode,
  difficulty: GameDifficulty,
  opponentScore: number | null
): string[] {
  const newlyUnlocked: string[] = [];
  const currentUnlocked = new Set(profile.unlockedAchievements);

  // 1. First Win
  if (!currentUnlocked.has('first_win')) {
    // If completed solo, or vs AI with higher score
    if (mode === 'solo' || (mode === 'vs-ai' && stats.score > (opponentScore || 0))) {
      newlyUnlocked.push('first_win');
    }
  }

  // 2. Memory Master (Hard difficulty win)
  if (!currentUnlocked.has('memory_master') && difficulty === 'hard') {
    if (mode === 'solo' || (mode === 'vs-ai' && stats.score > (opponentScore || 0))) {
      newlyUnlocked.push('memory_master');
    }
  }

  // 3. Speed Demon (Solo completed in under 60 seconds)
  if (!currentUnlocked.has('speed_demon') && mode === 'solo' && stats.timeElapsed < 60) {
    newlyUnlocked.push('speed_demon');
  }

  // 4. AI Slayer (Defeat AI on Hard)
  if (
    !currentUnlocked.has('ai_slayer') &&
    mode === 'vs-ai' &&
    difficulty === 'hard' &&
    stats.score > (opponentScore || 0)
  ) {
    newlyUnlocked.push('ai_slayer');
  }

  // 5. Streak King (Streak of 4 or more)
  if (!currentUnlocked.has('streak_king') && stats.streak >= 4) {
    newlyUnlocked.push('streak_king');
  }

  // 6. Perfect Accuracy (>= 80% accuracy)
  if (!currentUnlocked.has('perfect_accuracy') && stats.accuracy >= 80 && stats.moves >= 8) {
    newlyUnlocked.push('perfect_accuracy');
  }

  return newlyUnlocked;
}
