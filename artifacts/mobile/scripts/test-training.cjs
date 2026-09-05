const assert = require('node:assert/strict');
const { loadSource, progress, render, slots } = require('./test-support.cjs');
const model = loadSource('lib/training-model.ts');
const catalog = loadSource('lib/training-catalog.ts');
const { emptyTraining, reduceTraining, sessionKey, stageValid, skillProgress, trainingLevel, personalBest, cleanAnswer, recallScore } = model;
const profile = progress.normalizeProfile({ ability: 'starting', time: 'ten', movementLimit: 'none' });
const date = new Date(2026, 8, 15, 12);
const now = date.toISOString();
const start = '2026-09-15';
const tracks = ['mind', 'body', 'soul', 'freedom'];
const quest = (id) => tracks.flatMap((track) => progress.getTrackTasks(track, profile)).find((q) => q.id === id);
const make = (id, p = profile) => catalog.questChallenge(quest(id), p, emptyTraining(), date, start);
function solve(state, key) {
  let session = state.sessions[key];
  while (session.stageIndex < session.challenge.stages.length) {
    const stage = session.challenge.stages[session.stageIndex];
    if (stage.type === 'ideas') state = reduceTraining(state, { type: 'answer', key, answer: { ideas: ['first idea', 'FIRST IDEA', 'second idea'] } });
    if ('seconds' in stage) for (let seconds = 0; seconds < stage.seconds; seconds += 2) state = reduceTraining(state, { type: 'tick', key, seconds: 2 });
    const answer = stage.type === 'write' ? { text: 'A specific example with an action and a concrete observation.' }
      : stage.type === 'choice' ? { option: (stage.options.find((o) => o.correct) ?? stage.options[0]).id }
      : stage.type === 'rating' ? { rating: 3 }
      : stage.type === 'recall' ? { text: stage.words.join(', ') }
      : stage.type === 'performance' ? { value: 12, variant: stage.variants[0] }
      : stage.type === 'checklist' ? { checks: [0] } : null;
    if (answer) state = reduceTraining(state, { type: 'answer', key, answer });
    assert.equal(stageValid(stage, state.sessions[key].answers[stage.id]), true, `Completable stage ${stage.type}`);
    state = reduceTraining(state, { type: 'next', key }); session = state.sessions[key];
  }
  return reduceTraining(state, { type: 'feedback', key, value: 'right' });
}

// Every current quest has a non-checkbox recipe, and all seven mechanics can finish.
const all = tracks.flatMap((track) => progress.getTrackTasks(track, profile)).map((q) => catalog.questChallenge(q, profile, emptyTraining(), date, start));
const crossTrainingIds = new Set();
for (const trait of ['wit', 'adaptability', 'courage', 'social', 'creativity', 'practical']) {
  for (let variant = 0; variant < 3; variant++) {
    const adaptive = { ...progress.buildAdaptivePlan([], [], profile, date), observedDays: 3, weakestTrait: trait, recentQuestIds: [...crossTrainingIds] };
    const cross = progress.getTodayCrossTraining(profile, date, adaptive);
    all.push(catalog.questChallenge(cross, profile, emptyTraining(), date, start));
    crossTrainingIds.add(cross.id);
  }
}
assert.equal(crossTrainingIds.size, 18, 'Every cross-training variant is exercised');
all.push(...catalog.specialChallenges(profile, emptyTraining(), date, start));
assert.equal(new Set(all.map((c) => c.mechanic)).size, 7);
for (const c of all) {
  assert.ok(c.stages.length >= 2);
  let state = reduceTraining(emptyTraining(), { type: 'start', challenge: c, now }); const key = sessionKey(c);
  assert.equal(reduceTraining(state, { type: 'finish', key, now }), state, 'Opening cannot award XP');
  assert.equal(reduceTraining(state, { type: 'next', key }), state, 'Required steps cannot be skipped');
  state = solve(state, key);
  const finished = reduceTraining(state, { type: 'finish', key, now });
  assert.equal(finished.results.length, 1);
  assert.equal(reduceTraining(finished, { type: 'finish', key, now }), finished, 'Finish is idempotent');
  assert.equal(reduceTraining(finished, { type: 'answer', key, answer: { text: 'overwrite' } }), finished);
}

// Frozen session content survives storage, onboarding edits, and midnight.
const focus = make('mind-focus'); const key = sessionKey(focus);
let state = reduceTraining(emptyTraining(), { type: 'start', challenge: focus, now });
state = reduceTraining(state, { type: 'answer', key, answer: { text: 'Write one small useful result.' } });
state = reduceTraining(state, { type: 'next', key });
state = reduceTraining(state, { type: 'tick', key, seconds: 10000 });
assert.equal(state.sessions[key].answers.focus.elapsed, 2, 'A background gap cannot instantly complete an interval');
state = reduceTraining(state, { type: 'answer', key, answer: { elapsed: 9000 } });
assert.equal(state.sessions[key].answers.focus.elapsed, 2, 'Form updates cannot forge timer completion');
const restored = JSON.parse(JSON.stringify(state));
assert.equal(restored.sessions[key].answers.focus.elapsed, 2);
const changed = { ...focus, stages: [], level: 5 };
assert.equal(reduceTraining(restored, { type: 'start', challenge: changed, now }), restored);

// Responses cannot be changed after the explanation is revealed.
const reason = make('mind-reframe'); const rKey = sessionKey(reason);
let decisionState = reduceTraining(emptyTraining(), { type: 'start', challenge: reason, now });
decisionState = reduceTraining(decisionState, { type: 'answer', key: rKey, answer: { option: '0' } });
assert.equal(reduceTraining(decisionState, { type: 'answer', key: rKey, answer: { option: '1' } }), decisionState);
const performanceStage = make('body-strength').stages.find((s) => s.type === 'performance');
assert.equal(stageValid(performanceStage, cleanAnswer(performanceStage, { value: Infinity, variant: 'Floor push-up' })), false);
assert.equal(stageValid(performanceStage, { value: -1, variant: 'Floor push-up' }), false);
assert.equal(recallScore(['art', 'car'], 'cart artist'), 0, 'Recall requires whole words');

// Difficulty uses performance + calibration on distinct previous days, not XP or same-day farming.
const sample = { sessionKey: 'a', questId: 'mind-focus', skill: 'focus', secondarySkills: [], level: 1, date: '2026-09-10', completedAt: '2026-09-10T12:00:00Z', feedback: 'easy', successful: true, metrics: [] };
const recent = [10, 11, 12].map((day) => ({ ...sample, sessionKey: String(day), date: `2026-09-${day}`, completedAt: `2026-09-${day}T12:00:00Z` }));
assert.equal(trainingLevel('focus', profile, recent, '2026-09-15'), 2);
assert.equal(trainingLevel('focus', profile, recent.map((r) => ({ ...r, date: '2026-09-10' })), '2026-09-15'), 1);
assert.equal(trainingLevel('focus', profile, recent.map((r) => ({ ...r, successful: false })), '2026-09-15'), 1);
assert.equal(trainingLevel('strength', profile, recent.map((r) => ({ ...r, skill: 'strength' })), '2026-09-15'), 1);
assert.equal(skillProgress('focus', [...recent, ...recent]).level, 2);
assert.equal(trainingLevel('focus', profile, [...recent, { ...sample, date: '2026-09-15', feedback: 'hard', level: 2 }], '2026-09-15'), 2);
const hard = [13, 14].map((day) => ({ ...sample, level: 2, date: `2026-09-${day}`, completedAt: `2026-09-${day}T12:00:00Z`, feedback: 'hard' }));
assert.equal(trainingLevel('focus', profile, [...recent, ...hard], '2026-09-15'), 1);

// Current-day tasks agree across Home and paths throughout the 42-day cycle.
for (let day = 1; day <= 42; day++) {
  const d = new Date(2026, 8, day, 12); const adaptive = progress.buildAdaptivePlan([], [], profile, d);
  const daily = catalog.trainingDailyTasks(profile, d, adaptive, start);
  assert.equal(new Set(daily.map((q) => q.id)).size, daily.length);
  for (const track of tracks) assert.equal(daily.find((q) => q.kind === 'path' && q.track === track).id, catalog.trainingTrackTasks(track, profile, d, adaptive, start)[0].id);
}
const baseline = catalog.specialChallenges(profile, emptyTraining(), date, start)[0];
const finalDate = new Date(2026, 9, 26, 12);
const final = catalog.specialChallenges(profile, emptyTraining(), finalDate, start)[0];
assert.equal(final.scope, 'cycle:1:final');
const resultFor = (c, d) => { let t = reduceTraining(emptyTraining(), { type: 'start', challenge: c, now }); t = solve(t, sessionKey(c)); return reduceTraining(t, { type: 'finish', key: sessionKey(c), now: d.toISOString() }).results[0]; };
const b = resultFor(baseline, date); const f = resultFor(final, finalDate);
assert.equal(b.metrics[0].protocol, f.metrics[0].protocol);
assert.equal(personalBest(f.metrics[0], [b]), 4);
assert.equal(personalBest({ ...f.metrics[0], protocol: 'different setup' }, [b]), null);
assert.match(make('body-strength', { ...profile, movementLimit: 'knees' }).stages[0].prompt, /already cleared/);
assert.equal(make('body-strength', { ...profile, movementLimit: 'knees' }).stages[1].variants.includes('Floor push-up'), false);

// Session completion + progress + XP are atomic and survive repeated callbacks/reload.
render().setProfile(profile);
let current = slots[0];
current = progress.applyTrainingAction(current, { type: 'start', challenge: reason, now });
current = { ...current, training: solve(current.training, rKey) };
const saved = progress.applyTrainingAction(current, { type: 'finish', key: rKey, now });
assert.equal(saved.totalCompleted, current.totalCompleted + 1);
assert.equal(saved.completionHistory.length, current.completionHistory.length + 1);
assert.equal(saved.training.results.length, 1);
assert.equal(progress.applyTrainingAction(saved, { type: 'finish', key: rKey, now }), saved);
const legacy = { ...current, completedToday: [reason.quest.id], lastActiveDate: model.dateKey(date) };
const noDoubleAward = progress.applyTrainingAction(legacy, { type: 'finish', key: rKey, now });
assert.equal(noDoubleAward.training.results[0].xp, 0);
assert.equal(noDoubleAward.totalCompleted, legacy.totalCompleted);
const movement = make('body-strength');
let movementState = progress.applyTrainingAction(slots[0], { type: 'start', challenge: movement, now });
movementState = { ...movementState, profile: { ...profile, movementLimit: 'knees' } };
assert.equal(progress.applyTrainingAction(movementState, { type: 'answer', key: sessionKey(movement), answer: { option: '0' } }), movementState, 'New movement restrictions block an incompatible draft');
assert.equal(progress.getCycleProgress('2026-03-07', new Date(2026, 2, 9, 12)).day, 3, 'Civil-day cycle survives daylight saving');
const archived = { ...emptyTraining(), results: [b], sessions: {} };
assert.equal(reduceTraining(archived, { type: 'start', challenge: baseline, now }), archived, 'Archived results retain their reward identity');
console.log(`PASS: ${all.length} recipes, all seven mechanics, required interactions, timers, resume, scoring, difficulty, daily consistency, 42-day retest, and atomic XP.`);
