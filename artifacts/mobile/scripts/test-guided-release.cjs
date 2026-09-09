const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadSource, progress } = require('./test-support.cjs');
const m = loadSource('lib/training-model.ts'); const g = loadSource('lib/guided-programmes.ts');
const b = loadSource('lib/business-workspace.ts'); const { programmeAccess } = loadSource('lib/programme-access.ts');
const profile = { ...progress.normalizeProfile(null), businessRoute: 'service' };
const date = new Date(2026, 8, 7, 12); const at = date.toISOString();
let state = m.emptyTraining();
for (let i = 0; i < 4; i++) state = m.reduceTraining(state, { type: 'workspace', action: { kind: 'prospect', prospect: { id: 'p' + i, name: 'Business ' + i, phone: '012345678' + i, source: 'https://example.com' } } });
state = m.reduceTraining(state, { type: 'workspace', action: { kind: 'material', material: { id: 'sample', title: 'Sample', text: 'My saved work', version: 1 } } });
const restored = JSON.parse(JSON.stringify(state));
assert.equal(restored.workspace.materials.sample.text, 'My saved work');
assert.equal(restored.workspace.prospects.length, 4);
const template = g.programmeChallenge('freedom', profile, state, date);
const callStage = g.programmeUnits('freedom', profile)[10].stages[0];
const challenge = { ...template, stages: [callStage] };
state = m.reduceTraining(state, { type: 'start', challenge, now: at }); const key = m.sessionKey(challenge);
const start = (id, time = at) => ({ type: 'workspace', action: { kind: 'begin-call', key, prospectId: id, at: time } });
const outcome = (id, prospectId, value = 'No answer') => ({ type: 'workspace', action: { kind: 'call', call: { id, prospectId, sessionKey: key, outcome: value, at } } });
assert.equal(m.reduceTraining(state, start('p0')), state, 'No live calling before region selection');
state = m.reduceTraining(state, { type: 'workspace', action: { kind: 'region', origin: 'UK', region: 'UK' } });
assert.equal(m.reduceTraining(state, outcome('c0', 'p0')), state, 'Logging without beginning an attempt is rejected');
state = m.reduceTraining(state, start('p0'));
state = m.reduceTraining(state, { type: 'workspace', action: { kind: 'cancel-call', key } });
assert.equal(state.workspace.calls.length, 0, 'Cancellation creates no call');
assert.equal(m.workflowValid(callStage, {}, state, key), false, 'Cancellation cannot satisfy a call quest');
state = m.reduceTraining(state, start('p0')); state = m.reduceTraining(state, outcome('c0', 'p0', 'Not interested'));
assert.equal(state.workspace.calls.length, 1);
assert.equal(m.reduceTraining(state, outcome('c0', 'p0')), state, 'Repeated event does not create a duplicate');
assert.equal(m.reduceTraining(state, start('p0')), state, 'Declined contact is suppressed');
state = m.reduceTraining(state, { type: 'workspace', action: { kind: 'undo-call', id: 'c0' } });
assert.equal(state.workspace.calls.length, 0); assert.equal(b.canContact(state.workspace, 'p0'), true);
for (let i = 0; i < 3; i++) { state = m.reduceTraining(state, start('p' + i)); state = m.reduceTraining(state, outcome('c' + i, 'p' + i)); }
assert.equal(state.workspace.calls.length, 3); assert.equal(m.reduceTraining(state, start('p3')), state, 'Session capped at three attempts');
let expired = { ...state, workspace: { ...state.workspace, calls: [] } };
assert.equal(m.reduceTraining(expired, start('p3', new Date(date.getTime() + 61 * challenge.minutes * 1000).toISOString())), expired, 'Time budget blocks a new attempt');
assert.equal(programmeAccess({ minimumLevel: 3, released: true, prerequisites: ['missing'] }, 20, state), 'Complete prerequisites');
assert.equal(programmeAccess({ minimumLevel: 3, released: false, prerequisites: [] }, 20, state), 'Coming later');
assert.equal(programmeAccess({ minimumLevel: 3, released: true, prerequisites: [] }, 1, state), 'Rank locked');
assert.equal(g.refreshGuidedDrafts(state), state, 'Hydration never rewrites saved challenges');
assert.equal(m.workflowValid(callStage, { variant: 'practice' }, m.emptyTraining(), key), true, 'Practice can progress without inventing a call');
const legacy = { ...challenge, quest: { ...challenge.quest, id: 'freedom-programme-v1-service-4', title: 'Saved old assignment' } };
const legacyState = m.reduceTraining(m.emptyTraining(), { type: 'start', challenge: legacy, now: at });
assert.equal(g.programmeChallenge('freedom', profile, legacyState, new Date(2026, 8, 10)).quest.title, legacy.quest.title);
const share = fs.readFileSync('components/share-progress.tsx', 'utf8');
assert.ok(!/training|workspace|prospect|phone|materials/.test(share), 'Sharing only reads aggregate progress and authored quest titles');
let all = m.emptyTraining();
for (let day = 0; day < 14; day++) {
  const today = new Date(2026, 8, 7 + day, 12); const now = today.toISOString();
  const plan = g.guidedPlan(profile, all, today); assert.equal(plan.length, 3);
  for (const c of plan) {
    const k = m.sessionKey(c); all = m.reduceTraining(all, { type: 'start', challenge: c, now });
    for (const stage of c.stages) {
      if (stage.workflow === 'prospects') for (let i = 0; i < 3; i++) all = m.reduceTraining(all, { type: 'workspace', action: { kind: 'prospect', prospect: { id: 'p' + i, name: 'Business ' + i, phone: '012345678' + i, source: 'https://example.com' } } });
      const answer = stage.type === 'lesson' ? { acknowledged: true } : stage.type === 'performance' ? { variant: stage.variants[0], value: 5 } : { checks: stage.steps.map((_, i) => i), variant: 'practice' };
      all = m.reduceTraining(all, { type: 'answer', key: k, answer }); all = m.reduceTraining(all, { type: 'next', key: k });
    }
    all = m.reduceTraining(all, { type: 'feedback', key: k, value: 'right' }); all = m.reduceTraining(all, { type: 'finish', key: k, now });
    assert.equal(all.sessions[k].status, 'complete'); assert.equal(m.reduceTraining(all, { type: 'finish', key: k, now }), all);
  }
  assert.equal(g.guidedPlan(profile, all, today).length, 3, 'No replacement quests after completion');
}
assert.equal(all.results.length, 42); assert.equal(g.guidedPlan(profile, all, new Date(2026, 8, 21, 12)).length, 0);
assert.equal(JSON.parse(JSON.stringify(all)).results.length, 42);
console.log('PASS: complete 14-day flow, 42 preserved results, local material roundtrip, migration, call cancellation/undo/caps/budget/region gates, practice separation, prerequisites and share data boundary.');
