const assert = require('node:assert/strict');
const { loadSource, progress } = require('./test-support.cjs');
const { programmeUnits, programmeChallenge } = loadSource('lib/guided-programmes.ts');
const { bodyMaterials } = loadSource('lib/body-training.ts');
const { emptyTraining, reduceTraining, sessionKey } = loadSource('lib/training-model.ts');
const base = progress.normalizeProfile(null);
for (const equipment of ['none', 'home', 'gym']) for (const time of ['ten', 'twenty', 'forty']) for (const ability of ['starting', 'building', 'advanced']) {
  const units = programmeUnits('body', { ...base, equipment, time, ability });
  assert.equal(units.length, 14);
  for (const i of [0, 4, 7, 11]) {
    const moves = units[i].stages.filter(s => s.demonstration);
    assert.equal(moves.length, time === 'ten' || ability === 'starting' ? 2 : 4);
    assert.equal(new Set(units[i].stages.map(s => s.id)).size, units[i].stages.length);
    assert.ok(units[i].stages.some(s => s.restSeconds === 60));
    assert.ok(!JSON.stringify(units[i]).includes('Max'));
  }
  assert.equal(units[4].stages.some(s => s.demonstration === 'biceps-curl'), equipment !== 'none');
}
for (const movementLimit of ['knees', 'back', 'shoulders', 'other']) {
  const units = programmeUnits('body', { ...base, movementLimit });
  assert.ok(units.every(u => u.stages.every(s => !s.demonstration)), 'Known movement limitations retain the comfortable alternative');
}
const plant = bodyMaterials({ ...base, dietStyle: 'plant' });
assert.ok(plant.meal.text.includes('beans or lentils')); assert.ok(!/eggs|chicken|yogurt/.test(plant.meal.text));
assert.ok(!/raw milk|fast 14|avoid.*beans|shredded in/i.test(JSON.stringify(plant)));
const date = new Date(2026, 8, 8, 12); const c = programmeChallenge('body', base, emptyTraining(), date);
let state = reduceTraining(emptyTraining(), { type: 'start', challenge: c, now: date.toISOString() }); const key = sessionKey(c);
const rest = c.stages.findIndex(s => s.restSeconds);
state.sessions[key].stageIndex = rest;
for (let i = 0; i < 12; i++) state = reduceTraining(state, { type: 'tick', key, seconds: 1 });
state = JSON.parse(JSON.stringify(state));
assert.equal(state.sessions[key].answers[c.stages[rest].id].elapsed, 12, 'Rest timer survives storage roundtrip');
const resumed = programmeChallenge('body', { ...base, equipment: 'gym', ability: 'advanced' }, state, new Date(2026, 8, 10));
assert.deepEqual(resumed, state.sessions[key].challenge, 'Changing preferences never rewrites an active workout');
console.log('PASS: 27 equipment/time/ability combinations, 14 sessions, movement limits, meal preferences, rest persistence and active workout preservation.');
