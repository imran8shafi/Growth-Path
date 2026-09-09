import type { TrainingState } from './training-model';
export type ProgrammeRelease = { minimumLevel: number; released: boolean; prerequisites: string[] };
export function programmeAccess(programme: ProgrammeRelease, level: number, training: TrainingState) {
  if (!programme.released) return 'Coming later';
  if (level < programme.minimumLevel) return 'Rank locked';
  const completed = new Set(training.results.filter(r => r.successful).map(r => r.questId));
  if (!programme.prerequisites.every(id => completed.has(id))) return 'Complete prerequisites';
  return 'Available';
}
