import React, { useState } from 'react';
import { Volume2, VolumeX, Compass, MapPin, Sparkles } from 'lucide-react';
import { PassageChapter } from '../../types/passage';

interface PassageHeroProps {
  chapter: PassageChapter;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  onExploreClick?: () => void;
}

export const PassageHero: React.FC<PassageHeroProps> = ({
  chapter,
  isAudioPlaying,
  onToggleAudio,
  onExploreClick,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12 transition-all duration-700">
      {/* Top Editorial Eyebrow & Index */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-200/80 mb-8">
        <div className="flex items-center gap-3">
          <span className="font-display font-extrabold text-xs uppercase tracking-[0.2em] text-stone-900 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
            Passage • Issue N° {chapter.chapterNumber}
          </span>
          <span className="text-xs text-stone-400 font-serif-editorial italic hidden sm:inline">
            A Cultural Journey Across the Continents
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-stone-500">
          <span className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            {chapter.coordinates}
          </span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1 font-sans-clean font-medium text-stone-700">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            {chapter.city}, {chapter.country}
          </span>
        </div>
      </div>

      {/* Main Editorial Headline */}
      <div className="max-w-4xl mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="w-6 h-px bg-amber-600"></span>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-800 font-bold">
            Chapter {chapter.chapterNumber}
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold text-stone-900 tracking-tight leading-[1.05] mb-4">
          {chapter.title}
        </h1>
        <p className="font-editorial text-xl sm:text-2xl text-stone-600 font-normal leading-relaxed max-w-2xl italic">
          {chapter.subtitle}
        </p>
      </div>

      {/* Full-Width Cinematic Photo Card */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-stone-200/90 bg-stone-900 group aspect-[16/9] sm:aspect-[21/9] max-h-[580px]">
        {/* Cinematic Image with Smooth Ken-Burns Motion */}
        <img
          src={chapter.heroImageUrl}
          alt={chapter.title}
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-all duration-1000 ease-out ${
            imageLoaded ? 'opacity-95' : 'opacity-0'
          }`}
        />

        {/* Sophisticated Vignette & Soft Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-stone-950/10 pointer-events-none" />

        {/* Card Header Badges */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between gap-2 pointer-events-auto">
          <span className="px-3.5 py-1.5 rounded-full bg-stone-900/65 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {chapter.atmosphereTag}
          </span>

          {/* Soundscape Trigger Button */}
          <button
            type="button"
            onClick={onToggleAudio}
            aria-label="Toggle Atmosphere Acoustic Motif"
            className={`px-4 py-2 rounded-full text-xs font-display font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2 backdrop-blur-md shadow-lg border ${
              isAudioPlaying
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-amber-500/30'
                : 'bg-stone-900/70 text-white border-white/20 hover:bg-stone-900/90'
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Playing Ambiance</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-300" />
                <span>Listen Ambiance</span>
              </>
            )}
          </button>
        </div>

        {/* Bottom Card Narrative Overlay */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-auto">
          <div className="max-w-xl text-white">
            <p className="text-xs font-mono uppercase tracking-widest text-amber-300/90 mb-1">
              Photographic Expedition Log
            </p>
            <p className="text-xs sm:text-sm text-stone-200/90 font-sans-clean line-clamp-2 leading-relaxed">
              {chapter.photoCredit}
            </p>
          </div>

          {onExploreClick && (
            <button
              type="button"
              onClick={onExploreClick}
              className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Begin Chapter</span>
            </button>
          )}
        </div>
      </div>

      {/* Literary Introduction & Author Quote */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10 items-start">
        <div className="md:col-span-7 space-y-4">
          <p className="font-editorial text-lg sm:text-xl text-stone-800 leading-relaxed first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-stone-950 first-letter:leading-none">
            {chapter.storyIntroduction}
          </p>
        </div>

        <div className="md:col-span-5 p-6 rounded-2xl bg-stone-100/90 border border-stone-200/80 shadow-sm relative">
          <span className="font-editorial text-4xl text-amber-600/40 absolute -top-2 left-4 font-serif select-none">
            “
          </span>
          <blockquote className="pt-2">
            <p className="font-editorial italic text-sm sm:text-base text-stone-700 leading-relaxed">
              {chapter.quote.text}
            </p>
            <footer className="mt-3 text-xs font-mono text-stone-500 uppercase tracking-wider">
              — {chapter.quote.author}
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};
