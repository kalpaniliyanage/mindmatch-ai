import React, { useState } from 'react';
import { PlayerProfile, Achievement } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../utils/gameUtils';
import { User, Award, CheckCircle2, Lock, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { audio } from '../utils/audio';

interface ProfileViewProps {
  profile: PlayerProfile;
  achievements: Achievement[];
  onUpdateProfile: (name: string, avatar: string) => void;
}

const AVAILABLE_AVATARS = ['👤', '🦁', '🚀', '🧠', '👾', '🦊', '🦉', '🐱', '🦕', '🧑‍🚀', '👩‍💻'];

export default function ProfileView({ profile, achievements, onUpdateProfile }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  const handleSave = () => {
    audio.playClick();
    onUpdateProfile(editName.trim() || 'Player', selectedAvatar);
    setIsEditing(false);
  };

  const handleCancel = () => {
    audio.playClick();
    setEditName(profile.name);
    setSelectedAvatar(profile.avatar);
    setIsEditing(false);
  };

  const totalGames = profile.gamesPlayed;
  const winRate = totalGames > 0 ? Math.round((profile.gamesWon / totalGames) * 100) : 0;

  // Count unlocked
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 border border-neutral-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-sm">
      {/* Profile Header Block */}
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start border-b border-neutral-100 dark:border-zinc-800/60 pb-5 mb-5">
        
        {/* Avatar Display */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-sm">
            {profile.avatar}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center shadow hover:bg-neutral-50 dark:hover:bg-zinc-700 cursor-pointer text-xs"
              title="Edit Profile"
            >
              ✏️
            </button>
          )}
        </div>

        {/* Profile Info or Edit form */}
        <div className="flex-1 w-full text-center sm:text-left">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">
                  Enter Player Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value.slice(0, 18))}
                  className="w-full max-w-xs px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="Your Name..."
                  maxLength={18}
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase text-neutral-400 block mb-1">
                  Choose Avatar Icon
                </label>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  {AVAILABLE_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        audio.playClick();
                        setSelectedAvatar(emoji);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg border transition-all cursor-pointer ${
                        selectedAvatar === emoji
                          ? 'bg-indigo-500/20 border-indigo-500'
                          : 'bg-neutral-50 dark:bg-zinc-950 border-neutral-200 dark:border-zinc-800 hover:border-neutral-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center sm:justify-start gap-2 mt-1">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  Save Profile
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-neutral-100 dark:bg-zinc-800 hover:bg-neutral-200 dark:hover:bg-zinc-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-display font-bold text-lg text-neutral-800 dark:text-neutral-100 flex items-center justify-center sm:justify-start gap-1.5">
                  {profile.name}
                  <Sparkles size={14} className="text-amber-500" />
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">MindMatch Cadet Rank</p>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-neutral-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40 text-center sm:text-left">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">Games Played</span>
                  <span className="text-base font-bold text-neutral-800 dark:text-neutral-100 font-mono mt-0.5 block">
                    {totalGames}
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40 text-center sm:text-left">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">Win Rate %</span>
                  <span className="text-base font-bold text-neutral-800 dark:text-neutral-100 font-mono mt-0.5 block flex items-center justify-center sm:justify-start gap-1">
                    {winRate}% <TrendingUp size={12} className="text-emerald-500" />
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40 text-center sm:text-left">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">Best Solo Score</span>
                  <span className="text-base font-bold text-neutral-800 dark:text-neutral-100 font-mono mt-0.5 block">
                    {profile.bestScoreSolo}
                  </span>
                </div>
                <div className="bg-neutral-50 dark:bg-zinc-950/50 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800/40 text-center sm:text-left">
                  <span className="text-[9px] font-mono text-neutral-400 block uppercase">VS AI Victories</span>
                  <span className="text-base font-bold text-neutral-800 dark:text-neutral-100 font-mono mt-0.5 block">
                    {profile.gamesWon}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-display font-bold text-sm text-neutral-800 dark:text-neutral-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Medal Hall & Achievements</span>
          </h4>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
            {unlockedCount} / {achievements.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  ach.isUnlocked
                    ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-500/20 shadow-sm'
                    : 'bg-neutral-50/50 dark:bg-zinc-950/20 border-neutral-100 dark:border-zinc-900 opacity-60'
                }`}
              >
                {/* Achievement Badge */}
                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-2xl border ${
                  ach.isUnlocked
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-neutral-100 dark:bg-zinc-900 border-neutral-200 dark:border-zinc-800'
                }`}>
                  {ach.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-display font-bold text-xs ${ach.isUnlocked ? 'text-amber-900 dark:text-amber-300' : 'text-neutral-700 dark:text-neutral-400'}`}>
                      {ach.title}
                    </span>
                    {ach.isUnlocked ? (
                      <CheckCircle2 size={12} className="text-amber-500 shrink-0" />
                    ) : (
                      <Lock size={10} className="text-neutral-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-0.5 leading-tight">
                    {ach.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
