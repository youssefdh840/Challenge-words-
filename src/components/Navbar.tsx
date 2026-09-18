import React from 'react';
import { Volume2, VolumeX, Shield, Award } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  activeTab: 'passage' | 'arena' | 'passport' | 'leaderboard' | 'architecture';
  onTabChange: (tab: 'passage' | 'arena' | 'passport' | 'leaderboard' | 'architecture') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  stampsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  isMuted,
  onToggleMute,
  stampsCount,
}) => {
  const xpInCurrentLevel = user.xp % 200;
  const xpForNextLevel = 200;
  const xpPercentage = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white font-black text-lg ring-1 ring-white/20">
            🌍
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                World Challenge
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 hidden sm:inline-block">
                Terminale CS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Multiplayer Cultural 1v1 & Virtual Passport
            </p>
          </div>
        </div>

        {/* Center Nav Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Passage Editorial Mode */}
          <button
            type="button"
            onClick={() => onTabChange('passage')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'passage'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-300/90 hover:text-amber-200 hover:bg-amber-950/40 border border-amber-500/30'
            }`}
          >
            <span>✨</span>
            <span>Passage (Editorial)</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('arena')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'arena'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>⚔️</span>
            <span>Arena</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('passport')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'passport'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🛂</span>
            <span>Passport</span>
            {stampsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {stampsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer hidden md:flex ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🏆</span>
            <span>Rankings</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Architecture & Code</span>
            <span className="sm:hidden">CS Hub</span>
          </button>
        </nav>

        {/* Right Player Profile & Controls */}
        <div className="flex items-center gap-3">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* User mini status badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="relative">
              <span className="text-xl">{user.countryFlag}</span>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-600 text-[9px] font-bold text-white flex items-center justify-center border border-slate-900">
                {user.level}
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">
                  {user.username}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                  <Award className="w-2.5 h-2.5" /> {user.xp} XP
                </span>
              </div>
              {/* Level XP mini bar */}
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
