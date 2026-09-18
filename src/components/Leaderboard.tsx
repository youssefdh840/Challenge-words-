import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Trophy, Globe, Flame } from 'lucide-react';

interface LeaderboardProps {
  currentUser: UserProfile;
  stampsCount: number;
}

interface RankedPlayer {
  rank: number;
  id: string;
  username: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  avatar: string;
  xp: number;
  level: number;
  rankTitle: string;
  stampsCount: number;
  winRate: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  currentUser,
  stampsCount,
}) => {
  const [filter, setFilter] = useState<'all' | 'africa' | 'europe' | 'asia' | 'americas'>('all');

  const sampleRankings: RankedPlayer[] = [
    {
      rank: 1,
      id: 'p-1',
      username: 'Ousmane_Dakar',
      countryCode: 'SN',
      countryName: 'Senegal',
      countryFlag: '🇸🇳',
      avatar: '🦁',
      xp: 1420,
      level: 7,
      rankTitle: 'Grand Ambassador of Teranga',
      stampsCount: 14,
      winRate: 84,
    },
    {
      rank: 2,
      id: 'p-2',
      username: 'Kenji_Tokyo',
      countryCode: 'JP',
      countryName: 'Japan',
      countryFlag: '🇯🇵',
      avatar: '🌸',
      xp: 1290,
      level: 6,
      rankTitle: 'Imperial Shogun Navigator',
      stampsCount: 12,
      winRate: 79,
    },
    {
      rank: 3,
      id: 'p-3',
      username: 'Ananya_Delhi',
      countryCode: 'IN',
      countryName: 'India',
      countryFlag: '🇮🇳',
      avatar: '🪷',
      xp: 1150,
      level: 5,
      rankTitle: 'Raga Cultural Master',
      stampsCount: 11,
      winRate: 76,
    },
    {
      rank: 4,
      id: 'p-4',
      username: 'Giovanna_Rio',
      countryCode: 'BR',
      countryName: 'Brazil',
      countryFlag: '🇧🇷',
      avatar: '🦜',
      xp: 980,
      level: 5,
      rankTitle: 'Bossa Nova Grandmaster',
      stampsCount: 9,
      winRate: 71,
    },
    {
      rank: 5,
      id: currentUser.id,
      username: currentUser.username,
      countryCode: currentUser.countryCode,
      countryName: currentUser.countryName,
      countryFlag: currentUser.countryFlag,
      avatar: currentUser.avatar,
      xp: currentUser.xp,
      level: currentUser.level,
      rankTitle: currentUser.rankTitle,
      stampsCount: stampsCount,
      winRate: currentUser.gamesPlayed > 0 ? Math.round((currentUser.gamesWon / currentUser.gamesPlayed) * 100) : 0,
    },
    {
      rank: 6,
      id: 'p-6',
      username: 'Sofia_Oaxaca',
      countryCode: 'MX',
      countryName: 'Mexico',
      countryFlag: '🇲🇽',
      avatar: '🌮',
      xp: 780,
      level: 4,
      rankTitle: 'Aztec Cartographer',
      stampsCount: 7,
      winRate: 67,
    },
    {
      rank: 7,
      id: 'p-7',
      username: 'Liam_Montreal',
      countryCode: 'CA',
      countryName: 'Canada',
      countryFlag: '🇨🇦',
      avatar: '🍁',
      xp: 690,
      level: 4,
      rankTitle: 'Northern Voyager',
      stampsCount: 6,
      winRate: 64,
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Global Cultural Leaderboard
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Top academic delegates and global ambassadors ranked by XP, stamps, and duel precision.
          </p>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800 border border-slate-700 self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            All Earth
          </button>
        </div>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-end">
        {/* Rank 2 */}
        <div className="order-2 md:order-1 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center shadow-lg relative">
          <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center mx-auto mb-2 shadow">
            #2
          </div>
          <span className="text-3xl block mb-1">{sampleRankings[1].countryFlag}</span>
          <h3 className="font-bold text-white text-sm">{sampleRankings[1].username}</h3>
          <span className="text-[11px] text-slate-400 font-mono block">{sampleRankings[1].rankTitle}</span>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">XP</span>
              <span className="font-bold text-amber-400">{sampleRankings[1].xp}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Stamps</span>
              <span className="font-bold text-cyan-400">{sampleRankings[1].stampsCount}</span>
            </div>
          </div>
        </div>

        {/* Rank 1 - Champion */}
        <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-400 text-center shadow-2xl relative -translate-y-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-2 shadow-lg shadow-amber-500/40">
            👑 #1
          </div>
          <span className="text-4xl block mb-1">{sampleRankings[0].countryFlag}</span>
          <h3 className="font-black text-white text-base">{sampleRankings[0].username}</h3>
          <span className="text-xs text-amber-300 font-mono block">{sampleRankings[0].rankTitle}</span>
          <div className="mt-3 pt-3 border-t border-amber-500/30 flex justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Total XP</span>
              <span className="font-black text-amber-400 text-sm">{sampleRankings[0].xp}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Stamps</span>
              <span className="font-black text-cyan-400 text-sm">{sampleRankings[0].stampsCount}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Win Rate</span>
              <span className="font-black text-emerald-400 text-sm">{sampleRankings[0].winRate}%</span>
            </div>
          </div>
        </div>

        {/* Rank 3 */}
        <div className="order-3 p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center shadow-lg relative">
          <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center mx-auto mb-2 shadow">
            #3
          </div>
          <span className="text-3xl block mb-1">{sampleRankings[2].countryFlag}</span>
          <h3 className="font-bold text-white text-sm">{sampleRankings[2].username}</h3>
          <span className="text-[11px] text-slate-400 font-mono block">{sampleRankings[2].rankTitle}</span>
          <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-around text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">XP</span>
              <span className="font-bold text-amber-400">{sampleRankings[2].xp}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Stamps</span>
              <span className="font-bold text-cyan-400">{sampleRankings[2].stampsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Delegate & Country</th>
              <th className="py-3 px-4 hidden sm:table-cell">Rank Title</th>
              <th className="py-3 px-4 text-center">Stamps</th>
              <th className="py-3 px-4 text-center">Win Rate</th>
              <th className="py-3 px-4 text-right">Total XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sampleRankings.map((player) => {
              const isCurrent = player.id === currentUser.id;

              return (
                <tr
                  key={player.id}
                  className={`transition-colors ${
                    isCurrent ? 'bg-cyan-950/40 text-cyan-200 font-bold border-l-4 border-l-cyan-400' : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="py-3.5 px-4 font-black">
                    <span className="inline-block w-6 text-center">
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.countryFlag}</span>
                      <div>
                        <span className="font-bold text-white text-xs block">
                          {player.username} {isCurrent && '(You)'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {player.countryName}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell text-slate-400 font-normal">
                    {player.rankTitle}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-cyan-400">
                    {player.stampsCount} 🛂
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {player.winRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-amber-400 text-sm">
                    {player.xp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
