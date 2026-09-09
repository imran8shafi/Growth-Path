import type { OnboardingProfile } from '@/context/progress';
import type { Stage } from './training-model';
import type { GuidedUnit } from './lead-generation';
import type { Material } from './business-workspace';

const source = { title: 'NHS · Strength exercise guidance', url: 'https://www.nhs.uk/live-well/exercise/strength-exercises/' };
const material = (id: string, title: string, text: string): Material => ({ id: `body-${id}`, title, text, version: 1 });
export function bodyMaterials(p: OnboardingProfile | null) {
  const protein = p?.dietStyle === 'plant' ? 'beans or lentils' : p?.dietStyle === 'vegetarian' ? 'beans, lentils or suitable plain yogurt' : 'beans, lentils, eggs or cooked chicken';
  return {
    week: material('weekly-plan', 'Your two-week training plan', 'Week 1\n1 · Strength A\n2 · Assemble a meal\n3 · Prepare a shopping list\n4 · Walk and prepare for sleep\n5 · Strength B\n6 · Plan a useful takeaway order\n7 · Recovery and routine review\n\nWeek 2\n8 · Repeat A\n9 · Comfortable walk\n10 · Meal preparation\n11 · Recovery\n12 · Repeat B\n13 · Shopping\n14 · Keep your routine\n\nFollow the next assigned quest. Missed days carry forward. Do not double up to catch up. Use the same comfortable dose when repeating; XP never raises the weight or repetitions.'),
    meal: material(`meal-${p?.dietStyle ?? 'mixed'}`, 'A ready-to-use meal template', `One meal\n• Vegetables you enjoy, fresh or frozen\n• ${protein}\n• Rice, potato or suitable wholegrain bread\n• A little suitable unsaturated oil or dressing\n\nExample: a bean-and-vegetable bowl with rice. Choose portions to match your appetite and needs. Check allergies and religious requirements. You do not need premium, organic or branded ingredients.`),
    shopping: material(`shopping-${p?.dietStyle ?? 'mixed'}`, 'Your starter grocery list', `Check your kitchen first; buy only missing items within your budget.\n\n□ ${protein}\n□ Two vegetables you like\n□ A familiar grain, rice or potato\n□ Fruit for a convenient snack\n□ Suitable seasonings\n\nUse frozen or canned foods when useful. Compare unit prices. Check ingredients for allergens and dietary requirements. Adjust quantities for your household; no purchase is required to complete planning.`),
    prep: material('bean-bowl', 'A quick bean bowl', 'Original meal example · one serving\n\nIngredients\n½–1 cup cooked or canned beans, drained and rinsed\nA handful each of chopped cucumber and tomato\nA little lemon juice and olive oil, to taste\nA suitable serving of bread or cooked grain alongside\n\n1 · Wash hands and vegetables. Use ready-to-eat or properly cooked beans.\n2 · Mix the beans and chopped vegetables.\n3 · Add dressing and your chosen staple. Adjust portions to your needs.\n\nUse familiar alternatives for allergies. Keep perishable leftovers chilled promptly and follow their storage guidance.'),
    recovery: material('recovery', 'Your recovery checklist', 'Between strength sessions\n□ Keep a comfortable day without another hard session.\n□ Eat regular meals that suit you.\n□ Make water available and drink to your needs.\n□ Prepare a consistent bedtime around your responsibilities.\n\nBefore repeating\nUse the same setup. Do fewer repetitions or rest if needed. Stop a movement that causes pain, dizziness or unusual symptoms. Progress is consistency and control, not maximum effort every day.'),
  };
}

// Original beginner adaptation of the source's exercise → sets → rest format.
// Its high-volume splits, failure sets and fasting instructions are not prescribed.
export function enrichBodyProgramme(units: GuidedUnit[], profile: OnboardingProfile | null): GuidedUnit[] {
  const mats = bodyMaterials(profile); const limited = profile?.movementLimit && profile.movementLimit !== 'none';
  const rounds = profile?.time !== 'ten' && profile?.time !== undefined && profile?.ability !== 'starting' && profile?.ability !== undefined ? 2 : 1;
  const weighted = profile?.equipment === 'home' || profile?.equipment === 'gym';
  const move = (id: string, title: string, steps: string[], demonstration: Stage['demonstration']): Stage => ({ id, type: 'action', title, prompt: '', steps, demonstration, source, alternative: 'Stop and return when this movement is comfortable.' });
  const exercises: Record<string, Stage> = {
    legs: move('sit-stand', 'Sit-to-stand', ['Use a stable chair with no wheels. Place your feet flat and lean forward slightly.', 'Stand slowly, then sit with control. Try up to five comfortable repetitions.'], 'sit-stand'),
    push: move('wall-push', 'Wall press-up', ['Face a wall at arm’s length, palms at chest height and fingers up.', 'Keep your body straight. Bend your elbows by your sides, then push gently away. Try up to five comfortable repetitions.'], 'wall-push'),
    calves: move('calf-raise', 'Supported calf raise', ['Hold a stable chair for balance.', 'Raise both heels slowly, then lower with control. Try up to five comfortable repetitions.'], 'calf-raise'),
    curl: move('biceps-curl', 'Light biceps curl', [`Use ${profile?.equipment === 'gym' ? 'light dumbbells' : 'two light, securely closed water bottles'}. Keep your elbows beside your body.`, 'With palms facing forward, bend your elbows to lift, then lower slowly. Try up to five comfortable repetitions.'], 'biceps-curl'),
  };
  const workout = (b: boolean, repeat: boolean): GuidedUnit => {
    const moves = b ? [exercises.calves, weighted ? exercises.curl : exercises.push] : [exercises.legs, exercises.push];
    const stages: Stage[] = [{ id: 'prepare', type: 'action', title: 'Set up your session', prompt: '', material: mats.week, steps: ['Clear your space and check your supports. Begin with a short, easy walk or familiar movement to warm up.'], alternative: 'Return when you can set up comfortably.' }];
    for (let round = 0; round < rounds; round++) for (let i = 0; i < moves.length; i++) {
      const exercise = moves[i];
      stages.push({ ...exercise, id: `${exercise.id}-set-${round + 1}`, title: `${exercise.title} · set ${round + 1}/${rounds}` });
      if (round < rounds - 1 || i < moves.length - 1) stages.push({ id: `rest-${round}-${i}`, type: 'action', title: 'Rest between sets', prompt: '', steps: ['Rest for about a minute, or longer if you need it. Continue when comfortable.'], seconds: 60, restSeconds: 60, alternative: 'Keep resting until ready.' });
    }
    stages.push({ id: 'record', type: 'performance', title: 'Save one useful record', prompt: 'Record repetitions for your first set only. Zero is valid. Use the same setup next time.', variants: [b ? 'Supported calf raise — first set' : 'Sit-to-stand — first set', 'Recovery review'], unit: 'reps', maximum: 100 });
    return { title: `${repeat ? 'Repeat' : 'Learn'} strength ${b ? 'B' : 'A'}`, outcome: 'Follow the demonstrated exercises, rest, and save your actual first-set repetitions.', stages };
  };
  return units.map((unit, i) => {
    if (!limited && [0, 4, 7, 11].includes(i)) return workout(i === 4 || i === 11, i >= 7);
    const supplied = i === 1 ? mats.meal : [2, 12].includes(i) ? mats.shopping : i === 9 ? mats.prep : [6, 10, 13].includes(i) ? mats.recovery : undefined;
    if (!supplied) return unit;
    const firstAction = unit.stages.findIndex(s => s.type === 'action');
    return { ...unit, stages: unit.stages.map((stage, j) => j === firstAction ? { ...stage, material: supplied } : stage) };
  });
}
