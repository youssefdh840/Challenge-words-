import React, { useState } from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface WorldMapProps {
  targetCountryCode?: string;
  onCountrySelect: (countryCode: string) => void;
  interactive?: boolean;
  selectedCountryCode?: string | null;
  lastFeedback?: {
    isCorrect: boolean;
    clickedCode: string;
  } | null;
}

interface MapRegion {
  code: string;
  name: string;
  flag: string;
  continent: string;
  x: number; // 0-100%
  y: number; // 0-100%
  path?: string;
}

export const MAP_REGIONS: MapRegion[] = [
  // North America
  { code: 'CA', name: 'Canada', flag: '🇨🇦', continent: 'North America', x: 23, y: 22 },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', continent: 'North America', x: 19, y: 48 },
  // South America
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', continent: 'South America', x: 34, y: 64 },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', continent: 'South America', x: 31, y: 82 },
  // Europe
  { code: 'FR', name: 'France', flag: '🇫🇷', continent: 'Europe', x: 48.8, y: 34.5 },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', continent: 'Europe', x: 51.5, y: 31.0 },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', continent: 'Europe', x: 52.8, y: 37.0 },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', continent: 'Europe', x: 55.4, y: 40.5 },
  // Africa
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳', continent: 'Africa', x: 51.2, y: 38.8 },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', continent: 'Africa', x: 46.8, y: 41.2 },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', continent: 'Africa', x: 56.5, y: 43.0 },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳', continent: 'Africa', x: 43.5, y: 53.0 },
  // Asia
  { code: 'IN', name: 'India', flag: '🇮🇳', continent: 'Asia', x: 69.5, y: 49.0 },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asia', x: 86.5, y: 38.2 },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', continent: 'Asia', x: 83.2, y: 39.5 },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '🇦🇺', continent: 'Oceania', x: 86.0, y: 74.0 },
];

export const WorldMap: React.FC<WorldMapProps> = ({
  targetCountryCode,
  onCountrySelect,
  interactive = true,
  selectedCountryCode,
  lastFeedback,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null);

  return (
    <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner select-none">
      {/* Subtle Latitude / Longitude grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Equator & Prime Meridian */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      {/* Stylized Continent Background Silhouettes */}
      <svg
        viewBox="0 0 1000 500"
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#1e293b" stroke="#334155" strokeWidth="1.5">
          {/* North America */}
          <path d="M 120 70 Q 200 40 280 60 Q 310 120 280 180 Q 220 220 180 260 Q 150 240 130 180 Z" />
          {/* Greenland */}
          <path d="M 330 40 Q 370 30 390 60 Q 370 90 330 80 Z" />
          {/* South America */}
          <path d="M 280 270 Q 380 290 370 370 Q 340 440 310 470 Q 270 390 280 270 Z" />
          {/* Europe */}
          <path d="M 460 120 Q 560 100 570 170 Q 530 220 460 210 Q 440 160 460 120 Z" />
          {/* Africa */}
          <path d="M 460 210 Q 580 200 580 300 Q 550 400 500 420 Q 420 320 460 210 Z" />
          {/* Asia mainland */}
          <path d="M 570 110 Q 820 90 850 190 Q 820 280 690 270 Q 600 250 570 110 Z" />
          {/* India subcontinent */}
          <path d="M 660 240 Q 720 240 700 310 Q 670 300 660 240 Z" />
          {/* Japan archipelago */}
          <path d="M 855 170 Q 875 185 865 220 Q 855 205 855 170 Z" />
          {/* Australia */}
          <path d="M 790 330 Q 900 320 910 390 Q 850 440 780 400 Z" />
        </g>
      </svg>

      {/* Target prompt badge if target exists */}
      {targetCountryCode && (
        <div className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs text-cyan-200 flex items-center gap-2 shadow-lg z-20">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Click on the requested country pin on the map</span>
        </div>
      )}

      {/* Interactive Pin Drops / Country Markers */}
      {MAP_REGIONS.map((region) => {
        const isTarget = targetCountryCode === region.code;
        const isSelected = selectedCountryCode === region.code;
        const feedbackForThis = lastFeedback && lastFeedback.clickedCode === region.code;
        const isCorrectFeedback = feedbackForThis && lastFeedback.isCorrect;
        const isWrongFeedback = feedbackForThis && !lastFeedback.isCorrect;

        return (
          <div
            key={region.code}
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.95 }}
              disabled={!interactive}
              onClick={() => interactive && onCountrySelect(region.code)}
              onMouseEnter={() => setHoveredRegion(region)}
              onMouseLeave={() => setHoveredRegion(null)}
              className={`group relative flex items-center justify-center transition-all p-1 rounded-full cursor-pointer focus:outline-none ${
                isTarget
                  ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-bounce'
                  : ''
              }`}
            >
              {/* Pulsing Radar Ring for Target */}
              {isTarget && (
                <span className="absolute -inset-2 rounded-full bg-amber-400/30 animate-ping" />
              )}

              {/* Pin Center Circle */}
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-md border transition-all ${
                  isCorrectFeedback
                    ? 'bg-emerald-500 border-emerald-300 text-white ring-4 ring-emerald-400/40'
                    : isWrongFeedback
                    ? 'bg-rose-500 border-rose-300 text-white ring-4 ring-rose-400/40'
                    : isSelected
                    ? 'bg-cyan-500 border-cyan-300 text-white'
                    : 'bg-slate-800/90 border-slate-600 text-slate-200 hover:bg-cyan-600 hover:border-cyan-400'
                }`}
              >
                {isCorrectFeedback ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isWrongFeedback ? (
                  <XCircle className="w-4 h-4 text-white" />
                ) : (
                  <span>{region.flag}</span>
                )}
              </div>

              {/* Tooltip on hover or when target */}
              {(hoveredRegion?.code === region.code || isTarget) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-1 px-2.5 py-1 rounded bg-slate-950/95 border border-slate-600 text-slate-100 text-[11px] font-medium whitespace-nowrap shadow-xl pointer-events-none z-30 flex items-center gap-1.5"
                >
                  <span>{region.flag}</span>
                  <span>{region.name}</span>
                </motion.div>
              )}
            </motion.button>
          </div>
        );
      })}

      {/* Map Legend */}
      <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] text-slate-400 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800 pointer-events-none">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-cyan-400" />
          <span>Geographic Target Hitbox</span>
        </div>
      </div>
    </div>
  );
};
