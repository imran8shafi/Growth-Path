// Exercise the actual planner and provider state transitions without a device runtime.
const assert = require('node:assert/strict');
const { slots, render, progress: { buildAdaptivePlan, getTodayTasks, getDailyQuests, getTodayCrossTraining, getTrackTasks, advanceProgressDay, getFastingTargetHours } } = require('./test-support.cjs');
const date = new Date(2026, 8, 15, 12);
const days = ['2026-09-10', '2026-09-11', '2026-09-12', '2026-09-13', '2026-09-14'];
const tracks = ['mind', 'body', 'soul', 'freedom'];
const profile = { time: 'forty', priorityTracks: ['mind', 'body'], focusTrack: 'mind', ability: 'starting', coachingStyle: 'adaptive', movementLimit: 'none', fastingPreference: 'off', fastingSafety: 'blocked' };
const event = (track, day, questId = `${track}-focus`, trait) => ({ track, date: day, questId, trait, xp: 40, completedAt: `${day}T12:00:00.000Z` });
const equal = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected));

const cold = buildAdaptivePlan([], [], profile, date);
assert.equal(cold.mode, 'foundation');
const low = buildAdaptivePlan([], days, profile, date);
assert.equal(low.mode, 'recovery', 'Zero follow-through must still trigger a lighter plan');
assert.equal(getDailyQuests(profile, date, low).some((quest) => quest.kind === 'anchor'), false);
const fullHistory = days.flatMap((day) => tracks.map((track) => event(track, day)));
const full = buildAdaptivePlan(fullHistory, days, profile, date);
assert.equal(full.mode, 'stretch');
assert.equal(full.paceByTrack.body, 'steady', 'Completions alone must not raise physical workload');

const duplicates = days.flatMap((day) => [event('mind', day), event('mind', day, 'mind-read'), event('mind', day, 'mind-journal')]);
const narrow = buildAdaptivePlan(duplicates, days, profile, date);
assert.equal(narrow.completionRate, 0.25, 'Extra quests cannot substitute for the other three paths');
assert.notEqual(narrow.weakestTrack, 'mind');
const traitHistory = ['wit', 'adaptability', 'courage', 'social', 'creativity'].map((trait) => event('mind', days[0], `mind-trait-${trait}-example`, trait));
const traitPlan = buildAdaptivePlan([...fullHistory, ...traitHistory], days, profile, date);
assert.equal(traitPlan.weakestTrait, 'practical');
assert.equal(getTodayCrossTraining(profile, date, traitPlan).trait, 'practical');

const todayEvents = tracks.map((track) => event(track, '2026-09-15'));
const before = getDailyQuests(profile, date, full);
const after = getDailyQuests(profile, date, buildAdaptivePlan([...fullHistory, ...todayEvents], [...days, '2026-09-15'], profile, date));
equal(after, before);
equal(getDailyQuests(profile, date, buildAdaptivePlan(JSON.parse(JSON.stringify(fullHistory)), days, profile, date)), before);
for (const track of tracks) {
  const selected = getTodayTasks(track, profile, date, full);
  assert.equal(new Set(selected.map((task) => task.id)).size, 3);
  assert.equal(before.find((quest) => quest.kind === 'path' && quest.track === track).id, selected[0].id);
}
const excluded = getTodayTasks('mind', profile, date)[0].id;
const repeated = buildAdaptivePlan([event('mind', days[4], excluded)], days, profile, date);
assert.equal(getTodayTasks('mind', profile, date, repeated).some((quest) => quest.id === excluded), false);
const read = (plan) => getTrackTasks('mind', profile, plan).find((task) => task.id === 'mind-read');
assert.match(read(low).detail, /12 minutes/);
assert.match(read(full).detail, /from memory/);
const safeProfile = { ...profile, movementLimit: 'knees' };
assert.match(getTrackTasks('body', safeProfile, full).find((task) => task.id === 'body-strength').detail, /already cleared/);
assert.equal(getFastingTargetHours(profile), 12);

render().setProfile(profile);
const currentDate = slots[0].lastActiveDate;
render().toggle('mind-trait-wit-angle', 'mind', 30, 'wit');
assert.equal(slots[0].completionHistory.length, 1);
assert.equal(render().traitXp('wit'), 30);
render().toggle('mind-trait-wit-angle', 'mind', 30, 'wit');
assert.equal(slots[0].completionHistory.length, 0);
assert.equal(render().traitXp('wit'), 0);
for (const track of tracks) render().toggle(`${track}-focus`, track, 40);
const rewardedXp = render().totalXp;
render().toggle('freedom-focus', 'freedom', 40);
render().toggle('freedom-focus', 'freedom', 40);
assert.equal(render().totalXp, rewardedXp, 'Undo/redo cannot farm the daily bonus');
assert.equal(slots[0].completionHistory.length, 4);
assert.equal(slots[0].observedDates.filter((day) => day === currentDate).length, 1);
const tomorrow = new Date(`${currentDate}T12:00:00`);
tomorrow.setDate(tomorrow.getDate() + 1);
const rolled = advanceProgressDay(slots[0], tomorrow);
assert.equal(rolled.completedToday.length, 0);
assert.equal(rolled.completionHistory.length, 4);
assert.equal(rolled.totalCompleted, 4);
assert.equal(advanceProgressDay(rolled, tomorrow), rolled, 'Rollover must be idempotent');
console.log('PASS: cold start, low completion, balanced practice, duplicate coverage, weak skills, stable day/reload, shared selection, variety, difficulty, movement limits, undo/redo, and midnight rollover.');
