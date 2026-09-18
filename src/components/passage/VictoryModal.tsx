import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  CheckCircle,
  Clock,
  Zap,
  Flame,
} from 'lucide-react';
import { globalSoundEngine } from '../../services/GlobalSoundEngine';
import { PassportStamp } from '../../types';

export interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
  opponentName: string;
  xpGained: number;
  newLevel?: number;
  unlockedStamp?: PassportStamp | null;
  accuracyPercent?: number;
  timeSpentSeconds?: number;
  onRematch?: () => void;
  onViewPassport?: () => void;
  onContinueJourney?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  winnerName,
  opponentName,
  xpGained,
  newLevel,
  unlockedStamp,
  accuracyPercent = 100,
  timeSpentSeconds = 42,
  onRematch,
  onViewPassport,
  onContinueJourney,
}) => {
  const [animatedXP, setAnimatedXP] = useState(0);
  const [stampRevealed, setStampRevealed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAnimatedXP(0);
      setStampRevealed(false);
      return;
    }

    // Play victory fanfare
    globalSoundEngine.playVictory();

    // Animate XP counting up
    const startTime = performance.now();
    const duration = 1200;

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      setAnimatedXP(Math.floor(progress * xpGained));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        // Trigger stamp slam animation after XP finishes
        setTimeout(() => {
          setStampRevealed(true);
          if (unlockedStamp) {
            globalSoundEngine.playStamp();
          }
        }, 300);
      }
    };

    const frameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, xpGained, unlockedStamp]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md select-none">
          {/* Backdrop Click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#141416] text-stone-900 dark:text-[#f5f5f3] rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden z-10 text-center"
          >
            {/* Background Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 dark:bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/15 dark:bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Victory Badge Header */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Cultural Duel Victorious</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
              Triumph of Cultural Insight
            </h2>
            <p className="font-editorial italic text-stone-500 dark:text-stone-400 text-sm mt-1">
              <span className="font-bold text-stone-900 dark:text-stone-100">{winnerName}</span> outmatched{' '}
              <span className="text-stone-700 dark:text-stone-300">{opponentName}</span> in diplomatic trivia.
            </p>

            {/* XP Gained & Level Display Card */}
            <div className="my-6 p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800 shadow-inner flex flex-col items-center">
              <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
                Diplomatic Merit Accorded
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <span className="font-display text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                  +{animatedXP} XP
                </span>
              </div>

              {newLevel && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-display font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Rank Elevation: Level {newLevel} Diplomat</span>
                </div>
              )}

              {/* Performance Stats Grid */}
              <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800 text-center">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                    Precision
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {accuracyPercent}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                    Speed
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {timeSpentSeconds}s
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
                    Streak Bonus
                  </span>
                  <span className="font-display font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center justify-center gap-1 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    1.5x
                  </span>
                </div>
              </div>
            </div>

            {/* Unlocked Visa Stamp Card (Physical Slam Animation) */}
            {unlockedStamp && (
              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 mb-2 block font-semibold">
                  New Archival Visa Issued
                </span>

                <AnimatePresence>
                  {stampRevealed ? (
                    <motion.div
                      initial={{ scale: 2.8, rotate: -25, opacity: 0 }}
                      animate={{ scale: 1, rotate: -2, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className="inline-block p-4 rounded-2xl border-2 border-dashed border-amber-600 dark:border-amber-400 bg-amber-50/70 dark:bg-stone-900/90 shadow-lg text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{unlockedStamp.countryFlag}</span>
                        <div>
                          <div className="font-display text-sm font-black tracking-tight text-stone-900 dark:text-stone-100">
                            {unlockedStamp.countryName.toUpperCase()} • ENTRY VISA
                          </div>
                          <div className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
                            {unlockedStamp.capital || 'Official Capital'} • {unlockedStamp.acquiredAt}
                          </div>
                        </div>
                      </div>
                      <p className="font-editorial italic text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 max-w-sm">
                        "{unlockedStamp.culturalFact}"
                      </p>
                    </motion.div>
                  ) : (
                    <div className="h-20 flex items-center justify-center text-xs font-mono text-stone-400 animate-pulse">
                      Inking municipal wax seal...
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              {onRematch && (
                <button
                  type="button"
                  onClick={() => {
                    globalSoundEngine.playClick();
                    onRematch();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rematch Opponent</span>
                </button>
              )}

              {onViewPassport && (
                <button
                  type="button"
                  onClick={() => {
                    globalSoundEngine.playClick();
                    onViewPassport();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 font-display text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inspect Passport</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  globalSoundEngine.playClick();
                  if (onContinueJourney) onContinueJourney();
                  onClose();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-stone-950 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-display text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
