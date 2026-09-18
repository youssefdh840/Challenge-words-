export type ChallengeType = 'cultural_quiz' | 'word_decipher' | 'soundscape_quiz' | 'gastronomy_craft';

export interface PassageQuizOption {
  id: string;
  label: string;
  subtext?: string;
  isCorrect: boolean;
}

export interface PassageChallenge {
  id: string;
  type: ChallengeType;
  tag: string; // e.g. "Linguistics", "Gastronomy", "Architecture", "Acoustics"
  prompt: string;
  culturalStory: string;
  options: PassageQuizOption[];
  revealedFact: string;
  etymology?: {
    originalScript: string; // e.g. "木漏れ日" or "طعمية" or "هريسة"
    romanized: string;
    literalTranslation: string;
    philosophicalMeaning: string;
  };
  audioNotes?: Array<{ freq: number; duration: number }>;
  speechWord?: string;
  speechLang?: string;
}

export interface PassageChapter {
  id: string;
  chapterNumber: string; // e.g. "01", "02"
  title: string;
  subtitle: string;
  city: string;
  country: string;
  countryCode: string;
  coordinates: string; // e.g. "35°41'22\"N 139°41'30\"E"
  heroImageUrl: string;
  photoCredit: string;
  atmosphereTag: string; // e.g. "Morning mist, temple cedar, cedarwood bells"
  storyIntroduction: string;
  quote: {
    text: string;
    author: string;
  };
  challenges: PassageChallenge[];
  editorialStamp: {
    id: string;
    sealTitle: string;
    city: string;
    country: string;
    inkHex: string;
    issuedDate: string;
    symbolEmoji: string;
    culturalMotto: string;
  };
}
