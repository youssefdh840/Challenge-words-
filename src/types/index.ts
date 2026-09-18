export type MiniGameType =
  | 'country_quiz'
  | 'guess_word'
  | 'mystery_cuisine'
  | 'sound_quiz'
  | 'map_speed_test';

export interface UserLocation {
  countryCode: string;
  countryName: string;
  city: string;
  regionName?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  captureMethod: 'gps' | 'ip_fallback' | 'manual';
  ipAddress?: string;
  timezone?: string;
  flagEmoji: string;
  capturedAt: string;
}

export interface LobbyPeerLocation {
  id: string;
  username: string;
  avatar: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  city: string;
  latitude: number;
  longitude: number;
  rankTitle: string;
  level: number;
  status: 'idle' | 'in_queue' | 'in_match';
  lastPingMs?: number;
}

export interface UserProfile {
  id: string;
  username: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  avatar: string;
  xp: number;
  level: number;
  rankTitle: string;
  gamesPlayed: number;
  gamesWon: number;
  passportId: string;
  country?: string;
  nativeLanguage?: string;
  bio?: string;
  soundEnabled?: boolean;
  hapticEnabled?: boolean;
  location?: UserLocation;
}

export type StampInkColor = 'crimson' | 'navy' | 'emerald' | 'sepia' | 'violet';

export interface PassportStamp {
  id: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  acquiredAt: string;
  unlockedBy: 'victory' | 'cultural_exchange';
  opponentName: string;
  opponentCountry: string;
  inkColor: StampInkColor;
  capital: string;
  language: string;
  culturalFact: string;
  famousLandmark: string;
  coordinates: string;
}

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'geography' | 'polyglot' | 'explorer' | 'duelist';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface QuestionSoundData {
  notes?: Array<{ freq: number; duration: number }>;
  melodyDescription: string;
  speechText?: string;
  speechLang?: string;
}

export interface MapTargetData {
  countryCode: string;
  countryName: string;
  continent: 'africa' | 'europe' | 'asia' | 'americas' | 'oceania';
  x: number; // percentage coordinates on world map (0-100)
  y: number; // percentage coordinates on world map (0-100)
}

export interface GameQuestion {
  id: string;
  type: MiniGameType;
  prompt: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  culturalFact: string;
  imageUrl?: string;
  cuisineDetail?: {
    dishName: string;
    keyIngredients: string[];
    servedDuring?: string;
  };
  wordDetail?: {
    originalWord: string;
    phonetic: string;
    meaning: string;
  };
  soundData?: QuestionSoundData;
  mapTarget?: MapTargetData;
}

export interface PlayerRoundAnswer {
  option: string;
  timeTakenMs: number;
  isCorrect: boolean;
  pointsAwarded: number;
}

export type MatchStatus =
  | 'idle'
  | 'searching'
  | 'matched'
  | 'round_countdown'
  | 'playing_round'
  | 'round_review'
  | 'match_finished';

export interface ActiveMatch {
  matchId: string;
  player1: UserProfile;
  player2: UserProfile;
  questions: GameQuestion[];
  currentRoundIndex: number;
  totalRounds: number;
  status: MatchStatus;
  roundDurationSec: number;
  timeRemainingSec: number;
  player1Score: number;
  player2Score: number;
  player1Streak: number;
  player2Streak: number;
  player1CurrentAnswer: PlayerRoundAnswer | null;
  player2CurrentAnswer: PlayerRoundAnswer | null;
  roundHistory: Array<{
    questionId: string;
    player1Answer: PlayerRoundAnswer | null;
    player2Answer: PlayerRoundAnswer | null;
  }>;
  winnerId: string | null;
  isDraw: boolean;
  stampsAwarded: PassportStamp[];
  xpAwarded: {
    player1: number;
    player2: number;
  };
  crossBorderBonus?: boolean;
  distanceKm?: number;
  estimatedPingMs?: number;
  matchRoute?: {
    p1Coords: [number, number];
    p2Coords: [number, number];
    p1City: string;
    p2City: string;
  };
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  capital: string;
  continent: 'Africa' | 'Europe' | 'Asia' | 'Americas' | 'Oceania';
  primaryLanguage: string;
  nativeGreeting: string;
  greetingPhonetic: string;
  speechLang: string;
  culturalHighlight: string;
  cuisine: string;
  famousLandmark: string;
  soundMelody: Array<{ freq: number; duration: number }>;
}
