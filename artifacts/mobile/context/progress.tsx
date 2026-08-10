import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TrackKey = 'mind' | 'body' | 'soul' | 'freedom';
export type Goal = 'discipline' | 'energy' | 'meaning' | 'autonomy';
export type TimeCommitment = 'ten' | 'twenty' | 'forty';
export type BeliefStyle = 'faith' | 'reflection' | 'service' | 'open';
export type Equipment = 'none' | 'home' | 'gym';
export type Ability = 'starting' | 'building' | 'advanced';

export type OnboardingProfile = {
  goal: Goal;
  time: TimeCommitment;
  beliefs: BeliefStyle;
  equipment: Equipment;
  ability: Ability;
  focusTrack: TrackKey;
};

export type Quest = {
  id: string;
  track: TrackKey;
  title: string;
  detail: string;
  meta: string;
  xp: number;
};

type StoredState = {
  completedToday?: string[];
  totalCompleted?: number;
  xpByTrack?: Partial<Record<TrackKey, number>>;
  completedDates?: string[];
  lastActiveDate?: string;
  profile?: OnboardingProfile | null;
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
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function emptyXp(): Record<TrackKey, number> {
  return { mind: 0, body: 0, soul: 0, freedom: 0 };
}

function calculateStreak(dates: string[], today = todayKey()) {
  const known = new Set(dates);
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  while (known.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getTrackTasks(track: TrackKey, profile: OnboardingProfile | null): Quest[] {
  const current = profile ?? DEFAULT_PROFILE;
  const timeLabel = current.time === 'ten' ? '10 MIN' : current.time === 'forty' ? '40 MIN' : '20 MIN';
  const effortLabel = current.ability === 'starting' ? 'STARTER' : current.ability === 'advanced' ? 'DEEPEN' : 'BUILD';

  const tasks: Record<TrackKey, Quest[]> = {
    mind: [
      {
        id: 'mind-read',
        track,
        title: current.time === 'ten' ? 'Read for 10 minutes' : 'Read for 20 minutes',
        detail: 'Train the attention that makes meaningful work possible.',
        meta: timeLabel,
        xp: current.ability === 'advanced' ? 45 : 35,
      },
      { id: 'mind-journal', track, title: 'Write one clear thought', detail: 'Name what you are learning or avoiding.', meta: '5 MIN', xp: 30 },
      { id: 'mind-learn', track, title: 'Study a useful skill', detail: 'Choose something that compounds.', meta: effortLabel, xp: 45 },
    ],
    body: [
      {
        id: 'body-move',
        track,
        title: current.equipment === 'gym' ? 'Complete today’s training' : 'Move with intention',
        detail: current.equipment === 'none' ? 'Walk, stretch, or train with your bodyweight.' : 'Push, pull, squat, hinge, carry, or walk.',
        meta: current.time === 'ten' ? '10 MIN' : '30 MIN',
        xp: current.ability === 'advanced' ? 50 : 40,
      },
      { id: 'body-recover', track, title: 'Get outside and breathe', detail: 'Light, air, and an unhurried pace.', meta: '10 MIN', xp: 30 },
      { id: 'body-sleep', track, title: 'Protect your sleep window', detail: 'Set tomorrow up before tonight ends.', meta: 'RITUAL', xp: 35 },
    ],
    soul: [
      {
        id: 'soul-prayer',
        track,
        title: current.beliefs === 'faith' ? 'Practice prayer' : current.beliefs === 'service' ? 'Practice generous attention' : 'Practice stillness',
        detail: current.beliefs === 'faith' ? 'Use the tradition and language that grounds you.' : 'Make space for what is deeper than the feed.',
        meta: '10 MIN',
        xp: 35,
      },
      { id: 'soul-gratitude', track, title: 'Name three gifts', detail: 'Attention changes what becomes visible.', meta: '3 LINES', xp: 30 },
      { id: 'soul-serve', track, title: 'Make someone’s day lighter', detail: 'A message, an act, or your full presence.', meta: 'ONE ACT', xp: 40 },
    ],
    freedom: [
      {
        id: 'freedom-audit',
        track,
        title: current.goal === 'autonomy' ? 'Audit one recurring expense' : 'Clear one source of friction',
        detail: 'Keep more of what your effort creates.',
        meta: '10 MIN',
        xp: 35,
      },
      { id: 'freedom-build', track, title: 'Ship one small asset', detail: 'A useful offer, page, system, or conversation.', meta: '45 MIN', xp: 50 },
      { id: 'freedom-learn', track, title: 'Study a freedom skill', detail: 'Sales, writing, code, investing, or craft.', meta: effortLabel, xp: 45 },
    ],
  };

  return tasks[track];
}

export function getDailyQuests(profile: OnboardingProfile | null) {
  return TRACKS.map((track) => getTrackTasks(track, profile)[0]);
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
          profile: parsed.profile ?? null,
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
          void Haptics.selectionAsync();
          const completedToday = exists
            ? current.completedToday.filter((item) => item !== id)
            : [...current.completedToday, id];
          const dailyReward = !exists && current.completedToday.length === 3 ? 50 : 0;
          const nextXp = Math.max(0, current.xpByTrack[track] + (exists ? -xp : xp + dailyReward));
          const date = todayKey();
          const completedDates = exists
            ? current.completedDates
            : current.completedDates.includes(date)
              ? current.completedDates
              : [...current.completedDates, date];
          return {
            ...current,
            completedToday,
            totalCompleted: Math.max(0, current.totalCompleted + (exists ? -1 : 1)),
            xpByTrack: { ...current.xpByTrack, [track]: nextXp },
            completedDates,
            lastActiveDate: date,
          };
        });
      },
      setProfile: (profile) => setState((current) => ({ ...current, profile })),
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
        ...(state.completedToday.length >= 4 ? ['Four paths, one direction'] : []),
        ...(currentStreak >= 3 ? ['Three-day momentum'] : []),
        ...(totalXp >= 500 ? ['Becoming consistent'] : []),
      ],
    };
  }, [hydrated, state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}