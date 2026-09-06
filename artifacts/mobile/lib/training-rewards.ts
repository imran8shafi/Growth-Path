import type { TrainingResult } from './training-model';
import { SKILLS, skillProgress, type SkillKey } from './training-model';

export type Achievement = { id: string; title: string; detail: string; icon: 'award' | 'compass' | 'layers' | 'target' | 'shield' | 'zap'; earned: boolean; progress: number; target: number };

// Rewards are derived from persisted results: reopening a result cannot mint a badge or XP.
export function achievements(results: TrainingResult[]): Achievement[] {
  const days = new Set(results.map((r) => r.date)).size;
  const paths = new Set(results.map((r) => r.track)).size;
  const missions = results.filter((r) => r.category === 'mission').length;
  const bosses = results.filter((r) => r.category === 'boss').length;
  const retests = results.filter((r) => r.sessionKey.includes(':final:')).length;
  const ranks = (Object.keys(SKILLS) as SkillKey[]).filter((key) => skillProgress(key, results).level >= 2).length;
  return [
    { id: 'first-result', title: 'First evidence', detail: 'Finish one complete training session.', icon: 'zap' as const, progress: results.length, target: 1 },
    { id: 'four-paths', title: 'Four directions', detail: 'Record practice in Mind, Body, Soul, and Freedom.', icon: 'compass' as const, progress: paths, target: 4 },
    { id: 'seven-days', title: 'Keep returning', detail: 'Practice on seven different days. Rest days are welcome.', icon: 'layers' as const, progress: days, target: 7 },
    { id: 'fieldwork', title: 'Beyond the screen', detail: 'Bring back three real-world mission reports.', icon: 'target' as const, progress: missions, target: 3 },
    { id: 'chapter', title: 'Chapter breaker', detail: 'Complete a multi-stage chapter challenge.', icon: 'shield' as const, progress: bosses, target: 1 },
    { id: 'evolution', title: 'Return to the starting line', detail: 'Complete a Day 42 retest.', icon: 'award' as const, progress: retests, target: 1 },
    { id: 'range', title: 'Growing range', detail: 'Reach practice rank II in three different skills.', icon: 'compass' as const, progress: ranks, target: 3 },
  ].map((badge) => ({ ...badge, earned: badge.progress >= badge.target, progress: Math.min(badge.target, badge.progress) }));
}

export function newAchievements(results: TrainingResult[], sessionKey: string) {
  const index = results.findIndex((r) => r.sessionKey === sessionKey);
  if (index < 0) return [];
  const previous = new Set(achievements(results.slice(0, index)).filter((a) => a.earned).map((a) => a.id));
  return achievements(results.slice(0, index + 1)).filter((a) => a.earned && !previous.has(a.id));
}

export function valueMap(results: TrainingResult[]) {
  const counts = new Map<string, number>();
  for (const r of results) for (const value of new Set(r.values ?? [])) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}
