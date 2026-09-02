import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TrackKey = 'mind' | 'body' | 'soul' | 'freedom';
export type Goal = 'discipline' | 'energy' | 'meaning' | 'autonomy';
export type TimeCommitment = 'ten' | 'twenty' | 'forty';
export type BeliefStyle = 'faith' | 'reflection' | 'service' | 'open';
export type Equipment = 'none' | 'home' | 'gym';
export type Ability = 'starting' | 'building' | 'advanced';
export type Consistency = 'fresh' | 'inconsistent' | 'steady';
export type MindState = 'scattered' | 'stressed' | 'clear';
export type EnergyLevel = 'low' | 'uneven' | 'strong';
export type SleepQuality = 'poor' | 'okay' | 'good';
export type FreedomFocus = 'financial' | 'mobility' | 'both';
export type ReadingStyle = 'practical' | 'deep' | 'mixed' | 'exercises';
export type BookTier = 'starter' | 'deeper';
export type FaithTradition = 'islam' | 'christianity' | 'hinduism' | 'buddhism' | 'other' | 'private';
export type MovementLimit = 'none' | 'knees' | 'back' | 'shoulders' | 'other';
export type FreedomStage = 'control' | 'saving' | 'income' | 'business';

export type OnboardingProfile = {
  goal: Goal;
  time: TimeCommitment;
  beliefs: BeliefStyle;
  equipment: Equipment;
  ability: Ability;
  focusTrack: TrackKey;
  consistency?: Consistency;
  mindState?: MindState;
  energyLevel?: EnergyLevel;
  sleepQuality?: SleepQuality;
  freedomFocus: FreedomFocus;
  priorityTracks: [TrackKey, TrackKey];
  readingStyle: ReadingStyle;
  faithTradition?: FaithTradition;
  movementLimit: MovementLimit;
  freedomStage: FreedomStage;
};

export type Quest = {
  id: string;
  track: TrackKey;
  title: string;
  detail: string;
  meta: string;
  xp: number;
  trackColor: string;
  trackIcon: string;
};

export type Book = {
  id: string;
  track: TrackKey;
  title: string;
  author: string;
  promise: string;
  practice: string;
  journeyDays: number;
  tier: BookTier;
  readingStyles: ReadingStyle[];
  beliefStyles?: BeliefStyle[];
  faithTraditions?: FaithTradition[];
  freedomFocuses?: FreedomFocus[];
};

type StoredState = {
  completedToday?: string[];
  totalCompleted?: number;
  xpByTrack?: Partial<Record<TrackKey, number>>;
  completedDates?: string[];
  lastActiveDate?: string;
  profile?: OnboardingProfile | null;
  lastLevelUp?: number | null;
  dailyXp?: Record<string, number>;
  hapticsEnabled?: boolean;
  // Legacy field from the original local-first tracker.
  completed?: string[];
};

type ProgressState = {
  completedToday: string[];
  totalCompleted: number;
  xpByTrack: Record<TrackKey, number>;
  completedDates: string[];
  lastActiveDate: string;
  profile: OnboardingProfile | null;
  lastLevelUp: number | null;
  dailyXp: Record<string, number>;
  hapticsEnabled: boolean;
};

export type WeeklyXpPoint = {
  date: string;
  label: string;
  xp: number;
};

type ProgressContextValue = {
  completedToday: string[];
  profile: OnboardingProfile | null;
  hydrated: boolean;
  isComplete: (id: string) => boolean;
  toggle: (id: string, track: TrackKey, xp: number) => void;
  setProfile: (profile: OnboardingProfile) => void;
  resetOnboarding: () => void;
  totalCompleted: number;
  totalXp: number;
  level: number;
  levelProgress: number;
  currentStreak: number;
  trackCompleted: (track: TrackKey) => number;
  trackXp: (track: TrackKey) => number;
  achievements: string[];
  lastLevelUp: number | null;
  clearLevelUp: () => void;
  weeklyXp: WeeklyXpPoint[];
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
};

const STORAGE_KEY = '@jack-of-all/progression';
const TRACKS: TrackKey[] = ['mind', 'body', 'soul', 'freedom'];
const TRACK_PREFIXES: Record<TrackKey, string> = {
  mind: 'mind-',
  body: 'body-',
  soul: 'soul-',
  freedom: 'freedom-',
};

const DEFAULT_PROFILE: OnboardingProfile = {
  goal: 'discipline',
  time: 'twenty',
  beliefs: 'open',
  equipment: 'none',
  ability: 'starting',
  focusTrack: 'mind',
  consistency: 'fresh',
  mindState: 'scattered',
  energyLevel: 'uneven',
  sleepQuality: 'okay',
  freedomFocus: 'both',
  priorityTracks: ['mind', 'body'],
  readingStyle: 'mixed',
  movementLimit: 'none',
  freedomStage: 'control',
};

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return localDateKey();
}

function emptyXp(): Record<TrackKey, number> {
  return { mind: 0, body: 0, soul: 0, freedom: 0 };
}

function getWeeklyXp(dailyXp: Record<string, number>): WeeklyXpPoint[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = localDateKey(date);
    return {
      date: key,
      label: date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1),
      xp: dailyXp[key] ?? 0,
    };
  });
}

function calculateStreak(dates: string[], today = todayKey()) {
  const known = new Set(dates);
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  while (known.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function normalizeProfile(profile: OnboardingProfile | null | undefined): OnboardingProfile {
  if (!profile) return DEFAULT_PROFILE;
  const focusTrack = TRACKS.includes(profile.focusTrack) ? profile.focusTrack : DEFAULT_PROFILE.focusTrack;
  const savedPriorities = Array.isArray(profile.priorityTracks)
    ? profile.priorityTracks.filter((track): track is TrackKey => TRACKS.includes(track))
    : [];
  const priorityTracks = Array.from(new Set([focusTrack, ...savedPriorities, ...TRACKS])).slice(0, 2) as [TrackKey, TrackKey];
  const savedReadingStyle = profile.readingStyle as string | undefined;
  const readingStyle: ReadingStyle = savedReadingStyle === 'quick'
    ? 'practical'
    : savedReadingStyle === 'guided'
    ? 'mixed'
    : savedReadingStyle === 'practical' || savedReadingStyle === 'deep' || savedReadingStyle === 'mixed' || savedReadingStyle === 'exercises'
    ? savedReadingStyle
    : DEFAULT_PROFILE.readingStyle;
  return {
    ...DEFAULT_PROFILE,
    ...profile,
    focusTrack: priorityTracks[0],
    priorityTracks,
    readingStyle,
  };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicShuffle<T>(items: T[], seedText: string) {
  const shuffled = [...items];
  let seed = hashString(seedText);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function getTrackTasks(track: TrackKey, profile: OnboardingProfile | null): Quest[] {
  const current = normalizeProfile(profile);
  const timeLabel = current.time === 'ten' ? '10 MIN' : current.time === 'forty' ? '40 MIN' : '20 MIN';
  const effortLabel = current.ability === 'starting' ? 'STARTER' : current.ability === 'advanced' ? 'DEEPEN' : 'BUILD';
  const consistencyLabel = current.consistency === 'steady' ? effortLabel : current.consistency === 'inconsistent' ? 'KEEP IT ALIVE' : 'FIRST STEP';
  const trackColors: Record<TrackKey, string> = {
    mind: '#55D6FF',
    body: '#4CD6B0',
    soul: '#FFCC66',
    freedom: '#8D7CFF',
  };

  const trackIcons: Record<TrackKey, keyof typeof import('@expo/vector-icons').Feather.glyphMap> = {
    mind: 'book-open',
    body: 'activity',
    soul: 'sun',
    freedom: 'key',
  };
  const priorityBonus = current.priorityTracks.includes(track) ? 5 : 0;
  const quest = (id: string, title: string, detail: string, meta: string, xp: number): Quest => ({
    id,
    track,
    title,
    detail,
    meta,
    xp: xp + priorityBonus,
    trackColor: trackColors[track],
    trackIcon: trackIcons[track],
  });
  const shortMinutes = current.time === 'ten' ? 5 : current.time === 'forty' ? 20 : 10;
  const focusMinutes = current.time === 'ten' ? 10 : current.time === 'forty' ? 40 : 20;
  const strengthRounds = current.ability === 'starting' ? 1 : current.ability === 'advanced' ? 4 : 2;
  const hasMovementLimit = current.movementLimit !== 'none';

  const tasks: Record<TrackKey, Quest[]> = {
    mind: [
      quest('mind-focus', current.mindState === 'scattered' ? 'Close one mental loop' : 'Defend one focus block', `Put the phone away and work on one defined outcome for ${focusMinutes} minutes.`, `${focusMinutes} MIN`, 40),
      quest('mind-read', 'Read with a question', `Read for ${shortMinutes} minutes and capture the one idea worth remembering.`, `${shortMinutes} MIN`, 35),
      quest('mind-journal', current.mindState === 'stressed' ? 'Empty the mental weight' : 'Write one clear thought', 'Name what is taking your attention, what is true, and what comes next.', '3 LINES', 30),
      quest('mind-plan', 'Choose tomorrow before it arrives', 'Write the single outcome that would make tomorrow meaningful.', '2 MIN', 25),
      quest('mind-learn', 'Practice a useful skill', `Study actively for ${focusMinutes} minutes, then test yourself without looking.`, effortLabel, 45),
      quest('mind-digital', 'Create a quiet perimeter', 'Silence nonessential notifications and leave one distracting app closed.', consistencyLabel, 30),
      quest('mind-reframe', 'Challenge one limiting thought', 'Write the thought, the evidence against it, and a more useful response.', '5 MIN', 35),
      quest('mind-recall', 'Retrieve before you review', 'Recall yesterday’s most useful idea from memory, then check what you missed.', 'MEMORY', 35),
    ],
    body: [
      quest('body-move', current.energyLevel === 'low' ? 'Take an energy walk' : 'Walk with purpose', `Walk outdoors at a sustainable pace for ${focusMinutes} minutes.`, `${focusMinutes} MIN`, 40),
      quest('body-strength', hasMovementLimit ? 'Use your safe strength plan' : current.equipment === 'gym' ? 'Complete the foundational circuit' : 'Build strength anywhere', hasMovementLimit ? 'Repeat only movements already cleared for you. Stop if symptoms increase and seek qualified guidance when needed.' : current.equipment === 'gym' ? `${strengthRounds} rounds: squat, push, pull, hinge, and carry. Keep every rep controlled.` : `${strengthRounds} rounds: 8 squats, 6 incline push-ups, 10 glute bridges, and a 20-second plank.`, hasMovementLimit ? 'SAFE RANGE' : `${strengthRounds} ROUND${strengthRounds === 1 ? '' : 'S'}`, 50),
      quest('body-mobility', 'Restore your range', 'Move slowly through ankles, hips, upper back, and shoulders without forcing pain.', `${shortMinutes} MIN`, 35),
      quest('body-daylight', 'Meet the day outside', 'Get outdoor light and easy movement soon after waking when your schedule allows.', 'RECOVERY', 30),
      quest('body-sleep', current.sleepQuality === 'poor' ? 'Build one wind-down cue' : 'Protect your sleep window', 'Choose a realistic bedtime and begin dimming stimulation 30 minutes before it.', 'TONIGHT', 35),
      quest('body-hydrate', 'Set your hydration cue', 'Drink water with your first meal and place the next glass where you will see it.', 'ONE CUE', 25),
      quest('body-breathe', 'Lower the tempo', 'Take five slow breaths with a longer, comfortable exhale. Stop if you feel light-headed.', '2 MIN', 25),
      quest('body-recover', 'Take an easy recovery session', `Keep the effort conversational: an easy walk or gentle mobility for ${shortMinutes} minutes.`, `${shortMinutes} MIN`, 30),
    ],
    soul: [
      quest('soul-prayer', current.beliefs === 'faith' ? 'Return to prayer' : 'Practice deliberate stillness', current.beliefs === 'faith' ? 'Use the words, scripture, or silence of your own tradition.' : 'Sit without a feed or agenda and notice what remains important.', `${shortMinutes} MIN`, 35),
      quest('soul-gratitude', 'Name three gifts', 'Write three specific things you received, noticed, or were able to give today.', '3 LINES', 30),
      quest('soul-values', 'Turn one value into action', 'Choose one value you claim and one visible action that would express it today.', 'ONE ACTION', 40),
      quest('soul-stillness', 'Create a quiet interval', `Spend ${shortMinutes} minutes without input. Let attention settle before deciding what comes next.`, `${shortMinutes} MIN`, 35),
      quest('soul-serve', 'Make someone’s day lighter', 'Offer a useful message, a small act, or your complete attention.', 'ONE ACT', 40),
      quest('soul-forgive', 'Release one small resentment', 'Name what hurt, protect the needed boundary, and loosen your grip on replaying it.', 'REFLECT', 35),
      quest('soul-awe', 'Look beyond yourself', 'Notice something vast, beautiful, sacred, or quietly alive without photographing it.', '5 MIN', 30),
      quest('soul-review', 'Examine the day honestly', 'Where did your actions match your beliefs, and where can tomorrow be truer?', '2 QUESTIONS', 40),
    ],
    freedom: [
      quest('freedom-audit', current.freedomStage === 'control' ? 'Find one money leak' : 'Review where your money went', 'Review one recurring expense or impulse pattern and decide whether it still earns its place.', '10 MIN', 35),
      quest('freedom-save', current.freedomStage === 'control' ? 'Choose a savings floor' : 'Move money toward freedom', current.freedomStage === 'control' ? 'Choose a small amount you can protect consistently before increasing it.' : 'Set aside a realistic amount before the day gives it another job.', 'ONE TRANSFER', 40),
      quest('freedom-build', current.freedomStage === 'business' ? 'Ship something a customer can use' : current.freedomStage === 'income' ? 'Create proof of your skill' : current.consistency === 'fresh' ? 'Finish one tiny asset' : 'Ship one useful asset', 'Create something reusable: an offer, page, template, system, or piece of proof.', `${focusMinutes} MIN`, 50),
      quest('freedom-learn', 'Practice a valuable skill', `Train sales, writing, code, negotiation, or your chosen craft for ${focusMinutes} focused minutes.`, effortLabel, 45),
      quest('freedom-outreach', 'Create one opportunity', 'Send one thoughtful message that could lead to work, learning, collaboration, or a customer.', 'ONE MESSAGE', 45),
      quest('freedom-plan', 'Choose the next leverage point', 'Write the one action most likely to increase income, save time, or reduce dependence.', '5 MIN', 35),
      quest('freedom-travel', current.freedomFocus === 'financial' ? 'Price a future option' : 'Move one journey closer', current.freedomFocus === 'financial' ? 'Estimate the cost of one experience you want and give it a savings target.' : 'Research one cost, document, route, or date for a place you want to reach.', '10 MIN', 35),
      quest('freedom-system', 'Remove one repeated decision', 'Create a checklist, reminder, automation, or rule for something you solve repeatedly.', 'ONE SYSTEM', 45),
    ],
  };

  return tasks[track];
}

export function getTodayTasks(track: TrackKey, profile: OnboardingProfile | null, date = new Date()) {
  return deterministicShuffle(getTrackTasks(track, profile), `${localDateKey(date)}:${track}`).slice(0, 3);
}

export function getDailyQuests(profile: OnboardingProfile | null, date = new Date()) {
  const current = normalizeProfile(profile);
  const orderedTracks = [...current.priorityTracks, ...TRACKS.filter((track) => !current.priorityTracks.includes(track))];
  const coreQuests = orderedTracks.map((track) => getTodayTasks(track, current, date)[0]);
  if (current.time === 'ten') return coreQuests;
  const anchor = getTodayTasks(current.priorityTracks[0], current, date)[1];
  return [coreQuests[0], { ...anchor, meta: `ANCHOR · ${anchor.meta}` }, ...coreQuests.slice(1)];
}

export const BOOKS: Book[] = [
  { id: 'mind-deep-work', track: 'mind', tier: 'deeper', title: 'Deep Work', author: 'Cal Newport', promise: 'Build the ability to concentrate without distraction.', practice: 'Schedule one protected focus block and define its finish line.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep'] },
  { id: 'mind-meditations', track: 'mind', tier: 'deeper', title: 'Meditations', author: 'Marcus Aurelius', promise: 'Separate what you control from what you merely react to.', practice: 'Name one controllable response before the day begins.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'mind-atomic-habits', track: 'mind', tier: 'starter', title: 'Atomic Habits', author: 'James Clear', promise: 'Turn identity into small, repeatable systems.', practice: 'Make one good action obvious and one distraction harder to reach.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'mind-courage', track: 'mind', tier: 'starter', title: 'The Courage to Be Disliked', author: 'Ichiro Kishimi & Fumitake Koga', promise: 'Question the need to live for other people’s approval.', practice: 'Make one honest choice without rehearsing how it will look.', journeyDays: 12, readingStyles: ['mixed', 'deep'] },
  { id: 'body-built-to-move', track: 'body', tier: 'starter', title: 'Built to Move', author: 'Kelly & Juliet Starrett', promise: 'Use simple movement practices to protect everyday capacity.', practice: 'Choose one mobility test and practice its related movement.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'body-spark', track: 'body', tier: 'deeper', title: 'Spark', author: 'John J. Ratey', promise: 'Understand how movement supports learning, mood, and attention.', practice: 'Place a short walk before the work that needs your clearest mind.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'body-outlive', track: 'body', tier: 'deeper', title: 'Outlive', author: 'Peter Attia with Bill Gifford', promise: 'Think about health through long-term capacity instead of quick fixes.', practice: 'Choose one strength, aerobic, or recovery behavior to track this week.', journeyDays: 21, readingStyles: ['deep'] },
  { id: 'body-comfort-crisis', track: 'body', tier: 'starter', title: 'The Comfort Crisis', author: 'Michael Easter', promise: 'Use chosen difficulty to expand physical and mental capacity.', practice: 'Choose one safe inconvenience instead of the easiest available option.', journeyDays: 10, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'soul-meaning', track: 'soul', tier: 'starter', title: 'Man’s Search for Meaning', author: 'Viktor E. Frankl', promise: 'Explore meaning as a way of meeting suffering and responsibility.', practice: 'Write the responsibility that your present situation is asking you to carry.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'soul-joy', track: 'soul', tier: 'starter', title: 'The Book of Joy', author: 'Dalai Lama, Desmond Tutu & Douglas Abrams', promise: 'Practice perspective, humility, humor, gratitude, and compassion.', practice: 'Use one difficult moment as a cue to widen your perspective.', journeyDays: 12, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'soul-road', track: 'soul', tier: 'deeper', title: 'The Road Less Traveled', author: 'M. Scott Peck', promise: 'Connect discipline, love, responsibility, and spiritual growth.', practice: 'Face one necessary discomfort instead of postponing it.', journeyDays: 14, readingStyles: ['mixed', 'deep'] },
  { id: 'soul-quran', track: 'soul', tier: 'deeper', title: 'The Qur’an', author: 'Sacred text', promise: 'Deepen reflection through the scripture at the center of Islamic faith.', practice: 'Read a short passage with trusted commentary, then write one action it calls for.', journeyDays: 21, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['islam'] },
  { id: 'soul-bible', track: 'soul', tier: 'deeper', title: 'The Bible', author: 'Sacred text', promise: 'Deepen reflection through the scripture at the center of Christian faith.', practice: 'Read a short passage with trusted commentary, then write one action it calls for.', journeyDays: 21, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['christianity'] },
  { id: 'soul-gita', track: 'soul', tier: 'deeper', title: 'The Bhagavad Gita', author: 'Sacred text', promise: 'Reflect on duty, action, devotion, and the nature of the self.', practice: 'Read a short passage with trusted commentary and connect it to today’s duty.', journeyDays: 18, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['hinduism'] },
  { id: 'soul-dhammapada', track: 'soul', tier: 'deeper', title: 'The Dhammapada', author: 'Buddhist scripture', promise: 'Reflect on attention, conduct, suffering, and liberation.', practice: 'Carry one verse into the day and notice where it changes your response.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep'], beliefStyles: ['faith', 'reflection'], faithTraditions: ['buddhism'] },
  { id: 'freedom-money', track: 'freedom', tier: 'starter', title: 'The Psychology of Money', author: 'Morgan Housel', promise: 'Understand how behavior shapes financial outcomes.', practice: 'Write one money rule that protects you from your worst impulse.', journeyDays: 12, readingStyles: ['practical', 'mixed', 'exercises'], freedomFocuses: ['financial', 'both'] },
  { id: 'freedom-company', track: 'freedom', tier: 'deeper', title: 'Company of One', author: 'Paul Jarvis', promise: 'Build a resilient business without treating growth as the only goal.', practice: 'Define what “enough” would look like for one business metric.', journeyDays: 12, readingStyles: ['practical', 'mixed', 'deep'], freedomFocuses: ['financial', 'both'] },
  { id: 'freedom-vagabonding', track: 'freedom', tier: 'starter', title: 'Vagabonding', author: 'Rolf Potts', promise: 'Treat long-term travel as a deliberate life choice rather than an escape.', practice: 'Estimate the time and money needed for one meaningful journey.', journeyDays: 10, readingStyles: ['practical', 'mixed'], freedomFocuses: ['mobility', 'both'] },
  { id: 'freedom-almanack', track: 'freedom', tier: 'deeper', title: 'The Almanack of Naval Ravikant', author: 'Eric Jorgenson', promise: 'Explore leverage, specific knowledge, judgment, and ownership.', practice: 'Identify one skill that feels natural to you and useful to other people.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep'], freedomFocuses: ['financial', 'both'] },
  { id: 'freedom-four-hour', track: 'freedom', tier: 'deeper', title: 'The 4-Hour Workweek', author: 'Timothy Ferriss', promise: 'Question default assumptions about work, mobility, and time.', practice: 'Remove, automate, or shorten one repeated low-value task.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep', 'exercises'], freedomFocuses: ['mobility', 'both'] },
];

export function getRecommendedBooks(track: TrackKey, profile: OnboardingProfile | null, limit = 3) {
  const current = normalizeProfile(profile);
  const effectiveLimit = current.readingStyle === 'exercises' ? Math.min(limit, 2) : limit;
  const ranked = BOOKS
    .filter((book) => book.track === track)
    .filter((book) => !book.faithTraditions || (current.faithTradition ? book.faithTraditions.includes(current.faithTradition) : false))
    .map((book, index) => {
      let score = 0;
      if (book.readingStyles.includes(current.readingStyle)) score += 4;
      if (book.beliefStyles?.includes(current.beliefs)) score += 3;
      if (book.faithTraditions?.includes(current.faithTradition as FaithTradition)) score += 5;
      if (book.freedomFocuses?.includes(current.freedomFocus)) score += 4;
      if (current.priorityTracks.includes(track)) score += 1;
      return { book, score, index };
    })
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const preferredTier: BookTier = current.readingStyle === 'deep' ? 'deeper' : 'starter';
  const first = ranked.find(({ book }) => book.tier === preferredTier);
  const second = ranked.find(({ book }) => book.tier !== preferredTier);
  const balanced = [first, second, ...ranked].filter((item, index, all): item is NonNullable<typeof item> => Boolean(item) && all.findIndex((candidate) => candidate?.book.id === item?.book.id) === index);
  return balanced.slice(0, effectiveLimit).map(({ book }) => book);
}

export function getBookReason(book: Book, profile: OnboardingProfile | null) {
  const current = normalizeProfile(profile);
  if (book.faithTraditions?.includes(current.faithTradition as FaithTradition)) {
    return 'You asked for a faith-rooted Soul path that respects your tradition.';
  }
  if (book.track === 'mind') {
    if (current.readingStyle === 'exercises') return 'You prefer practice over heavy reading, so this starts with actions you can use immediately.';
    if (current.mindState === 'scattered') return 'You said your attention feels scattered; this helps you reclaim what your mind returns to.';
    if (current.mindState === 'stressed') return 'You described a heavy mind; this offers a more deliberate way to meet thought and pressure.';
    return current.readingStyle === 'deep' ? 'You asked for demanding ideas that sharpen an already steady mind.' : 'This matches your goal of making clear thinking more consistent.';
  }
  if (book.track === 'body') {
    if (current.movementLimit !== 'none') return 'This supports physical capacity while your movement quests remain inside your known safe range.';
    if (current.sleepQuality === 'poor') return 'You said recovery is unreliable; this connects physical progress to the habits beneath it.';
    return current.ability === 'starting' ? 'This gives you an approachable foundation for building a body you can rely on.' : 'This matches your readiness to understand and extend physical capacity.';
  }
  if (book.track === 'soul') {
    if (current.beliefs === 'service') return 'You find meaning through other people, so this turns conviction into how you show up.';
    if (current.beliefs === 'reflection') return 'You chose reflection, so this examines meaning without forcing a borrowed belief system.';
    if (current.beliefs === 'open') return 'You are still exploring; this creates questions and practices without demanding certainty.';
    return 'You asked for a Soul path grounded in belief and lived conviction.';
  }
  if (current.freedomFocus === 'mobility') return 'You defined freedom as control over place and time, so this moves mobility from dream to plan.';
  if (current.freedomStage === 'business') return 'You are building a business; this focuses on ownership, leverage, and systems.';
  if (current.freedomStage === 'income') return 'You want to increase income; this connects valuable skills to greater autonomy.';
  return 'You want more financial room, so this starts with behavior and decisions before complexity.';
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({
    completedToday: [],
    totalCompleted: 0,
    xpByTrack: emptyXp(),
    completedDates: [],
    lastActiveDate: todayKey(),
    profile: null,
    lastLevelUp: null,
    dailyXp: {},
    hapticsEnabled: true,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as StoredState;
        const today = todayKey();
        const legacyCompleted = Array.isArray(parsed.completed) ? parsed.completed : [];
        const xpByTrack = { ...emptyXp(), ...(parsed.xpByTrack ?? {}) };
        setState({
          completedToday: parsed.lastActiveDate === today ? (parsed.completedToday ?? legacyCompleted) : [],
          totalCompleted: parsed.totalCompleted ?? legacyCompleted.length,
          xpByTrack,
          completedDates: parsed.completedDates ?? [],
          lastActiveDate: today,
          profile: parsed.profile ? normalizeProfile(parsed.profile) : null,
          lastLevelUp: parsed.lastLevelUp ?? null,
          dailyXp: parsed.dailyXp ?? {},
          hapticsEnabled: parsed.hapticsEnabled ?? true,
        });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo<ProgressContextValue>(() => {
    const totalXp = Object.values(state.xpByTrack).reduce((sum, xp) => sum + xp, 0);
    const level = Math.floor(totalXp / 250) + 1;
    const levelProgress = (totalXp % 250) / 250;
    const currentStreak = calculateStreak(state.completedDates);

    return {
      completedToday: state.completedToday,
      profile: state.profile,
      hydrated,
      isComplete: (id) => state.completedToday.includes(id),
      toggle: (id, track, xp) => {
        setState((current) => {
          const exists = current.completedToday.includes(id);
          if (current.hapticsEnabled) void Haptics.selectionAsync();
          const completedToday = exists
            ? current.completedToday.filter((item) => item !== id)
            : [...current.completedToday, id];
          const hadAllPaths = TRACKS.every((path) => current.completedToday.some((item) => item.startsWith(TRACK_PREFIXES[path])));
          const hasAllPaths = TRACKS.every((path) => completedToday.some((item) => item.startsWith(TRACK_PREFIXES[path])));
          const dailyReward = !exists && !hadAllPaths && hasAllPaths ? 50 : 0;
          const xpChange = exists ? -xp : xp + dailyReward;
          const previousTotalXp = Object.values(current.xpByTrack).reduce((sum, xp) => sum + xp, 0);
          const nextTotalXp = previousTotalXp + xpChange;
          const previousLevel = Math.floor(previousTotalXp / 250) + 1;
          const nextLevel = Math.floor(nextTotalXp / 250) + 1;
          const leveledUp = nextLevel > previousLevel;
          const date = todayKey();
          const dailyXp = {
            ...current.dailyXp,
            [date]: Math.max(0, (current.dailyXp[date] ?? 0) + xpChange),
          };
          const completedDates = exists
            ? current.completedDates
            : current.completedDates.includes(date)
            ? current.completedDates
            : [...current.completedDates, date];
          return {
            ...current,
            completedToday,
            totalCompleted: Math.max(0, current.totalCompleted + (exists ? -1 : 1)),
            xpByTrack: { ...current.xpByTrack, [track]: Math.max(0, current.xpByTrack[track] + xpChange) },
            completedDates,
            lastActiveDate: date,
            lastLevelUp: leveledUp ? nextLevel : current.lastLevelUp,
            dailyXp,
          };
        });
      },
      setProfile: (profile) => setState((current) => ({ ...current, profile: normalizeProfile(profile) })),
      resetOnboarding: () => setState((current) => ({ ...current, profile: null })),
      totalCompleted: state.totalCompleted,
      totalXp,
      level,
      levelProgress,
      currentStreak,
      trackCompleted: (track) => state.completedToday.filter((id) => id.startsWith(TRACK_PREFIXES[track])).length,
      trackXp: (track) => state.xpByTrack[track],
      achievements: [
        ...(state.totalCompleted >= 1 ? ['First quest complete'] : []),
        ...(TRACKS.every((track) => state.completedToday.some((id) => id.startsWith(TRACK_PREFIXES[track]))) ? ['Four paths, one direction'] : []),
        ...(currentStreak >= 3 ? ['Three-day momentum'] : []),
        ...(totalXp >= 500 ? ['Becoming consistent'] : []),
      ],
      lastLevelUp: state.lastLevelUp,
      clearLevelUp: () => setState((current) => ({ ...current, lastLevelUp: null })),
      weeklyXp: getWeeklyXp(state.dailyXp),
      hapticsEnabled: state.hapticsEnabled,
      setHapticsEnabled: (enabled) => setState((current) => ({ ...current, hapticsEnabled: enabled })),
    };
  }, [hydrated, state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
