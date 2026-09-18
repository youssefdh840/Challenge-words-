import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Lock,
  RotateCw,
  Compass,
  MapPin,
  Sparkles,
  CheckCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { globalSoundEngine } from '../../services/GlobalSoundEngine';

export interface VirtualPassportStampData {
  id: string;
  chapterNumber: string;
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  city: string;
  coordinates: string;
  sealTitle: string;
  culturalMotto: string;
  inkHex: string;
  issuedDate?: string;
  symbolEmoji: string;
  isUnlocked: boolean;
  culturalFact?: string;
  unlockRequirement?: string;
}

export interface VirtualPassportViewProps {
  stamps: VirtualPassportStampData[];
  onSelectStamp?: (stamp: VirtualPassportStampData) => void;
  diplomatName?: string;
  newlyUnlockedStampId?: string | null;
  onClearNewlyUnlocked?: () => void;
}

export const VirtualPassportView: React.FC<VirtualPassportViewProps> = ({
  stamps,
  onSelectStamp,
  diplomatName = 'Cultural Envoy',
  newlyUnlockedStampId = null,
  onClearNewlyUnlocked,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [aspectRatioMode, setAspectRatioMode] = useState<'1:1' | '4:3'>('1:1');
  const [flippedStampIds, setFlippedStampIds] = useState<Record<string, boolean>>({});
  const [activeRevealStamp, setActiveRevealStamp] = useState<VirtualPassportStampData | null>(null);

  // Trigger celebration modal when a stamp is newly unlocked
  useEffect(() => {
    if (newlyUnlockedStampId) {
      const match = stamps.find((s) => s.id === newlyUnlockedStampId);
      if (match) {
        setActiveRevealStamp(match);
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#d97706', '#1c1917', '#10b981', '#f59e0b'],
          });
        } catch {
          // ignore if canvas-confetti context unavailable
        }
      }
    }
  }, [newlyUnlockedStampId, stamps]);

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedStampIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const unlockedCount = stamps.filter((s) => s.isUnlocked).length;
  const filteredStamps = stamps.filter((stamp) => {
    if (filterMode === 'unlocked') return stamp.isUnlocked;
    if (filterMode === 'locked') return !stamp.isUnlocked;
    return true;
  });

  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 text-white">
      {/* Header Section with Editorial Typography */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-white/10 mb-6 sm:mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 sm:w-6 h-px bg-[#E5A93C]" />
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#E5A93C] font-bold">
              Archival Registry
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Virtual Passport
          </h2>
          <p className="font-editorial text-xs sm:text-sm md:text-base text-[#9CA3AF] mt-1.5 sm:mt-2 italic max-w-xl">
            Official diplomatic entry seals issued upon deciphering world cultural heritage, customs, and living languages.
          </p>
        </div>

        {/* Diplomat Progress Card & Filter / Aspect Ratio Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Progress Capsule with Adequate Padding */}
          <div className="min-h-[44px] px-3.5 sm:px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/10 flex items-center gap-2.5 sm:gap-3 shadow-xs">
            <Award className="w-4 h-4 text-[#E5A93C] shrink-0" />
            <div className="text-[11px] sm:text-xs font-mono">
              <span className="text-[#9CA3AF]">Holder:</span>{' '}
              <span className="font-bold text-white truncate">{diplomatName}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="text-[11px] sm:text-xs font-mono font-bold text-white">
              <span className="text-[#E5A93C]">{unlockedCount}</span> / {stamps.length} Visas
            </div>
          </div>

          {/* Filter Pills with min-h-[44px] */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/10">
            {(['all', 'unlocked', 'locked'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  globalSoundEngine.playClick();
                  setFilterMode(mode);
                }}
                className={`min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-display font-semibold capitalize tracking-wide transition-all cursor-pointer ${
                  filterMode === mode
                    ? 'bg-white/[0.12] text-white border border-white/20 shadow-xs'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Aspect Ratio Mode Pill Toggle (1:1 Square vs 4:3 Aspect) */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/10">
            {(['1:1', '4:3'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => {
                  globalSoundEngine.playClick();
                  setAspectRatioMode(ratio);
                }}
                title={`Set Stamp Aspect Ratio to ${ratio}`}
                className={`min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  aspectRatioMode === ratio
                    ? 'bg-[#E5A93C]/20 text-[#E5A93C] border border-[#E5A93C]/50 shadow-xs'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Responsive Grid of Stamp Cards (grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6) */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredStamps.map((stamp, index) => {
            const isFlipped = !!flippedStampIds[stamp.id];
            const aspectClass = aspectRatioMode === '1:1' ? 'aspect-square' : 'aspect-[4/3]';

            return (
              <motion.div
                key={stamp.id}
                layout
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.03, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`perspective-1000 ${aspectClass} cursor-pointer w-full`}
                onClick={() => onSelectStamp && onSelectStamp(stamp)}
              >
                {/* 3D Flip Card Container with fixed aspect ratio */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 25 }}
                  className="relative w-full h-full transform-style-3d select-none"
                >
                  {/* ================= FRONT SIDE ================= */}
                  <div
                    className={`absolute inset-0 backface-hidden rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border flex flex-col justify-between transition-all duration-300 overflow-hidden ${
                      stamp.isUnlocked
                        ? 'bg-gradient-to-b from-[#E5A93C]/[0.08] via-white/[0.02] to-black/40 border-[#E5A93C]/40 hover:border-[#E5A93C] shadow-[0_0_20px_rgba(229,169,60,0.12)] hover:shadow-[0_0_30px_rgba(229,169,60,0.25)] text-white backdrop-blur-md'
                        : 'bg-[#060709] border-white/[0.06] hover:border-white/[0.12] text-stone-500 shadow-none'
                    }`}
                  >
                    {/* Stamp Header */}
                    <div className={`flex items-center justify-between pb-1.5 sm:pb-2 border-b ${stamp.isUnlocked ? 'border-white/10' : 'border-white/[0.04]'}`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`font-mono text-[10px] sm:text-xs font-bold shrink-0 ${stamp.isUnlocked ? 'text-[#E5A93C]' : 'text-stone-600'}`}>
                          {stamp.chapterNumber}
                        </span>
                        <span className="text-white/15 shrink-0">•</span>
                        <span className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider truncate ${stamp.isUnlocked ? 'text-[#FFE58F] font-semibold' : 'text-stone-500'}`}>
                          {stamp.countryCode} {stamp.flagEmoji}
                        </span>
                      </div>

                      <span className={`text-[9px] sm:text-[10px] font-mono flex items-center gap-1 shrink-0 ${stamp.isUnlocked ? 'text-[#00F2FE]' : 'text-stone-600'}`}>
                        <Compass className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${stamp.isUnlocked ? 'text-[#00F2FE]' : 'text-stone-700'}`} />
                        <span className="truncate max-w-[55px] sm:max-w-[70px]">{stamp.coordinates.split(',')[0]}</span>
                      </span>
                    </div>

                    {/* Center Seal Visual: Unlocked (Neon/Gold) vs Locked (Dark Silhouette) */}
                    <div className="my-auto text-center py-1 sm:py-1.5 flex items-center justify-center">
                      {stamp.isUnlocked ? (
                        <div className="inline-flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-full border border-[#E5A93C] relative group/seal transition-transform duration-300 hover:scale-105 bg-gradient-to-b from-[#E5A93C]/20 via-[#E5A93C]/5 to-transparent shadow-[0_0_18px_rgba(229,169,60,0.3)]">
                          <div className="absolute inset-0.5 rounded-full border border-[#FFE58F]/25 pointer-events-none" />
                          <span className="text-2xl sm:text-3xl md:text-4xl block leading-none mb-1 filter drop-shadow-[0_0_8px_rgba(229,169,60,0.6)]">
                            {stamp.symbolEmoji}
                          </span>
                          <span className="font-display text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-[#FFE58F] drop-shadow-[0_0_6px_rgba(229,169,60,0.4)] truncate max-w-[90px] sm:max-w-[110px]">
                            {stamp.city}
                          </span>
                          <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-wider text-[#00F2FE] font-bold mt-0.5 drop-shadow-[0_0_4px_rgba(0,242,254,0.5)] truncate max-w-[85px] sm:max-w-[105px]">
                            {stamp.countryName}
                          </span>
                        </div>
                      ) : (
                        /* Dark Silhouette with faint outer borders */
                        <div className="inline-flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-full border border-white/[0.07] bg-black/50 text-stone-500 relative overflow-hidden group shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                          <span className="text-2xl sm:text-3xl md:text-4xl block leading-none mb-1 opacity-15 filter grayscale brightness-50 select-none">
                            {stamp.symbolEmoji}
                          </span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 border border-white/[0.05] text-stone-500">
                            <Lock className="w-2.5 h-2.5 text-stone-600 stroke-[1.75]" />
                            <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest font-semibold text-stone-500">
                              Locked
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stamp Footer */}
                    <div className={`pt-1.5 sm:pt-2 border-t flex items-center justify-between gap-1.5 ${stamp.isUnlocked ? 'border-white/10' : 'border-white/[0.04]'}`}>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-display text-[10px] sm:text-xs font-bold truncate ${stamp.isUnlocked ? 'text-white' : 'text-stone-400'}`}>
                          {stamp.sealTitle}
                        </h4>
                        <p className={`font-editorial italic text-[8px] sm:text-[9px] truncate mt-0.5 ${stamp.isUnlocked ? 'text-[#FFE58F]/90' : 'text-stone-600'}`}>
                          {stamp.isUnlocked
                            ? `“${stamp.culturalMotto}”`
                            : stamp.unlockRequirement || 'Locked inquiry'}
                        </p>
                      </div>

                      {stamp.isUnlocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            globalSoundEngine.playHover();
                            toggleFlip(stamp.id, e);
                          }}
                          title="Flip for Archival Dossier"
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#E5A93C]/10 hover:bg-[#E5A93C]/25 text-[#E5A93C] flex items-center justify-center shrink-0 transition-all cursor-pointer border border-[#E5A93C]/50 shadow-[0_0_8px_rgba(229,169,60,0.2)]"
                        >
                          <RotateCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ================= BACK SIDE (REVEALED ARCHIVAL DOSSIER) ================= */}
                  <div
                    className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border border-[#E5A93C]/40 bg-[#07080B] text-white flex flex-col justify-between shadow-[0_0_24px_rgba(229,169,60,0.2)] backdrop-blur-md overflow-hidden"
                  >
                    <div>
                      {/* Back Header */}
                      <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-white/10">
                        <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-[#E5A93C] font-bold truncate">
                          Dispatch #{stamp.chapterNumber}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => toggleFlip(stamp.id, e)}
                          className="w-6 h-6 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#FFE58F] border border-[#E5A93C]/40 flex items-center justify-center cursor-pointer shadow-[0_0_6px_rgba(229,169,60,0.2)]"
                        >
                          <RotateCw className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Back Content with Line Clamping */}
                      <div className="mt-1.5 sm:mt-2">
                        <div className="flex items-center gap-1.5 text-[#00F2FE] text-[10px] sm:text-[11px] font-sans-clean mb-1 truncate">
                          <MapPin className="w-3 h-3 text-[#00F2FE] shrink-0" />
                          <span className="font-medium truncate">{stamp.city}, {stamp.countryName}</span>
                        </div>
                        <h4 className="font-display text-xs sm:text-sm font-bold text-white mb-1 truncate">
                          {stamp.sealTitle}
                        </h4>
                        <p className="font-editorial italic text-[9px] sm:text-[10px] text-[#9CA3AF] leading-snug line-clamp-3 sm:line-clamp-4">
                          {stamp.culturalFact ||
                            'Authentic cultural wisdom inscribed into the permanent ledger of world heritage.'}
                        </p>
                      </div>
                    </div>

                    {/* Back Footer */}
                    <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex items-center justify-between text-[8px] sm:text-[9px] font-mono text-[#9CA3AF]">
                      <span className="text-emerald-400 font-semibold truncate">Certified</span>
                      <span className="text-[#E5A93C] font-bold shrink-0">
                        {stamp.issuedDate || 'Visa'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ================= CELEBRATORY UNLOCK & REVEAL MODAL ANIMATION ================= */}
      <AnimatePresence>
        {activeRevealStamp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#050505] rounded-3xl p-8 border-2 border-[#E5A93C]/50 shadow-[0_0_60px_rgba(229,169,60,0.35)] text-center overflow-hidden text-white"
            >
              {/* Radial background glow */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[radial-gradient(circle,rgba(229,169,60,0.25)_0%,rgba(0,242,254,0.08)_40%,transparent_70%)] pointer-events-none blur-xl" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  globalSoundEngine.playClick();
                  setActiveRevealStamp(null);
                  if (onClearNewlyUnlocked) onClearNewlyUnlocked();
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/10 flex items-center justify-center cursor-pointer transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Tag Header */}
              <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
                <Sparkles className="w-4 h-4 text-[#E5A93C] drop-shadow-[0_0_8px_#E5A93C]" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#FFE58F] font-bold drop-shadow-[0_0_8px_rgba(229,169,60,0.4)]">
                  Match Conquered • Visa Unlocked
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1 relative z-10 drop-shadow-[0_0_12px_rgba(229,169,60,0.4)]">
                {activeRevealStamp.city}, {activeRevealStamp.countryName}
              </h3>

              <p className="font-editorial italic text-[#FFE58F]/90 text-sm mb-6 relative z-10">
                “{activeRevealStamp.culturalMotto}”
              </p>

              {/* Physical Stamp Impact Animation with Bright Neon / Gold Accents */}
              <div className="relative my-6 flex items-center justify-center z-10">
                {/* Expanding Shockwave Ring 1 (Gold) */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="absolute w-36 h-36 rounded-full border-4 border-[#E5A93C] shadow-[0_0_30px_#E5A93C] pointer-events-none"
                />

                {/* Expanding Shockwave Ring 2 (Neon Cyan) */}
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.8 }}
                  animate={{ scale: 3.0, opacity: 0 }}
                  transition={{ duration: 1.05, ease: 'easeOut', delay: 0.08 }}
                  className="absolute w-36 h-36 rounded-full border-2 border-[#00F2FE] shadow-[0_0_30px_#00F2FE] pointer-events-none"
                />

                {/* The Inked Stamp Dropping Down with High-Velocity Impact */}
                <motion.div
                  initial={{ scale: 3.2, rotate: -18, opacity: 0 }}
                  animate={{ scale: [3.2, 0.92, 1], rotate: [-18, 4, 0], opacity: 1 }}
                  transition={{ duration: 0.65, times: [0, 0.75, 1], ease: [0.16, 1, 0.3, 1] }}
                  className="w-36 h-36 rounded-full border-4 border-[#E5A93C] bg-gradient-to-b from-[#E5A93C]/25 via-[#0A0B0E] to-[#050505] flex flex-col items-center justify-center shadow-[0_0_45px_rgba(229,169,60,0.65),inset_0_0_20px_rgba(229,169,60,0.25)] relative"
                >
                  <span className="text-4xl block mb-1 filter drop-shadow-[0_0_14px_rgba(229,169,60,0.8)]">
                    {activeRevealStamp.symbolEmoji}
                  </span>
                  <span className="font-display text-xs font-black tracking-widest uppercase text-[#FFE58F] drop-shadow-[0_0_8px_#E5A93C]">
                    {activeRevealStamp.city}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#00F2FE] font-bold drop-shadow-[0_0_6px_#00F2FE]">
                    {activeRevealStamp.countryCode} {activeRevealStamp.flagEmoji}
                  </span>
                </motion.div>
              </div>

              {/* Cultural Revelation Card */}
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left relative z-10">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_#34D399]" />
                  <span>Archival Cultural Record</span>
                </div>
                <p className="font-editorial text-xs sm:text-sm text-[#9CA3AF] italic leading-relaxed">
                  {activeRevealStamp.culturalFact}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 flex justify-center relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRevealStamp(null);
                    if (onClearNewlyUnlocked) onClearNewlyUnlocked();
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E5A93C] via-[#FFD272] to-[#E5A93C] hover:brightness-110 text-black border border-white/20 font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_25px_rgba(229,169,60,0.5)] hover:shadow-[0_0_35px_rgba(229,169,60,0.7)] transition-all"
                >
                  Inscribe into Virtual Passport
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
