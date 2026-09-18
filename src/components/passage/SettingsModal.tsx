import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Sliders,
  Shield,
  Sun,
  Moon,
  Laptop,
  Volume2,
  VolumeX,
  Download,
  LogOut,
  Check,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useTheme, Theme } from '../../services/ThemeProvider';
import { globalSoundEngine } from '../../services/GlobalSoundEngine';
import { useToast } from './ToastNotification';
import { UserProfile, PassportStamp } from '../../types';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stamps: PassportStamp[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

const AVATAR_OPTIONS = [
  '⛩️',
  '🏛️',
  '🕌',
  '🛕',
  '🗿',
  '🪶',
  '🧭',
  '📜',
  '🌋',
  '🎭',
  '🌺',
  '🏮',
];

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English (Diplomatic Standard)' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'is', label: 'Íslenska (Icelandic)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  stamps,
  onUpdateUser,
  onLogout,
}) => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Profile Form States
  const [displayName, setDisplayName] = useState(user.username);
  const [hostCountry, setHostCountry] = useState(user.country);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '⛩️');
  const [nativeLanguage, setNativeLanguage] = useState(user.nativeLanguage || 'en');

  // Audio Volume States
  const [isMuted, setIsMuted] = useState(globalSoundEngine.getMuted());
  const [sfxVolume, setSfxVolume] = useState(globalSoundEngine.getSfxVolume());
  const [musicVolume, setMusicVolume] = useState(globalSoundEngine.getMusicVolume());

  // Privacy States
  const [publicProfile, setPublicProfile] = useState(true);
  const [allowDuelInvites, setAllowDuelInvites] = useState(true);

  const handleSaveProfile = () => {
    globalSoundEngine.playClick();
    onUpdateUser({
      username: displayName.trim() || user.username,
      country: hostCountry,
      avatar: selectedAvatar,
      nativeLanguage: nativeLanguage,
    });
    showToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Diplomatic dossier changes saved to archival ledger.',
    });
    onClose();
  };

  const handleExportPassportData = () => {
    globalSoundEngine.playClick();
    const dataToExport = {
      exportVersion: '1.0',
      exportDate: new Date().toISOString(),
      diplomatProfile: user,
      issuedStampsCount: stamps.length,
      stampsCollection: stamps,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passage-passport-${user.username.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast({
      type: 'success',
      title: 'Passport Ledger Exported',
      message: 'Archival travel record downloaded as authenticated JSON.',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative w-full max-w-2xl bg-white dark:bg-[#141416] text-stone-900 dark:text-[#f5f5f3] rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] select-none"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300">
                  <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Diplomatic Settings</h3>
                  <p className="font-mono text-[10px] text-stone-400 uppercase tracking-widest">
                    Profile • Aesthetics • Security
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Navigation Ribbon */}
            <div className="flex border-b border-stone-200/80 dark:border-stone-800 px-6 pt-2 bg-stone-50 dark:bg-stone-900/50">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile');
                  globalSoundEngine.playHover();
                }}
                className={`pb-3 px-3 text-xs font-display font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'border-stone-950 dark:border-amber-400 text-stone-950 dark:text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile & Identity</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('preferences');
                  globalSoundEngine.playHover();
                }}
                className={`pb-3 px-3 text-xs font-display font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'preferences'
                    ? 'border-stone-950 dark:border-amber-400 text-stone-950 dark:text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Preferences & Audio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('security');
                  globalSoundEngine.playHover();
                }}
                className={`pb-3 px-3 text-xs font-display font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'security'
                    ? 'border-stone-950 dark:border-amber-400 text-stone-950 dark:text-white'
                    : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Account & Ledger</span>
              </button>
            </div>

            {/* Tab Contents Scrollable Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* ================= TAB 1: PROFILE ================= */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Avatar Selector */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-2 font-semibold">
                      Diplomatic Seal Insignia (Avatar)
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => {
                            setSelectedAvatar(av);
                            globalSoundEngine.playHover();
                          }}
                          className={`h-12 rounded-2xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                            selectedAvatar === av
                              ? 'bg-amber-50 dark:bg-stone-800 border-amber-500 shadow-md ring-2 ring-amber-400/50 scale-105'
                              : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                      Diplomat Callsign / Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>

                  {/* Host Country & Native Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                        Host Nation
                      </label>
                      <input
                        type="text"
                        value={hostCountry}
                        onChange={(e) => setHostCountry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                        Primary Translation Dialect
                      </label>
                      <select
                        value={nativeLanguage}
                        onChange={(e) => setNativeLanguage(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      >
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: PREFERENCES ================= */}
              {activeTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Theme Engine Mode Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
                        Theme Engine
                      </label>
                      <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                        {theme === 'dark' ? 'Charcoal Deep Void' : theme === 'light' ? 'Editorial Ivory' : 'System Match'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setTheme(t);
                            globalSoundEngine.playClick();
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-display font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            theme === t
                              ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs font-bold'
                              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                          }`}
                        >
                          {t === 'light' && <Sun className="w-3.5 h-3.5 text-amber-600" />}
                          {t === 'dark' && <Moon className="w-3.5 h-3.5 text-amber-400" />}
                          {t === 'system' && <Laptop className="w-3.5 h-3.5 text-stone-400" />}
                          <span className="capitalize">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Feedback Controls */}
                  <div className="space-y-4 pt-4 border-t border-stone-200/80 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-display font-bold">Soundscape Feedback</h4>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Haptic auditory cues for stamp seals, quiz chimes, and card interactions.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextMute = !isMuted;
                          setIsMuted(nextMute);
                          globalSoundEngine.setMuted(nextMute);
                          if (!nextMute) globalSoundEngine.playClick();
                        }}
                        className={`p-2 rounded-full border transition-all cursor-pointer ${
                          isMuted
                            ? 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-400'
                            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* SFX Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-500">SFX Resonance</span>
                        <span className="font-bold">{Math.round(sfxVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        disabled={isMuted}
                        value={sfxVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSfxVolume(val);
                          globalSoundEngine.setSfxVolume(val);
                          globalSoundEngine.playHover();
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Music / Soundscape Volume Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-500">Acoustic Atmosphere</span>
                        <span className="font-bold">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        disabled={isMuted}
                        value={musicVolume}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setMusicVolume(val);
                          globalSoundEngine.setMusicVolume(val);
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 3: ACCOUNT & SECURITY ================= */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Privacy Options */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 font-semibold">
                      Diplomatic Privacy Rules
                    </h4>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer">
                      <div>
                        <span className="font-display text-xs font-bold block">Public Passport Ledger</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Allow other envoys to view your unlocked visas on the global leaderboard.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={publicProfile}
                        onChange={(e) => setPublicProfile(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 cursor-pointer">
                      <div>
                        <span className="font-display text-xs font-bold block">1v1 Cultural Duel Inquiries</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          Accept incoming speed-quiz challenges from peer explorers.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowDuelInvites}
                        onChange={(e) => setAllowDuelInvites(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                      />
                    </label>
                  </div>

                  {/* Export Ledger Data */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-900 border border-amber-200/80 dark:border-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 dark:text-amber-400">
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Passport Ledger</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                        Download your unlocked visas, coordinates, and cultural stats ({stamps.length} stamps).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportPassportData}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-display text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Export JSON
                    </button>
                  </div>

                  {/* Log Out */}
                  {onLogout && (
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          globalSoundEngine.playClick();
                          onLogout();
                          onClose();
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-display font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out of Session</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-end gap-3 bg-stone-50 dark:bg-stone-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-display font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2 rounded-full bg-stone-950 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-display text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
