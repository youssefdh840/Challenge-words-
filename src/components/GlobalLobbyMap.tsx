import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  Radio,
  Wifi,
  Globe2,
  RefreshCw,
  Navigation,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLocation, LobbyPeerLocation, UserProfile, ActiveMatch } from '../types';
import { GLOBAL_LOBBY_PEERS } from '../data/activePeers';
import {
  locationService,
  calculateHaversineDistanceKm,
  estimatePingMs,
  WORLD_CITIES_REGISTRY,
} from '../services/locationService';
import { globalSoundEngine } from '../services/GlobalSoundEngine';

interface GlobalLobbyMapProps {
  user: UserProfile;
  activeMatch?: ActiveMatch | null;
  onLocationUpdated?: (loc: UserLocation) => void;
  className?: string;
  isSearching?: boolean;
}

/**
 * Converts Geographic Coordinates (Lat, Lon) to SVG Percentage Coordinates (0-100%)
 * Uses standard Equirectangular (Plate Carrée) projection
 */
function coordsToPercent(lat: number, lon: number): { x: number; y: number } {
  // Clamped longitude: -180 to +180 -> 0 to 100%
  const x = ((lon + 180) / 360) * 100;
  // Clamped latitude: +90 to -90 -> 0 to 100%
  // Mild Mercator scale compression near extreme poles for visual balance
  const clampedLat = Math.max(-80, Math.min(84, lat));
  const y = ((90 - clampedLat) / 180) * 100;
  return {
    x: Math.max(2, Math.min(98, x)),
    y: Math.max(4, Math.min(96, y)),
  };
}

export const GlobalLobbyMap: React.FC<GlobalLobbyMapProps> = ({
  user,
  activeMatch,
  onLocationUpdated,
  className = '',
  isSearching = false,
}) => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() =>
    user.location || locationService.getLocation()
  );
  const [activePeers, setActivePeers] = useState<LobbyPeerLocation[]>(GLOBAL_LOBBY_PEERS);
  const [selectedPeer, setSelectedPeer] = useState<LobbyPeerLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showManualPicker, setShowManualPicker] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Sync with location service
  useEffect(() => {
    const unsub = locationService.subscribe((loc) => {
      setCurrentLocation(loc);
      if (onLocationUpdated) onLocationUpdated(loc);
    });
    return unsub;
  }, [onLocationUpdated]);

  // Periodic active peer ping simulation for lively radar feel
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePeers((prev) =>
        prev.map((p) => ({
          ...p,
          lastPingMs: Math.max(
            18,
            Math.round((p.lastPingMs || 50) + (Math.random() * 8 - 4))
          ),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLocateGPS = async () => {
    globalSoundEngine.playClick();
    setIsLocating(true);
    try {
      const loc = await locationService.captureLocation();
      setCurrentLocation(loc);
      if (onLocationUpdated) onLocationUpdated(loc);
      globalSoundEngine.playCorrect();
    } catch {
      // noop
    } finally {
      setIsLocating(false);
    }
  };

  const handleSelectManualCity = (countryCode: string) => {
    globalSoundEngine.playClick();
    const loc = locationService.setManualLocation(countryCode);
    setCurrentLocation(loc);
    if (onLocationUpdated) onLocationUpdated(loc);
    setShowManualPicker(false);
  };

  // Convert player 1 location
  const userPos = coordsToPercent(currentLocation.latitude, currentLocation.longitude);

  // Compute opponent location for connection arc
  let opponentPos: { x: number; y: number } | null = null;
  let opponentData: {
    city: string;
    country: string;
    flag: string;
    distanceKm: number;
    pingMs: number;
    isCrossBorder: boolean;
  } | null = null;

  if (activeMatch && activeMatch.player2) {
    const p2 = activeMatch.player2;
    // Look up opponent coordinates from active peers or registry
    const foundPeer = activePeers.find((p) => p.countryCode === p2.countryCode);
    const foundCity = WORLD_CITIES_REGISTRY.find((c) => c.countryCode === p2.countryCode);
    const oppLat = foundPeer?.latitude ?? foundCity?.latitude ?? 35.6762;
    const oppLon = foundPeer?.longitude ?? foundCity?.longitude ?? 139.6503;

    opponentPos = coordsToPercent(oppLat, oppLon);
    const dist = calculateHaversineDistanceKm(
      currentLocation.latitude,
      currentLocation.longitude,
      oppLat,
      oppLon
    );
    opponentData = {
      city: foundPeer?.city || foundCity?.city || p2.countryName,
      country: p2.countryName,
      flag: p2.countryFlag,
      distanceKm: dist,
      pingMs: estimatePingMs(dist),
      isCrossBorder: p2.countryCode !== currentLocation.countryCode,
    };
  }

  // Calculate Great Circle curve path for SVG
  const calculateArcPath = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ): { path: string; midX: number; midY: number } => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Compute midpoint
    const midX = (from.x + to.x) / 2;
    // Arc height bows upward (negative Y in SVG) proportionally to distance
    const arcHeight = Math.min(28, Math.max(12, dist * 0.38));
    const midY = (from.y + to.y) / 2 - arcHeight;

    return {
      path: `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`,
      midX,
      midY,
    };
  };

  const connectionArc = opponentPos ? calculateArcPath(userPos, opponentPos) : null;

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#050505] border border-white/10 text-white overflow-hidden shadow-2xl ${className}`}
    >
      {/* ================= TOP TELEMETRY & LOCATION OVERRIDE BAR ================= */}
      <div className="p-4 sm:p-5 bg-[#050505] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Current Node Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2FE] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00F2FE] shadow-[0_0_10px_#00F2FE]" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">{currentLocation.flagEmoji}</span>
              <span className="font-display text-sm font-bold text-white tracking-wide">
                {currentLocation.city}, {currentLocation.countryName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-white/[0.05] text-[#9CA3AF] border border-white/10">
                {currentLocation.captureMethod === 'gps'
                  ? 'GPS Locked'
                  : currentLocation.captureMethod === 'ip_fallback'
                  ? 'IP Geolocation'
                  : 'Manual Override'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#9CA3AF] mt-0.5 flex items-center gap-2">
              <span>
                {Math.abs(currentLocation.latitude).toFixed(2)}°{' '}
                {currentLocation.latitude >= 0 ? 'N' : 'S'},{' '}
                {Math.abs(currentLocation.longitude).toFixed(2)}°{' '}
                {currentLocation.longitude >= 0 ? 'E' : 'W'}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[#00F2FE] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] shadow-[0_0_6px_#00F2FE]" />
                {activePeers.length} International Nodes Online
              </span>
            </p>
          </div>
        </div>

        {/* Location Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={handleLocateGPS}
            disabled={isLocating}
            title="Scan GPS Geolocation"
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-[#E5A93C]' : 'text-[#00F2FE]'}`} />
            <span className="hidden sm:inline">Re-Scan GPS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              globalSoundEngine.playClick();
              setShowManualPicker((v) => !v);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Change Origin</span>
            <ChevronDown className="w-3 h-3 text-[#9CA3AF]" />
          </button>
        </div>
      </div>

      {/* ================= MANUAL CITY SELECTOR DROPDOWN ================= */}
      <AnimatePresence>
        {showManualPicker && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#050505] border-b border-white/10 px-4 py-3 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E5A93C]">
                Diplomatic Origin Fallback Registry:
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter country or city..."
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E5A93C]"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-44 overflow-y-auto pr-1">
              {WORLD_CITIES_REGISTRY.filter(
                (c) =>
                  c.countryName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                  c.city.toLowerCase().includes(searchFilter.toLowerCase())
              ).map((city) => {
                const isSelected = currentLocation.countryCode === city.countryCode;
                return (
                  <button
                    key={city.countryCode}
                    type="button"
                    onClick={() => handleSelectManualCity(city.countryCode)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#E5A93C]/10 border-[#E5A93C] text-white ring-1 ring-[#E5A93C] shadow-[0_0_12px_rgba(229,169,60,0.25)]'
                        : 'bg-white/[0.02] border-white/10 text-[#9CA3AF] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{city.flag}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{city.city}</div>
                      <div className="text-[10px] font-mono text-[#9CA3AF] truncate">
                        {city.countryName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= INTERACTIVE RADAR WORLD MAP STAGE ================= */}
      <div className="relative w-full aspect-[2/1] min-h-[340px] sm:min-h-[420px] bg-[#050505] overflow-hidden select-none">
        {/* Subtle Latitude & Longitude Coordinate Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="geo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00F2FE" strokeWidth="0.3" opacity="0.3" />
            </pattern>
            {/* Cyan Glow Filter */}
            <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Amber Glow Filter */}
            <filter id="amber-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo-grid)" />
          {/* Equator */}
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="#00F2FE"
            strokeWidth="0.6"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          {/* Prime Meridian */}
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="#00F2FE"
            strokeWidth="0.6"
            strokeDasharray="4 4"
            opacity="0.4"
          />
        </svg>

        {/* Continental Silhouette Vectors (Equirectangular Map Contours) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="#0D0E12" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.4">
            {/* North America */}
            <path d="M 12 14 Q 22 8 30 12 Q 33 24 28 36 Q 22 44 18 52 Q 15 48 13 36 Z" />
            {/* Greenland */}
            <path d="M 33 8 Q 38 6 41 12 Q 38 18 33 16 Z" />
            {/* South America */}
            <path d="M 28 54 Q 38 58 37 74 Q 34 88 31 94 Q 27 78 28 54 Z" />
            {/* Europe */}
            <path d="M 46 24 Q 56 20 57 34 Q 53 44 46 42 Q 44 32 46 24 Z" />
            {/* Africa */}
            <path d="M 46 42 Q 58 40 58 60 Q 55 80 50 84 Q 42 64 46 42 Z" />
            {/* Asia mainland */}
            <path d="M 57 22 Q 82 18 85 38 Q 82 56 69 54 Q 60 50 57 22 Z" />
            {/* India */}
            <path d="M 66 48 Q 72 48 70 62 Q 67 60 66 48 Z" />
            {/* Japan */}
            <path d="M 85 34 Q 87 37 86 44 Q 85 41 85 34 Z" />
            {/* Australia */}
            <path d="M 79 66 Q 90 64 91 78 Q 85 88 78 80 Z" />
          </g>

          {/* ================= ANIMATED MATCH ARC (CONNECTING USER A & USER B) ================= */}
          {connectionArc && (
            <g>
              {/* Broad Ambient Amber Glow Arc */}
              <path
                d={connectionArc.path}
                fill="none"
                stroke="#E5A93C"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.25"
                filter="url(#amber-glow)"
              />
              {/* Focused Radiant Glow Path */}
              <path
                d={connectionArc.path}
                fill="none"
                stroke="#E5A93C"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.75"
                filter="url(#amber-glow)"
              />
              {/* Core Dashed Flight Path */}
              <path
                d={connectionArc.path}
                fill="none"
                stroke="#FFF2C6"
                strokeWidth="0.9"
                strokeDasharray="3 3"
                strokeLinecap="round"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="100"
                  to="0"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </path>

              {/* Dynamic Traveling Pulsing Wave Particle with Cyan Neon Glow */}
              <circle r="2.2" fill="#00F2FE" filter="url(#cyan-glow)">
                <animateMotion
                  path={connectionArc.path}
                  dur="2.2s"
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </circle>
            </g>
          )}
        </svg>

        {/* ================= ACTIVE PEERS PINS (AROUND THE GLOBE) ================= */}
        {activePeers.map((peer) => {
          const pos = coordsToPercent(peer.latitude, peer.longitude);
          const isOpponent =
            activeMatch && activeMatch.player2 && activeMatch.player2.countryCode === peer.countryCode;

          return (
            <div
              key={peer.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
            >
              {/* Pulsing Aura & Glowing Dot */}
              <button
                type="button"
                onClick={() => {
                  globalSoundEngine.playHover();
                  setSelectedPeer(peer);
                }}
                className={`relative flex items-center justify-center p-1.5 rounded-full cursor-pointer transition-transform hover:scale-135 focus:outline-none ${
                  isOpponent ? 'scale-125' : ''
                }`}
              >
                <span
                  className={`absolute w-6 h-6 rounded-full animate-ping opacity-60 ${
                    isOpponent
                      ? 'bg-[#E5A93C] shadow-[0_0_14px_#E5A93C]'
                      : 'bg-[#00F2FE] shadow-[0_0_14px_#00F2FE]'
                  }`}
                />
                {/* Radial Glow Halo */}
                <span
                  className={`absolute w-4 h-4 rounded-full blur-[2px] opacity-80 ${
                    isOpponent ? 'bg-[#E5A93C]' : 'bg-[#00F2FE]'
                  }`}
                />
                {/* Core Neon Dot */}
                <span
                  className={`relative w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[7px] font-black ${
                    isOpponent
                      ? 'bg-[#E5A93C] text-black shadow-[0_0_12px_#E5A93C]'
                      : 'bg-[#00F2FE] text-black shadow-[0_0_12px_#00F2FE]'
                  }`}
                >
                  •
                </span>
              </button>

              {/* Subtle hover city tag */}
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center z-30">
                <div className="px-2.5 py-1 rounded-xl bg-black/95 border border-white/10 text-[10px] font-mono whitespace-nowrap shadow-2xl flex items-center gap-1.5 text-white backdrop-blur-md">
                  <span>{peer.countryFlag}</span>
                  <span className="font-bold">{peer.city}</span>
                  <span className="text-[#00F2FE]">~{peer.lastPingMs}ms</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* ================= USER'S CURRENT LOCATION PIN (HOST DIPLOMAT) ================= */}
        <div
          style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
        >
          {/* Concentric Sonar Waves */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-14 h-14 rounded-full border border-[#00F2FE]/50 shadow-[0_0_20px_rgba(0,242,254,0.3)] animate-ping" />
            <span className="absolute w-8 h-8 rounded-full bg-[#00F2FE]/20 border border-[#00F2FE]/70 shadow-[0_0_14px_rgba(0,242,254,0.4)]" />

            {/* Core Pin Anchor */}
            <div className="w-5 h-5 rounded-full bg-[#00F2FE] border-2 border-white text-black flex items-center justify-center shadow-[0_0_18px_#00F2FE] relative">
              <span className="w-2 h-2 rounded-full bg-black" />
            </div>

            {/* Permanent Identity Tag */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap flex flex-col items-center">
              <div className="px-2.5 py-1 rounded-lg bg-black/95 border border-[#00F2FE]/60 text-[#00F2FE] text-[11px] font-mono font-bold shadow-[0_0_14px_rgba(0,242,254,0.3)] flex items-center gap-1.5 backdrop-blur-md">
                <span>{currentLocation.flagEmoji}</span>
                <span>YOU ({currentLocation.city})</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= OPPONENT ACTIVE PIN (WHEN MATCHED) ================= */}
        {opponentPos && opponentData && (
          <div
            style={{ left: `${opponentPos.x}%`, top: `${opponentPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-14 h-14 rounded-full border border-[#E5A93C]/60 shadow-[0_0_22px_rgba(229,169,60,0.4)] animate-ping" />
              <div className="w-5 h-5 rounded-full bg-[#E5A93C] border-2 border-white text-black flex items-center justify-center shadow-[0_0_20px_#E5A93C]">
                <span className="w-2 h-2 rounded-full bg-black" />
              </div>

              {/* Opponent Identity Tag */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap flex flex-col items-center">
                <div className="px-2.5 py-1 rounded-lg bg-black/95 border border-[#E5A93C]/80 text-[#E5A93C] text-[11px] font-mono font-bold shadow-[0_0_16px_rgba(229,169,60,0.3)] flex items-center gap-1.5 backdrop-blur-md">
                  <span>{opponentData.flag}</span>
                  <span>OPPONENT ({opponentData.city})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MIDPOINT FLIGHT ARC TELEMETRY BADGE ================= */}
        {connectionArc && opponentData && (
          <div
            style={{ left: `${connectionArc.midX}%`, top: `${connectionArc.midY}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1.5 rounded-full bg-black/95 border border-[#E5A93C]/80 shadow-[0_0_22px_rgba(229,169,60,0.4)] flex items-center gap-2 text-xs font-mono backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5A93C] shrink-0" />
              <span className="font-bold text-white">
                {opponentData.distanceKm.toLocaleString()} km
              </span>
              <span className="text-white/20">•</span>
              <span className="text-[#00F2FE] font-semibold">{opponentData.pingMs}ms latency</span>
              {opponentData.isCrossBorder && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-emerald-400 font-bold">Cross-Border Visa Link</span>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* ================= SEARCHING RADAR SCANNER OVERLAY ================= */}
        {isSearching && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-[#00F2FE]/30 shadow-[0_0_30px_rgba(0,242,254,0.2)] animate-ping" />
            <div className="absolute px-4 py-2 rounded-xl bg-black/90 border border-[#00F2FE]/50 text-[#00F2FE] font-mono text-xs flex items-center gap-2 shadow-2xl backdrop-blur-md">
              <Radio className="w-4 h-4 animate-spin text-[#00F2FE]" />
              <span>Scanning Latency & Regional Matchmaking Nodes...</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM MAP FOOTER & LEGEND ================= */}
      <div className="p-3.5 sm:p-4 bg-[#050505] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#9CA3AF]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
            <span className="text-white">You (Local Node)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE]/70 shadow-[0_0_6px_#00F2FE]" />
            <span className="text-white">Active Peers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5A93C] shadow-[0_0_8px_#E5A93C]" />
            <span className="text-white">Duel Pairing Link</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
          <Info className="w-3.5 h-3.5 text-[#E5A93C]" />
          <span>Equirectangular Plate Carrée Projection • Real-Time Geodesic Arcs</span>
        </div>
      </div>

      {/* ================= PEER DOSSIER POPUP (WHEN CLICKED) ================= */}
      <AnimatePresence>
        {selectedPeer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 right-4 max-w-xs w-full bg-[#050505]/95 border border-white/10 rounded-2xl p-4 shadow-2xl z-40 backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPeer.countryFlag}</span>
                <div>
                  <h4 className="font-display font-bold text-white text-sm">
                    {selectedPeer.username}
                  </h4>
                  <p className="text-[11px] font-mono text-[#9CA3AF]">
                    {selectedPeer.city}, {selectedPeer.countryName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPeer(null)}
                className="w-5 h-5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-[#9CA3AF] hover:text-white flex items-center justify-center text-xs cursor-pointer border border-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/10">
              <div>
                <span className="text-[#9CA3AF] block text-[10px]">Rank:</span>
                <span className="font-bold text-[#E5A93C] truncate block">
                  {selectedPeer.rankTitle}
                </span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block text-[10px]">Distance:</span>
                <span className="font-bold text-[#00F2FE] block">
                  {calculateHaversineDistanceKm(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    selectedPeer.latitude,
                    selectedPeer.longitude
                  ).toLocaleString()}{' '}
                  km
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#9CA3AF] italic">
              Status: <span className="capitalize text-emerald-400 font-semibold">{selectedPeer.status.replace('_', ' ')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
