import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

export interface QuizChoiceOption {
  id: string;
  label: string;
  subtext?: string;
  isCorrect?: boolean;
  pronunciationAudioWord?: string;
}

export interface InteractivePillGroupProps {
  options: QuizChoiceOption[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  isSubmitted?: boolean;
  disabled?: boolean;
  layoutColumns?: 1 | 2;
  // Audio trigger button support ("Hear Pronunciation")
  audioWord?: string;
  audioLang?: string;
  onHearPronunciation?: (word: string, lang?: string) => void;
}

export const InteractivePillGroup: React.FC<InteractivePillGroupProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
  isSubmitted = false,
  disabled = false,
  layoutColumns = 2,
  audioWord,
  audioLang = 'en-US',
  onHearPronunciation,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Audio Pronunciation Trigger Handler
  const handlePlayAudio = (e: React.MouseEvent, wordToSpeak?: string) => {
    e.stopPropagation();
    const targetWord = wordToSpeak || audioWord;
    if (!targetWord) return;

    setIsPlayingAudio(true);

    if (onHearPronunciation) {
      onHearPronunciation(targetWord, audioLang);
      setTimeout(() => setIsPlayingAudio(false), 1400);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(targetWord);
        utterance.lang = audioLang;
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setIsPlayingAudio(false);
      }
    } else {
      setTimeout(() => setIsPlayingAudio(false), 1200);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Optional "Hear Pronunciation" Header Pill Bar if audioWord is present */}
      {audioWord && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] shadow-[0_0_8px_#E5A93C]" />
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-[#9CA3AF] font-semibold">
              Lexicon Pronunciation
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={(e) => handlePlayAudio(e, audioWord)}
            className={`min-h-[44px] sm:min-h-[48px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-display font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-xs border border-white/10 ${
              isPlayingAudio
                ? 'bg-[#E5A93C] text-black border-[#E5A93C] ring-2 ring-[#E5A93C]/40 font-bold'
                : 'bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md text-white'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-black animate-pulse" />
                <span className="font-bold">Speaking: “{audioWord}”</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#00F2FE]" />
                <span className="text-[#9CA3AF] hover:text-white">Hear Pronunciation</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Choices Grid with Fluid Touch Targets (min-h-[48px]) & Responsive Auto-Wrapping */}
      <div
        role="radiogroup"
        aria-label="Quiz Options"
        className={`grid gap-3 sm:gap-4 w-full ${
          layoutColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const letter = String.fromCharCode(65 + index); // A, B, C, D...

          // OLED Deep Dark state styling
          let containerTheme =
            'bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border-white/10 text-white';
          let badgeTheme = 'bg-white/[0.05] text-[#9CA3AF] border border-white/10';

          if (isSubmitted) {
            if (option.isCorrect) {
              containerTheme =
                'bg-emerald-950/30 backdrop-blur-md border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/40';
              badgeTheme = 'bg-emerald-500 text-black font-bold border-transparent';
            } else if (isSelected && !option.isCorrect) {
              containerTheme =
                'bg-rose-950/30 backdrop-blur-md border-rose-500/50 text-white ring-1 ring-rose-500/40';
              badgeTheme = 'bg-rose-500 text-white border-transparent';
            } else {
              containerTheme =
                'opacity-30 bg-white/[0.01] border-white/5 text-gray-500';
              badgeTheme = 'bg-white/[0.02] text-gray-500 border-white/5';
            }
          } else if (isSelected) {
            containerTheme =
              'bg-white/[0.08] backdrop-blur-md border-[#E5A93C]/70 text-white shadow-xl ring-1 ring-[#E5A93C]/60';
            badgeTheme = 'bg-[#E5A93C] text-black font-black border-transparent';
          }

          return (
            <motion.button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled || isSubmitted}
              onClick={() => onSelectOption(option.id)}
              whileHover={
                !disabled && !isSubmitted
                  ? { scale: 1.015, y: -2 }
                  : undefined
              }
              whileTap={
                !disabled && !isSubmitted
                  ? { scale: 0.985 }
                  : undefined
              }
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              className={`group relative p-3.5 sm:p-4 min-h-[48px] sm:min-h-[56px] rounded-2xl border text-left flex items-start gap-3 sm:gap-3.5 transition-all duration-200 cursor-pointer disabled:cursor-default select-none ${containerTheme}`}
            >
              {/* Letter Index Badge (A, B, C, D) - touch friendly anchor */}
              <motion.span
                layout
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs sm:text-sm font-mono font-bold flex items-center justify-center shrink-0 transition-colors shadow-xs ${badgeTheme}`}
              >
                {isSubmitted && option.isCorrect ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : isSubmitted && isSelected && !option.isCorrect ? (
                  <X className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  letter
                )}
              </motion.span>

              {/* Main Term & Subtitle Definition with Fluid Typography */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-xs sm:text-sm md:text-base font-bold tracking-tight text-white block break-words">
                    {option.label}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Optional per-option pronunciation button with 36px touch zone */}
                    {option.pronunciationAudioWord && (
                      <motion.span
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) =>
                          handlePlayAudio(e, option.pronunciationAudioWord)
                        }
                        title="Hear Pronunciation"
                        className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-[#9CA3AF] hover:text-[#00F2FE] border border-white/10 transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </motion.span>
                    )}

                    <AnimatePresence>
                      {isSelected && !isSubmitted && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sparkles className="w-4 h-4 text-[#E5A93C] animate-pulse shrink-0" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Subtitle Definition */}
                {option.subtext && (
                  <p
                    className={`text-[11px] sm:text-xs md:text-[13px] mt-1 sm:mt-1.5 leading-relaxed font-sans-clean transition-colors break-words ${
                      isSelected && !isSubmitted
                        ? 'text-white/90'
                        : isSubmitted && option.isCorrect
                        ? 'text-emerald-300 font-medium'
                        : 'text-[#9CA3AF]'
                    }`}
                  >
                    {option.subtext}
                  </p>
                )}
              </div>

              {/* Subtle Active Corner Border Accent */}
              {isSelected && !isSubmitted && (
                <motion.div
                  layoutId="activePillGlow"
                  className="absolute inset-0 rounded-2xl ring-1 ring-[#E5A93C]/50 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
