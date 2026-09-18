import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Award,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Code2,
  Sliders,
  CheckCircle2,
  Compass,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditorialHeroCard } from './EditorialHeroCard';
import { InteractivePillGroup } from './InteractivePillGroup';
import { VirtualPassportView } from './VirtualPassportView';
import {
  CategoryTagPills,
  TagCloudBadges,
} from './PillTagGroup';
import { PassageBottomBar } from './PassageBottomBar';
import { PASSAGE_CHAPTERS } from '../../data/passageChapters';
import { soundEngine } from '../../services/soundEngine';
import { UserProfile, PassportStamp } from '../../types';

interface PassageEditorialGameProps {
  user: UserProfile;
  stamps: PassportStamp[];
  onAwardStamp?: (stamp: PassportStamp) => void;
  onNavigateToFullApp?: () => void;
}

export const PassageEditorialGame: React.FC<PassageEditorialGameProps> = ({
  user,
  stamps,
  onAwardStamp,
  onNavigateToFullApp,
}) => {
  // Navigation & Chapter State
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'journey' | 'passport' | 'specifications'>('journey');
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);

  // User Interactive Answers State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>({});
  const [newlyUnlockedStampId, setNewlyUnlockedStampId] = useState<string | null>(null);

  // Audio State
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Modal State for Passport Stamp Inspection
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  const chapter = PASSAGE_CHAPTERS[currentChapterIndex];
  const challenge = chapter.challenges[selectedChallengeIndex] || chapter.challenges[0];

  // Stop audio when chapter changes
  useEffect(() => {
    setIsAudioPlaying(false);
    setSelectedChallengeIndex(0);
  }, [currentChapterIndex]);

  // Audio Ambient Motif playback
  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      // Play chapter atmospheric melody
      if (challenge.audioNotes && challenge.audioNotes.length > 0) {
        soundEngine.playMelody(challenge.audioNotes);
      } else {
        soundEngine.playTone(440, 'sine', 0.8, 0.15);
      }
      setTimeout(() => setIsAudioPlaying(false), 3000);
    }
  };

  const handlePronounceWord = (word: string, lang = 'en-US') => {
    soundEngine.speakPhrase(word, lang);
  };

  const handleSelectOption = (optionId: string) => {
    if (submittedAnswers[challenge.id]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [challenge.id]: optionId,
    }));
    soundEngine.playTick();
  };

  const handleSubmitAnswer = () => {
    const selected = selectedAnswers[challenge.id];
    if (!selected) return;

    setSubmittedAnswers((prev) => ({
      ...prev,
      [challenge.id]: true,
    }));

    const opt = challenge.options.find((o) => o.id === selected);
    if (opt?.isCorrect) {
      soundEngine.playVictory();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d97706', '#1c1917', '#b45309', '#f59e0b'],
      });

      // Check if all challenges in this chapter are finished
      const allDone = chapter.challenges.every(
        (c) => c.id === challenge.id || submittedAnswers[c.id]
      );
      if (allDone) {
        setCompletedChapters((prev) => ({
          ...prev,
          [chapter.id]: true,
        }));
        setNewlyUnlockedStampId(chapter.id);
        soundEngine.playStamp();

        // Mint Stamp into passport if callback provided
        if (onAwardStamp) {
          const newStamp: PassportStamp = {
            id: `passage-stamp-${chapter.id}`,
            countryCode: chapter.countryCode,
            countryName: chapter.country,
            countryFlag: chapter.countryCode === 'JP' ? '🇯🇵' : chapter.countryCode === 'EG' ? '🇪🇬' : chapter.countryCode === 'CU' ? '🇨🇺' : chapter.countryCode === 'TN' ? '🇹🇳' : '🇮🇸',
            acquiredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            unlockedBy: 'victory',
            opponentName: 'Passage Narrator',
            opponentCountry: chapter.country,
            inkColor: chapter.countryCode === 'JP' ? 'crimson' : chapter.countryCode === 'EG' ? 'sepia' : chapter.countryCode === 'CU' ? 'navy' : chapter.countryCode === 'TN' ? 'navy' : 'emerald',
            capital: chapter.city,
            language: 'Native',
            culturalFact: chapter.challenges[0]?.revealedFact || chapter.quote.text,
            famousLandmark: chapter.title,
            coordinates: chapter.coordinates,
          };
          onAwardStamp(newStamp);
        }
      }
    } else {
      soundEngine.playIncorrect();
    }
  };

  const isCurrentChallengeSubmitted = !!submittedAnswers[challenge.id];
  const selectedOption = challenge.options.find((o) => o.id === selectedAnswers[challenge.id]);
  const isCorrect = selectedOption?.isCorrect ?? false;

  const totalChallenges = PASSAGE_CHAPTERS.reduce((acc, c) => acc + c.challenges.length, 0);
  const completedChallengesCount = Object.keys(submittedAnswers).filter((k) => {
    return PASSAGE_CHAPTERS.some((c) =>
      c.challenges.some((ch) => ch.id === k && ch.options.find((o) => o.id === selectedAnswers[k])?.isCorrect)
    );
  }).length;

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white selection:bg-[#E5A93C]/30 selection:text-white pb-32">
      {/* Top Editorial Bar */}
      <nav className="sticky top-0 z-30 bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-lg sm:text-xl tracking-tighter text-white">
            PASSAGE
          </span>
          <span className="h-4 w-px bg-white/10 hidden sm:block" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#9CA3AF] hidden sm:block">
            A Cultural Journey
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('journey')}
            className={`px-3.5 py-1 rounded-full text-xs font-display font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === 'journey'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/20'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            Story Chapters
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passport')}
            className={`px-3.5 py-1 rounded-full text-xs font-display font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'passport'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/20'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#E5A93C]" />
            <span>Passport Archive</span>
            <span className="text-[10px] font-mono px-1 rounded-full bg-[#E5A93C] text-black font-bold">
              {stamps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specifications')}
            className={`px-3.5 py-1 rounded-full text-xs font-display font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'specifications'
                ? 'bg-white/[0.12] text-white shadow-sm border border-white/20'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden sm:inline">Design & Architecture</span>
            <span className="sm:hidden">Dossier</span>
          </button>
        </div>

        {/* Chapter Quick Nav Jump */}
        <div className="hidden md:flex items-center gap-1.5">
          {PASSAGE_CHAPTERS.map((ch, idx) => {
            const isCurrent = idx === currentChapterIndex;
            const isCompleted = completedChapters[ch.id];

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setCurrentChapterIndex(idx)}
                className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center border ${
                  isCurrent
                    ? 'bg-white text-black border-white scale-110 shadow'
                    : isCompleted
                    ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                    : 'bg-white/[0.03] text-[#9CA3AF] border-white/10 hover:border-white/30 hover:text-white'
                }`}
                title={`${ch.chapterNumber}: ${ch.title}`}
              >
                {ch.chapterNumber}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ================= VIEW 1: STORY JOURNEY ================= */}
      {activeTab === 'journey' && (
        <main>
          {/* Chapter Selector Ribbon */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
            <CategoryTagPills
              categories={PASSAGE_CHAPTERS.map((c, i) => ({
                id: String(i),
                label: `Ch. ${c.chapterNumber}: ${c.city}`,
                count: c.challenges.length,
              }))}
              activeId={String(currentChapterIndex)}
              onSelect={(id) => setCurrentChapterIndex(Number(id))}
            />
          </div>

          {/* Editorial Hero Component */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-6">
            <EditorialHeroCard
              chapterNumber={chapter.chapterNumber}
              title={chapter.title}
              subtitle={chapter.subtitle}
              city={chapter.city}
              country={chapter.country}
              coordinates={chapter.coordinates}
              imageUrl={chapter.heroImageUrl}
              photoCredit={chapter.photoCredit}
              tags={[chapter.country, chapter.atmosphereTag, chapter.coordinates]}
              atmosphere={chapter.atmosphereTag}
              isAudioActive={isAudioPlaying}
              onToggleAudio={handleToggleAudio}
              onCtaClick={() => {
                const el = document.getElementById('chapter-challenges');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              ctaText="Begin Chapter Inquiry"
            />
          </div>

          {/* Cultural Challenges & Narrative Deck */}
          <section id="chapter-challenges" className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10 mb-8">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#E5A93C] font-bold block mb-1">
                  Interactive Deciphering Deck
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  Cultural Inquiries & Deciphering
                </h2>
              </div>

              {/* Challenge Sub-Tabs */}
              <div className="flex items-center gap-2">
                {chapter.challenges.map((ch, idx) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChallengeIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-display font-medium tracking-wide transition-all cursor-pointer flex items-center gap-1.5 border ${
                      selectedChallengeIndex === idx
                        ? 'bg-[#E5A93C] text-black border-[#E5A93C] shadow-sm font-bold'
                        : 'bg-white/[0.03] text-[#9CA3AF] hover:text-white border-white/10 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>Inquiry {idx + 1}</span>
                    {submittedAnswers[ch.id] && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* The Main Challenge Card: Responsive Grid (1 col on mobile, 2 col on tablet/desktop) */}
            <div className="rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden p-5 sm:p-8 lg:p-10 transition-all duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Context, Narrative Story & Etymology */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                  {/* Category Tag Cloud & Metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <TagCloudBadges
                      tags={[
                        chapter.country,
                        challenge.tag,
                        challenge.type.replace('_', ' ').toUpperCase(),
                      ]}
                    />

                    <span className="text-xs font-mono text-[#9CA3AF]">
                      Ref: {challenge.id}
                    </span>
                  </div>

                  {/* Narrative Story Prologue */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] font-bold block mb-1.5">
                      Cultural Narrative
                    </span>
                    <p className="font-editorial text-base sm:text-lg text-[#9CA3AF] leading-relaxed italic">
                      “{challenge.culturalStory}”
                    </p>
                  </div>

                  {/* Word Decipher Special Showcase (If Applicable) */}
                  {challenge.etymology && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/10 flex flex-col gap-3">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] font-bold block mb-1">
                          Target Lexicon & Etymology
                        </span>
                        <div className="flex items-baseline gap-2.5 flex-wrap">
                          <span className="font-editorial text-2xl sm:text-3xl text-white font-serif">
                            {challenge.etymology.originalScript}
                          </span>
                          <span className="font-display text-base sm:text-lg font-bold text-[#00F2FE]">
                            ({challenge.etymology.romanized})
                          </span>
                        </div>
                        <p className="text-xs font-sans-clean text-[#9CA3AF] mt-1 leading-normal">
                          Literal: “{challenge.etymology.literalTranslation}” — {challenge.etymology.philosophicalMeaning}
                        </p>
                      </div>

                      {challenge.speechWord && (
                        <button
                          type="button"
                          onClick={() => handlePronounceWord(challenge.speechWord!, challenge.speechLang)}
                          className="min-h-[44px] px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-display font-semibold transition-all cursor-pointer flex items-center gap-2 self-start shadow-sm"
                        >
                          <Volume2 className="w-4 h-4 text-[#00F2FE]" />
                          <span>Hear Pronunciation</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Inquiry Prompt, Pill Options, Action Bar & Revealed Fact */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Inquiry Prompt Headline */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#00F2FE] font-bold block mb-1">
                      Inquiry Prompt
                    </span>
                    <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight leading-snug">
                      {challenge.prompt}
                    </h3>
                  </div>

                  {/* Pill Button Options */}
                  <div>
                    <InteractivePillGroup
                      options={challenge.options}
                      selectedOptionId={selectedAnswers[challenge.id] || null}
                      isSubmitted={isCurrentChallengeSubmitted}
                      onSelectOption={handleSelectOption}
                      layoutColumns={2}
                      audioWord={challenge.speechWord}
                      audioLang={challenge.speechLang}
                      onHearPronunciation={handlePronounceWord}
                    />
                  </div>

                  {/* Submit & Navigation Control Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-[#9CA3AF] font-sans-clean">
                      {!isCurrentChallengeSubmitted ? (
                        <span>Select an option above and confirm to unlock cultural revelation.</span>
                      ) : isCorrect ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Deciphered correctly! Cultural dossier unlocked.</span>
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">
                          Not quite, but the cultural truth is revealed below.
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                      {!isCurrentChallengeSubmitted ? (
                        <button
                          type="button"
                          disabled={!selectedAnswers[challenge.id]}
                          onClick={handleSubmitAnswer}
                          className="min-h-[44px] px-6 py-2.5 rounded-full bg-white hover:bg-white/90 disabled:opacity-20 text-black border border-white/10 font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <span>Submit Answer</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          {selectedChallengeIndex < chapter.challenges.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setSelectedChallengeIndex((p) => p + 1)}
                              className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#E5A93C] hover:bg-[#E5A93C]/90 text-black border border-white/10 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <span>Next Inquiry</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : currentChapterIndex < PASSAGE_CHAPTERS.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setCurrentChapterIndex((p) => p + 1)}
                              className="min-h-[44px] px-5 py-2.5 rounded-full bg-white hover:bg-white/90 text-black border border-white/10 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <span>Advance to Chapter {PASSAGE_CHAPTERS[currentChapterIndex + 1].chapterNumber}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsPassportModalOpen(true)}
                              className="min-h-[44px] px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black border border-white/10 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Completed Passport</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revealed Cultural Fact Box */}
                  {isCurrentChallengeSubmitted && (
                    <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 text-white animate-in fade-in duration-500">
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold uppercase tracking-wider text-[#E5A93C]">
                        <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                        <span>Cultural Archival Disclosure</span>
                      </div>
                      <p className="font-editorial text-sm sm:text-base leading-relaxed text-[#9CA3AF]">
                        {challenge.revealedFact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chapter Editorial Stamp Mint Banner (If all chapter challenges completed) */}
            {completedChapters[chapter.id] && (
              <div className="mt-8 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md text-white border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full border-2 border-[#E5A93C]/80 flex items-center justify-center text-3xl shrink-0 bg-white/[0.04] shadow-inner">
                    {chapter.editorialStamp.symbolEmoji}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E5A93C] block mb-1">
                      Official Entry Visa Minted
                    </span>
                    <h4 className="font-display text-xl font-bold text-white">
                      {chapter.editorialStamp.sealTitle}
                    </h4>
                    <p className="text-xs font-serif-editorial italic text-[#9CA3AF] mt-0.5">
                      “{chapter.editorialStamp.culturalMotto}” • Issued at {chapter.editorialStamp.issuedDate}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPassportModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-[#E5A93C] hover:bg-[#E5A93C]/90 text-black border border-white/10 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0"
                >
                  Inspect Passport Seal
                </button>
              </div>
            )}
          </section>

          {/* Minimalist Bottom Bar */}
          <PassageBottomBar
            chapters={PASSAGE_CHAPTERS}
            currentChapterIndex={currentChapterIndex}
            onSelectChapter={(i) => setCurrentChapterIndex(i)}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={handleToggleAudio}
            stampsCount={stamps.length}
            onOpenPassport={() => setIsPassportModalOpen(true)}
            completedChallengesCount={completedChallengesCount}
            totalChallengesCount={totalChallenges}
          />
        </main>
      )}

      {/* ================= VIEW 2: VIRTUAL PASSPORT ARCHIVE ================= */}
      {activeTab === 'passport' && (
        <VirtualPassportView
          diplomatName={user.username || 'Cultural Envoy'}
          newlyUnlockedStampId={newlyUnlockedStampId}
          onClearNewlyUnlocked={() => setNewlyUnlockedStampId(null)}
          stamps={PASSAGE_CHAPTERS.map((ch) => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            countryCode: ch.countryCode,
            countryName: ch.country,
            flagEmoji:
              ch.countryCode === 'JP'
                ? '🇯🇵'
                : ch.countryCode === 'EG'
                ? '🇪🇬'
                : ch.countryCode === 'CU'
                ? '🇨🇺'
                : ch.countryCode === 'TN'
                ? '🇹🇳'
                : '🇮🇸',
            city: ch.city,
            coordinates: ch.coordinates,
            sealTitle: ch.editorialStamp.sealTitle,
            culturalMotto: ch.editorialStamp.culturalMotto,
            inkHex: ch.editorialStamp.inkHex,
            issuedDate: ch.editorialStamp.issuedDate,
            symbolEmoji: ch.editorialStamp.symbolEmoji,
            isUnlocked: !!completedChapters[ch.id],
            culturalFact: ch.challenges[0]?.revealedFact || ch.quote.text,
            unlockRequirement: `Complete Inquiries in Chapter ${ch.chapterNumber} (${ch.city})`,
          }))}
          onSelectStamp={(stamp) => {
            if (stamp.isUnlocked) {
              setIsPassportModalOpen(true);
            }
          }}
        />
      )}

      {/* ================= VIEW 3: DESIGN SYSTEM & ARCHITECTURE DOSSIER ================= */}
      {activeTab === 'specifications' && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
          {/* Header */}
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#E5A93C] font-bold block mb-1">
              Lead UI/UX & Web Developer Technical Specification
            </span>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Awwwards-Level Editorial Architecture
            </h1>
            <p className="text-sm font-sans-clean text-[#9CA3AF] mt-2 max-w-3xl leading-relaxed">
              Design system guidelines, typography pairings, framework recommendations, and interactive component source code for “Passage: A Cultural Journey”.
            </p>
          </div>

          {/* 1. Architecture Recommendation: React/Next vs Vue/Nuxt */}
          <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[#E5A93C]">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                1. Recommended Frontend Architecture
              </h2>
            </div>

            <p className="font-sans-clean text-[#9CA3AF] text-sm leading-relaxed mb-6">
              For an editorial, narrative-driven experience with Awwwards-nominated visual fluidity, we recommend:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans-clean text-xs leading-relaxed">
              {/* React Option */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-[#E5A93C]/40 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-black uppercase text-white">
                    Primary Pick: Next.js (App Router) + React 19
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#E5A93C] text-black font-mono font-bold text-[10px]">
                    OPTIMAL
                  </span>
                </div>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li><strong className="text-white">Image Optimization:</strong> <code className="text-[#00F2FE]">next/image</code> serves AVIF/WebP with priority loading and blur-up placeholders for cinematic chapter imagery.</li>
                  <li><strong className="text-white">Motion & Animation:</strong> <code className="text-[#00F2FE]">motion/react</code> (Framer Motion 12+) for layout animations, page exits, and spring-based pill interactions.</li>
                  <li><strong className="text-white">Scroll Physics:</strong> Lenis Smooth Scroll (<code className="text-[#00F2FE]">@studio-freight/lenis</code>) for inertia-rich editorial reading transitions.</li>
                  <li><strong className="text-white">Audio Architecture:</strong> Web Audio API audio graph singleton with SpeechSynthesis for low-overhead native pronunciations.</li>
                </ul>
              </div>

              {/* Vue Option */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-sm font-black uppercase text-white">
                    Alternative: Nuxt 3 + Vue 3
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[#9CA3AF] font-mono font-bold text-[10px]">
                    SOLID
                  </span>
                </div>
                <ul className="space-y-2 text-[#9CA3AF]">
                  <li><strong className="text-white">Image Optimization:</strong> <code className="text-[#00F2FE]">@nuxt/image</code> provider with Cloudinary/IPX integration.</li>
                  <li><strong className="text-white">Animation:</strong> <code className="text-[#00F2FE]">@vueuse/motion</code> or GSAP ScrollTrigger for parallax timelines.</li>
                  <li><strong className="text-white">State Engine:</strong> Pinia store for chapter progress and passport stamp synchronization.</li>
                  <li><strong className="text-white">SEO / Prerendering:</strong> Nitro engine generates static routes for ultra-fast First Contentful Paint (FCP).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Styling Guidelines & Tailwind CSS Configuration */}
          <div className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-[#00F2FE]">
                <Sliders className="w-5 h-5" />
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                2. CSS & Typography Design Tokens (OLED Deep Dark)
              </h2>
            </div>

            <p className="font-sans-clean text-[#9CA3AF] text-sm leading-relaxed mb-6">
              To produce this exact OLED editorial aesthetic, the design system employs high-contrast sans display titles (Syne / Neue Haas), paired with warm literary serifs (Newsreader) and clean geometric UI body text (Plus Jakarta Sans).
            </p>

            {/* Code Block */}
            <div className="rounded-2xl bg-black/60 border border-white/10 text-stone-300 p-5 font-mono text-xs overflow-x-auto leading-relaxed">
              <pre>{`/* OLED Deep Dark Aesthetic Design Tokens */
:root {
  /* Editorial Obsidian Canvas & Surfaces */
  --passage-bg: #0B0C10;             /* Obsidian Deep Black */
  --passage-surface: rgba(255, 255, 255, 0.03); /* Translucent dark charcoal */
  --passage-border: rgba(255, 255, 255, 0.10);  /* Subtle 1px hairline border */
  --passage-border-strong: rgba(255, 255, 255, 0.20);

  /* High-Contrast OLED Typography */
  --passage-text-headline: #FFFFFF;  /* Pure White */
  --passage-text-body: #9CA3AF;      /* Muted Silver */
  --passage-text-muted: #6B7280;     /* Subtle footnote captions */

  /* Luxury Accents */
  --passage-accent-amber: #E5A93C;   /* Warm Amber highlight */
  --passage-accent-cyan: #00F2FE;    /* Electric Cyan highlight */
}

/* Typography Hierarchy */
.font-display { font-family: 'Syne', -apple-system, sans-serif; font-weight: 700; }
.font-editorial { font-family: 'Newsreader', Georgia, serif; font-style: italic; }
.font-sans-clean { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

/* Micro Pill Dimensions */
.pill-button {
  border-radius: 9999px;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--passage-border);
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
}`}</pre>
            </div>
          </div>
        </section>
      )}

      {/* ================= PASSPORT INSPECTION MODAL ================= */}
      {isPassportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0C10] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative text-white">
            <button
              type="button"
              onClick={() => setIsPassportModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-[#9CA3AF] hover:text-white border border-white/10 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#E5A93C] font-bold block mb-1">
                Virtual Passport Dossier
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                Official Editorial Stamps
              </h3>
              <p className="text-xs font-sans-clean text-[#9CA3AF] mt-1">
                {stamps.length} entry visas officially stamped on your diplomat record.
              </p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {PASSAGE_CHAPTERS.map((ch) => {
                const isUnlocked = completedChapters[ch.id];
                const stamp = ch.editorialStamp;

                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      isUnlocked
                        ? 'bg-white/[0.04] border-[#E5A93C]/40 text-white shadow-sm'
                        : 'bg-white/[0.01] border-white/5 opacity-40 text-[#9CA3AF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isUnlocked ? stamp.symbolEmoji : '🔒'}</span>
                      <div>
                        <span className="font-display text-sm font-bold block text-white">
                          {stamp.sealTitle}
                        </span>
                        <span className="text-xs font-serif-editorial italic text-[#9CA3AF] block">
                          {ch.city}, {ch.country} • {stamp.culturalMotto}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isUnlocked ? 'bg-[#E5A93C] text-black font-bold' : 'bg-white/10 text-[#9CA3AF]'
                      }`}
                    >
                      {isUnlocked ? 'Stamped' : 'Locked'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPassportModalOpen(false)}
                className="px-5 py-2 rounded-full bg-white hover:bg-white/90 text-black border border-white/10 text-xs font-display font-bold uppercase tracking-wider cursor-pointer transition-all"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
