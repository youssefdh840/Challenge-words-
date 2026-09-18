import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { PassageQuizOption } from '../../types/passage';

/* -------------------------------------------------------------
 * 1. Category Tag Cloud & Filter Pills
 * ------------------------------------------------------------- */
interface CategoryTagPillsProps {
  categories: Array<{ id: string; label: string; count?: number }>;
  activeId: string;
  onSelect: (id: string) => void;
  variant?: 'subtle' | 'editorial' | 'bordered';
}

export const CategoryTagPills: React.FC<CategoryTagPillsProps> = ({
  categories,
  activeId,
  onSelect,
  variant = 'editorial',
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
      {categories.map((cat) => {
        const isActive = cat.id === activeId;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`group relative min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-display font-medium tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-2 select-none border ${
              isActive
                ? 'bg-white/[0.12] text-white border-white/30 shadow-md backdrop-blur-md ring-1 ring-white/30 scale-102 font-bold'
                : 'bg-white/[0.03] text-[#9CA3AF] hover:text-white hover:bg-white/[0.07] border-white/10 backdrop-blur-md'
            }`}
          >
            <span>{cat.label}</span>
            {typeof cat.count === 'number' && (
              <span
                className={`text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full border font-semibold ${
                  isActive
                    ? 'bg-white/10 text-[#E5A93C] border-white/25'
                    : 'bg-white/[0.04] text-[#9CA3AF] border-white/10 group-hover:bg-white/[0.08]'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. Cultural Tag Cloud Badges (Read-Only / Clickable Filter)
 * ------------------------------------------------------------- */
interface TagCloudBadgesProps {
  tags: string[];
  selectedTag?: string | null;
  onTagClick?: (tag: string) => void;
}

export const TagCloudBadges: React.FC<TagCloudBadgesProps> = ({
  tags,
  selectedTag,
  onTagClick,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        return (
          <span
            key={tag}
            onClick={() => onTagClick && onTagClick(tag)}
            className={`inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-[40px] px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-[13px] font-mono font-medium transition-all duration-200 border ${
              onTagClick ? 'cursor-pointer' : 'cursor-default'
            } ${
              isSelected
                ? 'bg-[#E5A93C] text-black border-[#E5A93C] shadow-sm font-bold'
                : 'bg-white/[0.03] backdrop-blur-md text-[#9CA3AF] hover:text-white hover:bg-white/[0.08] border-white/10'
            }`}
          >
            <span className="text-[#00F2FE] font-bold">#</span>
            <span>{tag}</span>
          </span>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------
 * 3. Editorial Quiz Option Pill Buttons
 * ------------------------------------------------------------- */
interface QuizOptionPillsProps {
  options: PassageQuizOption[];
  selectedOptionId: string | null;
  isAnswerSubmitted: boolean;
  onSelectOption: (optionId: string) => void;
}

export const QuizOptionPills: React.FC<QuizOptionPillsProps> = ({
  options,
  selectedOptionId,
  isAnswerSubmitted,
  onSelectOption,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
      {options.map((opt, index) => {
        const isSelected = selectedOptionId === opt.id;
        const letter = String.fromCharCode(65 + index); // A, B, C, D

        let buttonStyle = 'bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-md border-white/10 text-white';
        let badgeStyle = 'bg-white/[0.05] text-[#9CA3AF] border border-white/10';

        if (isAnswerSubmitted) {
          if (opt.isCorrect) {
            buttonStyle = 'bg-emerald-950/30 backdrop-blur-md border-emerald-500/50 text-white shadow-sm ring-1 ring-emerald-500/40';
            badgeStyle = 'bg-emerald-500 text-black font-bold border-transparent';
          } else if (isSelected && !opt.isCorrect) {
            buttonStyle = 'bg-rose-950/30 backdrop-blur-md border-rose-500/50 text-white ring-1 ring-rose-500/40';
            badgeStyle = 'bg-rose-500 text-white border-transparent';
          } else {
            buttonStyle = 'opacity-30 bg-white/[0.01] border-white/5 text-gray-500';
            badgeStyle = 'bg-white/[0.02] text-gray-500 border-white/5';
          }
        } else if (isSelected) {
          buttonStyle = 'bg-white/[0.08] backdrop-blur-md border-[#E5A93C]/70 text-white shadow-xl ring-1 ring-[#E5A93C]/60 scale-[1.01]';
          badgeStyle = 'bg-[#E5A93C] text-black font-black border-transparent';
        }

        return (
          <button
            key={opt.id}
            type="button"
            disabled={isAnswerSubmitted}
            onClick={() => onSelectOption(opt.id)}
            className={`group relative min-h-[48px] sm:min-h-[56px] p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 text-left flex items-start gap-3 sm:gap-3.5 cursor-pointer disabled:cursor-default ${buttonStyle}`}
          >
            {/* Pill Letter Badge */}
            <span
              className={`w-8 h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${badgeStyle}`}
            >
              {isAnswerSubmitted && opt.isCorrect ? <Check className="w-4 h-4 stroke-[2.5]" /> : letter}
            </span>

            {/* Content Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xs sm:text-sm md:text-base font-bold tracking-tight text-white block break-words">
                  {opt.label}
                </span>
                {isSelected && !isAnswerSubmitted && (
                  <Sparkles className="w-4 h-4 text-[#E5A93C] animate-pulse shrink-0" />
                )}
              </div>

              {opt.subtext && (
                <p
                  className={`text-[11px] sm:text-xs md:text-[13px] mt-1 sm:mt-1.5 leading-relaxed font-sans-clean break-words ${
                    isSelected && !isAnswerSubmitted
                      ? 'text-white/90'
                      : isAnswerSubmitted && opt.isCorrect
                      ? 'text-emerald-300 font-medium'
                      : 'text-[#9CA3AF]'
                  }`}
                >
                  {opt.subtext}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
