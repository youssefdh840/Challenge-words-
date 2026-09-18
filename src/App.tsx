import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GameArena } from './components/GameArena';
import { VirtualPassport } from './components/VirtualPassport';
import { Leaderboard } from './components/Leaderboard';
import { ArchitectureHub } from './components/ArchitectureHub';
import { PassageEditorialGame } from './components/passage/PassageEditorialGame';
import {
  ActiveMatch,
  AchievementBadge,
  PassportStamp,
  UserProfile,
  UserLocation,
} from './types';
import {
  INITIAL_USER,
  INITIAL_STAMPS,
  INITIAL_BADGES,
} from './data/initialData';
import { gameEngine } from './services/gameEngine';
import { soundEngine } from './services/soundEngine';
import { locationService } from './services/locationService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'passage' | 'arena' | 'passport' | 'leaderboard' | 'architecture'>('passage');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('wc_user_profile');
    const baseUser = saved ? JSON.parse(saved) : INITIAL_USER;
    if (!baseUser.location) {
      baseUser.location = locationService.getLocation();
    }
    return baseUser;
  });

  // Capture user location on startup and synchronize
  useEffect(() => {
    locationService.captureLocation().then((loc) => {
      setUser((prev) => {
        if (!prev.location || prev.location.captureMethod !== 'manual') {
          const updated: UserProfile = {
            ...prev,
            location: loc,
            countryCode: loc.countryCode,
            countryName: loc.countryName,
            countryFlag: loc.flagEmoji,
          };
          localStorage.setItem('wc_user_profile', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }).catch(() => {});
  }, []);

  const handleUpdateLocation = (loc: UserLocation) => {
    setUser((prev) => {
      const updated: UserProfile = {
        ...prev,
        location: loc,
        countryCode: loc.countryCode,
        countryName: loc.countryName,
        countryFlag: loc.flagEmoji,
      };
      localStorage.setItem('wc_user_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const [stamps, setStamps] = useState<PassportStamp[]>(() => {
    const saved = localStorage.getItem('wc_passport_stamps');
    return saved ? JSON.parse(saved) : INITIAL_STAMPS;
  });

  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    const saved = localStorage.getItem('wc_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync game engine active match state
  useEffect(() => {
    const unsub = gameEngine.subscribe((match) => {
      setActiveMatch(match);

      // Handle match finish rewards
      if (match && match.status === 'match_finished') {
        const p1Won = match.winnerId === user.id;
        const xpGained = match.xpAwarded.player1 || 50;

        setUser((prev) => {
          const newXP = prev.xp + xpGained;
          const newLevel = Math.floor(newXP / 200) + 1;
          const newGamesPlayed = prev.gamesPlayed + 1;
          const newGamesWon = prev.gamesWon + (p1Won ? 1 : 0);

          let newRank = prev.rankTitle;
          if (newLevel >= 6) newRank = 'Grand Cultural Ambassador';
          else if (newLevel >= 4) newRank = 'Transcontinental Diplomat';
          else if (newLevel >= 2) newRank = 'Adventurer of the Medinas';

          const updated: UserProfile = {
            ...prev,
            xp: newXP,
            level: newLevel,
            rankTitle: newRank,
            gamesPlayed: newGamesPlayed,
            gamesWon: newGamesWon,
          };
          localStorage.setItem('wc_user_profile', JSON.stringify(updated));
          return updated;
        });

        // Add awarded stamps
        if (match.stampsAwarded && match.stampsAwarded.length > 0) {
          setStamps((prev) => {
            const copy = [...prev];
            match.stampsAwarded.forEach((st) => {
              if (!copy.some((existing) => existing.countryCode === st.countryCode)) {
                copy.push(st);
              }
            });
            localStorage.setItem('wc_passport_stamps', JSON.stringify(copy));
            return copy;
          });
        }

        // Update Badges
        setBadges((prevBadges) => {
          const updated = prevBadges.map((badge) => {
            if (badge.id === 'badge_first_duel') {
              return { ...badge, unlocked: true, progress: 1 };
            }
            if (badge.id === 'badge_japan') {
              const hasJP = match.stampsAwarded.some((s) => s.countryCode === 'JP') || stamps.some((s) => s.countryCode === 'JP');
              if (hasJP) return { ...badge, unlocked: true, progress: 1 };
            }
            if (badge.id === 'badge_brazil') {
              const hasBR = match.stampsAwarded.some((s) => s.countryCode === 'BR') || stamps.some((s) => s.countryCode === 'BR');
              if (hasBR) return { ...badge, unlocked: true, progress: 1 };
            }
            if (badge.id === 'badge_5_countries') {
              const totalUnique = new Set([...stamps.map((s) => s.countryCode), ...match.stampsAwarded.map((s) => s.countryCode)]).size;
              return {
                ...badge,
                progress: Math.min(5, totalUnique),
                unlocked: totalUnique >= 5,
              };
            }
            return badge;
          });
          localStorage.setItem('wc_badges', JSON.stringify(updated));
          return updated;
        });
      }
    });

    return unsub;
  }, [user.id, stamps]);

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        stampsCount={stamps.length}
      />

      {/* Main Content View Container */}
      <main className="flex-1">
        {activeTab === 'passage' && (
          <PassageEditorialGame
            user={user}
            stamps={stamps}
            onAwardStamp={(newStamp) => {
              setStamps((prev) => {
                if (prev.some((s) => s.id === newStamp.id)) return prev;
                const updated = [newStamp, ...prev];
                localStorage.setItem('wc_passport_stamps', JSON.stringify(updated));
                return updated;
              });
            }}
            onNavigateToFullApp={() => setActiveTab('arena')}
          />
        )}

        {activeTab === 'arena' && (
          <GameArena
            user={user}
            activeMatch={activeMatch}
            onNavigateToPassport={() => setActiveTab('passport')}
            onUpdateUserLocation={handleUpdateLocation}
          />
        )}

        {activeTab === 'passport' && (
          <VirtualPassport
            user={user}
            stamps={stamps}
            badges={badges}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            currentUser={user}
            stampsCount={stamps.length}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureHub />}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-6 text-center text-xs text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span className="font-bold text-white font-display">World Challenge</span>
            <span>• Terminale Computer Science / NSI Project</span>
          </div>
          <div className="flex items-center gap-3 text-[#9CA3AF] font-mono text-[11px]">
            <span>PostgreSQL 3NF Schema</span>
            <span className="text-white/20">•</span>
            <span>WebSocket Protocol</span>
            <span className="text-white/20">•</span>
            <span>Web Audio Synthesizer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
