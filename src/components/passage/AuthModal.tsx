import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Navigation,
  Globe2,
  Check,
} from 'lucide-react';
import { useToast } from './ToastNotification';
import { globalSoundEngine } from '../../services/GlobalSoundEngine';
import { UserProfile, UserLocation } from '../../types';
import {
  locationService,
  WORLD_CITIES_REGISTRY,
} from '../../services/locationService';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: Partial<UserProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const { showToast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [detectedLocation, setDetectedLocation] = useState<UserLocation>(() =>
    locationService.getLocation()
  );
  const [showOriginPicker, setShowOriginPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      locationService
        .captureLocation()
        .then((loc) => setDetectedLocation(loc))
        .catch(() => {});
    }
  }, [isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email || !email.includes('@')) {
      errs.email = 'Please provide a valid diplomatic email address.';
    }
    if (!password || password.length < 6) {
      errs.password = 'Credential must be at least 6 characters.';
    }
    if (mode === 'signup' && !username.trim()) {
      errs.username = 'Diplomat callsign / username is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSelectOrigin = (code: string) => {
    const newLoc = locationService.setManualLocation(code);
    setDetectedLocation(newLoc);
    setShowOriginPicker(false);
    globalSoundEngine.playClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      globalSoundEngine.playIncorrect();
      showToast({
        type: 'error',
        title: 'Authentication Incomplete',
        message: 'Please resolve the highlighted fields to issue your visa credentials.',
      });
      return;
    }

    setIsLoading(true);
    globalSoundEngine.playClick();

    setTimeout(() => {
      setIsLoading(false);
      globalSoundEngine.playCorrect();

      const authenticatedProfile: Partial<UserProfile> = {
        username: username.trim() || (email.split('@')[0] || 'Diplomat'),
        country: detectedLocation.countryName,
        countryName: detectedLocation.countryName,
        countryFlag: detectedLocation.flagEmoji,
        countryCode: detectedLocation.countryCode,
        location: detectedLocation,
      };

      onAuthSuccess(authenticatedProfile);
      showToast({
        type: 'success',
        title: mode === 'login' ? 'Credentials Verified' : 'Passport Issued',
        message: `Welcome back, Diplomat ${authenticatedProfile.username} from ${detectedLocation.city}, ${detectedLocation.countryName}.`,
      });
      onClose();
    }, 850);
  };

  const handleSocialAuth = (provider: 'Google' | 'Apple' | 'GitHub') => {
    globalSoundEngine.playClick();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      globalSoundEngine.playCorrect();
      const mockSocialUser: Partial<UserProfile> = {
        username: `${provider}Voyager`,
        country: detectedLocation.countryName,
        countryName: detectedLocation.countryName,
        countryFlag: detectedLocation.flagEmoji,
        countryCode: detectedLocation.countryCode,
        location: detectedLocation,
      };
      onAuthSuccess(mockSocialUser);
      showToast({
        type: 'success',
        title: `Authenticated via ${provider}`,
        message: `Federated identity connected. Station: ${detectedLocation.city}, ${detectedLocation.countryName}.`,
      });
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md">
          {/* Backdrop Click */}
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
            className="relative w-full max-w-md bg-white dark:bg-[#141416] text-stone-900 dark:text-[#f5f5f3] rounded-3xl p-6 sm:p-8 border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden z-10 select-none"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-amber-700 dark:text-amber-400 text-[11px] font-mono font-bold tracking-widest uppercase mb-3">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Diplomatic Access</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                {mode === 'login' ? 'Sign In to Passage' : 'Issue Your Passport'}
              </h3>
              <p className="font-editorial italic text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
                {mode === 'login'
                  ? 'Synchronize unlocked cultural visas, XP rankings, and archival stamps.'
                  : 'Enroll into the global cultural expedition as a registered diplomatic wayfarer.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl mb-6 border border-stone-200/80 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrors({});
                  globalSoundEngine.playHover();
                }}
                className={`py-2 rounded-xl text-xs font-display font-bold tracking-wide transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrors({});
                  globalSoundEngine.playHover();
                }}
                className={`py-2 rounded-xl text-xs font-display font-bold tracking-wide transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'
                }`}
              >
                New Passport
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                    Diplomat Callsign / Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="e.g. Kenji Tanaka"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                        errors.username
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-[10px] text-rose-600 mt-1">{errors.username}</p>
                  )}
                </div>
              )}

              {/* Email Floating/Clean Field */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="envoy@worldpassage.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                      errors.email
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-1 font-semibold">
                  Security Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border text-xs font-sans-clean transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                      errors.password
                        ? 'border-rose-400 ring-1 ring-rose-400'
                        : 'border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Geographic Origin Card */}
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl">{detectedLocation.flagEmoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                        {detectedLocation.city}, {detectedLocation.countryName}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>
                          {detectedLocation.captureMethod === 'gps'
                            ? 'GPS Location'
                            : detectedLocation.captureMethod === 'ip_fallback'
                            ? 'IP Geolocation'
                            : 'Manual Override'}{' '}
                          ({detectedLocation.countryCode})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      globalSoundEngine.playClick();
                      setShowOriginPicker((v) => !v);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-stone-200 dark:bg-stone-800 text-[10px] font-mono font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    Change Origin
                  </button>
                </div>

                {/* Origin Picker Dropdown */}
                <AnimatePresence>
                  {showOriginPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800"
                    >
                      <div className="text-[10px] font-mono uppercase text-stone-400 mb-1.5 font-bold">
                        Select Diplomatic Post:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {WORLD_CITIES_REGISTRY.slice(0, 10).map((c) => (
                          <button
                            key={c.countryCode}
                            type="button"
                            onClick={() => handleSelectOrigin(c.countryCode)}
                            className={`p-1.5 rounded-lg text-left text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                              detectedLocation.countryCode === c.countryCode
                                ? 'bg-amber-500/20 text-amber-500 font-bold'
                                : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                            }`}
                          >
                            <span>{c.flag}</span>
                            <span className="truncate text-[11px]">{c.city}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit CTA */}
              <motion.button
                whileHover={{ scale: 1.015, y: -1 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-2xl bg-stone-950 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 font-display text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Validating Diplomatic Ledger...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-600" />
                    <span>{mode === 'login' ? 'Authorize Credentials' : 'Mint Official Passport'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Subtle Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#141416] text-[10px] font-mono uppercase tracking-widest text-stone-400">
                Or Federated Identity
              </span>
            </div>

            {/* Social Login Pill Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleSocialAuth('Google')}
                className="py-2.5 px-2 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/80 text-xs font-display font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.14 0 9.97 0 12s.45 3.86 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-[11px] font-bold">Google</span>
              </motion.button>

              {/* Apple */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleSocialAuth('Apple')}
                className="py-2.5 px-2 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/80 text-xs font-display font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.13-10.74-19.49-14.21-31.06-3.47-11.58-5.2-22.6-5.2-33.07 0-14.57 3.73-26.65 11.19-36.23 7.46-9.58 16.92-14.48 28.37-14.7 4.9.12 10.3 1.34 16.2 3.65 5.9 2.31 9.77 3.51 11.6 3.6 2.32-.23 6.36-1.5 12.13-3.82 5.77-2.31 10.88-3.41 15.34-3.3 11.66.57 21.05 4.67 28.16 12.3-10.12 6.1-15.08 14.54-14.88 25.32.22 8.35 3.44 15.28 9.66 20.79 6.22 5.51 13.68 8.78 22.38 9.8-2.32 6.78-5.27 13.88-8.85 21.31zM119.22 33.15c0-7.39 2.68-14.4 8.04-21.03 5.36-6.63 11.95-10.96 19.77-13 1.03 7.39-1.39 14.23-7.26 20.52-5.87 6.29-12.71 10.02-20.55 13.51z" />
                </svg>
                <span className="text-[11px] font-bold">Apple</span>
              </motion.button>

              {/* GitHub */}
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => handleSocialAuth('GitHub')}
                className="py-2.5 px-2 rounded-2xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/80 text-xs font-display font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span className="text-[11px] font-bold">GitHub</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
