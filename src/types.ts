export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameTheme = 'animals' | 'programming' | 'space';
export type GameMode = 'solo' | 'vs-ai';
export type ActivePlayer = 'player' | 'ai';

export interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  theme: GameTheme;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  bestScoreSolo: number;
  bestScoreVsAi: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  conditionType: 'score' | 'time' | 'streak' | 'difficulty' | 'versus';
  conditionValue: number;
  isUnlocked: boolean;
}

export interface GameStats {
  score: number;
  moves: number;
  matches: number;
  timeElapsed: number; // in seconds
  streak: number;
  accuracy: number;
}

export interface AIMemoryItem {
  value: string;
  index: number;
  rememberedAt: number; // timestamp or move count
  confidence: number; // 0.0 to 1.0 (for decay model)
}

export interface AIMemory {
  [index: number]: AIMemoryItem;
}

export interface AISettings {
  difficulty: 'easy' | 'medium' | 'hard';
  memoryCapacity: number; // max cards AI can remember
  forgettingRate: number; // chance to forget a card per turn (0.0 to 1.0)
  flipDelay: number; // in milliseconds
}
