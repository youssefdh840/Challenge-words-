import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, MapPin, Volume2, VolumeX, Sparkles, ArrowDown } from 'lucide-react';

export interface EditorialHeroCardProps {
  chapterNumber: string; // e.g. "I", "01"
  title?: string;
  subtitle?: string;
  city: string;
  country: string;
  coordinates: string;
  imageUrl: string;
  photoCredit?: string;
  tags?: string[];
  atmosphere?: string;
  isAudioActive?: boolean;
  onToggleAudio?: () => void;
  onCtaClick?: () => void;
  ctaText?: string;
}

export const EditorialHeroCard: React.FC<EditorialHeroCardProps> = ({
  chapterNumber,
  title,
  subtitle,
  city,
  country,
  coordinates,
  imageUrl,
  photoCredit,
  tags = ['Japan', 'Untranslatable', 'LivingHeritage'],
  atmosphere,
  isAudioActive = false,
  onToggleAudio,
  onCtaClick,
  ctaText = 'Begin Chapter Inquiry',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute prominent title format: e.g. "TOKYO: CHAPTER I"
  const formattedTitle = title || `${city.toUpperCase()}: CHAPTER ${chapterNumber.toUpperCase()}`;

  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-6 sm:pb-8"
    >
      {/* Editorial Meta Topbar with Auto-Wrap */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-white/10 mb-5 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="font-display font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-white bg-white/[0.03] backdrop-blur-md px-3 sm:px-3.5 py-1.5 rounded-full border border-white/10 shadow-xs">
            Passage • Issue {chapterNumber}
          </span>
          <span className="text-xs text-[#9CA3AF] font-editorial italic hidden sm:inline">
            A Cultural Journey & Interactive Expedition
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono text-[#9CA3AF]">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
            <span className="truncate">{coordinates}</span>
          </span>
          <span className="text-white/20 hidden xs:inline">•</span>
          <span className="flex items-center gap-1.5 text-white font-sans-clean font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="truncate">{city}, {country}</span>
          </span>
        </div>
      </div>

      {/* Main Editorial Header Typography with Fluid Scaling */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 sm:w-6 h-px bg-[#E5A93C]" />
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#E5A93C] font-bold">
            Chapter {chapterNumber} Dispatch
          </span>
        </div>
        
        {/* Large Bold Typography with Fluid Scaling */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] break-words">
          {formattedTitle}
        </h1>

        {subtitle && (
          <p className="font-editorial text-sm sm:text-lg md:text-xl text-[#9CA3AF] font-normal leading-relaxed max-w-2xl mt-2 sm:mt-3 italic break-words">
            {subtitle}
          </p>
        )}
      </div>

      {/* Full-Width Cinematic Responsive Aspect Ratio Container */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-[#0B0C10] group aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[50dvh] sm:max-h-[560px]">
        <motion.img
          src={imageUrl}
          alt={formattedTitle}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          initial={{ scale: 1.08 }}
          animate={{ scale: isLoaded ? 1 : 1.08 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out ${
            isLoaded ? 'opacity-85' : 'opacity-0'
          }`}
        />

        {/* Subtle Vignette & Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10]/95 via-[#0B0C10]/40 to-[#0B0C10]/15 pointer-events-none" />

        {/* Card Header Pills: Atmosphere & Audio Soundscape Toggle with min-h-[44px] */}
        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-wrap items-center justify-between gap-2.5 pointer-events-auto">
          {atmosphere ? (
            <span className="px-3 sm:px-3.5 py-1.5 min-h-[36px] sm:min-h-[40px] rounded-full bg-black/60 sm:bg-white/[0.03] backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-mono font-medium flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C] animate-pulse" />
              <span className="truncate">{atmosphere}</span>
            </span>
          ) : (
            <div />
          )}

          {onToggleAudio && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onToggleAudio}
              className={`min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-4 py-2.5 rounded-full text-xs sm:text-sm font-display font-semibold tracking-wide backdrop-blur-md shadow-lg border transition-all cursor-pointer flex items-center gap-2 ${
                isAudioActive
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C] shadow-[#E5A93C]/20 font-bold'
                  : 'bg-black/60 sm:bg-white/[0.03] text-[#9CA3AF] hover:text-white border-white/10 hover:bg-white/[0.08]'
              }`}
            >
              {isAudioActive ? (
                <>
                  <Volume2 className="w-4 h-4 text-black shrink-0" />
                  <span className="truncate">Acoustic Atmosphere Active</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#00F2FE] shrink-0" />
                  <span className="truncate">Hear Soundscape</span>
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Card Footer: Metadata Badges (Pills) & Interactive CTA with Generous Touch Targets */}
        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 pointer-events-auto">
          <div className="max-w-xl text-white">
            {photoCredit && (
              <p className="text-[10px] sm:text-[11px] font-mono text-[#9CA3AF] mb-1.5 sm:mb-2.5 truncate">
                {photoCredit}
              </p>
            )}

            {/* Metadata Badges Auto-Wrapping Pill Group */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {tags.map((tag) => {
                const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                return (
                  <motion.span
                    key={tag}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="min-h-[32px] sm:min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium bg-black/60 sm:bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 text-white tracking-wide transition-colors cursor-default shadow-xs flex items-center"
                  >
                    {cleanTag}
                  </motion.span>
                );
              })}
            </div>
          </div>

          {onCtaClick && (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onCtaClick}
              className="w-full sm:w-auto min-h-[48px] px-5 sm:px-6 py-3 rounded-full bg-white text-black hover:bg-white/90 border border-white/10 font-display text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-xl cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
              <span>{ctaText}</span>
              <ArrowDown className="w-3.5 h-3.5 text-stone-500" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
