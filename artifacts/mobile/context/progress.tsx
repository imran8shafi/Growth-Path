import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TrackKey = 'mind' | 'body' | 'soul' | 'freedom';

type ProgressState = {
  completed: string[];
};

type ProgressContextValue = {
  completed: string[];
  isComplete: (id: string) => boolean;
  toggle: (id: string) => void;
  totalCompleted: number;
  trackCompleted: (track: TrackKey) => number;
};

const STORAGE_KEY = '@jack-of-all/progress';
const TRACK_PREFIXES: Record<TrackKey, string> = {
  mind: 'mind-',
  body: 'body-',
  soul: 'soul-',
  freedom: 'freedom-',
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>({ completed: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored) as ProgressState;
          setState({ completed: Array.isArray(parsed.completed) ? parsed.completed : [] });
        }
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    }
  }, [hydrated, state]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      completed: state.completed,
      isComplete: (id) => state.completed.includes(id),
      toggle: (id) => {
        setState((current) => {
          const exists = current.completed.includes(id);
          void Haptics.selectionAsync();
          return {
            completed: exists
              ? current.completed.filter((item) => item !== id)
              : [...current.completed, id],
          };
        });
      },
      totalCompleted: state.completed.length,
      trackCompleted: (track) =>
        state.completed.filter((id) => id.startsWith(TRACK_PREFIXES[track])).length,
    }),
    [state],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error('useProgress must be used inside ProgressProvider');
  }
  return value;
}