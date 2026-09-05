import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

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
export type Archetype = 'guardian' | 'scholar' | 'builder' | 'pilgrim' | 'sovereign';
export type MomentumObstacle = 'distraction' | 'energy' | 'clarity' | 'belief' | 'overwhelm' | 'alone' | 'narrow';
export type CoachingStyle = 'demanding' | 'encouraging' | 'adaptive' | 'direct';
export type FastingPreference = 'off' | 'curious' | 'experienced';
export type FastingSafety = 'clear' | 'blocked' | 'clinician';
export type TraitKey = 'wit' | 'adaptability' | 'courage' | 'social' | 'creativity' | 'practical';
export type QuestKind = 'path' | 'anchor' | 'cross-training' | 'recovery';
export type AdaptivePace = 'foundation' | 'recovery' | 'steady' | 'stretch';

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
  archetype: Archetype;
  momentumObstacle: MomentumObstacle;
  coachingStyle: CoachingStyle;
  fastingPreference: FastingPreference;
  fastingSafety: FastingSafety;
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
  trait?: TraitKey;
  kind?: QuestKind;
  adaptivePace?: AdaptivePace;
};

export type FastingSession = {
  startedAt: string;
  endedAt: string;
  minutes: number;
  targetHours: number;
};

export type CompletionEvent = {
  questId: string;
  date: string;
  completedAt: string;
  track: TrackKey;
  trait?: TraitKey;
  xp: number;
};

export type AdaptivePlan = {
  date: string;
  mode: AdaptivePace;
  observedDays: number;
  completionRate: number;
  weakestTrack: TrackKey;
  weakestTrait: TraitKey;
  paceByTrack: Record<TrackKey, AdaptivePace>;
  recentQuestIds: string[];
  reason: string;
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
  includedPdf?: true;
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
  xpByTrait?: Partial<Record<TraitKey, number>>;
  cycleStartedAt?: string;
  fastingStartedAt?: string | null;
  fastingSessions?: FastingSession[];
  completionHistory?: CompletionEvent[];
  observedDates?: string[];
  dailyRewardDates?: string[];
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
  xpByTrait: Record<TraitKey, number>;
  cycleStartedAt: string;
  fastingStartedAt: string | null;
  fastingSessions: FastingSession[];
  completionHistory: CompletionEvent[];
  observedDates: string[];
  dailyRewardDates: string[];
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
  toggle: (id: string, track: TrackKey, xp: number, trait?: TraitKey) => void;
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
  traitXp: (trait: TraitKey) => number;
  cycleStartedAt: string;
  fastingStartedAt: string | null;
  fastingSessions: FastingSession[];
  adaptivePlan: AdaptivePlan;
  planDate: Date;
  startFast: () => void;
  finishFast: () => void;
  cancelFast: () => void;
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
  archetype: 'sovereign',
  momentumObstacle: 'distraction',
  coachingStyle: 'adaptive',
  fastingPreference: 'off',
  fastingSafety: 'blocked',
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

function emptyTraitXp(): Record<TraitKey, number> {
  return { wit: 0, adaptability: 0, courage: 0, social: 0, creativity: 0, practical: 0 };
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

export const ADAPTIVE_PACE_META: Record<AdaptivePace, { label: string; detail: string; color: string }> = {
  foundation: { label: 'Learning you', detail: 'Your onboarding answers set the starting level.', color: '#55D6FF' },
  recovery: { label: 'Reduce friction', detail: 'The plan is shrinking the first step so returning feels possible.', color: '#FFCC66' },
  steady: { label: 'Build consistency', detail: 'The workload is holding steady while your evidence accumulates.', color: '#4CD6B0' },
  stretch: { label: 'Raise the standard', detail: 'Your recent consistency supports a slightly deeper challenge.', color: '#8D7CFF' },
};

export function buildAdaptivePlan(
  history: CompletionEvent[],
  observedDates: string[],
  profile: OnboardingProfile | null,
  date = new Date(),
): AdaptivePlan {
  const current = normalizeProfile(profile);
  const today = localDateKey(date);
  const analysisDates = Array.from(new Set(observedDates.filter((day) => day < today))).sort().slice(-14);
  const dateSet = new Set(analysisDates);
  const recentHistory = history.filter((event) => dateSet.has(event.date));
  const pathHistory = recentHistory.filter((event) => !event.trait);
  const observedDays = analysisDates.length;
  const practicedPathDays = new Set(pathHistory.map((event) => `${event.date}:${event.track}`));
  const completionRate = observedDays === 0 ? 0 : practicedPathDays.size / (observedDays * TRACKS.length);
  const hasSignal = observedDays >= 3;
  const trackCounts = TRACKS.reduce((counts, track) => ({ ...counts, [track]: new Set(pathHistory.filter((event) => event.track === track).map((event) => event.date)).size }), emptyXp());
  const traitKeys = Object.keys(emptyTraitXp()) as TraitKey[];
  const traitCounts = traitKeys.reduce((counts, trait) => ({ ...counts, [trait]: recentHistory.filter((event) => event.trait === trait).length }), emptyTraitXp());
  const trackOrder = deterministicShuffle(TRACKS, `${today}:adaptive-track-tie`);
  const weakestTrack = hasSignal
    ? [...trackOrder].sort((left, right) => trackCounts[left] - trackCounts[right])[0]
    : current.priorityTracks[0];
  const traitOrder = deterministicShuffle(traitKeys, `${today}:adaptive-trait-tie`);
  const weakestTrait = hasSignal
    ? [...traitOrder].sort((left, right) => traitCounts[left] - traitCounts[right])[0]
    : traitOrder[0];
  const paceFor = (track: TrackKey): AdaptivePace => {
    if (!hasSignal) return 'foundation';
    const rate = trackCounts[track] / Math.max(1, observedDays);
    if (rate < 0.45) return 'recovery';
    if (track !== 'body' && observedDays >= 5 && rate >= 0.8) return 'stretch';
    return 'steady';
  };
  const paceByTrack = TRACKS.reduce((paces, track) => ({ ...paces, [track]: paceFor(track) }), {} as Record<TrackKey, AdaptivePace>);
  const mode: AdaptivePace = !hasSignal ? 'foundation' : completionRate < 0.45 ? 'recovery' : completionRate >= 0.78 && observedDays >= 5 ? 'stretch' : 'steady';
  const reason = !hasSignal
    ? 'Your onboarding answers set the baseline. Once you have visited on three previous days, your recorded practice begins shaping the plan.'
    : mode === 'recovery'
    ? `Recent follow-through is ${Math.round(completionRate * 100)}%. Today lowers friction and puts ${weakestTrack} first.`
    : mode === 'stretch'
    ? `You practiced ${Math.round(completionRate * 100)}% of your daily paths on recorded days. Focus exercises can go a little deeper within your chosen time.`
    : `${weakestTrack} has the least recent practice, so it receives today’s first position and adaptive emphasis.`;
  const recentQuestIds = [...recentHistory]
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt))
    .map((event) => event.questId)
    .filter((id, index, all) => all.indexOf(id) === index)
    .slice(0, 24);
  return { date: today, mode, observedDays, completionRate, weakestTrack, weakestTrait, paceByTrack, recentQuestIds, reason };
}

export const ARCHETYPE_META: Record<Archetype, { label: string; evolved: string; description: string; icon: string; color: string }> = {
  guardian: { label: 'Guardian', evolved: 'Steadfast Guardian', description: 'Capability, courage, and responsibility.', icon: 'shield', color: '#4CD6B0' },
  scholar: { label: 'Scholar', evolved: 'Focused Scholar', description: 'Attention, understanding, and clear judgment.', icon: 'book-open', color: '#55D6FF' },
  builder: { label: 'Builder', evolved: 'Sovereign Builder', description: 'Useful skills, systems, and independence.', icon: 'tool', color: '#8D7CFF' },
  pilgrim: { label: 'Pilgrim', evolved: 'Grounded Pilgrim', description: 'Belief, meaning, and honest exploration.', icon: 'compass', color: '#FFCC66' },
  sovereign: { label: 'Sovereign', evolved: 'Integrated Sovereign', description: 'Balanced command of the whole life.', icon: 'hexagon', color: '#6DE3FF' },
};

export const TRAIT_META: Record<TraitKey, { label: string; description: string; color: string; icon: string }> = {
  wit: { label: 'Wit', description: 'Notice surprise and communicate with lightness.', color: '#F59ED7', icon: 'smile' },
  adaptability: { label: 'Adaptability', description: 'Change strategy without abandoning the aim.', color: '#55D6FF', icon: 'shuffle' },
  courage: { label: 'Courage', description: 'Move toward useful discomfort with judgment.', color: '#FF8A65', icon: 'shield' },
  social: { label: 'Social intelligence', description: 'Listen, read the room, and strengthen trust.', color: '#FFCC66', icon: 'users' },
  creativity: { label: 'Creativity', description: 'Generate options and connect distant ideas.', color: '#8D7CFF', icon: 'aperture' },
  practical: { label: 'Practical ability', description: 'Solve real problems with tools and systems.', color: '#4CD6B0', icon: 'tool' },
};

export const CYCLE_CHAPTERS = [
  { title: 'Foundation', detail: 'Make returning easier than quitting.' },
  { title: 'Attention', detail: 'Choose what is allowed to shape you.' },
  { title: 'Capability', detail: 'Build energy, strength, and useful skill.' },
  { title: 'Conviction', detail: 'Turn values and belief into visible action.' },
  { title: 'Adaptation', detail: 'Respond intelligently when conditions change.' },
  { title: 'Integration', detail: 'Carry every path as one coherent life.' },
] as const;

export function getCycleProgress(cycleStartedAt: string, date = new Date()) {
  const start = new Date(`${cycleStartedAt}T12:00:00`);
  const current = new Date(date);
  current.setHours(12, 0, 0, 0);
  const elapsedDays = Math.max(0, Math.floor((current.getTime() - start.getTime()) / 86_400_000));
  const day = (elapsedDays % 42) + 1;
  const cycle = Math.floor(elapsedDays / 42) + 1;
  const chapterIndex = Math.floor((day - 1) / 7);
  return { day, cycle, chapterIndex, progress: day / 42, chapter: CYCLE_CHAPTERS[chapterIndex] };
}

export function getEvolutionIdentity(profile: OnboardingProfile | null) {
  const current = normalizeProfile(profile);
  const currentForms: Record<MomentumObstacle, string> = {
    distraction: 'Scattered Seeker', energy: 'Depleted Striver', clarity: 'Unmapped Explorer',
    belief: 'Unanchored Pilgrim', overwhelm: 'Overloaded Builder', alone: 'Solitary Starter', narrow: 'Specialized Striver',
  };
  return { current: currentForms[current.momentumObstacle], next: ARCHETYPE_META[current.archetype].evolved };
}

export function getTrackTasks(track: TrackKey, profile: OnboardingProfile | null, adaptive?: AdaptivePlan): Quest[] {
  const current = normalizeProfile(profile);
  const adaptivePace = adaptive?.paceByTrack[track] ?? 'foundation';
  const effortLabel = adaptivePace === 'recovery' ? 'RECOVERY REP' : adaptivePace === 'stretch' ? 'STRETCH' : current.ability === 'starting' ? 'STARTER' : current.ability === 'advanced' ? 'DEEPEN' : 'BUILD';
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
  const adaptiveBonus = adaptivePace === 'stretch' ? 5 : 0;
  const quest = (id: string, title: string, detail: string, meta: string, xp: number): Quest => ({
    id,
    track,
    title,
    detail,
    meta,
    xp: xp + priorityBonus + adaptiveBonus,
    trackColor: trackColors[track],
    trackIcon: trackIcons[track],
    adaptivePace,
  });
  const scaleMinutes = (minutes: number) => adaptivePace === 'recovery' ? Math.max(2, Math.round(minutes * 0.6)) : minutes;
  const shortMinutes = scaleMinutes(current.time === 'ten' ? 5 : current.time === 'forty' ? 20 : 10);
  const focusMinutes = scaleMinutes(current.time === 'ten' ? 10 : current.time === 'forty' ? 40 : 20);
  const baseRounds = current.ability === 'starting' ? 1 : current.ability === 'advanced' ? 4 : 2;
  const strengthRounds = Math.max(1, baseRounds - (adaptivePace === 'recovery' ? 1 : 0));
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

  return tasks[track].map((task) => {
    if (adaptivePace === 'stretch' && track !== 'body') {
      const deeper: Record<Exclude<TrackKey, 'body'>, string> = {
        mind: 'Use the final minute to explain the idea from memory and name one application.',
        soul: 'Close by naming one action that will put this reflection into practice.',
        freedom: 'Finish with one concrete output and a clear next step.',
      };
      return { ...task, detail: `${task.detail} ${deeper[track]}`, meta: `DEEPER · ${task.meta}` };
    }
    if (adaptivePace === 'recovery') return { ...task, detail: `${task.detail} Keep this to one small, comfortable attempt; partial scope counts.`, meta: `LIGHTER · ${task.meta}` };
    return task;
  });
}

export function getTodayTasks(track: TrackKey, profile: OnboardingProfile | null, date = new Date(), adaptive?: AdaptivePlan) {
  const tasks = deterministicShuffle(getTrackTasks(track, profile, adaptive), `${localDateKey(date)}:${track}`);
  if (!adaptive?.recentQuestIds.length) return tasks.slice(0, 3);
  return tasks.sort((left, right) => {
    const leftRecent = adaptive.recentQuestIds.indexOf(left.id);
    const rightRecent = adaptive.recentQuestIds.indexOf(right.id);
    if (leftRecent === -1 && rightRecent !== -1) return -1;
    if (rightRecent === -1 && leftRecent !== -1) return 1;
    return rightRecent - leftRecent;
  }).slice(0, 3);
}

export function getTodayCrossTraining(profile: OnboardingProfile | null, date = new Date(), adaptive?: AdaptivePlan): Quest {
  const current = normalizeProfile(profile);
  const cue: Record<CoachingStyle, string> = {
    demanding: 'Finish the rep. No negotiation.',
    encouraging: 'Keep it light, honest, and complete.',
    adaptive: 'Reduce the scope if needed, but make the attempt.',
    direct: 'Do it before the day gets noisy.',
  };
  const pools: Record<TraitKey, Array<{ id: string; track: TrackKey; title: string; detail: string }>> = {
    wit: [
      { id: 'angle', track: 'mind', title: 'Find the unexpected angle', detail: 'Take one ordinary annoyance and write three playful comparisons for it.' },
      { id: 'story', track: 'soul', title: 'Tell a story with a turn', detail: 'Retell one small event with a clear setup, one vivid detail, and a surprising ending.' },
      { id: 'observe', track: 'mind', title: 'Collect comic observations', detail: 'Notice three harmless contradictions or absurd details in ordinary life.' },
    ],
    adaptability: [
      { id: 'backup', track: 'mind', title: 'Build a second route', detail: 'Choose today’s main plan and write one smaller version that still counts.' },
      { id: 'constraint', track: 'freedom', title: 'Create under constraint', detail: 'Solve one task using half the time, tools, or steps you normally expect.' },
      { id: 'reframe', track: 'mind', title: 'Ask what is still possible', detail: 'Name one changed condition, then list three useful moves that remain.' },
    ],
    courage: [
      { id: 'avoided', track: 'soul', title: 'Approach one avoided action', detail: 'Take the smallest respectful step toward something useful you have delayed.' },
      { id: 'preference', track: 'soul', title: 'State one honest preference', detail: 'Express what you genuinely prefer without aggression or apology.' },
      { id: 'ask', track: 'freedom', title: 'Make the clean ask', detail: 'Request the information, opportunity, feedback, or help you actually need.' },
    ],
    social: [
      { id: 'follow-up', track: 'soul', title: 'Ask the second question', detail: 'Listen fully, then ask one follow-up that proves you heard the first answer.' },
      { id: 'detail', track: 'soul', title: 'Remember one human detail', detail: 'Recall something important to another person and check in without an agenda.' },
      { id: 'appreciation', track: 'soul', title: 'Give precise appreciation', detail: 'Thank someone for a specific action and explain why it mattered.' },
    ],
    creativity: [
      { id: 'ten-uses', track: 'mind', title: 'Generate ten uses', detail: 'Choose an everyday object or idea and invent ten different uses for it.' },
      { id: 'collision', track: 'mind', title: 'Combine distant ideas', detail: 'Join two unrelated interests and sketch one product, story, or solution.' },
      { id: 'versions', track: 'freedom', title: 'Make three versions', detail: 'Create a safe, bold, and strange version of the same idea before choosing.' },
    ],
    practical: [
      { id: 'repair', track: 'freedom', title: 'Learn one useful repair', detail: 'Understand or complete one small household, digital, or administrative fix.' },
      { id: 'checklist', track: 'freedom', title: 'Turn memory into a checklist', detail: 'Write the repeatable steps for something you keep solving from scratch.' },
      { id: 'teach-back', track: 'mind', title: 'Explain how it works', detail: 'Choose one tool you use and explain its mechanism in plain language.' },
    ],
  };
  const traits = Object.keys(TRAIT_META) as TraitKey[];
  const trait = adaptive && adaptive.observedDays >= 3 ? adaptive.weakestTrait : deterministicShuffle(traits, `${localDateKey(date)}:rounded-trait`)[0];
  const shuffledItems = deterministicShuffle(pools[trait], `${localDateKey(date)}:${trait}:exercise`);
  const item = shuffledItems.find((candidate) => !adaptive?.recentQuestIds.includes(`${candidate.track}-trait-${trait}-${candidate.id}`)) ?? shuffledItems[0];
  const meta = TRAIT_META[trait];
  return {
    id: `${item.track}-trait-${trait}-${item.id}`,
    track: item.track,
    title: item.title,
    detail: `${item.detail} ${cue[current.coachingStyle]}`,
    meta: `${meta.label.toUpperCase()} · 5 MIN`,
    xp: 30,
    trackColor: meta.color,
    trackIcon: meta.icon,
    trait,
    kind: 'cross-training',
    adaptivePace: adaptive?.mode ?? 'foundation',
  };
}

export function getFastingTargetHours(profile: OnboardingProfile | null) {
  const current = normalizeProfile(profile);
  return current.fastingPreference === 'experienced' ? 14 : 12;
}

export function getDailyQuests(profile: OnboardingProfile | null, date = new Date(), adaptive?: AdaptivePlan) {
  const current = normalizeProfile(profile);
  const adaptiveLead = adaptive && adaptive.observedDays >= 3 ? [adaptive.weakestTrack] : [];
  const orderedTracks = Array.from(new Set([...adaptiveLead, ...current.priorityTracks, ...TRACKS])) as TrackKey[];
  const coreQuests = orderedTracks.map((track) => ({ ...getTodayTasks(track, current, date, adaptive)[0], kind: 'path' as const }));
  const coachingCue: Record<CoachingStyle, string> = {
    demanding: 'Complete the clean rep. No negotiation.',
    encouraging: 'A small, complete attempt is real progress.',
    adaptive: 'Reduce the scope if needed; keep the return.',
    direct: 'Start before you negotiate with it.',
  };
  const leadCue = adaptive?.paceByTrack[orderedTracks[0]] === 'recovery' ? 'Begin with the smallest useful step. Returning is enough today.' : coachingCue[current.coachingStyle];
  coreQuests[0] = { ...coreQuests[0], detail: `${coreQuests[0].detail} ${leadCue}` };
  const crossTraining = getTodayCrossTraining(current, date, adaptive);
  if (current.time !== 'forty' || adaptive?.mode === 'recovery') return [...coreQuests, crossTraining];
  const anchorTrack = adaptive?.weakestTrack ?? current.priorityTracks[0];
  const anchor = getTodayTasks(anchorTrack, current, date, adaptive)[1];
  return [coreQuests[0], { ...anchor, kind: 'anchor', meta: `ANCHOR · ${anchor.meta}` }, ...coreQuests.slice(1), crossTraining];
}

export const BOOKS: Book[] = [
  { id: 'guide-mind-last-fortress', track: 'mind', tier: 'starter', title: 'The Last Fortress', author: 'Growth Path', promise: 'A seven-day field guide for reclaiming attention, choosing your inputs, and strengthening deliberate thought.', practice: 'Complete the attention audit and choose one boundary that protects your mind today.', journeyDays: 7, readingStyles: ['practical', 'mixed', 'deep', 'exercises'], includedPdf: true },
  { id: 'mind-deep-work', track: 'mind', tier: 'deeper', title: 'Deep Work', author: 'Cal Newport', promise: 'Build the ability to concentrate without distraction.', practice: 'Schedule one protected focus block and define its finish line.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep'] },
  { id: 'mind-meditations', track: 'mind', tier: 'deeper', title: 'Meditations', author: 'Marcus Aurelius', promise: 'Separate what you control from what you merely react to.', practice: 'Name one controllable response before the day begins.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'mind-atomic-habits', track: 'mind', tier: 'starter', title: 'Atomic Habits', author: 'James Clear', promise: 'Turn identity into small, repeatable systems.', practice: 'Make one good action obvious and one distraction harder to reach.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'mind-courage', track: 'mind', tier: 'starter', title: 'The Courage to Be Disliked', author: 'Ichiro Kishimi & Fumitake Koga', promise: 'Question the need to live for other people’s approval.', practice: 'Make one honest choice without rehearsing how it will look.', journeyDays: 12, readingStyles: ['mixed', 'deep'] },
  { id: 'guide-body-capability', track: 'body', tier: 'starter', title: 'Physical Capability', author: 'Growth Path', promise: 'A seven-day field guide for building strength, energy, movement, and recovery from your real starting point.', practice: 'Take the capability baseline and choose the smallest repeatable movement session.', journeyDays: 7, readingStyles: ['practical', 'mixed', 'deep', 'exercises'], includedPdf: true },
  { id: 'body-built-to-move', track: 'body', tier: 'starter', title: 'Built to Move', author: 'Kelly & Juliet Starrett', promise: 'Use simple movement practices to protect everyday capacity.', practice: 'Choose one mobility test and practice its related movement.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'body-spark', track: 'body', tier: 'deeper', title: 'Spark', author: 'John J. Ratey', promise: 'Understand how movement supports learning, mood, and attention.', practice: 'Place a short walk before the work that needs your clearest mind.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'body-outlive', track: 'body', tier: 'deeper', title: 'Outlive', author: 'Peter Attia with Bill Gifford', promise: 'Think about health through long-term capacity instead of quick fixes.', practice: 'Choose one strength, aerobic, or recovery behavior to track this week.', journeyDays: 21, readingStyles: ['deep'] },
  { id: 'body-comfort-crisis', track: 'body', tier: 'starter', title: 'The Comfort Crisis', author: 'Michael Easter', promise: 'Use chosen difficulty to expand physical and mental capacity.', practice: 'Choose one safe inconvenience instead of the easiest available option.', journeyDays: 10, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'guide-soul-conviction', track: 'soul', tier: 'starter', title: 'Lived Conviction', author: 'Growth Path', promise: 'A seven-day field guide for examining belief, clarifying values, and turning conviction into practice.', practice: 'Name one value you want your choices—not only your words—to prove today.', journeyDays: 7, readingStyles: ['practical', 'mixed', 'deep', 'exercises'], includedPdf: true },
  { id: 'soul-meaning', track: 'soul', tier: 'starter', title: 'Man’s Search for Meaning', author: 'Viktor E. Frankl', promise: 'Explore meaning as a way of meeting suffering and responsibility.', practice: 'Write the responsibility that your present situation is asking you to carry.', journeyDays: 10, readingStyles: ['mixed', 'deep'] },
  { id: 'soul-joy', track: 'soul', tier: 'starter', title: 'The Book of Joy', author: 'Dalai Lama, Desmond Tutu & Douglas Abrams', promise: 'Practice perspective, humility, humor, gratitude, and compassion.', practice: 'Use one difficult moment as a cue to widen your perspective.', journeyDays: 12, readingStyles: ['practical', 'mixed', 'exercises'] },
  { id: 'soul-road', track: 'soul', tier: 'deeper', title: 'The Road Less Traveled', author: 'M. Scott Peck', promise: 'Connect discipline, love, responsibility, and spiritual growth.', practice: 'Face one necessary discomfort instead of postponing it.', journeyDays: 14, readingStyles: ['mixed', 'deep'] },
  { id: 'soul-quran', track: 'soul', tier: 'deeper', title: 'The Qur’an', author: 'Sacred text', promise: 'Deepen reflection through the scripture at the center of Islamic faith.', practice: 'Read a short passage with trusted commentary, then write one action it calls for.', journeyDays: 21, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['islam'] },
  { id: 'soul-bible', track: 'soul', tier: 'deeper', title: 'The Bible', author: 'Sacred text', promise: 'Deepen reflection through the scripture at the center of Christian faith.', practice: 'Read a short passage with trusted commentary, then write one action it calls for.', journeyDays: 21, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['christianity'] },
  { id: 'soul-gita', track: 'soul', tier: 'deeper', title: 'The Bhagavad Gita', author: 'Sacred text', promise: 'Reflect on duty, action, devotion, and the nature of the self.', practice: 'Read a short passage with trusted commentary and connect it to today’s duty.', journeyDays: 18, readingStyles: ['mixed', 'deep'], beliefStyles: ['faith'], faithTraditions: ['hinduism'] },
  { id: 'soul-dhammapada', track: 'soul', tier: 'deeper', title: 'The Dhammapada', author: 'Buddhist scripture', promise: 'Reflect on attention, conduct, suffering, and liberation.', practice: 'Carry one verse into the day and notice where it changes your response.', journeyDays: 14, readingStyles: ['practical', 'mixed', 'deep'], beliefStyles: ['faith', 'reflection'], faithTraditions: ['buddhism'] },
  { id: 'guide-freedom-choose', track: 'freedom', tier: 'starter', title: 'The Power to Choose', author: 'Growth Path', promise: 'A seven-day field guide for creating financial room, valuable skills, and greater control over place and time.', practice: 'Define what freedom means in one concrete sentence, then identify today’s smallest leverage point.', journeyDays: 7, readingStyles: ['practical', 'mixed', 'deep', 'exercises'], freedomFocuses: ['financial', 'mobility', 'both'], includedPdf: true },
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
      if (book.includedPdf) score += 8;
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
  if (book.includedPdf) {
    return `This original Growth Path guide turns your ${book.track} answers into a seven-day practice you can begin now.`;
  }
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

export function advanceProgressDay(current: ProgressState, date = new Date()): ProgressState {
  const today = localDateKey(date);
  if (current.lastActiveDate === today && (!current.profile || current.observedDates.includes(today))) return current;
  const observedDates = Array.from(new Set([...current.observedDates, ...(current.profile ? [today] : [])])).sort().slice(-45);
  return {
    ...current,
    completedToday: current.lastActiveDate === today ? current.completedToday : [],
    lastActiveDate: today,
    observedDates,
    completionHistory: current.completionHistory.filter((event) => observedDates.includes(event.date)),
  };
}

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
    xpByTrait: emptyTraitXp(),
    cycleStartedAt: todayKey(),
    fastingStartedAt: null,
    fastingSessions: [],
    completionHistory: [],
    observedDates: [],
    dailyRewardDates: [],
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
        const xpByTrait = { ...emptyTraitXp(), ...(parsed.xpByTrait ?? {}) };
        const savedFastStartedAt = parsed.fastingStartedAt ?? null;
        const fastAge = savedFastStartedAt ? Date.now() - Date.parse(savedFastStartedAt) : Number.POSITIVE_INFINITY;
        const fastingStartedAt = fastAge >= 0 && fastAge < 24 * 60 * 60 * 1_000 ? savedFastStartedAt : null;
        const observedDates = Array.from(new Set([...(parsed.observedDates ?? []), ...(parsed.profile ? [today] : [])])).sort().slice(-45);
        const completionHistory = Array.isArray(parsed.completionHistory) ? parsed.completionHistory.filter((event) => observedDates.includes(event.date)) : [];
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
          xpByTrait,
          cycleStartedAt: parsed.cycleStartedAt ?? today,
          fastingStartedAt,
          fastingSessions: parsed.fastingSessions ?? [],
          completionHistory,
          observedDates,
          dailyRewardDates: parsed.dailyRewardDates ?? [],
        });
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const markObserved = () => setState((current) => advanceProgressDay(current));
    markObserved();
    const subscription = AppState.addEventListener('change', (nextState) => { if (nextState === 'active') markObserved(); });
    const timer = setInterval(() => { if (AppState.currentState === 'active') markObserved(); }, 60_000);
    return () => { subscription.remove(); clearInterval(timer); };
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo<ProgressContextValue>(() => {
    const totalXp = Object.values(state.xpByTrack).reduce((sum, xp) => sum + xp, 0);
    const level = Math.floor(totalXp / 250) + 1;
    const levelProgress = (totalXp % 250) / 250;
    const currentStreak = calculateStreak(state.completedDates);
    const planDate = new Date(`${state.lastActiveDate}T12:00:00`);
    const adaptivePlan = buildAdaptivePlan(state.completionHistory, state.observedDates, state.profile, planDate);

    return {
      completedToday: state.completedToday,
      profile: state.profile,
      hydrated,
      isComplete: (id) => state.completedToday.includes(id),
      toggle: (id, track, xp, trait) => {
        setState((current) => {
          // Refresh first when a tap races the midnight/foreground listener.
          if (current.lastActiveDate !== todayKey()) return advanceProgressDay(current);
          const exists = current.completedToday.includes(id);
          if (current.hapticsEnabled) void Haptics.selectionAsync();
          const completedToday = exists
            ? current.completedToday.filter((item) => item !== id)
            : [...current.completedToday, id];
          const hasAllPaths = TRACKS.every((path) => completedToday.some((item) => item.startsWith(TRACK_PREFIXES[path]) && !item.includes('-trait-')));
          const dailyReward = !exists && hasAllPaths && !current.dailyRewardDates.includes(todayKey()) ? 50 : 0;
          const recordedXp = current.completionHistory.find((event) => event.questId === id && event.date === todayKey())?.xp ?? xp;
          const xpChange = exists ? -recordedXp : xp + dailyReward;
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
          const completionHistory = exists
            ? current.completionHistory.filter((event) => !(event.questId === id && event.date === date))
            : [...current.completionHistory, { questId: id, date, completedAt: new Date().toISOString(), track, trait, xp }];
          return {
            ...current,
            completedToday,
            totalCompleted: Math.max(0, current.totalCompleted + (exists ? -1 : 1)),
            xpByTrack: { ...current.xpByTrack, [track]: Math.max(0, current.xpByTrack[track] + xpChange) },
            xpByTrait: trait ? { ...current.xpByTrait, [trait]: Math.max(0, current.xpByTrait[trait] + (exists ? -recordedXp : xp)) } : current.xpByTrait,
            completedDates,
            lastActiveDate: date,
            lastLevelUp: leveledUp ? nextLevel : current.lastLevelUp,
            dailyXp,
            completionHistory,
            dailyRewardDates: dailyReward ? [...current.dailyRewardDates, date].slice(-45) : current.dailyRewardDates,
            observedDates: current.observedDates.includes(date) ? current.observedDates : [...current.observedDates, date].slice(-45),
          };
        });
      },
      setProfile: (profile) => setState((current) => advanceProgressDay({ ...current, profile: normalizeProfile(profile) })),
      resetOnboarding: () => setState((current) => ({ ...current, profile: null, fastingStartedAt: null })),
      totalCompleted: state.totalCompleted,
      totalXp,
      level,
      levelProgress,
      currentStreak,
      trackCompleted: (track) => getTodayTasks(track, state.profile, planDate, adaptivePlan).filter((task) => state.completedToday.includes(task.id)).length,
      trackXp: (track) => state.xpByTrack[track],
      achievements: [
        ...(state.totalCompleted >= 1 ? ['First quest complete'] : []),
        ...(TRACKS.every((track) => state.completedToday.some((id) => id.startsWith(TRACK_PREFIXES[track]) && !id.includes('-trait-'))) ? ['Four paths, one direction'] : []),
        ...(currentStreak >= 3 ? ['Three-day momentum'] : []),
        ...(Object.values(state.xpByTrait).some((xp) => xp > 0) ? ['Cross-trained'] : []),
        ...(Object.values(state.xpByTrait).every((xp) => xp > 0) ? ['Rounded apprentice'] : []),
        ...(adaptivePlan.observedDays >= 3 ? ['Plan learned your rhythm'] : []),
        ...(totalXp >= 500 ? ['Becoming consistent'] : []),
      ],
      lastLevelUp: state.lastLevelUp,
      clearLevelUp: () => setState((current) => ({ ...current, lastLevelUp: null })),
      weeklyXp: getWeeklyXp(state.dailyXp),
      hapticsEnabled: state.hapticsEnabled,
      setHapticsEnabled: (enabled) => setState((current) => ({ ...current, hapticsEnabled: enabled })),
      traitXp: (trait) => state.xpByTrait[trait],
      cycleStartedAt: state.cycleStartedAt,
      fastingStartedAt: state.fastingStartedAt,
      fastingSessions: state.fastingSessions,
      adaptivePlan,
      planDate,
      startFast: () => setState((current) => {
        const profile = normalizeProfile(current.profile);
        if (current.fastingStartedAt || profile.fastingPreference === 'off' || profile.fastingSafety !== 'clear') return current;
        if (current.hapticsEnabled) void Haptics.selectionAsync();
        return { ...current, fastingStartedAt: new Date().toISOString() };
      }),
      finishFast: () => setState((current) => {
        if (!current.fastingStartedAt) return current;
        const endedAt = new Date();
        const minutes = Math.max(0, Math.round((endedAt.getTime() - new Date(current.fastingStartedAt).getTime()) / 60_000));
        if (current.hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const session: FastingSession = {
          startedAt: current.fastingStartedAt,
          endedAt: endedAt.toISOString(),
          minutes,
          targetHours: getFastingTargetHours(current.profile),
        };
        return { ...current, fastingStartedAt: null, fastingSessions: [...current.fastingSessions.slice(-19), session] };
      }),
      cancelFast: () => setState((current) => ({ ...current, fastingStartedAt: null })),
    };
  }, [hydrated, state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
