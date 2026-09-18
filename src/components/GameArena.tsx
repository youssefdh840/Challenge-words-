import React, { useState } from 'react';
import {
  ActiveMatch,
  GameQuestion,
  UserProfile,
  UserLocation,
} from '../types';
import { gameEngine } from '../services/gameEngine';
import { soundEngine } from '../services/soundEngine';
import { WorldMap } from './WorldMap';
import { GlobalLobbyMap } from './GlobalLobbyMap';
import { COUNTRIES_LIST } from '../data/countries';
import confetti from 'canvas-confetti';
import {
  Zap,
  Volume2,
  Trophy,
  Swords,
  Timer,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Flame,
  Globe2,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameArenaProps {
  user: UserProfile;
  activeMatch: ActiveMatch | null;
  onNavigateToPassport: () => void;
  onUpdateUserLocation?: (loc: UserLocation) => void;
}

export const GameArena: React.FC<GameArenaProps> = ({
  user,
  activeMatch,
  onNavigateToPassport,
  onUpdateUserLocation,
}) => {
  const [preferredCountry, setPreferredCountry] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const triggerVictoryConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleStartMatch = () => {
    soundEngine.playTick();
    gameEngine.startMatchmaking(user, preferredCountry || undefined);
  };

  const handleOptionSelect = (option: string) => {
    if (!activeMatch || activeMatch.status !== 'playing_round') return;
    if (activeMatch.player1CurrentAnswer) return;
    setSelectedOption(option);
    gameEngine.submitPlayerAnswer(option);
  };

  const handleMapCountrySelect = (countryCode: string) => {
    if (!activeMatch || activeMatch.status !== 'playing_round') return;
    if (activeMatch.player1CurrentAnswer) return;
    // Map answer resolution
    const currentQ = activeMatch.questions[activeMatch.currentRoundIndex];
    if (currentQ && currentQ.mapTarget) {
      setSelectedOption(countryCode);
      const isCorrect = countryCode.toUpperCase() === currentQ.mapTarget.countryCode.toUpperCase();
      gameEngine.submitPlayerAnswer(isCorrect ? currentQ.correctAnswer : 'WRONG_LOCATION');
    }
  };

  // Helper for mini-game category styling
  const getCategoryBadge = (type: GameQuestion['type']) => {
    switch (type) {
      case 'country_quiz':
        return { label: 'Country & Flag Quiz', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      case 'guess_word':
        return { label: 'Guess the Word', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'mystery_cuisine':
        return { label: 'Mystery Cuisine', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'sound_quiz':
        return { label: 'Music & Sound Quiz', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'map_speed_test':
        return { label: 'World Map Speed Test', color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' };
    }
  };

  // 1. STATE: LOBBY / MATCHMAKING LAUNCHER
  if (!activeMatch || activeMatch.status === 'idle') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Real-time Global Lobby Map */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>Global Radar Network & Real-Time Active Diplomat Nodes</span>
            </h2>
            <span className="text-[11px] font-mono text-stone-400">
              Cross-Border Pairing: Enabled
            </span>
          </div>
          <GlobalLobbyMap
            user={user}
            onLocationUpdated={onUpdateUserLocation}
            className="shadow-2xl"
          />
        </div>

        {/* Hero Duel Card */}
        <div className="rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 text-xs font-bold mb-5">
            <Swords className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-Time 1v1 Cultural Arena • Cross-Border Stamp Matchmaking</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Challenge the World in 1v1 Cultural Duels
          </h1>
          <p className="text-stone-300 text-sm max-w-2xl mb-6 leading-relaxed">
            Face international students in rapid 5-round cultural mini-games. The engine prioritizes
            connecting you with players from other nations, unlocking their official country visa stamps!
          </p>

          {/* Challenger Identity Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-stone-800 flex items-center justify-center text-3xl border border-stone-700 shadow-inner">
                {user.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{user.countryFlag}</span>
                  <h3 className="font-black text-white text-base">{user.username}</h3>
                </div>
                <p className="text-xs text-stone-400 font-mono">
                  {user.rankTitle} • Lv.{user.level} ({user.xp} XP)
                </p>
                <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
                  Origin: {user.location?.city || user.countryName} ({user.countryName})
                </p>
              </div>
            </div>

            {/* Target Opponent Selector */}
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col justify-center">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-amber-400" />
                Target Opponent Origin (Optional):
              </label>
              <select
                value={preferredCountry}
                onChange={(e) => setPreferredCountry(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs font-medium text-stone-200 focus:outline-none focus:border-amber-400"
              >
                <option value="">Any Foreign Nation (Optimal Stamp Matching)</option>
                {COUNTRIES_LIST.filter((c) => c.code !== user.countryCode).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.capital})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mini-Games Showcase Pills */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2.5">
              Included Mini-Game Modes:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center font-semibold">
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-blue-500/30 text-blue-300">
                <span className="block text-lg mb-1">🏛️</span>
                <span>Country Quiz</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-emerald-500/30 text-emerald-300">
                <span className="block text-lg mb-1">🗣️</span>
                <span>Guess the Word</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-500/30 text-amber-300">
                <span className="block text-lg mb-1">🍲</span>
                <span>Mystery Cuisine</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-purple-500/30 text-purple-300">
                <span className="block text-lg mb-1">🎵</span>
                <span>Music & Sound</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900/80 border border-rose-500/30 text-rose-300 col-span-2 sm:col-span-1">
                <span className="block text-lg mb-1">🗺️</span>
                <span>Map Speed Test</span>
              </div>
            </div>
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={handleStartMatch}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <Swords className="w-5 h-5" />
            <span>Launch Cross-Border Matchmaking</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. STATE: SEARCHING FOR OPPONENT
  if (activeMatch.status === 'searching') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        {/* Radar Map in Searching State */}
        <div className="mb-6">
          <GlobalLobbyMap
            user={user}
            isSearching={true}
            className="shadow-2xl"
          />
        </div>

        <div className="p-6 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl max-w-lg mx-auto">
          <h2 className="text-xl font-black text-white mb-2 flex items-center justify-center gap-2">
            <Radio className="w-5 h-5 text-amber-400 animate-spin" />
            <span>Cross-Border Matchmaking in Progress...</span>
          </h2>
          <p className="text-xs font-mono text-stone-400 mb-5 leading-relaxed">
            Scanning international nodes for latency and cross-border diversity. Primary rule: pairing with a different region to unlock passport stamps.
          </p>
          <button
            type="button"
            onClick={() => gameEngine.leaveMatch()}
            className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono font-bold cursor-pointer transition-colors border border-stone-700"
          >
            Cancel Matchmaking
          </button>
        </div>
      </div>
    );
  }

  // 3. STATE: MATCH FOUND (VS SPLASH WITH FLIGHT ARC)
  if (activeMatch.status === 'matched') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Animated Geodesic Flight Arc Map */}
        <div className="mb-6">
          <GlobalLobbyMap
            user={user}
            activeMatch={activeMatch}
            className="shadow-2xl"
          />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 sm:p-8 rounded-3xl bg-stone-900/95 border-2 border-amber-500/50 shadow-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CROSS-BORDER DIPLOMATIC LINK ESTABLISHED</span>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-14 my-4">
            {/* Player 1 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-800 border-2 border-emerald-400 flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-2 shadow-lg">
                {activeMatch.player1.avatar}
              </div>
              <div className="text-2xl mb-0.5">{activeMatch.player1.countryFlag}</div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">{activeMatch.player1.username}</h3>
              <span className="text-xs text-stone-400 font-mono">
                {activeMatch.matchRoute?.p1City || activeMatch.player1.countryName}
              </span>
            </div>

            {/* VS Badge & Telemetry */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
                VS
              </div>
              {activeMatch.distanceKm && (
                <span className="text-[11px] font-mono text-amber-400 font-bold mt-2">
                  {activeMatch.distanceKm.toLocaleString()} km
                </span>
              )}
              {activeMatch.estimatedPingMs && (
                <span className="text-[10px] font-mono text-cyan-400">
                  ~{activeMatch.estimatedPingMs}ms
                </span>
              )}
            </div>

            {/* Player 2 */}
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-800 border-2 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-2 shadow-lg">
                {activeMatch.player2.avatar}
              </div>
              <div className="text-2xl mb-0.5">{activeMatch.player2.countryFlag}</div>
              <h3 className="font-extrabold text-white text-sm sm:text-base">{activeMatch.player2.username}</h3>
              <span className="text-xs text-stone-400 font-mono">
                {activeMatch.matchRoute?.p2City || activeMatch.player2.countryName}
              </span>
            </div>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-emerald-300 mt-5 flex items-center justify-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Synchronizing Geodesic Duel Stream... Round 1 beginning!</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // 4. STATE: PLAYING ROUND & ROUND REVIEW
  const currentRound = activeMatch.questions[activeMatch.currentRoundIndex];
  const isReviewing = activeMatch.status === 'round_review';
  const category = getCategoryBadge(currentRound.type);

  if (activeMatch.status === 'playing_round' || isReviewing) {
    const timePercentage = Math.round((activeMatch.timeRemainingSec / activeMatch.roundDurationSec) * 100);

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Battle Header */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Player 1 Status */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeMatch.player1.countryFlag}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-none">
                    {activeMatch.player1.username}
                  </span>
                  {activeMatch.player1Streak >= 2 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> {activeMatch.player1Streak}x
                    </span>
                  )}
                </div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {activeMatch.player1Score} pts
                </div>
              </div>
            </div>

            {/* Center Round & Timer */}
            <div className="text-center">
              <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-400">
                Round {activeMatch.currentRoundIndex + 1} / {activeMatch.totalRounds}
              </div>
              <div
                className={`text-2xl font-black font-mono flex items-center justify-center gap-1 my-0.5 ${
                  activeMatch.timeRemainingSec <= 3 ? 'text-rose-400 animate-bounce' : 'text-white'
                }`}
              >
                <Timer className="w-5 h-5 opacity-70" />
                <span>{activeMatch.timeRemainingSec}s</span>
              </div>
            </div>

            {/* Player 2 Status */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <div className="flex items-center justify-end gap-1.5">
                  {activeMatch.player2Streak >= 2 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> {activeMatch.player2Streak}x
                    </span>
                  )}
                  <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-none">
                    {activeMatch.player2.username}
                  </span>
                </div>
                <div className="text-lg font-black text-amber-400 font-mono">
                  {activeMatch.player2Score} pts
                </div>
              </div>
              <span className="text-2xl">{activeMatch.player2.countryFlag}</span>
            </div>
          </div>

          {/* Round Timer Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                activeMatch.timeRemainingSec <= 3
                  ? 'bg-rose-500'
                  : activeMatch.timeRemainingSec <= 6
                  ? 'bg-amber-400'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card Container */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Category Tag */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider font-mono ${category.color}`}
            >
              {category.label}
            </span>

            {/* Opponent Status Indicator */}
            <div className="text-xs font-mono flex items-center gap-2">
              {activeMatch.player2CurrentAnswer ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Opponent Answered ({activeMatch.player2CurrentAnswer.timeTakenMs}ms)
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Opponent thinking...
                </span>
              )}
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="text-lg sm:text-2xl font-black text-white leading-snug mb-6">
            {currentRound.prompt}
          </h2>

          {/* SPECIAL MODE 1: SOUND QUIZ INTERACTION */}
          {currentRound.type === 'sound_quiz' && currentRound.soundData && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-purple-400 block">
                  CULTURAL AUDIO SIGNATURE
                </span>
                <p className="text-xs font-semibold text-purple-200">
                  {currentRound.soundData.melodyDescription}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentRound.soundData.notes && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playMelody(currentRound.soundData!.notes!);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Replay Melody</span>
                  </button>
                )}
                {currentRound.soundData.speechText && (
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.speakPhrase(
                        currentRound.soundData!.speechText!,
                        currentRound.soundData!.speechLang || 'en-US'
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-purple-500/40"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Native Voice</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* SPECIAL MODE 2: GUESS THE WORD DETAIL CARD */}
          {currentRound.type === 'guess_word' && currentRound.wordDetail && (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 mb-6 flex items-center justify-between">
              <div>
                <span className="text-2xl font-extrabold text-emerald-300 block">
                  « {currentRound.wordDetail.originalWord} »
                </span>
                <span className="text-xs text-emerald-400 font-mono">
                  Phonetic: [{currentRound.wordDetail.phonetic}]
                </span>
              </div>
              {currentRound.soundData?.speechText && (
                <button
                  type="button"
                  onClick={() =>
                    soundEngine.speakPhrase(
                      currentRound.soundData!.speechText!,
                      currentRound.soundData!.speechLang || 'en-US'
                    )
                  }
                  className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* SPECIAL MODE 3: MYSTERY CUISINE INGREDIENTS CARD */}
          {currentRound.type === 'mystery_cuisine' && currentRound.cuisineDetail && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🍲</span>
                <h3 className="font-bold text-amber-200 text-sm">
                  Dish Profile: {currentRound.cuisineDetail.dishName}
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentRound.cuisineDetail.keyIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-amber-900/40 border border-amber-700/50 text-amber-200"
                  >
                    • {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SPECIAL MODE 4: WORLD MAP SPEED TEST INTERACTIVE MAP */}
          {currentRound.type === 'map_speed_test' ? (
            <div className="mb-6">
              <WorldMap
                targetCountryCode={currentRound.mapTarget?.countryCode}
                onCountrySelect={handleMapCountrySelect}
                selectedCountryCode={selectedOption}
                interactive={!activeMatch.player1CurrentAnswer && !isReviewing}
                lastFeedback={
                  selectedOption
                    ? {
                        isCorrect:
                          selectedOption.toUpperCase() ===
                          currentRound.mapTarget?.countryCode.toUpperCase(),
                        clickedCode: selectedOption,
                      }
                    : null
                }
              />
              <p className="text-center text-xs text-slate-400 mt-2 font-mono">
                Click directly on the target country marker on the map!
              </p>
            </div>
          ) : (
            /* STANDARD 4 CHOICES GRID */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentRound.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option.toLowerCase() === currentRound.correctAnswer.toLowerCase();
                const answered = !!activeMatch.player1CurrentAnswer;

                let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-slate-500';

                if (isReviewing) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-600/80 border-rose-500 text-white font-bold opacity-80';
                  } else {
                    btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                  }
                } else if (answered) {
                  if (isSelected) {
                    btnStyle = 'bg-cyan-600 border-cyan-400 text-white font-bold';
                  } else {
                    btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={answered || isReviewing}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isReviewing && isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                    {isReviewing && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ROUND REVIEW CARD (Appears after both answer or time runs out) */}
          <AnimatePresence>
            {isReviewing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 font-mono">
                  <Sparkles className="w-4 h-4" />
                  <span>Cultural Resolution & Insights</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">
                  Correct Answer: <span className="text-emerald-400">{currentRound.correctAnswer}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {currentRound.explanation}
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{currentRound.culturalFact}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-mono text-cyan-400 pt-2 border-t border-slate-800">
                  <span>Next round beginning shortly...</span>
                  <span>Keep your reflexes ready!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // 5. STATE: MATCH FINISHED (CEREMONY & STAMP UNLOCK)
  if (activeMatch.status === 'match_finished') {
    const p1Won = activeMatch.winnerId === activeMatch.player1.id;
    const isDraw = activeMatch.isDraw;
    const awardedStamp = activeMatch.stampsAwarded[0];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onAnimationComplete={() => {
            if (p1Won) triggerVictoryConfetti();
          }}
          className="rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden"
        >
          {/* Header Trophy Banner */}
          <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl border bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border-amber-400/40">
            {p1Won ? '🏆' : isDraw ? '🤝' : '🛡️'}
          </div>

          <h2 className="text-3xl font-black text-white mb-1">
            {p1Won ? 'Spectacular Victory!' : isDraw ? 'Honorable Draw!' : 'Match Completed!'}
          </h2>
          <p className="text-sm text-slate-400 mb-6 font-mono">
            {p1Won
              ? 'You triumphed in the international duel and earned diplomatic honor!'
              : isDraw
              ? 'Both players demonstrated formidable cultural mastery!'
              : 'A valiant effort! Cultural exchanges enrich every participant.'}
          </p>

          {/* Final Scoreboard Comparison */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
            <div className="border-r border-slate-800 pr-2">
              <span className="text-xs text-slate-400 block font-mono">YOU ({user.countryFlag})</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {activeMatch.player1Score} pts
              </span>
              <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                +{activeMatch.xpAwarded.player1} XP Gained
              </span>
            </div>
            <div className="pl-2">
              <span className="text-xs text-slate-400 block font-mono">
                {activeMatch.player2.username} ({activeMatch.player2.countryFlag})
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono">
                {activeMatch.player2Score} pts
              </span>
              <span className="text-[11px] text-slate-400 font-bold block mt-1">
                +{activeMatch.xpAwarded.player2} XP
              </span>
            </div>
          </div>

          {/* DIPLOMATIC PASSPORT STAMP CEREMONY */}
          {awardedStamp && (
            <motion.div
              initial={{ scale: 1.5, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="p-5 rounded-2xl border-4 border-dashed border-rose-600 bg-rose-950/20 text-rose-500 max-w-md mx-auto my-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-rose-600/30 pb-2 mb-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
                  ★ NEW PASSPORT STAMP UNLOCKED ★
                </span>
                <span className="text-xs font-mono font-bold">{awardedStamp.acquiredAt}</span>
              </div>
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="text-3xl">{awardedStamp.countryFlag}</span>
                <div className="text-left">
                  <h3 className="text-xl font-black uppercase text-rose-400">
                    {awardedStamp.countryName}
                  </h3>
                  <span className="text-xs font-mono text-rose-300">
                    Visa granted via {p1Won ? 'Victory' : 'Cultural Exchange'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-mono text-rose-200/80 mt-2">
                Opponent: {awardedStamp.opponentName} • Port: {awardedStamp.capital}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              type="button"
              onClick={onNavigateToPassport}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Inspect Virtual Passport</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => gameEngine.leaveMatch()}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm cursor-pointer border border-slate-700 transition-all"
            >
              Play Another Duel
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
