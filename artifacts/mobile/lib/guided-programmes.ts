import type { OnboardingProfile, TrackKey } from '@/context/progress';
import { dateKey, sessionKey, type Challenge, type SkillKey, type Stage, type TrainingState } from './training-model';

const sources = {
  business: { title: 'SBA · Customer research and business planning', url: 'https://www.sba.gov/counseling/plan-your-business/' },
  thinking: { title: 'Epictetus · Enchiridion, sections 1 and 5 · Elizabeth Carter translation', url: 'https://classics.mit.edu/Epictetus/epicench.html' },
  movement: { title: 'NHS · Strength exercise demonstrations', url: 'https://www.nhs.uk/live-well/exercise/strength-exercises/' },
  diet: { title: 'WHO · Healthy diet', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet' },
};
type Unit = { title: string; outcome: string; stages: Stage[] };
const lesson = (title: string, points: string[], example: string, source?: Stage['source']): Stage => ({ id: 'learn', type: 'lesson', title, prompt: 'Understand the idea, then use it in the next step.', points, example, source });
const action = (title: string, steps: string[], alternative = 'Pause this assignment. Keep the completed steps and return when you can finish.'): Stage => ({ id: 'apply', type: 'action', title, prompt: 'Follow these steps in order. Mark each after doing it. Your place is saved when you leave the app.', steps, alternative, help: 'Start with the first unchecked step. You can leave and return without losing your work.' });
const choice = (title: string, prompt: string, options: [string, string, boolean?][]): Stage => ({ id: 'check', type: 'choice', title, prompt, options: options.map(([label, response, correct], i) => ({ id: String(i), label, response, ...(correct === undefined ? {} : { correct }) })) });
const artifact = (title: string, fields: [string, string, string][]): Stage => ({ id: 'build', type: 'artifact', title, prompt: 'Complete this template. It becomes part of your saved project, ready to reuse in the next assignment.', fields: fields.map(([id, label, example]) => ({ id, label, example })), help: 'Use the example as a pattern, then replace it with details from your own project. Short phrases are enough.' });

export function businessUnits(route: 'service' | 'saas' | 'app'): Unit[] {
  const service = route === 'service';
  const task = (title: string, steps: string[]): Unit => ({
    title, outcome: steps[0],
    stages: [{ id: 'guided-action', type: 'action', title, prompt: '', steps, alternative: 'Pause and come back when you are ready.' }],
  });
  return service ? [
    task('Make a sample café post', [
      'Open a free design tool. Choose a square social-post template.',
      'Use this sample: “Fresh coffee. A quieter start.” Add your own photo or a free-to-use coffee image.',
      'Export the image to a folder called My business. Label it Sample. Your first portfolio piece is ready.',
    ]),
    task('Find three cafés to learn from', [
      'Open the public social page of a nearby independent café.',
      'Look for a post showing its menu or opening hours. Save the page to your bookmarks.',
      'Repeat for two more cafés. These are your examples for tomorrow.',
    ]),
    task('Improve your sample', [
      'Open your saved sample and one bookmarked café page.',
      'Use a larger headline and one clear image. Keep the text readable on a phone.',
      'Save the updated image in My business.',
    ]),
    task('Prepare your first introduction', [
      'Open a new note in your My business folder.',
      'Copy this starter: “Hi! I’m building a portfolio of café social posts. May I send you a sample for feedback?”',
      'Add your name at the end. Save it for tomorrow.',
    ]),
    task('Ask for feedback once', [
      'Choose one bookmarked café with a public business contact.',
      'Send your saved introduction yourself. Wait for permission before sending the sample.',
      'Save the conversation. One request is enough; respect a no.',
    ]),
    task('Prepare a small service offer', [
      'Open a new note called My offer.',
      'Copy this scope: “Three social posts using your photos. One round of changes. Final files ready to publish.”',
      'Add “Price and delivery date agreed before work starts.” Save it beside your sample.',
    ]),
    task('Put your work together', [
      'Open My business. Place your sample and offer in one folder.',
      'Check spelling and whether the sample is easy to read on your phone.',
      'Save the folder as your starter portfolio. Use it in your next customer conversation.',
    ]),
  ] : [
    task(route === 'app' ? 'Sketch your first app' : 'Sketch your first SaaS tool', [
      'Use this starter project: a simple list that helps a tutor follow up on lesson enquiries.',
      'On paper, draw a list with three columns: Name, Next lesson, Follow-up date. Use fictional names.',
      'Photograph the sketch and save it in a folder called My business.',
    ]),
    task('Explore one existing tool', [
      'Open the free version or public demo of a task-list app you already know.',
      'Look at how it adds an item and marks it complete.',
      'Reopen your sketch. Add a clear Add enquiry button and a Done checkbox.',
    ]),
    task('Draw the next screen', [
      'Draw the screen that opens after Add enquiry.',
      'Use these labels: Student name, Lesson, Follow-up date. Add a Save button.',
      'Place this drawing beside your first sketch. You now have a two-screen flow.',
    ]),
    task('Prepare a feedback request', [
      'Open a new note in My business.',
      'Copy this starter: “Hi! I’m sketching a simple lesson-enquiry list. Could I show you two screens and watch how you would use them?”',
      'Add your name and save it. Use this with a tutor you know or an appropriate public business contact.',
    ]),
    task('Show your sketch to one person', [
      'Ask one tutor if they are willing to look at your sketch. Respect a no.',
      'If they agree, show the two screens and say: “Try adding an enquiry.” Watch where they hesitate.',
      'Circle one confusing part on your sketch. If they cannot try it yet, save your place and return later.',
    ]),
    task('Build a clickable demo', [
      'Open a free presentation tool. Recreate each sketch on a separate slide.',
      'Link Add enquiry to the second slide. Link Save back to the list.',
      'Run the slideshow and try both buttons. This is a demo, ready to show.',
    ]),
    task('Test your first demo', [
      'Open the demo on your phone.',
      'Tap Add enquiry, then Save. Fix any broken link or label that is hard to read.',
      'Save the tested version in My business. Your next milestone is one working feature.',
    ]),
  ];
}
const mind: Unit[] = [
  { title: 'Control the next action', outcome: 'A practical distinction between your choices and external outcomes.', stages: [lesson('Epictetus · Control and judgment', ['Your choices and an external result are different things.', 'Direct effort toward an action you can take.', 'This is a philosophical perspective, not a requirement to accept mistreatment.'], 'Before an interview you can prepare examples and arrive on time. You cannot determine the interviewer’s final decision.', sources.thinking), choice('Apply the distinction', 'Your application has not received a reply. Which action is within your control?', [['Guarantee that they respond', 'Another person’s response is outside your direct control.', false], ['Check the stated timeline and prepare another application', 'This gives you a concrete next action without assuming the outcome.', true]]), action('Use it today', ['Open one task you have been postponing.', 'Do its first concrete action: open the form, locate the document, or prepare the required materials.'])] },
  { title: 'Separate a fact from an interpretation', outcome: 'A tested response to an everyday assumption.', stages: [lesson('Observation first', ['An observation describes what happened.', 'An interpretation explains why you think it happened.', 'Check an interpretation before acting on it.'], '“The message has no reply” is an observation. “They dislike me” is one interpretation.'), choice('Check the assumption', 'A colleague missed your message. What is the most useful next step?', [['Assume deliberate disrespect', 'That conclusion adds information you do not have.', false], ['Check whether they saw it and clarify the deadline', 'A neutral check gathers evidence and moves the task forward.', true]])] },
  { title: 'Notice the missing comparison', outcome: 'A way to assess online success claims.', stages: [lesson('Selection bias', ['A sample may exclude unsuccessful cases.', 'Ask how examples were selected.', 'Look for outcomes and costs, not only testimonials.'], 'A course shows five successful customers without saying how many enrolled.'), choice('Ask the useful question', 'Which would help evaluate the course’s claim?', [['How many people enrolled and what were their outcomes?', 'This adds a denominator and reduces selection bias.', true], ['Does the founder look successful?', 'Appearance is not evidence of typical customer outcomes.', false]])] },
  { title: 'Learn by retrieving', outcome: 'A reading session about preparing your attention.', stages: [lesson('Retrieval practice', ['Try recalling before reopening the source.', 'Check the answer after the attempt.', 'Return to the idea on a later day.'], 'Try to identify the missing comparison in an advert, then revisit the selection-bias lesson.'), choice('Retrieve the lesson', 'An advert shows only winning customers. What is missing?', [['The outcomes of the wider customer group', 'Correct: the visible cases may not represent everyone.', true], ['More dramatic pictures of the winners', 'More selected examples do not fix the missing comparison.', false]])] },
  { title: 'Make a tradeoff deliberately', outcome: 'A decision made with a clear opportunity cost.', stages: [lesson('Opportunity cost', ['Choosing one use of limited time gives up another.', 'Compare realistic alternatives.', 'Include rest and existing responsibilities in the comparison.'], 'A free webinar still costs the hour that could have been spent completing a sample.'), action('Protect one work block', ['Find a ten-minute slot in your existing schedule.', 'Move one nonessential notification or browsing session out of that slot.', 'Use the slot for the next unfinished step in your main project.'])] },
  { title: 'Work through a moral dilemma', outcome: 'A reading and a practical act of responsibility.', stages: [choice('A friend asks you to hide a mistake', 'A friend made an error that could affect a customer. They ask you to stay silent. Which response will you examine?', [['Help them disclose and correct it', 'This protects the customer and supports your friend through taking responsibility.'], ['First establish the facts and actual impact', 'This avoids an inaccurate accusation. Set a prompt point for deciding how to correct the problem.'], ['Speak privately with a responsible supervisor', 'This may protect the customer when direct correction is not possible. Consider proportionality and confidentiality.']]), lesson('Compare the values', ['Honesty asks what the affected person needs to know.', 'Care asks how to reduce avoidable harm.', 'Responsibility asks who can correct the situation.'], 'Different approaches can serve these values. Agreement with the app is not a measure of moral worth.'), action('Take responsibility in practice', ['Find a small outstanding commitment: return an item, correct a mistaken detail, or finish an agreed task.', 'Take the corrective action. Acknowledge it honestly if another person is affected.'])] },
  { title: 'Check a claim before sharing it', outcome: 'A real claim checked at its original source.', stages: [action('Trace one claim', ['Choose one factual claim from a post you recently encountered.', 'Find its original source. Compare the claim with what the source actually says.', 'If the source cannot be found, treat the claim as unverified and avoid presenting it as established fact.']), choice('Apply what you learned', 'A product testimonial says improvement happened after using the product.', [['That alone proves the product caused it', 'Timing alone does not rule out other causes.', false], ['Check alternatives and comparative evidence', 'The testimonial is a starting point for investigation, not a controlled comparison.', true]]), action('Make care practical', ['Ask someone you already know whether help with one small task would be useful.', 'Help if they agree. If they decline, respect their answer and handle one shared household responsibility.'])] },
];

function bodyUnits(profile: OnboardingProfile | null): Unit[] {
  const limited = profile?.movementLimit && profile.movementLimit !== 'none';
  const protein = profile?.dietStyle === 'plant' ? 'beans or lentils' : profile?.dietStyle === 'vegetarian' ? 'beans, lentils, or plain yogurt if tolerated' : 'beans, lentils, eggs, or another suitable protein';
  const workout = (repeat: boolean): Unit => ({ title: repeat ? 'Repeat your strength session' : 'Learn your first strength session', outcome: 'A recorded, comfortable movement session.', stages: [
    ...(limited ? [lesson('Make movement comfortable', limited ? ['Stay within a familiar, comfortable range.', 'Do not test a painful movement to earn progress.', 'If movement feels unsuitable today, take a recovery day.'] : ['Use a stable chair and a clear floor.', 'Work slowly within a comfortable range.', 'Stop for pain, dizziness, or unusual symptoms.'], limited ? 'Prepare a clear space; do only a familiar movement that feels comfortable.' : 'Starter session: 5 slow sit-to-stands, rest 60 seconds, then 5 supported calf raises. Follow the movement guide below.', sources.movement)] : []),
    ...(!limited ? [{ ...action('Sit-to-stand', ['Set a stable chair against a wall. Keep feet flat, hip-width apart.', 'Lean forward slightly, stand slowly, then sit with control. Try up to five comfortable repetitions.']), id: 'sit-stand', demonstration: 'sit-stand' as const, source: sources.movement }, { ...action('Supported calf raise', ['Rest for about 60 seconds after sit-to-stands. Hold the chair back for balance.', 'Slowly lift your heels, then lower them with control. Try up to five comfortable repetitions.']), id: 'calf-raise', demonstration: 'calf-raise' as const, source: sources.movement }] : []),
    ...(limited ? [action('Follow the session', limited ? ['Choose a familiar, comfortable movement that suits your needs.', 'Set up the equipment or support it requires.', 'Keep the movement gentle and stop if it hurts.'] : ['Watch or read the sit-to-stand demonstration; position the stable chair.', 'Perform up to 5 slow sit-to-stands, then rest for 60 seconds.', 'Perform up to 5 supported calf raises. Stop early if needed.'], 'If movement feels unsuitable today, rest and prepare your space for another day.')] : []),
    { id: 'record', type: 'performance', title: 'Record what you actually did', prompt: 'Enter repetitions for the selected exercise only. Use 0 for preparation only; no improvement is required.', variants: limited ? ['Comfortable movement', 'Recovery review'] : ['Sit-to-stand', 'Recovery review'], unit: 'reps', maximum: 100 },
  ] });
  return [workout(false),
    { title: 'Assemble a balanced meal', outcome: 'One practical meal assembled from suitable foods.', stages: [lesson('Build from familiar foods', ['Combine vegetables, a protein source, and a fibre-rich staple.', 'Use affordable foods you already know are safe for you.', 'Adapt portions to your needs; this is a meal template, not a medical diet.'], `Example: vegetables, ${protein}, and rice or wholegrain bread. Use allergy-safe alternatives.`, sources.diet), action('Prepare your next meal', [`Check that you have vegetables, ${protein}, and a suitable staple.`, 'Check ingredients for allergens and your religious or dietary requirements.', 'Assemble the meal using safe food handling. Keep the remaining ingredients for another meal.'])] },
    { title: 'Make your next shop easier', outcome: 'A small grocery list that supports repeatable meals.', stages: [action('Build a three-meal shopping list', ['Check your cupboard and fridge before buying anything.', `Plan three meals using vegetables, ${protein}, and a staple you already eat.`, 'Add only missing ingredients to your normal shopping list. Compare unit prices and keep within your budget.']), choice('Choose a useful comparison', 'Two similar packaged foods have different serving sizes. How should you compare sodium?', [['Compare the same amount of each food', 'Using the same basis makes the comparison meaningful.', true], ['Pick the smaller printed number', 'The serving sizes may make that comparison misleading.', false]])] },
    { title: 'Prepare a reliable sleep routine', outcome: 'A prepared evening environment and realistic wake time.', stages: [action('Set up tonight', ['Choose a wake time compatible with your responsibilities.', 'Set your alarm and place distracting devices away from the bed if practical.', 'Prepare tomorrow’s clothes or materials so the morning has one fewer obstacle.'])] },
    workout(true),
    { title: 'Improve a usual takeaway order', outcome: 'A practical food substitution you can reuse.', stages: [lesson('Change the pattern', ['Compare portion size, vegetables, and protein.', 'Consider a less sugary drink and less frequent fried sides.', 'A single meal does not determine your health.'], 'Keep a familiar main dish, add vegetables when available, and choose water if suitable. Check allergens instead of assuming a “healthy” label guarantees safety.', sources.diet), action('Prepare your next order', ['Open the menu of a place you actually use.', 'Identify one suitable order with vegetables and protein within your budget.', 'Save the order in your usual notes or favourites. Buying food is not required for this step.'])] },
    { title: 'Review your physical foundation', outcome: 'A repeatable training and meal routine.', stages: [action('Make the routine repeatable', ['Compare your two movement records using the same setup; a higher number is not required.', 'Keep one suitable meal from this unit in your regular rotation.', 'Place the next two suitable movement sessions in your schedule with recovery between them.']), choice('Choose the next improvement', 'A routine causes pain but promises faster progress.', [['Continue to protect the streak', 'Stop the painful movement and seek suitable guidance. A streak is not a reason to ignore pain.', false], ['Stop and adjust with appropriate guidance', 'Sustainable practice depends on an appropriate routine.', true]])] },
  ];
}

const readingPassages = [
  ['1', 'Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions.', 'Focus on the next action you can take.'],
  ['5', 'Men are disturbed, not by things, but by the principles and notions which they form concerning things.', 'Separate an event from your interpretation. This is a historical perspective, not a reason to blame yourself for harm.'],
  ['6', "Only your reaction to the appearances of things.", 'Look beyond appearances when judging success.'],
  ['4', 'When you are going about any action, remind yourself what nature the action is.', 'Prepare for ordinary interruptions before beginning.'],
  ['10', 'With every accident, ask yourself what abilities you have for making a proper use of it.', 'Choose a useful response to a small setback.'],
  ['8', "Don't demand that things happen as you wish, but wish that they happen as they do happen, and you will go on well.", 'Distinguish accepting a fact from approving it. You can still take responsible action.'],
  ['1', 'Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions.', 'Return to the opening passage and apply one useful idea.'],
];
const readingMind: Unit[] = mind.map((unit, i) => ({
  ...unit, title: ['Read: what is in your control', 'Read: events and judgments', 'Read: appearances and character', 'Read: prepare your attention', 'Read: responding to setbacks', 'Read: acceptance and action', 'Revisit your first passage'][i],
  stages: [
    { ...lesson('The Enchiridion · Section ' + readingPassages[i][0], [readingPassages[i][2]], 'Read slowly. Take one useful idea into your day.', undefined), reading: { passage: readingPassages[i][1], attribution: 'Epictetus · The Enchiridion §' + readingPassages[i][0] + ' · Elizabeth Carter translation (public domain)' }, seconds: 3600 },
    ...unit.stages.filter(stage => stage.type === 'action'),
  ],
}));

export const PROGRAMME_TRACKS: TrackKey[] = ['mind', 'body', 'freedom'];
const colors = { mind: '#55D6FF', body: '#4CD6B0', soul: '#FFCC66', freedom: '#A998FF' };
const skills: Record<TrackKey, SkillKey> = { mind: 'reasoning', body: 'strength', soul: 'conviction', freedom: 'independence' };
export function programmeUnits(track: TrackKey, profile: OnboardingProfile | null) {
  return track === 'mind' ? readingMind : track === 'body' ? bodyUnits(profile) : track === 'soul' ? [] : businessUnits(profile?.businessRoute ?? 'service');
}
export function programmeTitle(track: TrackKey, profile: OnboardingProfile | null) {
  return { mind: 'Clear thinking', body: 'Movement & everyday nutrition', soul: profile?.beliefs === 'faith' ? 'Faith in daily life' : 'Ethics in daily life', freedom: { service: 'Service business foundation', saas: 'SaaS foundation', app: 'App business foundation' }[profile?.businessRoute ?? 'service'] }[track];
}
function branch(track: TrackKey, p: OnboardingProfile | null) { return track === 'freedom' ? p?.businessRoute ?? 'service' : track === 'soul' ? p?.beliefs === 'faith' ? p.faithTradition ?? 'private' : 'ethics' : 'core'; }
export const isGuided = (c: Challenge) => Boolean(c.quest.track !== 'soul' && c.programme && c.scope.startsWith('programme:quests:'));
// Upgrade presentation in saved drafts without changing answers, stage IDs or awards.
export function refreshGuidedDrafts(training: TrainingState): TrainingState {
  return { ...training, sessions: Object.fromEntries(Object.entries(training.sessions).map(([key, session]) => {
    if (session.status !== 'active' || !isGuided(session.challenge)) return [key, session];
    if (session.challenge.quest.track === 'freedom' && !session.challenge.stages.some(s => s.id === 'guided-action')) {
      const route = session.challenge.quest.id.includes('-saas-') ? 'saas' : session.challenge.quest.id.includes('-app-') ? 'app' : 'service';
      const unit = businessUnits(route)[(session.challenge.programme?.step ?? 1) - 1];
      if (unit) return [key, { ...session, stageIndex: 0, feedback: undefined, challenge: { ...session.challenge, stages: unit.stages, quest: { ...session.challenge.quest, title: unit.title, detail: unit.outcome }, programme: { ...session.challenge.programme!, outcome: unit.outcome } } }];
    }
    const stages = session.challenge.stages.map((stage) => {
      const clean = (text: string) => text.replace(/ and follow any prescribed diet\./g, '.').replace(/clinician-approved/g, 'familiar, comfortable').replace(/already cleared/g, 'familiar and comfortable');
      const updated = JSON.parse(JSON.stringify(stage, (_key, value) => typeof value === 'string' ? clean(value) : value)) as Stage;
      return updated.type === 'lesson' && updated.reading ? { ...updated, seconds: updated.seconds ?? 3600, source: undefined } : updated;
    });
    return [key, { ...session, challenge: { ...session.challenge, stages } }];
  })) };
}
export function programmeChallenge(track: TrackKey, p: OnboardingProfile | null, training: TrainingState, date: Date): Challenge | undefined {
  if (track === 'soul') return undefined;
  const units = programmeUnits(track, p); const route = branch(track, p); const prefix = `${track}-programme-v1-${route}-`;
  // Freeze the assignment for the day; completing it never offers a second quest in its place.
  const today = Object.values(training.sessions).find((s) => isGuided(s.challenge) && s.challenge.quest.track === track && (dateKey(new Date(s.startedAt)) === dateKey(date) || training.results.some((r) => r.sessionKey === s.key && r.date === dateKey(date))));
  if (today) return today.challenge;
  const done = new Set(training.results.filter((r) => r.date < dateKey(date) && r.successful).map((r) => r.questId));
  const index = units.findIndex((_, i) => !done.has(`${prefix}${i + 1}`));
  if (index < 0) return undefined;
  const unit = units[index]; const questId = `${prefix}${index + 1}`;
  const old = Object.values(training.sessions).find((s) => isGuided(s.challenge) && s.challenge.quest.id === questId && s.status === 'active' && (track !== 'body' || s.challenge.movementLimit === (p?.movementLimit ?? 'none')));
  if (old) return old.challenge;
  // Retrying a previous incomplete or difficult attempt gets a new session, never repeats a same-day award.
  const scope = `programme:quests:${dateKey(date)}`;
  return { quest: { id: questId, track, title: unit.title, detail: unit.outcome, xp: 40, meta: '10 MIN · GUIDED', trackColor: colors[track], trackIcon: track === 'body' ? 'activity' : 'compass', kind: 'path' },
    skill: skills[track], mechanic: 'skill', category: 'quest', level: 1, minutes: p?.time === 'forty' ? 10 : p?.time === 'twenty' ? (track === 'freedom' ? 8 : 6) : (track === 'freedom' ? 4 : 3), scope, cycle: 1, cycleDay: index + 1,
    movementLimit: p?.movementLimit ?? 'none', stages: unit.stages.map((stage) => stage.type === 'choice' ? ({ id: stage.id, type: 'lesson' as const, title: 'A useful example', prompt: stage.prompt, points: stage.options.filter(o => o.correct !== false).map(o => o.response), example: 'Use this guidance in your next real-world step. No answer or score is needed.' }) : stage).map((stage, i, stages) => ({ ...stage, id: stages.slice(0, i).some((earlier) => earlier.id === stage.id) ? `${stage.id}-${i}` : stage.id })),
    reason: `${programmeTitle(track, p)} · Assignment ${index + 1} of ${units.length}. Work at your pace; the time is an estimate, not a deadline.`,
    programme: { title: programmeTitle(track, p), step: index + 1, total: units.length, outcome: unit.outcome, next: units[index + 1]?.title ?? 'Foundation complete. Continue applying your saved materials in daily life.' },
  };
}
export function guidedPlan(p: OnboardingProfile | null, training: TrainingState, date: Date): Challenge[] {
  const primary = p?.focusTrack === 'soul' ? 'mind' : p?.focusTrack ?? 'mind'; const count = 3;
  const prior = training.results.filter((r) => r.date < dateKey(date) && r.questId.includes('-programme-v1-'));
  const rest = PROGRAMME_TRACKS.filter((t) => t !== primary).sort((a, b) => prior.filter((r) => r.track === a).length - prior.filter((r) => r.track === b).length);
  return [primary, ...rest].map((track) => programmeChallenge(track, p, training, date)).filter((c): c is Challenge => Boolean(c)).slice(0, count);
}
export function nextGuided(plan: Challenge[], training: TrainingState) { return plan.find((c) => !training.results.some((r) => r.sessionKey === sessionKey(c))); }
export function suggestedGuided(plan: Challenge[], training: TrainingState) {
  const available = plan.filter(c => !training.results.some(r => r.sessionKey === sessionKey(c)));
  return available.find(c => training.sessions[sessionKey(c)]?.status === 'active') ?? available[0];
}
