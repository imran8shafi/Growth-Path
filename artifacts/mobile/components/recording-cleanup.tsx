import { useEffect, useRef } from 'react';
import { useProgress } from '@/context/progress';
import { removeRecording } from '@/lib/recording-storage';

export function RecordingCleanup() {
  const { training } = useProgress();
  const previous = useRef(new Set<string>());
  useEffect(() => {
    const current = new Set(Object.values(training.sessions).flatMap((s) => Object.values(s.answers).flatMap((a) => a.recording ? [a.recording.id] : [])));
    // Covers discard, replacement, transcript retention and user-requested progress reset.
    for (const id of previous.current) if (!current.has(id)) void removeRecording(id).catch(() => undefined);
    previous.current = current;
  }, [training.sessions]);
  return null;
}
