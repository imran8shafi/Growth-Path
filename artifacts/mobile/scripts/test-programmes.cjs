const assert = require('node:assert/strict');
const { loadSource, progress, render, slots } = require('./test-support.cjs');
const model = loadSource('lib/training-model.ts');
const programmes = loadSource('lib/guided-programmes.ts');
const { guidedPlan, programmeChallenge, programmeUnits, nextGuided } = programmes;
const { emptyTraining, reduceTraining, sessionKey, dateKey, stageValid, cleanAnswer } = model;
const date = new Date(2026, 8, 6, 12); const now = date.toISOString();
const profile = { ...progress.normalizeProfile(null), focusTrack: 'freedom', time: 'twenty', businessRoute: 'service' };
const legacyReading = programmeChallenge('mind', profile, emptyTraining(), date);
delete legacyReading.stages[0].seconds;
let legacyState = reduceTraining(emptyTraining(), { type: 'start', challenge: legacyReading, now });
const readingKey = sessionKey(legacyReading);
legacyState.sessions[readingKey].answers[legacyReading.stages[0].id] = { elapsed: 7 };
const refreshed = programmes.refreshGuidedDrafts(legacyState);
assert.equal(refreshed.sessions[readingKey].challenge.stages[0].seconds, undefined);
assert.equal(refreshed.sessions[readingKey].answers[legacyReading.stages[0].id].elapsed, 7);
const ticked = reduceTraining(refreshed, { type: 'tick', key: readingKey, seconds: 1 });
assert.equal(ticked.sessions[readingKey].answers[legacyReading.stages[0].id].elapsed, 8, 'Saved reading resumes its stopwatch');
assert.deepEqual(programmes.refreshGuidedDrafts(refreshed), refreshed, 'Draft refresh is idempotent');
function solve(state, c, feedback = 'right') {
  const key = sessionKey(c);
  state = reduceTraining(state, { type: 'start', challenge: c, now });
  for (const stage of c.stages) {
    if (stage.workflow === 'prospects') for (let i = 0; i < 3; i++) state = reduceTraining(state, { type: 'workspace', action: { kind: 'prospect', prospect: { id: 'p' + i, name: 'Business ' + i, phone: '012345678' + i, source: 'https://example.com' } } });
    const answer = stage.type === 'lesson' ? { acknowledged: true }
      : stage.type === 'action' ? { checks: stage.steps.map((_, i) => i), ...(stage.workflow?.startsWith('call') ? { variant: 'practice' } : {}) }
      : stage.type === 'artifact' ? { fields: Object.fromEntries(stage.fields.map((f) => [f.id, f.example])) }
      : stage.type === 'performance' ? { variant: stage.variants[0], value: 5 }
      : stage.type === 'choice' ? { option: (stage.options.find((o) => o.correct) ?? stage.options[0]).id }
      : null;
    assert.ok(answer, `Unsupported guided mechanic ${stage.type}`);
    assert.equal(stageValid(stage), false, 'Required stage cannot be bypassed');
    state = reduceTraining(state, { type: 'answer', key, answer });
    state = reduceTraining(state, { type: 'next', key });
  }
  state = reduceTraining(state, { type: 'feedback', key, value: feedback });
  return reduceTraining(state, { type: 'finish', key, now });
}
for (const time of ['ten', 'twenty', 'forty']) {
  const plan = guidedPlan({ ...profile, time }, emptyTraining(), date);
  assert.equal(plan.length, { ten: 3, twenty: 3, forty: 3 }[time]);
  assert.equal(plan[0].quest.track, 'freedom');
  assert.equal(new Set(plan.map((c) => c.quest.id)).size, plan.length);
  assert.ok(plan.every((c) => c.programme && c.quest.kind === 'path'));
}
let total = 0;
for (const route of ['service', 'saas', 'app']) for (const track of programmes.PROGRAMME_TRACKS) {
  const p = { ...profile, businessRoute: route };
  const units = programmeUnits(track, p);
  assert.equal(units.length, track === 'freedom' && route !== 'service' ? 7 : 14);
  for (let step = 0; step < units.length; step++) {
    const prefix = programmeChallenge(track, p, emptyTraining(), date).quest.id.replace(/1$/, '');
    const previous = units.slice(0, step).map((_, i) => ({ questId: `${prefix}${i + 1}`, date: '2026-09-05', successful: true }));
    const c = programmeChallenge(track, p, { ...emptyTraining(), results: previous }, date);
    assert.equal(c.programme.step, step + 1);
    assert.ok(c.stages.every(s => s.type !== 'choice'), 'Guided quests have no exam questions');
    assert.equal(new Set(c.stages.map(s => s.id)).size, c.stages.length);
    assert.ok(c.stages.every((s) => !['write', 'rating', 'ideas', 'attention', 'timer'].includes(s.type)), 'No filler reflection, storytelling, or breathing mechanics');
    assert.ok(!/storycraft|composure test|optional|side quest/i.test(c.quest.title + c.quest.detail));
    const result = solve(emptyTraining(), c);
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].successful, true);
    assert.equal(reduceTraining(result, { type: 'finish', key: sessionKey(c), now }), result);
    total++;
  }
}
const plan = guidedPlan(profile, emptyTraining(), date);
const readQuest = plan.find(c => c.quest.track === 'mind');
assert.ok(readQuest.stages[0].reading?.attribution.includes('Epictetus'));
let reading = reduceTraining(emptyTraining(), { type: 'start', challenge: readQuest, now });
reading = reduceTraining(reading, { type: 'tick', key: sessionKey(readQuest), seconds: 1 });
assert.equal(reading.sessions[sessionKey(readQuest)].answers[readQuest.stages[0].id].elapsed, 1);
assert.equal(stageValid(readQuest.stages[0], { acknowledged: true }), true, 'Reading has no minimum-time exam gate');
assert.deepEqual(Array.from(plan.find(c => c.quest.track === 'body').stages.filter(s => s.demonstration).map(s => s.demonstration)), ['sit-stand', 'wall-push']);
const started = reduceTraining(emptyTraining(), { type: 'start', challenge: plan[0], now });
const otherStarted = reduceTraining(emptyTraining(), { type: 'start', challenge: plan[2], now });
assert.equal(sessionKey(programmes.suggestedGuided(plan, otherStarted)), sessionKey(plan[2]), 'Suggest resuming an active quest before starting another');
assert.equal(sessionKey(programmes.suggestedGuided(plan, emptyTraining())), sessionKey(plan[0]), 'Use the assigned order when nothing is started');
const allDone = plan.reduce((state, c) => solve(state, c), emptyTraining());
assert.equal(programmes.suggestedGuided(plan, allDone), undefined, 'Completed plans never suggest extra work');
const later = new Date(2026, 8, 12, 12);
assert.equal(sessionKey(guidedPlan(profile, started, later)[0]), sessionKey(plan[0]), 'Missed days retain the unfinished assignment');
const done = solve(emptyTraining(), plan[0]);
assert.deepEqual(guidedPlan(profile, done, date).map(sessionKey), plan.map(sessionKey), 'Completing an assignment cannot add extra quests today');
assert.equal(nextGuided(guidedPlan(profile, done, date), done).quest.track, plan[1].quest.track);
const tomorrow = new Date(2026, 8, 7, 12);
assert.equal(guidedPlan(profile, done, tomorrow)[0].programme.step, 2);
const hard = solve(emptyTraining(), plan[0], 'hard');
assert.equal(guidedPlan(profile, hard, tomorrow)[0].programme.step, 1, 'Hard session repeats rather than escalating');
const changed = guidedPlan({ ...profile, businessRoute: 'app' }, started, date);
assert.equal(changed[0].programme.title, plan[0].programme.title, 'Active session freezes the business route');
const food = JSON.stringify(programmeUnits('body', { ...profile, dietStyle: 'plant' })[1]);
assert.ok(food.includes('beans or lentils')); assert.ok(!food.includes('eggs'));
const limited = programmeUnits('body', { ...profile, movementLimit: 'knees' })[0];
assert.ok(JSON.stringify(limited).includes('familiar'));
assert.ok(!JSON.stringify(limited).includes('clinician'));
assert.equal(programmeUnits('soul', profile).length, 0);
assert.equal(programmeChallenge('soul', profile, emptyTraining(), date), undefined);
const migrated = progress.normalizeProfile({ ...profile, focusTrack: 'soul', priorityTracks: ['soul', 'freedom'] });
assert.equal(migrated.focusTrack, 'mind');
assert.ok(!migrated.priorityTracks.includes('soul'));
assert.ok(guidedPlan({ ...profile, focusTrack: 'soul', time: 'forty' }, emptyTraining(), date).every(c => c.quest.track !== 'soul'));
assert.ok(JSON.stringify(programmeUnits('mind', profile)).includes('Take responsibility in practice'));
const action = programmeUnits('body', profile)[0].stages.find((s) => s.type === 'action' && s.steps.length > 1);
assert.equal(stageValid(action, { checks: [0] }), false);
const template = { id: 'legacy-template', type: 'artifact', fields: [{ id: 'customer', label: 'Customer', example: 'Cafe' }] };
assert.equal(stageValid(template, { fields: {} }), false);
assert.equal(cleanAnswer(template, { fields: { [template.fields[0].id]: 'x'.repeat(900), unwanted: 'discard' } }).fields[template.fields[0].id].length, 500);
for (const route of ['service', 'saas', 'app']) {
  for (const unit of programmes.businessUnits(route)) {
    assert.equal(unit.stages.length, 1, 'Business quests have one clear activity');
    assert.equal(unit.stages[0].type, 'action', 'Supply steps instead of questions or forms');
    assert.equal(unit.stages[0].steps.length, 3);
    assert.ok(unit.stages[0].steps.every(step => step.length < 200), 'Each screen keeps instructions short');
  }
}
const oldBusiness = reduceTraining(emptyTraining(), { type: 'start', challenge: { ...plan[0], stages: [template] }, now });
oldBusiness.sessions[sessionKey(plan[0])].answers[template.id] = { fields: { customer: 'My existing work' } };
const newBusiness = programmes.refreshGuidedDrafts(oldBusiness);
assert.equal(newBusiness.sessions[sessionKey(plan[0])].challenge.stages[0].id, 'legacy-template');
assert.equal(newBusiness.sessions[sessionKey(plan[0])].answers[template.id].fields.customer, 'My existing work');
assert.deepEqual(newBusiness.results, oldBusiness.results, 'Simplifying a draft does not award XP or change results');
assert.deepEqual(programmes.refreshGuidedDrafts(newBusiness), newBusiness);
render().setProfile(profile);
let current = slots[0];
const extra = programmeChallenge('body', profile, current.training, date);
assert.notEqual(progress.applyTrainingAction(current, { type: 'start', challenge: extra, now }), current, 'Can choose any assigned quest');
assert.equal(progress.applyTrainingAction(current, { type: 'start', challenge: { ...extra, scope: 'unassigned' }, now }), current, 'Cannot start a quest outside the daily mix');
const expected = nextGuided(guidedPlan(current.profile, current.training, date), current.training);
current = progress.applyTrainingAction(current, { type: 'start', challenge: { ...expected, quest: { ...expected.quest, xp: 9999 } }, now });
assert.equal(current.training.sessions[sessionKey(expected)].challenge.quest.xp, 40, 'Planner supplies the authoritative assignment');
const solved = solve(current.training, expected);
// Put the solved answers into an active session to test the atomic completion path.
current = { ...current, training: { ...solved, results: [], sessions: { [sessionKey(expected)]: { ...solved.sessions[sessionKey(expected)], status: 'active' } } } };
const saved = progress.applyTrainingAction(current, { type: 'finish', key: sessionKey(expected), now });
assert.equal(saved.totalCompleted, current.totalCompleted + 1);
assert.equal(saved.dailyRewardDates.includes(dateKey(date)), false, 'Partial main plan earns no daily bonus');
const short = { ...current, profile: { ...current.profile, time: 'ten' } };
const shortSaved = progress.applyTrainingAction(short, { type: 'finish', key: sessionKey(expected), now });
assert.ok(!shortSaved.dailyRewardDates.includes(dateKey(date)), 'One of three short quests does not complete the daily mix');
assert.equal(shortSaved.dailyXp[dateKey(date)] - (short.dailyXp[dateKey(date)] ?? 0), 40);
assert.equal(progress.applyTrainingAction(saved, { type: 'finish', key: sessionKey(expected), now }), saved);
console.log(`PASS: ${total} guided unit variants; time budgets, sequencing, missed days, no extras, prerequisites, route freezing, three-path migration/diet/movement preferences, artifact validation, and atomic XP.`);
