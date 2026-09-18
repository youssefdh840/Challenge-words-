import React, { useState } from 'react';
import {
  PassportStamp,
  AchievementBadge,
  UserProfile,
} from '../types';
import { COUNTRIES } from '../data/countries';
import { soundEngine } from '../services/soundEngine';
import {
  Award,
  Calendar,
  Volume2,
  Music,
  Sparkles,
  Plane,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VirtualPassportProps {
  user: UserProfile;
  stamps: PassportStamp[];
  badges: AchievementBadge[];
}

export const VirtualPassport: React.FC<VirtualPassportProps> = ({
  user,
  stamps,
  badges,
}) => {
  const [selectedStamp, setSelectedStamp] = useState<PassportStamp | null>(null);
  const [activeTab, setActiveTab] = useState<'visas' | 'identity' | 'achievements'>('visas');
  const [continentFilter, setContinentFilter] = useState<string>('all');

  const filteredStamps = stamps.filter((s) => {
    if (continentFilter === 'all') return true;
    const info = COUNTRIES[s.countryCode];
    return info && info.continent.toLowerCase() === continentFilter.toLowerCase();
  });

  const getInkColorClasses = (color: string) => {
    switch (color) {
      case 'crimson':
        return 'border-rose-600 text-rose-600 bg-rose-50/10 shadow-rose-950/20';
      case 'navy':
        return 'border-blue-600 text-blue-600 bg-blue-50/10 shadow-blue-950/20';
      case 'emerald':
        return 'border-emerald-600 text-emerald-600 bg-emerald-50/10 shadow-emerald-950/20';
      case 'sepia':
        return 'border-amber-700 text-amber-700 bg-amber-50/10 shadow-amber-950/20';
      case 'violet':
        return 'border-purple-600 text-purple-600 bg-purple-50/10 shadow-purple-950/20';
      default:
        return 'border-indigo-600 text-indigo-600 bg-indigo-50/10 shadow-indigo-950/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Passport Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛂</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Official Virtual Passport
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Official travel log of unlocked international cultural stamps and badges.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-700/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab('visas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'visas'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Entry Visas ({stamps.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('identity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'identity'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Biometric Page
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
          </button>
        </div>
      </div>

      {/* Main Passport Booklet Container */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#1b1f38] to-[#111424] border-2 border-amber-500/30 p-4 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden">
        {/* Subtle Watermark Guilloche background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* TOP EMBOSSED GOLD RIBBON */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6 text-amber-300/80 text-xs font-mono tracking-widest uppercase">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            WORLD CHALLENGE TRAVEL DOCUMENT
          </span>
          <span className="text-[11px] text-amber-400/90 font-bold">
            NO. {user.passportId}
          </span>
        </div>

        {/* TAB 1: VISAS & STAMPS GALLERY */}
        {activeTab === 'visas' && (
          <div>
            {/* Continent Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 text-xs no-scrollbar">
              <span className="text-slate-400 font-semibold text-xs mr-1">Continent:</span>
              {['all', 'Africa', 'Europe', 'Asia', 'Americas', 'Oceania'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setContinentFilter(c)}
                  className={`px-3 py-1 rounded-full capitalize font-medium transition-all cursor-pointer whitespace-nowrap ${
                    continentFilter.toLowerCase() === c.toLowerCase()
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/60 font-bold'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Stamp Grid */}
            {filteredStamps.length === 0 ? (
              <div className="py-16 text-center">
                <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-300">No stamps found in this category</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  Play more 1v1 duels in the Arena to defeat opponents and collect their national stamps!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStamps.map((stamp, idx) => {
                  const inkClass = getInkColorClasses(stamp.inkColor);
                  // Alternating aesthetic rotations to mimic real inked rubber stamps
                  const rotDeg = ((idx * 7) % 15) - 7;

                  return (
                    <motion.div
                      key={stamp.id}
                      whileHover={{ scale: 1.04, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      style={{ transform: `rotate(${rotDeg}deg)` }}
                      onClick={() => {
                        soundEngine.playStamp();
                        setSelectedStamp(stamp);
                      }}
                      className={`relative p-5 rounded-2xl border-2 border-dashed ${inkClass} cursor-pointer transition-shadow hover:shadow-lg backdrop-blur-sm group select-none`}
                    >
                      {/* Inner Stamp Border */}
                      <div className="border border-current/40 rounded-xl p-3 h-full flex flex-col justify-between">
                        {/* Stamp Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{stamp.countryFlag}</span>
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-widest block opacity-70">
                                ENTRY PERMIT
                              </span>
                              <h4 className="font-black text-sm uppercase tracking-wide">
                                {stamp.countryName}
                              </h4>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono border border-current px-1.5 py-0.5 rounded uppercase font-bold">
                            {stamp.unlockedBy === 'victory' ? 'VICTORY' : 'CULTURE'}
                          </span>
                        </div>

                        {/* Stamp Body details */}
                        <div className="my-2 space-y-1 text-xs font-mono opacity-90">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 opacity-75" />
                            <span>{stamp.acquiredAt}</span>
                          </div>
                          <div className="text-[11px] truncate">
                            Port: <span className="font-bold">{stamp.capital}</span>
                          </div>
                          <div className="text-[10px] opacity-80 truncate">
                            Opponent: {stamp.opponentName}
                          </div>
                        </div>

                        {/* Stamp Footer */}
                        <div className="pt-2 border-t border-current/20 flex items-center justify-between text-[9px] font-mono">
                          <span>{stamp.coordinates}</span>
                          <span className="underline group-hover:font-bold">Inspect Dossier →</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BIOMETRIC & CITIZEN IDENTITY PAGE */}
        {activeTab === 'identity' && (
          <div className="max-w-2xl mx-auto bg-amber-50/90 text-slate-900 rounded-2xl p-6 sm:p-8 shadow-xl border-4 border-amber-200/40 relative">
            {/* Top Passport Title */}
            <div className="text-center border-b-2 border-slate-900/20 pb-4 mb-6">
              <span className="text-[10px] tracking-widest font-mono uppercase text-slate-600 block">
                GLOBAL UNION OF COMPUTER SCIENCE EDUCATORS
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-slate-900">
                WORLD CHALLENGE PASSPORT
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Photo Box */}
              <div className="w-36 h-44 rounded-xl bg-slate-200 border-2 border-slate-700/60 flex flex-col items-center justify-center relative shadow-inner shrink-0 overflow-hidden mx-auto sm:mx-0">
                <span className="text-5xl">{user.avatar}</span>
                <span className="text-2xl mt-1">{user.countryFlag}</span>
                <div className="absolute bottom-1 text-[9px] font-mono font-bold text-slate-600 uppercase">
                  VERIFIED DELEGATE
                </div>
              </div>

              {/* Data Fields */}
              <div className="flex-1 space-y-3 font-mono text-xs w-full">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Surname / Nom</span>
                    <span className="font-bold text-sm text-slate-900">{user.username}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Passport No.</span>
                    <span className="font-bold text-sm text-amber-800">{user.passportId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Nationality</span>
                    <span className="font-bold text-sm text-slate-900">
                      {user.countryName} {user.countryFlag}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Ranking Title</span>
                    <span className="font-bold text-xs text-indigo-900">{user.rankTitle}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Level</span>
                    <span className="font-bold text-sm text-slate-900">Lv. {user.level}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Total XP</span>
                    <span className="font-bold text-sm text-slate-900">{user.xp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Win Rate</span>
                    <span className="font-bold text-sm text-emerald-800">
                      {user.gamesPlayed > 0
                        ? `${Math.round((user.gamesWon / user.gamesPlayed) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-500 uppercase block">
                    Stamps Collected
                  </span>
                  <span className="font-bold text-sm text-slate-900">
                    {stamps.length} Unique Sovereignties
                  </span>
                </div>
              </div>
            </div>

            {/* Machine Readable Zone (MRZ) */}
            <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-400/80 font-mono text-[10px] sm:text-xs text-slate-800 tracking-wider select-all overflow-x-auto leading-relaxed">
              <p>P&lt;{user.countryCode}{user.username.toUpperCase().padEnd(25, '&lt;')}</p>
              <p>
                {user.passportId.replace(/-/g, '')}&lt;{user.countryCode}9901015M3109180&lt;&lt;&lt;&lt;&lt;&lt;04
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: BADGES & ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all ${
                  b.unlocked
                    ? 'bg-slate-800/80 border-amber-500/40 text-slate-100 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      b.unlocked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm truncate text-white">{b.name}</h4>
                      {b.unlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                          UNLOCKED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {b.progress} / {b.maxProgress}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            b.unlocked ? 'bg-amber-400' : 'bg-cyan-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (b.progress / b.maxProgress) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CULTURAL DOSSIER POPUP FOR SELECTED STAMP */}
      <AnimatePresence>
        {selectedStamp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedStamp.countryFlag}</span>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400">
                      PASSPORT CULTURAL DOSSIER
                    </span>
                    <h3 className="text-xl font-black text-white">{selectedStamp.countryName}</h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStamp(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Cultural Highlight & Heritage
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {selectedStamp.culturalFact}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Capital City</span>
                    <span className="font-bold text-white text-sm">{selectedStamp.capital}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Language</span>
                    <span className="font-bold text-white text-sm">{selectedStamp.language}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Landmark</span>
                    <span className="font-bold text-white text-xs truncate">
                      {selectedStamp.famousLandmark}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                    <span className="text-slate-400 block text-[10px] uppercase">Unlocked Via</span>
                    <span className="font-bold text-amber-300 text-xs uppercase">
                      {selectedStamp.unlockedBy} vs {selectedStamp.opponentName}
                    </span>
                  </div>
                </div>

                {/* Audio Interactions */}
                {COUNTRIES[selectedStamp.countryCode] && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const country = COUNTRIES[selectedStamp.countryCode];
                        soundEngine.speakPhrase(country.nativeGreeting, country.speechLang);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Hear Greeting: {COUNTRIES[selectedStamp.countryCode].nativeGreeting}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const country = COUNTRIES[selectedStamp.countryCode];
                        soundEngine.playMelody(country.soundMelody);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Music className="w-4 h-4" />
                      <span>Play Folk Motif</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedStamp(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Return to Passport
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
