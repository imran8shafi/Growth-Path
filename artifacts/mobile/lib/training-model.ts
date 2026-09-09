import type { OnboardingProfile, Quest, TrackKey, TraitKey } from '@/context/progress';
import { canContact, emptyWorkspace, reduceWorkspace, type BusinessWorkspace, type Material, type WorkspaceAction } from './business-workspace';
import { regionReviewed } from './calling-guidance';

export type SkillKey = 'focus' | 'reasoning' | 'memory' | 'storytelling' | 'strength' | 'mobility' | 'composure' | 'conviction' | 'connection' | 'negotiation' | 'independence' | 'creativity' | 'wit' | 'adaptability' | 'practical';
export type Mechanic = 'timer' | 'performance' | 'decision' | 'creation' | 'field' | 'skill' | 'boss';
export type ChallengeCategory = 'quest' | 'trial' | 'mission' | 'boss';
export type Feedback = 'easy' | 'right' | 'hard';
type StageBase = { id: string; title: string; prompt: string; source?: { title: string; url: string }; help?: string; reading?: { passage: string; attribution: string }; demonstration?: 'sit-stand' | 'calf-raise' | 'wall-push' | 'biceps-curl'; material?: Material; workflow?: 'prospects' | 'call' | 'call-session'; practice?: boolean; restSeconds?: number };
export type Stage = StageBase & (
  | { type: 'write'; minimum: number; placeholder?: string }
  | { type: 'choice'; options: { id: string; label: string; response: string; correct?: boolean }[] }
  | { type: 'timer'; seconds: number; mode: 'focus' | 'composure' | 'movement' | 'prepare' | 'speak' }
  | { type: 'rating'; low: string; high: string }
  | { type: 'ideas'; seconds: number; minimum: number }
  | { type: 'recall'; words: string[]; seconds: number }
  | { type: 'performance'; unit: string; maximum: number; variants: string[] }
  | { type: 'checklist'; items: string[] }
  | { type: 'lesson'; points: string[]; example: string; seconds?: number }
  | { type: 'action'; steps: string[]; alternative: string; seconds?: number }
  | { type: 'artifact'; fields: { id: string; label: string; example: string }[] }
  | { type: 'attention'; cues: string[]; target: string }
  | { type: 'values'; options: string[]; maximum: number }
);
export type Challenge = {
  quest: Quest; mechanic: Mechanic; category: ChallengeCategory; skill: SkillKey;
  secondarySkills?: SkillKey[]; level: number; stages: Stage[]; minutes: number;
  scope: string; cycle: number; cycleDay: number; reason: string;
  movementLimit?: OnboardingProfile['movementLimit'];
  programme?: { title: string; step: number; total: number; outcome: string; next: string; contentVersion?: number; prerequisites?: string[]; sources?: string[] };
};
export type StageAnswer = {
  text?: string; option?: string; rating?: number; ideas?: string[]; checks?: number[];
  value?: number; variant?: string; elapsed?: number;
  acknowledged?: boolean; attention?: boolean[]; values?: string[];
  recording?: { id: string; seconds: number };
  fields?: Record<string, string>; alternative?: boolean;
};
export type TrainingSession = {
  key: string; challenge: Challenge; startedAt: string; stageIndex: number;
  answers: Record<string, StageAnswer>; feedback?: Feedback;
  status: 'active' | 'complete'; completedAt?: string;
};
export type Metric = { protocol: string; label: string; value: number; unit: string };
export type TrainingResult = {
  sessionKey: string; questId: string; title: string; track: TrackKey; trait?: TraitKey;
  skill: SkillKey; secondarySkills: SkillKey[]; level: number; date: string;
  category: ChallengeCategory; cycle: number; cycleDay: number; feedback: Feedback;
  successful: boolean; metrics: Metric[]; xp: number; completedAt: string;
  values?: string[];
};
export type TrainingState = { version: 1; sessions: Record<string, TrainingSession>; results: TrainingResult[]; workspace?: BusinessWorkspace };
export const emptyTraining = (): TrainingState => ({ version: 1, sessions: {}, results: [] });
export const SKILLS: Record<SkillKey, { label: string; track: TrackKey; icon: string; description: string; levels: string[] }> = {
  focus: { label: 'Focus', track: 'mind', icon: 'target', description: 'Protect one outcome from competing inputs.', levels: ['One clear outcome', 'Hold the boundary', 'Return after distraction', 'Recall and apply', 'Build a deep-work ritual'] },
  reasoning: { label: 'Reasoning', track: 'mind', icon: 'git-branch', description: 'Separate claims, evidence, and assumptions.', levels: ['Spot an assumption', 'Compare explanations', 'Test the evidence', 'Argue the other side', 'Make a decision brief'] },
  memory: { label: 'Recall', track: 'mind', icon: 'layers', description: 'Retrieve an idea without looking it up.', levels: ['Four-word recall', 'Five-word recall', 'Six-word recall', 'Seven-word recall', 'Eight-word recall'] },
  storytelling: { label: 'Storycraft', track: 'mind', icon: 'mic', description: 'Give a moment a setup, detail, and payoff.', levels: ['A clear beginning', 'A specific detail', 'An opening hook', 'A surprising turn', 'A concise ending'] },
  strength: { label: 'Strength practice', track: 'body', icon: 'activity', description: 'Record controlled movement using a repeatable setup.', levels: ['Learn your setup', 'Repeat cleanly', 'Build consistency', 'Own the movement', 'Review your training'] },
  mobility: { label: 'Movement', track: 'body', icon: 'move', description: 'Practice comfortable movement and record what works.', levels: ['Comfortable range', 'Steady rhythm', 'Repeatable routine', 'Adapt your routine', 'Move with confidence'] },
  composure: { label: 'Composure', track: 'body', icon: 'wind', description: 'Notice your state and practice a comfortable reset.', levels: ['Notice your state', 'Find a steady tempo', 'Return your attention', 'Choose your response', 'Use your reset'] },
  conviction: { label: 'Conviction', track: 'soul', icon: 'shield', description: 'Connect a principle with a considered action.', levels: ['Name a principle', 'Notice a tradeoff', 'Protect a boundary', 'Act under pressure', 'Review your alignment'] },
  connection: { label: 'Connection', track: 'soul', icon: 'users', description: 'Listen carefully and communicate with respect.', levels: ['Ask a real question', 'Reflect what you hear', 'Read the context', 'Have a difficult conversation', 'Repair a misunderstanding'] },
  negotiation: { label: 'Negotiation', track: 'freedom', icon: 'message-circle', description: 'Understand interests and look for workable options.', levels: ['Ask before arguing', 'Find the interest', 'Offer options', 'Know your alternative', 'Prepare a negotiation'] },
  independence: { label: 'Independence', track: 'freedom', icon: 'compass', description: 'Make a concrete plan that increases your options.', levels: ['Map an option', 'Find a constraint', 'Compare alternatives', 'Make useful proof', 'Build a repeatable system'] },
  creativity: { label: 'Creativity', track: 'mind', icon: 'aperture', description: 'Generate different options, then develop one.', levels: ['Generate options', 'Change the context', 'Add a constraint', 'Combine two ideas', 'Develop an unexpected use'] },
  wit: { label: 'Wit', track: 'mind', icon: 'smile', description: 'Use surprise and lightness without cruelty.', levels: ['A playful reply', 'A deadpan reply', 'An absurd reply', 'A gentle callback', 'Read the room'] },
  adaptability: { label: 'Adaptability', track: 'mind', icon: 'shuffle', description: 'Change the approach while keeping the purpose.', levels: ['Find another route', 'Work with less', 'Respond to a change', 'Trade off deliberately', 'Integrate a new constraint'] },
  practical: { label: 'Practical skill', track: 'freedom', icon: 'tool', description: 'Make an everyday process easier to repeat.', levels: ['Describe the task', 'Build a checklist', 'Test your process', 'Fix a weak step', 'Teach the process'] },
};
export const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function seededIndex(seed: string, count: number) { let h = 2166136261; for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) % count; }

export function skillProgress(skill: SkillKey, results: TrainingResult[]) {
  const relevant = results.filter((r) => r.skill === skill || r.secondarySkills.includes(skill));
  const days = new Set(relevant.filter((r) => r.successful).map((r) => r.date)).size;
  return { level: Math.min(5, 1 + Math.floor(days / 3)), days, nextIn: Math.max(0, 3 - days % 3), sessions: relevant.length };
}

export function trainingLevel(skill: SkillKey, profile: OnboardingProfile | null, results: TrainingResult[], today: string) {
  // Always use prior-day results: completing a session never changes the other cards today.
  const previous = results.filter((r) => r.skill === skill && r.date < today).sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  let level = profile?.ability === 'advanced' ? 3 : profile?.ability === 'building' ? 2 : 1;
  if (SKILLS[skill].track === 'body') return level;
  let easyDays = new Set<string>(); let hardDays = new Set<string>();
  for (const result of previous) {
    if (result.level !== level) continue;
    if (result.feedback === 'hard') { hardDays.add(result.date); easyDays.clear(); }
    else if (result.successful && result.feedback === 'easy') { easyDays.add(result.date); hardDays.clear(); }
    else { easyDays.clear(); hardDays.clear(); }
    if (hardDays.size >= 2) { level = Math.max(1, level - 1); hardDays.clear(); }
    if (easyDays.size >= 3) { level = Math.min(5, level + 1); easyDays.clear(); }
  }
  return level;
}

export function cleanAnswer(stage: Stage, input: StageAnswer): StageAnswer {
  const answer: StageAnswer = {};
  if (stage.type === 'artifact') answer.fields = Object.fromEntries(stage.fields.map((f) => [f.id, typeof input.fields?.[f.id] === 'string' ? input.fields[f.id].slice(0, 500) : '']));
  if (stage.type === 'action') {
    answer.checks = [...new Set((input.checks ?? []).filter((n) => Number.isInteger(n) && n >= 0 && n < stage.steps.length))]; answer.alternative = input.alternative === true;
    if (stage.workflow) { answer.fields = Object.fromEntries(Object.entries(input.fields ?? {}).filter(([k]) => ['name', 'phone', 'source'].includes(k)).map(([k,v]) => [k, String(v).slice(0, 500)])); if (input.variant === 'practice') answer.variant = 'practice'; }
  }
  if (stage.type === 'lesson') answer.acknowledged = input.acknowledged === true;
  if (stage.type === 'attention' && Array.isArray(input.attention)) answer.attention = input.attention.filter((v) => typeof v === 'boolean').slice(0, stage.cues.length);
  if (stage.type === 'values' && Array.isArray(input.values)) answer.values = [...new Set(input.values.filter((v) => stage.options.includes(v)))].slice(0, stage.maximum);
  if (stage.type === 'timer' && stage.mode === 'speak' && input.recording && /^take-[a-z0-9-]+$/.test(input.recording.id) && Number.isFinite(input.recording.seconds) && input.recording.seconds > 0 && input.recording.seconds <= stage.seconds + 2) answer.recording = input.recording;
  if (typeof input.text === 'string') answer.text = input.text.slice(0, 2000);
  if (stage.type === 'choice' && stage.options.some((o) => o.id === input.option)) answer.option = input.option;
  if (stage.type === 'rating' && Number.isInteger(input.rating) && input.rating! >= 1 && input.rating! <= 5) answer.rating = input.rating;
  if (stage.type === 'ideas' && Array.isArray(input.ideas)) answer.ideas = [...new Map(input.ideas.filter((s) => typeof s === 'string').map((s) => s.trim().slice(0, 160)).filter(Boolean).map((s) => [s.toLocaleLowerCase(), s])).values()].slice(0, 40);
  if (stage.type === 'checklist' && Array.isArray(input.checks)) answer.checks = [...new Set(input.checks.filter((n) => Number.isInteger(n) && n >= 0 && n < stage.items.length))];
  if (stage.type === 'performance') {
    if (Number.isFinite(input.value) && input.value! >= 0 && input.value! <= stage.maximum) answer.value = input.value;
    if (stage.variants.includes(input.variant ?? '')) answer.variant = input.variant;
  }
  // Timer elapsed is updated only by the dedicated foreground tick action.
  return answer;
}

export function stageValid(stage: Stage, a: StageAnswer = {}): boolean {
  switch (stage.type) {
    case 'action': return a.alternative === true || stage.steps.every((_, i) => a.checks?.includes(i));
    case 'artifact': return stage.fields.every((f) => (a.fields?.[f.id]?.trim().length ?? 0) >= 2);
    case 'write': return (a.text?.trim().length ?? 0) >= stage.minimum;
    case 'choice': return stage.options.some((o) => o.id === a.option);
    case 'timer': return (stage.mode === 'speak' && (a.recording?.seconds ?? 0) >= 3) || (a.elapsed ?? 0) >= stage.seconds;
    case 'rating': return Number.isInteger(a.rating) && a.rating! >= 1 && a.rating! <= 5;
    case 'ideas': return (a.elapsed ?? 0) >= stage.seconds && (a.ideas?.length ?? 0) >= stage.minimum;
    case 'recall': return (a.elapsed ?? 0) >= stage.seconds && Boolean(a.text?.trim());
    case 'performance': return Number.isFinite(a.value) && a.value! >= 0 && a.value! <= stage.maximum && stage.variants.includes(a.variant ?? '');
    case 'checklist': return (a.checks?.length ?? 0) > 0;
    case 'lesson': return a.acknowledged === true;
    case 'attention': return a.attention?.length === stage.cues.length && a.attention.every((v) => typeof v === 'boolean');
    case 'values': return Boolean(a.values?.length && a.values.length <= stage.maximum && a.values.every((v) => stage.options.includes(v)));
  }
}
export function sessionValid(session: TrainingSession) { return session.challenge.stages.every((stage) => stageValid(stage, session.answers[stage.id])) && ['easy', 'right', 'hard'].includes(session.feedback ?? ''); }
export function recallScore(words: string[], answer: string) {
  const tokens = new Set(answer.toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  return words.filter((w) => tokens.has(w.toLocaleLowerCase())).length;
}

export function sessionResult(session: TrainingSession, now = new Date()): TrainingResult {
  const { challenge: c } = session; const metrics: Metric[] = []; let correct = 0; let possible = 0; let hasPractice = true;
  for (const stage of c.stages) {
    const a = session.answers[stage.id] ?? {};
    if (stage.type === 'action' && a.alternative) hasPractice = false;
    const protocol = `${c.quest.id}:v1:${stage.id}:L${c.level}`;
    if (stage.type === 'ideas' && !a.ideas?.length) hasPractice = false;
    if (stage.type === 'performance' && (!a.value || a.variant === 'Recovery review')) hasPractice = false;
    if (stage.type === 'choice' && stage.options.some((o) => o.correct !== undefined)) { possible++; if (stage.options.find((o) => o.id === a.option)?.correct) correct++; }
    if (stage.type === 'recall') { const score = recallScore(stage.words, a.text ?? ''); correct += score; possible += stage.words.length; metrics.push({ protocol: `${protocol}:${stage.words.length}:${stage.seconds}`, label: 'Words recalled', value: score, unit: `of ${stage.words.length}` }); }
    if (stage.type === 'ideas') metrics.push({ protocol: `${protocol}:${stage.seconds}:${stage.prompt}`, label: 'Distinct entries', value: a.ideas?.length ?? 0, unit: `in ${stage.seconds}s` });
    if (stage.type === 'performance') metrics.push({ protocol: `${protocol}:${a.variant}`, label: a.variant ?? stage.title, value: a.value ?? 0, unit: stage.unit });
    if (stage.type === 'timer' && stage.mode === 'focus') metrics.push({ protocol: `${protocol}:${stage.seconds}`, label: 'Timed focus', value: Math.round((a.elapsed ?? 0) / 6) / 10, unit: 'min' });
    if (stage.type === 'attention') {
      const score = stage.cues.filter((cue, i) => a.attention?.[i] === (cue === stage.target)).length;
      correct += score; possible += stage.cues.length;
      metrics.push({ protocol: `${protocol}:${stage.cues.length}`, label: stage.id.includes('before') ? 'Attention before reset' : 'Attention after reset', value: Math.round(score / stage.cues.length * 100), unit: '%' });
    }
  }
  if (possible) metrics.push({ protocol: `${c.quest.id}:v1:accuracy:L${c.level}`, label: 'Practice accuracy', value: Math.round(correct / possible * 100), unit: '%' });
  const values = [...new Set(c.stages.filter((s) => s.type === 'values').flatMap((s) => session.answers[s.id]?.values ?? []))];
  if (c.programme && session.feedback === 'hard') hasPractice = false;
  return { sessionKey: session.key, questId: c.quest.id, title: c.quest.title, track: c.quest.track, trait: c.quest.trait, skill: c.skill, secondarySkills: c.secondarySkills ?? [], level: c.level, date: dateKey(now), category: c.category, cycle: c.cycle, cycleDay: c.cycleDay, feedback: session.feedback!, successful: hasPractice && (possible === 0 || correct / possible >= 0.7), metrics, xp: c.quest.xp, completedAt: now.toISOString(), values };
}

export type TrainingAction =
  | { type: 'workspace'; action: WorkspaceAction }
  | { type: 'start'; challenge: Challenge; now: string }
  | { type: 'answer'; key: string; answer: StageAnswer }
  | { type: 'recording'; key: string; stageId: string; recording?: StageAnswer['recording'] }
  | { type: 'tick'; key: string; seconds: number }
  | { type: 'next'; key: string }
  | { type: 'feedback'; key: string; value: Feedback }
  | { type: 'finish'; key: string; now: string }
  | { type: 'discard'; key: string };

export function sessionKey(challenge: Challenge) { return `${challenge.scope}:${challenge.quest.id}`; }
export function workflowValid(stage: Stage, answer: StageAnswer | undefined, current: TrainingState, key: string) {
  if (!stage.workflow) return true;
  const w = current.workspace ?? emptyWorkspace();
  if (stage.workflow === 'prospects') return w.prospects.length >= 3;
  if (w.pending?.[key]) return false;
  return answer?.variant === 'practice' || w.calls.some(c => c.sessionKey === key);
}
export function reduceTraining(current: TrainingState, action: TrainingAction): TrainingState {
  if (action.type === 'workspace') {
    const w = current.workspace ?? emptyWorkspace();
    if (action.action.kind === 'begin-call') {
      const a = action.action; const session = current.sessions[a.key]; const stage = session?.challenge.stages[session.stageIndex];
      if (!session || session.status !== 'active' || !stage || !['call', 'call-session'].includes(stage.workflow ?? '') || !regionReviewed(w.region, w.origin) || !Number.isFinite(Date.parse(a.at)) || !canContact(w, a.prospectId) || !w.prospects.some(p => p.id === a.prospectId) || w.pending?.[a.key]) return current;
      if (w.calls.filter(c => c.sessionKey === a.key).length >= (stage.workflow === 'call-session' ? 3 : 1)) return current;
      if (w.windows?.[a.key] && Date.parse(a.at) - Date.parse(w.windows[a.key]) >= session.challenge.minutes * 60000) return current;
    }
    if (action.action.kind === 'call') {
      const call = action.action.call; const session = current.sessions[call.sessionKey];
      const stage = session?.challenge.stages[session.stageIndex];
      if (!session || session.status !== 'active' || !stage || !['call', 'call-session'].includes(stage.workflow ?? '') || !regionReviewed(w.region, w.origin) || !Number.isFinite(Date.parse(call.at))) return current;
      const prior = w.calls.filter(c => c.sessionKey === call.sessionKey);
      if (prior.length >= (stage.workflow === 'call-session' ? 3 : 1)) return current;
      if (w.pending?.[call.sessionKey]?.prospectId !== call.prospectId) return current;
    }
    if (action.action.kind === 'undo-call') {
      const call = w.calls.find(c => c.id === (action.action as { id: string }).id);
      if (!call || current.sessions[call.sessionKey]?.status !== 'active') return current;
    }
    const workspace = reduceWorkspace(w, action.action);
    return workspace === w ? current : { ...current, workspace };
  }
  if (action.type === 'start') {
    const key = sessionKey(action.challenge);
    if (current.sessions[key] || current.results.some((r) => r.sessionKey === key)) return current;
    const session: TrainingSession = { key, challenge: action.challenge, startedAt: action.now, stageIndex: 0, answers: {}, status: 'active' };
    return { ...current, sessions: { ...current.sessions, [key]: session } };
  }
  const session = current.sessions[action.key];
  // Audio saving can finish after navigation. Address its stage explicitly instead of
  // accidentally replacing the answer on whatever stage is now visible.
  if (session && action.type === 'recording') {
    const stage = session.challenge.stages.find((s) => s.id === action.stageId);
    if (!stage || stage.type !== 'timer' || stage.mode !== 'speak') return current;
    const recording = cleanAnswer(stage, { recording: action.recording }).recording;
    if (action.recording && !recording) return current;
    const updated = { ...session, answers: { ...session.answers, [stage.id]: { ...session.answers[stage.id], recording } } };
    return { ...current, sessions: { ...current.sessions, [action.key]: updated } };
  }
  if (!session || session.status === 'complete') return current;
  if (action.type === 'discard') { const sessions = { ...current.sessions }; delete sessions[action.key]; return { ...current, sessions }; }
  let next = session;
  const stage = session.challenge.stages[session.stageIndex];
  if (action.type === 'answer' && stage) {
    const old = session.answers[stage.id] ?? {};
    // Decisions are final after reveal; users cannot turn revealed answers into a higher score.
    if (stage.type === 'choice' && old.option) return current;
    if (stage.type === 'ideas' && (old.elapsed ?? 0) >= stage.seconds) return current;
    if (stage.type === 'recall' && (old.elapsed ?? 0) < stage.seconds) return current;
    if (stage.type === 'attention') {
      const previous = old.attention ?? []; const incoming = action.answer.attention ?? [];
      if (incoming.length !== previous.length + 1 || incoming.length > stage.cues.length || previous.some((v, i) => incoming[i] !== v) || typeof incoming[incoming.length - 1] !== 'boolean') return current;
    }
    next = { ...session, answers: { ...session.answers, [stage.id]: { ...cleanAnswer(stage, action.answer), elapsed: old.elapsed } } };
  }
  if (action.type === 'tick' && stage && ('seconds' in stage || (stage.type === 'lesson' && stage.reading)) && Number.isFinite(action.seconds)) {
    const old = session.answers[stage.id] ?? {};
    next = { ...session, answers: { ...session.answers, [stage.id]: { ...old, elapsed: Math.min(stage.seconds ?? 3600, (old.elapsed ?? 0) + Math.max(0, Math.min(2, action.seconds))) } } };
  }
  if (action.type === 'next' && stage && stageValid(stage, session.answers[stage.id]) && workflowValid(stage, session.answers[stage.id], current, session.key)) next = { ...session, stageIndex: Math.min(session.challenge.stages.length, session.stageIndex + 1) };
  if (action.type === 'feedback' && ['easy', 'right', 'hard'].includes(action.value)) next = { ...session, feedback: action.value };
  if (action.type === 'finish') {
    if (!sessionValid(session) || !session.challenge.stages.every(s => workflowValid(s, session.answers[s.id], current, session.key)) || current.results.some((r) => r.sessionKey === action.key)) return current;
    const result = sessionResult(session, new Date(action.now));
    if (session.challenge.stages.some(s => s.workflow?.startsWith('call') && session.answers[s.id]?.variant === 'practice')) result.title = `Practice: ${result.title}`;
    next = { ...session, status: 'complete', completedAt: action.now };
    // Keep scores across evolution cycles; keep only the latest 60 completed transcripts.
    const completedKeys = Object.values(current.sessions).filter((s) => s.status === 'complete').sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')).slice(0, 59).map((s) => s.key);
    const sessions = Object.fromEntries(Object.entries(current.sessions).filter(([key, s]) => s.status === 'active' || completedKeys.includes(key)));
    return { ...current, sessions: { ...sessions, [action.key]: next }, results: [...current.results, result] };
  }
  return next === session ? current : { ...current, sessions: { ...current.sessions, [action.key]: next } };
}

export function personalBest(metric: Metric, results: TrainingResult[], excludeKey?: string) {
  const values = results.filter((r) => r.sessionKey !== excludeKey).flatMap((r) => r.metrics).filter((m) => m.protocol === metric.protocol).map((m) => m.value);
  return values.length ? Math.max(...values) : null;
}
