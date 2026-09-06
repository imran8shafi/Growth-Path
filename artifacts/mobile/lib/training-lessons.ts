import type { SkillKey, Stage } from './training-model';

const LESSONS: Partial<Record<SkillKey, { title: string; points: string[]; example: string }>> = {
  memory: { title: 'Give your memory a route', points: ['Group unrelated items into a single scene.', 'Make one image distinctive enough to retrieve.', 'Close the source before checking what you remember.'], example: 'For river, candle, train: picture a candle floating down a river beside a tiny train. Now rebuild the scene without looking.' },
  negotiation: { title: 'Interests before positions', points: ['Ask what makes the other person’s request important.', 'Offer two options that change different constraints.', 'Know what you can do if no agreement is possible.'], example: '“Friday is too late” is a position. “We need time to test” reveals an interest. Offer a smaller tested version Thursday or the full version Friday.' },
  focus: { title: 'Protect an outcome', points: ['Define something you can finish, not a vague intention.', 'Remove one predictable interruption.', 'When distracted, note it and return to the next action.'], example: 'Replace “work on my project” with “write the opening paragraph.” If a message arrives, check it after the interval.' },
  storytelling: { title: 'A moment that turns', points: ['Start with a person who wants something.', 'Use one detail the listener can picture.', 'End where the situation or your understanding changes.'], example: '“I rehearsed my introduction ten times. Then I walked into the wrong meeting. The stranger who helped me became my first client.”' },
  practical: { title: 'Make a process testable', points: ['Name one person and the problem they face.', 'Build the smallest tool that removes one obstacle.', 'Test it on the real task before improving its appearance.'], example: 'A packing checklist is useful if it catches a forgotten charger. Try it on one trip, then revise the step that failed.' },
  conviction: { title: 'A boundary you can keep', points: ['Name the value behind your decision.', 'Describe your own choice without dictating theirs.', 'Offer a respectful alternative when one is possible.'], example: '“I care about our friendship. I can help you prepare, but I cannot publicly support a claim I disagree with.”' },
  adaptability: { title: 'Keep the purpose, change the method', points: ['Separate the outcome from your preferred approach.', 'Identify exactly which constraint changed.', 'Try a smaller test before committing to the new plan.'], example: 'If a workshop loses its projector, the purpose is still learning. Use one physical demonstration and ask the group to explain it back.' },
};

export function trainingLesson(skill: SkillKey): Stage {
  const lesson = LESSONS[skill] ?? LESSONS.practical!;
  return { id: 'field-guide', type: 'lesson', title: lesson.title, prompt: 'Learn one approach. Then put it to the test.', points: lesson.points, example: lesson.example };
}
