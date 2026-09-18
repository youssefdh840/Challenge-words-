import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  BookOpen,
  Award,
} from 'lucide-react';
import { PassageChapter } from '../../types/passage';

interface PassageBottomBarProps {
  chapters: PassageChapter[];
  currentChapterIndex: number;
  onSelectChapter: (index: number) => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  stampsCount: number;
  onOpenPassport: () => void;
  completedChallengesCount: number;
  totalChallengesCount: number;
}

export const PassageBottomBar: React.FC<PassageBottomBarProps> = ({
  chapters,
  currentChapterIndex,
  onSelectChapter,
  isAudioPlaying,
  onToggleAudio,
  stampsCount,
  onOpenPassport,
  completedChallengesCount,
  totalChallengesCount,
}) => {
  const currentChapter = chapters[currentChapterIndex];
  const progressPercent = Math.round(
    ((currentChapterIndex + 1) / chapters.length) * 100
  );

  const canPrev = currentChapterIndex > 0;
  const canNext = currentChapterIndex < chapters.length - 1;

  return (
    <aside aria-label="Passage Reading Bar" className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {/* Floating Minimalist Pill Bar */}
        <div className="bg-[#0B0C10]/90 backdrop-blur-xl border border-white/10 text-white rounded-full px-4 sm:px-6 py-3 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 sm:gap-6 transition-all duration-500">
          {/* Chapter Indicator & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-8 h-8 rounded-full bg-white/[0.04] text-[#E5A93C] font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-white/10">
              {currentChapter.chapterNumber}
            </span>

            <div className="min-w-0 hidden xs:block sm:block">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs sm:text-sm font-bold text-white truncate">
                  {currentChapter.title}
                </span>
                <span className="text-[10px] font-mono text-[#9CA3AF] hidden md:inline">
                  ({currentChapterIndex + 1} of {chapters.length})
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#9CA3AF] truncate hidden sm:block">
                {currentChapter.city}, {currentChapter.country}
              </p>
            </div>
          </div>

          {/* Micro Progress Track */}
          <div className="hidden lg:flex items-center gap-2 w-32 shrink-0">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E5A93C] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#9CA3AF]">
              {progressPercent}%
            </span>
          </div>

          {/* Center/Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio Ambiance Pill Button */}
            <button
              type="button"
              onClick={onToggleAudio}
              aria-label={isAudioPlaying ? 'Mute soundscape' : 'Play soundscape'}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                isAudioPlaying
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C] font-bold shadow-sm'
                  : 'bg-white/[0.03] text-[#9CA3AF] hover:text-white border-white/10 hover:bg-white/[0.08]'
              }`}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-black" />
                  <span className="hidden sm:inline">Acoustic On</span>
                  {/* Micro Equalizer Animation */}
                  <span className="flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-0.5 bg-black animate-[ping_1.2s_infinite] h-2" />
                    <span className="w-0.5 bg-black animate-[pulse_0.8s_infinite] h-3" />
                    <span className="w-0.5 bg-black animate-[ping_1s_infinite] h-1.5" />
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="hidden sm:inline">Sound Muted</span>
                </>
              )}
            </button>

            {/* Virtual Passport Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenPassport}
              className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-display font-semibold transition-all cursor-pointer flex items-center gap-2"
            >
              <Award className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span className="hidden xs:inline">Passport</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#E5A93C] text-black text-[10px] font-mono font-black">
                {stampsCount}
              </span>
            </button>

            {/* Chapter Steppers */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-2 sm:pl-3">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => onSelectChapter(currentChapterIndex - 1)}
                aria-label="Previous Chapter"
                className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed border border-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => onSelectChapter(currentChapterIndex + 1)}
                aria-label="Next Chapter"
                className="w-8 h-8 rounded-full bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-20 text-white flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed border border-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
