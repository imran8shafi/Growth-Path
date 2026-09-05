import { getCycleProgress, getDailyQuests, getTodayTasks, normalizeProfile, type AdaptivePlan, type OnboardingProfile, type Quest, type TrackKey } from '@/context/progress';
import { dateKey, seededIndex, trainingLevel, type Challenge, type Mechanic, type SkillKey, type Stage, type TrainingState } from './training-model';

const DEPTH: Record<SkillKey, string[]> = {
  focus: ['Name the distraction most likely to interrupt you and your response.', 'Describe how you returned after an interruption, or how you would.', 'Explain your output from memory and give a different application.', 'Design a repeatable work ritual, including a clear stopping point.'],
  reasoning: ['Give two plausible explanations of the same event.', 'Name evidence that would change your mind.', 'Write the strongest argument against your conclusion.', 'Write a decision brief: claim, evidence, uncertainty, and next test.'],
  memory: ['Connect the ideas with a vivid image.', 'Group the ideas into meaningful chunks.', 'Use what you retrieved in a new example.', 'Teach a retrieval strategy to a complete beginner.'],
  storytelling: ['Rewrite one vague detail as something the listener can picture.', 'Rewrite your first sentence to create curiosity.', 'Make your turning point clearer without exaggerating what happened.', 'Cut an unnecessary detail and rewrite the ending in one sentence.'],
  strength: ['Describe what makes your setup repeatable.', 'Name a technique cue you already know and used.', 'Describe how you chose a comfortable stopping point.', 'Write one question you would ask a qualified coach about your training.'],
  mobility: ['Name the range that felt comfortable.', 'Describe a routine you could repeat in the same setting.', 'Adapt the routine for a day with less time.', 'Describe how you would choose a suitable movement option on a different day.'],
  composure: ['Name one sign that tells you a reset could help.', 'Describe what helped you return your attention.', 'Name a situation where you could use a comfortable pause before responding.', 'Design your own short reset using what you have observed.'],
  conviction: ['Name the competing value and treat it fairly.', 'Write a respectful sentence that protects your boundary.', 'Name the social pressure and how you would respond.', 'Compare your principle with a real action and revise what needs revising.'],
  connection: ['Reflect the other person’s point without adding your judgment.', 'Name one assumption you might be making about the other person.', 'Prepare an opening sentence for a difficult but safe conversation.', 'Write a repair message that takes responsibility without demanding forgiveness.'],
  negotiation: ['Name an interest behind each person’s position.', 'Propose two options that change different constraints.', 'Name a reasonable alternative if there is no agreement.', 'Write a preparation brief: interests, options, limits, and an open question.'],
  independence: ['Name the main constraint on your plan.', 'Compare two routes using the same criteria.', 'Describe the smallest useful proof that your plan works.', 'Turn the next step into a repeatable process with a review date.'],
  creativity: ['Move your idea into a very different setting.', 'Adapt your idea for someone with fewer resources.', 'Combine your favorite idea with an unrelated object.', 'Develop one unusual use into a small, testable prototype.'],
  wit: ['Rewrite your reply with a very serious, deadpan tone.', 'Rewrite it around an unexpected, harmless image.', 'Add a callback to an earlier detail in your story.', 'Name when your joke would not fit the room and how you would adapt it.'],
  adaptability: ['Keep the same purpose but use half the resources.', 'Name one new constraint and a workable response.', 'Explain which tradeoff you chose and why.', 'Combine two changed conditions into a new plan.'],
  practical: ['Write the steps so a beginner could follow them.', 'Test a step and describe what was unclear.', 'Add a check that catches a likely mistake.', 'Explain the process in plain language and identify its limits.'],
};

const write = (id: string, title: string, prompt: string, minimum = 12): Stage => ({ id, title, prompt, type: 'write', minimum, placeholder: 'Make it specific. A sentence is enough.' });
const timer = (id: string, title: string, prompt: string, seconds: number, mode: 'focus' | 'composure' | 'movement' | 'prepare' | 'speak' = 'focus'): Stage => ({ id, title, prompt, type: 'timer', seconds, mode });
const rating = (id: string, title: string): Stage => ({ id, title, prompt: 'How scattered do you feel? This is your own rating, not a clinical measurement.', type: 'rating', low: 'Settled', high: 'Very scattered' });
const decision = (id: string, title: string, prompt: string, options: { label: string; response: string; correct?: boolean }[]): Stage => ({ id, title, prompt, type: 'choice', options: options.map((o, i) => ({ id: String(i), ...o })) });
const rubric = (items: string[]): Stage => ({ id: 'rubric', title: 'Review your attempt', prompt: 'Select what you included. This is self-review; the app does not judge the quality of your work.', type: 'checklist', items: [...items, 'I made an attempt and know what to improve'] });
const field = (prompt: string): Stage[] => [
  write('plan', 'Choose your next move', `${prompt} What will you do, when, and where? Keep names and sensitive details out of your notes.`),
  decision('outcome', 'Go do it. Come back here.', 'Your mission is saved. Leave the app when ready, then report what actually happened.', [
    { label: 'I followed through', response: 'Record one concrete observation from the interaction.' },
    { label: 'I tried; it did not work out', response: 'An honest attempt is useful evidence. What got in the way?' },
    { label: 'I chose a safer alternative', response: 'Good judgment includes changing the plan. Record your alternative.' },
  ]),
  write('report', 'Bring back evidence', 'What happened, what did you learn, and what would you change? A self-reported outcome is enough.'),
];

type Recipe = { title: string; summary: string; skill: SkillKey; mechanic: Mechanic; stages: Stage[] };
function recipeFor(quest: Quest, profile: OnboardingProfile | null, level: number, date: Date): Recipe {
  const p = normalizeProfile(profile);
  const seconds = p.time === 'ten' ? 60 : p.time === 'forty' ? 360 : 180;
  const duration = quest.adaptivePace === 'recovery' ? Math.max(30, Math.round(seconds * .6)) : seconds;
  const seed = `${dateKey(date)}:${quest.id}`;
  const choose = <T,>(items: T[]): T => items[seededIndex(seed, items.length)];
  const creation = (title: string, summary: string, skill: SkillKey, prompt: string, items: string[]): Recipe => ({ title, summary, skill, mechanic: 'creation', stages: [write('create', title, prompt), rubric(items)] });
  const mission = (title: string, summary: string, skill: SkillKey, prompt: string): Recipe => ({ title, summary, skill, mechanic: 'field', stages: field(prompt) });
  const composure: Recipe = { title: 'Composure reset', summary: 'Rate your state, follow a gentle visual interval, then compare your own ratings.', skill: 'composure', mechanic: 'timer', stages: [rating('before', 'Before the reset'), timer('reset', 'Find a comfortable tempo', 'Let the rings be a soft visual cue. Breathe normally or use a comfortable rhythm. No holds or forced deep breaths; stop if light-headed. You can simply observe the animation.', 60, 'composure'), rating('after', 'After the reset'), write('notice', 'What did you notice?', 'Name one change, or say that nothing changed. Either is useful.', 3)] };
  const memory: Recipe = { title: 'Recall trial', summary: 'Study a short set, retrieve it without looking, and see exactly what you recalled.', skill: 'memory', mechanic: 'skill', stages: [
    { id: 'recall', title: 'Observe, then retrieve', prompt: 'Study these words. When they disappear, enter the ones you remember in any order.', type: 'recall', seconds: 15, words: choose([
      ['river', 'candle', 'train', 'lemon', 'mirror', 'cloud', 'pencil', 'garden'], ['island', 'window', 'horse', 'silver', 'basket', 'bridge', 'planet', 'feather'], ['forest', 'button', 'tiger', 'orange', 'ladder', 'ocean', 'pillow', 'castle'], ['mountain', 'camera', 'apple', 'velvet', 'anchor', 'sunset', 'ribbon', 'village'],
    ]).slice(0, level + 3) }, write('strategy', 'Choose your next strategy', 'How did you connect the words? What might make them easier to retrieve next time?'),
  ] };
  const reasoning: Recipe = { title: 'Evidence room', summary: 'Choose a response, uncover its tradeoff, then build a stronger explanation.', skill: 'reasoning', mechanic: 'decision', stages: [
    decision('reason', 'What does the evidence show?', choose([
      'A friend says a new morning routine caused their success because success came after the routine. What is missing?',
      'A creator interviews only satisfied customers and concludes everyone benefits. What would you check?',
      'Your productivity rose the week you changed apps, but your workload also fell. What should you conclude?',
    ]), [
      { label: 'The story is convincing enough', response: 'A vivid story can suggest a hypothesis, but it does not rule out other explanations.', correct: false },
      { label: 'Check other explanations and the comparison group', response: 'Comparisons and alternative explanations help distinguish a useful clue from a causal claim.', correct: true },
      { label: 'Reject it because it is anecdotal', response: 'One story is limited evidence, but it can still be a clue worth testing.', correct: false },
    ]), write('counter', level >= 3 ? 'Argue the strongest alternative' : 'Ask the missing question', level >= 3 ? 'Write an alternative explanation and one observation that would distinguish it from the original claim.' : 'Write one question you would ask before accepting the claim.'),
  ] };
  const conviction: Recipe = { title: 'Values under pressure', summary: 'Face a tradeoff, choose your response, and name the principle behind it.', skill: 'conviction', mechanic: 'decision', stages: [
    decision('values', 'Choose deliberately', choose([
      'A friend asks you to publicly support an idea you disagree with. You value both honesty and friendship.',
      'You promised someone your time, but an exciting opportunity appears at the same time. What do you do first?',
      'A group laughs at someone who is not present. You want to belong without joining in.',
    ]), [
      { label: 'State my boundary with respect', response: 'This protects clarity. Consider tone and context so the other person can understand your boundary.' },
      { label: 'Ask questions before deciding', response: 'Curiosity may reveal a workable option. Set a point at which you will make your decision.' },
      { label: 'Speak privately or propose an alternative', response: 'A private conversation can reduce defensiveness. Make sure the alternative still honors your principle.' },
    ]), write('principle', 'Name the principle', 'Which value guided you, and what cost or tradeoff are you willing to accept? There is no universal score for your beliefs.'),
  ] };
  const negotiation: Recipe = { title: 'Negotiation lab', summary: 'Practice finding interests before debating a position.', skill: 'negotiation', mechanic: 'skill', stages: [
    decision('negotiate', 'Ask before arguing', 'A collaborator says your proposed deadline is impossible. A useful first step is to understand the constraint. What do you say?', [
      { label: 'What part of the deadline is hardest to meet?', response: 'An open question can reveal the actual constraint before you propose an option.', correct: true },
      { label: 'Everyone else can do it', response: 'Comparison adds pressure without learning what is preventing agreement.', correct: false },
      { label: 'Then accept my terms or leave', response: 'An ultimatum may close options before you know whether a workable tradeoff exists.', correct: false },
    ]), write('offer', 'Create two workable options', 'Write one option that changes timing and another that changes scope. What matters most to each person?'),
  ] };
  const story: Recipe = { title: 'Storycraft', summary: 'Build a hook, speak a short story, then review its structure.', skill: 'storytelling', mechanic: 'creation', stages: [
    write('hook', level >= 3 ? 'Lead with the unexpected' : 'Set the scene', choose(['A small mistake that taught you something.', 'A moment when your plan changed unexpectedly.', 'A time you misunderstood something funny.', 'An ordinary trip with one surprising detail.'])),
    timer('prepare', 'Find your turn', 'Choose one specific detail and the moment that changes the story.', 20, 'prepare'),
    timer('speak', 'Tell it in one minute', 'Speak aloud. This session does not record audio. You can write your version in the next step instead.', 60, 'speak'),
    write('payoff', 'Save your ending', 'Write the payoff, or your short version of the story.'), rubric(['A clear setup', 'A specific detail', 'A turn or payoff']),
  ] };
  if (quest.trait) {
    if (quest.trait === 'wit' && quest.id.includes('story')) return story;
    if (quest.trait === 'wit') return { title: 'Comeback lab', summary: 'Try a playful response, then explore three different comic styles.', skill: 'wit', mechanic: 'creation', stages: [
      write('reply', 'Keep it playful', choose(['A friend says: “You dress like someone’s dad.” Write a light response that does not insult them.', 'A friend says: “You are early. Are you feeling okay?” Write a playful reply.', 'Your friend says: “You brought a notebook to lunch?” Find a gentle joke.']), 3),
      decision('style', 'Explore the styles', 'Which style would fit your reply and this friendship?', [
        { label: 'Playful', response: 'Agree and exaggerate a little: “I take my unofficial responsibilities very seriously.”' },
        { label: 'Deadpan', response: 'Give an absurdly serious answer: “It is part of my five-year plan.”' },
        { label: 'Absurd', response: 'Jump to an unexpected image: “My committee of pigeons approved it.”' },
      ]), write('rewrite', 'Try another angle', 'Write a second version. Which would be kindest and most natural in that relationship?', 3),
    ] };
    if (quest.trait === 'creativity') return { title: 'Creativity trial', summary: 'Race the clock for distinct ideas, then develop the one you like most.', skill: 'creativity', mechanic: 'creation', stages: [
      { id: 'ideas', title: 'One object. Many possibilities.', prompt: `Invent uses for ${choose(['a brick', 'a paper clip', 'a cardboard box', 'a towel'])}.${level >= 3 ? ' Constraint: no uses involving its usual purpose.' : ''}`, type: 'ideas', seconds: 60, minimum: 0 }, write('develop', 'Make one idea useful', 'Choose one idea and explain who could use it and how.'),
    ] };
    if (quest.trait === 'adaptability') return { title: 'Plan B simulator', summary: 'Build an approach, receive a constraint, and change strategy.', skill: 'adaptability', mechanic: 'decision', stages: [
      write('original', 'Start with a plan', 'You need to teach someone a useful idea in five minutes. What is your approach?'),
      decision('twist', 'Conditions changed', choose(['You now have only one minute.', 'You cannot use a screen or a written note.', 'Your listener has no background in the subject.']), [
        { label: 'Simplify the idea', response: 'Keep one useful outcome; remove the supporting detail.' }, { label: 'Change the medium', response: 'A demonstration or concrete example may work better than explanation.' }, { label: 'Ask what they need', response: 'Find the part that matters to this person before spending the remaining time.' },
      ]), write('adapt', 'Rebuild the approach', 'Write your revised plan. What did you protect, and what did you let go?'),
    ] };
    if (quest.trait === 'social') return quest.id.includes('story') ? story : mission('Connection mission', 'Prepare one real conversation and bring back what you learned.', 'connection', 'Ask someone you know an open question, listen without interrupting, and reflect back one thing you heard. Respect their time and wish to decline.');
    if (quest.trait === 'courage') return mission('The honest conversation', 'Turn a safe, useful discomfort into one considered action.', 'conviction', 'Choose a low-stakes request, boundary, or conversation you have been postponing. Avoid confrontation or any situation that feels unsafe.');
    return creation('Practical workshop', 'Make and test a short checklist for an everyday task.', 'practical', 'Choose a routine you already know how to do safely. Write three steps, a way to check the result, and one common mistake.', ['Clear steps', 'A check for success', 'A common mistake']);
  }
  switch (quest.id) {
    case 'mind-focus': return { title: 'Focus chamber', summary: 'Define one output, protect a short interval, and capture what you finished.', skill: 'focus', mechanic: 'timer', stages: [write('goal', 'Define the finish line', 'What small output will exist at the end of this session?'), timer('focus', 'Protect the interval', 'Work on your output. Pause when interrupted; only time spent in an active session is counted.', duration), write('output', 'Show yourself the result', level >= 3 ? 'Summarize the output from memory and name where you will use it.' : 'What did you finish, and what is the next step?')] };
    case 'mind-read': return { title: 'Read → retrieve → apply', summary: 'Bring one idea from your book into practice.', skill: 'memory', mechanic: 'timer', stages: [write('question', 'Read with a question', 'Which book or idea are you working on, and what do you want to understand?'), timer('read', 'Read with attention', 'Use your book or included field guide. Pause this session if you switch apps; resume when you return.', duration), write('recall', 'Close the source', 'Explain the idea from memory and give one example of how you could use it.')] };
    case 'mind-learn': case 'mind-recall': return memory;
    case 'mind-reframe': return reasoning;
    case 'mind-journal': return creation('Thought to evidence', 'Separate an interpretation from what you actually know.', 'reasoning', 'Write one thought, one observable fact, and one alternative explanation.', ['A thought', 'An observable fact', 'Another explanation']);
    case 'mind-plan': return creation('Tomorrow by design', 'Make a specific plan with an interruption strategy.', 'focus', 'Name tomorrow’s one useful output, the first step, and what you will do if interrupted.', ['An output', 'A first step', 'An interruption plan']);
    case 'mind-digital': return mission('Distraction audit', 'Change one part of your environment and test it.', 'focus', 'Choose one distracting notification or easy-to-reach app. Change its setting, then try a short work interval.');
    case 'body-breathe': return composure;
    case 'body-strength': return { title: 'Strength log trial', summary: 'Record a comfortable, controlled set using the same setup each time.', skill: 'strength', mechanic: 'performance', stages: [
      decision('ready', 'Choose a suitable session', p.movementLimit !== 'none' ? 'Use only a movement and range already cleared for you. This app cannot assess an injury. You may choose a recovery review instead.' : 'Use a familiar movement you can do comfortably. Warm up as you normally do. Stop before technique breaks down, and stop for pain or feeling unwell. This is not a maximum-effort test.', [
        { label: 'I have a comfortable, suitable movement', response: 'Keep the setup consistent so future records can be compared.' },
        { label: 'I will review my training instead', response: 'Enter zero reps with “Recovery review” selected. You can still reflect without doing a set.' },
      ]), { id: 'performance', title: 'Log the set', prompt: 'Choose the exact setup and record clean reps. These are self-reported; no automatic increase is prescribed.', type: 'performance', unit: 'reps', maximum: 200, variants: p.movementLimit !== 'none' ? ['Previously cleared movement', 'Recovery review'] : ['Wall push-up', 'Incline push-up', 'Floor push-up', 'Recovery review'] },
      write('form', 'Save your setup', 'Describe your setup and how the set felt, or what you learned from the recovery review.'),
    ] };
    case 'body-move': return mission('Explorer mission', 'Choose a familiar, safe route with one new detail to observe.', 'mobility', 'Choose a short walk suited to your ability and conditions, or a suitable indoor alternative. Set your own distance; do not travel somewhere unsafe for a score.');
    case 'body-mobility': case 'body-recover': return { title: 'Movement studio', summary: 'Choose a comfortable movement, use a gentle interval, and log your response.', skill: 'mobility', mechanic: 'timer', stages: [write('movement', 'Choose your safe range', p.movementLimit !== 'none' ? 'Name one movement already cleared for you, or choose a seated observation break.' : 'Choose familiar, gentle movement or a seated observation break. Never force a painful range.'), timer('movement', 'Move at your own pace', 'Use comfortable movement only. Stop for pain or feeling unwell; you can finish the interval observing quietly.', Math.min(120, duration), 'movement'), write('response', 'What felt useful?', 'Name what felt comfortable and what you would change. No flexibility score is inferred.', 3)] };
    case 'body-daylight': return mission('Outdoor observation', 'Take a short, suitable outdoor break and notice your surroundings.', 'mobility', 'Choose an accessible outdoor spot in comfortable conditions. Notice three things you usually miss.');
    case 'body-sleep': return creation('Wind-down designer', 'Build a small evening routine around your actual schedule.', 'composure', 'Choose a realistic bedtime cue, one source of stimulation to put away, and an alternative if your evening changes.', ['A realistic cue', 'One environment change', 'A backup plan']);
    case 'body-hydrate': return creation('Environment designer', 'Turn a useful daily routine into an easy-to-notice cue.', 'practical', 'Choose one routine you already want to keep, such as water with a meal. Describe the cue, where it will be, and how you will test it. Follow any personal fluid restrictions.', ['A visible cue', 'A suitable place', 'A way to test it']);
    case 'soul-values': case 'soul-forgive': return conviction;
    case 'soul-prayer': return { title: p.beliefs === 'faith' ? 'Conviction in practice' : 'What deserves your attention?', summary: 'Choose a meaningful passage or principle, reflect, and give it an action.', skill: 'conviction', mechanic: 'timer', stages: [write('source', 'Choose your starting point', p.beliefs === 'faith' ? `Choose a passage, prayer, or teaching from your own ${p.faithTradition && !['other', 'private'].includes(p.faithTradition) ? p.faithTradition : 'faith'} tradition. You can keep its details private and name only the principle.` : 'Choose a principle you want to live by. Where did it come from, and why does it matter to you?'), timer('reflect', 'Give it your attention', 'Use this interval for your own practice. The app does not score belief or devotion.', Math.min(120, duration), 'prepare'), write('action', 'Turn it into action', 'What small action would express this principle today?')] };
    case 'soul-gratitude': return creation('Gratitude with a destination', 'Make appreciation specific enough to express.', 'connection', 'Name an act you appreciated, why it mattered, and what you would say to the person.', ['A specific act', 'Its impact', 'An honest expression']);
    case 'soul-stillness': return conviction;
    case 'soul-serve': return mission('Make yourself useful', 'Ask what would help, then bring back an honest outcome.', 'connection', 'Offer one small, practical act to someone you know. Ask what they need and accept a no.');
    case 'soul-awe': return creation('Perspective shift', 'Look at an ordinary moment from three different perspectives.', 'conviction', 'Describe one thing you noticed today. How might a child, an older person, and your future self see it?', ['An observation', 'Different perspectives', 'One thing you value']);
    case 'soul-review': return creation('Alignment review', 'Compare a principle with an actual decision.', 'conviction', 'Name a decision from today, the value it expressed, and one choice you would make differently.', ['A real decision', 'A principle', 'A next action']);
    case 'freedom-audit': return creation('Money map', 'Look at one recurring cost and make the tradeoff explicit.', 'independence', 'Use approximate amounts: name one recurring cost, what you get from it, and whether you would keep, change, or investigate it. Do not enter account details.', ['A cost', 'The value received', 'A decision']);
    case 'freedom-save': return creation('Options fund planner', 'Make a savings goal concrete without making a transfer in the app.', 'independence', 'Name a goal, an approximate cost, and a contribution you think fits your circumstances. What assumption needs checking?', ['A goal', 'A realistic contribution', 'An assumption to check']);
    case 'freedom-build': return { title: p.freedomStage === 'business' ? 'The useful offer' : 'Proof of skill', summary: 'Create one small output that another person could use.', skill: 'independence', mechanic: 'creation', stages: [write('brief', 'Define the recipient', 'Who could use what you are making, and what problem does it solve?'), timer('build', 'Make the smallest useful version', 'Draft an example, template, offer, or solution. Keep the scope inside this interval.', duration), write('artifact', 'Capture your proof', 'Paste a short version or describe the output and how someone would use it.')] };
    case 'freedom-learn': return negotiation;
    case 'freedom-outreach': return mission('Create an opportunity', 'Prepare a relevant message, send it yourself, and record the outcome.', 'negotiation', 'Choose one appropriate person to contact about work or learning. Write a helpful message, respect boundaries, and send it using your own app.');
    case 'freedom-plan': return creation('Constraint mapper', 'Choose the obstacle that matters most right now.', 'independence', p.freedomFocus === 'mobility' ? 'Choose a place you want to reach. What is the main constraint: cost, documents, time, or work? Name a next step and a source to verify.' : 'Name one constraint on your independence, two ways to reduce it, and the next useful step.', ['A constraint', 'Two options', 'A next step']);
    case 'freedom-travel': return creation('Route room', 'Compare two ways to reach a real goal.', 'independence', p.freedomFocus === 'financial' ? 'Estimate the cost of an experience you want. Compare two ways to make it affordable and list what you need to verify.' : 'Choose a destination and compare two routes on cost, time, and one practical constraint. Use current official sources before acting.', ['Two options', 'A cost/time tradeoff', 'Something to verify']);
    case 'freedom-system': return creation('System builder', 'Create a small process that saves future effort.', 'practical', 'Describe a repeated task. Write a trigger, three steps, and how you know it worked.', ['A trigger', 'Clear steps', 'A completion check']);
    default: throw new Error(`No interactive recipe for ${quest.id}`);
  }
}

export function questChallenge(quest: Quest, profile: OnboardingProfile | null, training: TrainingState, date: Date, cycleStartedAt: string): Challenge {
  const cycle = getCycleProgress(cycleStartedAt, date);
  const first = recipeFor(quest, profile, 1, date);
  const level = trainingLevel(first.skill, profile, training.results, dateKey(date));
  const recipe = recipeFor(quest, profile, level, date);
  if (level > 1) recipe.stages = [...recipe.stages, write('depth', `Level ${level}: apply the skill`, DEPTH[recipe.skill][level - 2])];
  const measured = recipe.stages.some((s) => s.type === 'recall' || s.type === 'performance' || s.type === 'ideas');
  const category = recipe.mechanic === 'field' ? 'mission' : measured ? 'trial' : 'quest';
  const minutes = Math.max(2, Math.ceil(recipe.stages.reduce((sum, s) => sum + ('seconds' in s ? s.seconds : s.type === 'choice' ? 20 : 30), 0) / 60));
  return { quest: { ...quest, title: recipe.title, detail: recipe.summary, meta: `${category.toUpperCase()} · ${minutes} MIN` }, mechanic: recipe.mechanic, category, skill: recipe.skill, level, stages: recipe.stages, minutes, scope: `day:${dateKey(date)}`, cycle: cycle.cycle, cycleDay: cycle.day, movementLimit: normalizeProfile(profile).movementLimit, reason: level > 1 ? `Level ${level} combines your starting preference with feedback from previous sessions.` : 'Start with a small, complete attempt. Your feedback calibrates future sessions.' };
}

const CHAPTER_SKILLS: SkillKey[][] = [
  ['memory', 'strength', 'focus'], ['focus', 'memory', 'reasoning'], ['strength', 'mobility', 'practical', 'independence'], ['conviction', 'connection', 'storytelling'], ['adaptability', 'negotiation', 'creativity'], ['practical', 'conviction', 'independence'],
];
export function trainingTrackTasks(track: TrackKey, profile: OnboardingProfile | null, date: Date, adaptive: AdaptivePlan, cycleStartedAt: string): Quest[] {
  const chapter = getCycleProgress(cycleStartedAt, date).chapterIndex;
  return getTodayTasks(track, profile, date, adaptive).sort((a, b) => Number(CHAPTER_SKILLS[chapter].includes(recipeFor(b, profile, 1, date).skill)) - Number(CHAPTER_SKILLS[chapter].includes(recipeFor(a, profile, 1, date).skill)));
}
export function trainingDailyTasks(profile: OnboardingProfile | null, date: Date, adaptive: AdaptivePlan, cycleStartedAt: string): Quest[] {
  return getDailyQuests(profile, date, adaptive).map((quest) => quest.kind === 'cross-training' ? quest : { ...trainingTrackTasks(quest.track, profile, date, adaptive, cycleStartedAt)[quest.kind === 'anchor' ? 1 : 0], kind: quest.kind });
}

export function specialChallenges(profile: OnboardingProfile | null, training: TrainingState, date: Date, cycleStartedAt: string): Challenge[] {
  const cycle = getCycleProgress(cycleStartedAt, date);
  const baseQuest = (id: string, track: TrackKey, title: string, detail: string, xp: number): Quest => ({ id, track, title, detail, xp, meta: '', trackColor: track === 'body' ? '#4CD6B0' : '#55D6FF', trackIcon: 'award' });
  // Fixed protocols let baseline and Day 42 results be compared on the same terms.
  const recall = questChallenge(baseQuest('mind-recall', 'mind', '', '', 35), { ...normalizeProfile(profile), ability: 'starting' }, { ...training, results: [] }, date, cycleStartedAt);
  const baseline: Challenge = { ...recall, quest: { ...recall.quest, id: 'mind-trial-baseline', title: 'Baseline: recall', detail: 'A fixed four-word / 15-second protocol. Return to it at the end of the cycle.' }, scope: `cycle:${cycle.cycle}:baseline`, category: 'trial', level: 1 };
  const strength = questChallenge(baseQuest('body-strength', 'body', '', '', 40), { ...normalizeProfile(profile), ability: 'starting' }, { ...training, results: [] }, date, cycleStartedAt);
  const strengthBaseline: Challenge = { ...strength, quest: { ...strength.quest, id: 'body-trial-baseline', title: 'Baseline: controlled movement', detail: 'Record a comfortable set and its setup. Use the same setup for your retest.' }, scope: `cycle:${cycle.cycle}:baseline`, category: 'trial', level: 1 };
  const weeks = [
    { title: 'The observer', skill: 'focus' as SkillKey, track: 'mind' as TrackKey, brief: 'Learn to notice a distraction, practice a response, and change one real environment.', lesson: 'A useful focus plan names an outcome and a response to interruption.', mission: 'Change one source of interruption and report what you noticed.' },
    { title: 'The communicator', skill: 'storytelling' as SkillKey, track: 'mind' as TrackKey, brief: 'Build a clear idea, rehearse it, and explain it to someone.', lesson: 'A concrete example gives an abstract idea something to attach to.', mission: 'Explain a useful idea to someone who wants to hear it. Ask what was clear and what was not.' },
    { title: 'The builder', skill: 'practical' as SkillKey, track: 'freedom' as TrackKey, brief: 'Turn an everyday problem into a small useful tool.', lesson: 'Start with the smallest version that solves one real problem.', mission: 'Create a short checklist, template, or example. Try it on a real task and report the result.' },
    { title: 'The principled voice', skill: 'conviction' as SkillKey, track: 'soul' as TrackKey, brief: 'Practice a respectful boundary and use it in a suitable setting.', lesson: 'A clear boundary describes your choice without trying to control the other person.', mission: 'Make a small respectful request or clarify an expectation in a safe, appropriate conversation.' },
    { title: 'The negotiator', skill: 'negotiation' as SkillKey, track: 'freedom' as TrackKey, brief: 'Learn an interest-first approach, rehearse, and try it in real life.', lesson: 'Ask about the other person’s constraint before proposing a tradeoff.', mission: 'Use one open question in a low-stakes collaboration. Look for a workable option without pressuring anyone.' },
    { title: 'The integrator', skill: 'adaptability' as SkillKey, track: 'mind' as TrackKey, brief: 'Combine a clear goal, a useful output, and a real-world test.', lesson: 'A good plan survives a change by protecting the purpose and adapting the method.', mission: 'Create something useful, ask someone to try it, and adjust one thing based on what happened.' },
  ];
  const week = weeks[cycle.chapterIndex];
  const boss: Challenge = {
    quest: baseQuest(`${week.track}-boss-${cycle.chapterIndex + 1}`, week.track, week.title, week.brief, 150),
    mechanic: 'boss', category: 'boss', skill: week.skill, secondarySkills: ['reasoning', 'connection'], level: trainingLevel(week.skill, profile, training.results, dateKey(date)),
    stages: [decision('lesson', 'Learn → choose', `${week.lesson} What is the strongest next step?`, [
      { label: 'Understand the situation and define a useful outcome', response: 'A specific outcome gives you something to test in the real world.', correct: true },
      { label: 'Push ahead without asking questions', response: 'Speed helps only if you are solving the right problem.', correct: false },
      { label: 'Wait until I can guarantee success', response: 'A low-stakes test can teach you something without a guarantee.', correct: false },
    ]), write('rehearse', 'Rehearse your approach', `Put this into your own words: ${week.lesson} Write the exact first action or sentence you will use.`), ...field(week.mission)],
    minutes: 15, scope: `cycle:${cycle.cycle}:week:${cycle.chapterIndex + 1}`, cycle: cycle.cycle, cycleDay: cycle.day, reason: 'One multi-stage challenge for this chapter. Your draft stays saved while you do the real-world part.',
  };
  const final: Challenge = { ...baseline, quest: { ...baseline.quest, title: 'Evolution: recall retest', detail: 'Repeat the same-length recall protocol and compare with your baseline.', xp: 75 }, scope: `cycle:${cycle.cycle}:final`, cycleDay: 42, stages: [...baseline.stages, write('integration', 'What changed outside the app?', 'Name one useful thing you can now do, one habit of practice to keep, and one area for the next cycle.')], reason: 'This retest compares the same protocol, not a global intelligence or ability score.' };
  const strengthFinal: Challenge = { ...strengthBaseline, quest: { ...strengthBaseline.quest, title: 'Evolution: movement retest', detail: 'Compare a comfortable set with the same setup as your baseline.', xp: 60 }, scope: `cycle:${cycle.cycle}:final`, cycleDay: 42 };
  return cycle.day === 42 ? [final, strengthFinal, boss] : [baseline, strengthBaseline, boss];
}
